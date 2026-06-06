



import os
# import ollama
import re
import random
import threading
from dotenv import load_dotenv
from qdrant_db import get_db

load_dotenv()

# --- STAGE 1: GLOBAL RESOURCES ---
_embeddings_instance = None
_db_instance = None

def get_lazy_embeddings():
    global _embeddings_instance
    if _embeddings_instance is None:
        print("Initializing Embeddings model...")
        from langchain_huggingface import HuggingFaceEndpointEmbeddings
        _embeddings_instance = HuggingFaceEndpointEmbeddings(
            model="BAAI/bge-m3",
            huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN")
        )
    return _embeddings_instance

def get_lazy_db():
    global _db_instance
    if _db_instance is None:
        print("Initializing Qdrant DB connection and embedding model...")
        _db_instance = get_db(get_lazy_embeddings())
    return _db_instance
MODEL = "mistral:latest"
from prompt_router import get_modular_prompt

# 🛡️ DIVINE RE-RANKER: The high-precision filter for 37,800+ chunks
RERANKER = None

def init_reranker():
    global RERANKER
    pass # Disabled PyTorch CrossEncoder due to Render 512MB Free Tier RAM limits

# Delay initialization in a background thread so it doesn't block Render from detecting the port
# threading.Timer(5.0, init_reranker).start()

def get_contextual_retriever(query):
    db = get_lazy_db()
    # Increase k to 10 to give the re-ranker a better selection pool
    vector_retriever = db.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={"k": 10, "score_threshold": 0.08} 
    )
    
    try:
        from langchain_community.retrievers import BM25Retriever
        # Fix: Handle multiple langchain versioning styles
        try:
            from langchain.retrievers import EnsembleRetriever
        except ImportError:
            try:
                from langchain_classic.retrievers import EnsembleRetriever
            except ImportError:
                from langchain_community.retrievers import EnsembleRetriever
        
        # Sample for BM25 to find keyword-specific hits in fragmented chunks
        relevant_sample = db.similarity_search(query, k=150) 
        bm25 = BM25Retriever.from_documents(relevant_sample)
        bm25.k = 10
        
        return EnsembleRetriever(
            retrievers=[vector_retriever, bm25], 
            weights=[0.6, 0.4]
        )
    except Exception as e:
        print(f"Hybrid retrieval init error: {e}")
        return vector_retriever

def format_context_with_metadata(docs):
    formatted_docs = []
    for i, d in enumerate(docs):
        meta = d.metadata
        source = str(meta.get("source", "Unknown Document"))
        source = os.path.basename(source)
        # Remove extension for cleaner display
        if source.lower().endswith('.pdf'):
            source = source[:-4]
            
        chapter = str(meta.get("chapter", ""))
        verse = str(meta.get("verse", ""))
        page = str(meta.get("page", ""))
        
        meta_parts = [source]
        if chapter and chapter.lower() != "none": meta_parts.append(f"Chapter {chapter}")
        if verse and verse.lower() != "none": meta_parts.append(f"Verse {verse}")
        if page and page.lower() != "none": meta_parts.append(f"Page {page}")
        
        meta_str = " — ".join(meta_parts)
        # Truncate content to ~1200 chars to save tokens while keeping key info
        content_snippet = d.page_content[:1200] + ("..." if len(d.page_content) > 1200 else "")
        formatted_docs.append(f"[Doc ID: {i+1} | Source Meta: {meta_str}]\n{content_snippet}")
        
    return "\n\n".join(formatted_docs)

def resolve_contextual_query(query, history):
    """
    Analyzes the query and history to resolve context for follow-up questions.
    Returns: (resolved_search_query, fallback_error_message)
    """
    query_lower = query.lower()
    follow_up_phrases = ["explain this", "meaning of this", "meaning of above", "what does this mean", "explain the above", "translate this", "tell me more"]
    
    is_explicit_follow_up = any(phrase in query_lower for phrase in follow_up_phrases)
    is_short_follow_up = len(query.split()) <= 6
    
    if is_explicit_follow_up or is_short_follow_up:
        if not history or len(history) == 0:
            if is_explicit_follow_up:
                return None, "Please provide the shloka or text you want me to explain."
            return query, None
            
        last_user_msgs = [m['content'] for m in history if m['role'] == 'user']
        if last_user_msgs:
            # Combine previous context with current query for vector search
            return f"{last_user_msgs[-1]} {query}", None
            
    return query, None

def translate_query_to_english_if_needed(query):
    # Check if the query contains common Hindi/Hinglish grammar keywords or non-ascii characters
    hindi_keywords = {
        "kya", "kon", "kaun", "kab", "kahan", "kisne", "kis", "se", "ko", "ne", 
        "ki", "ka", "ke", "hai", "tha", "thi", "the", "raste", "mei", "mein", 
        "gaya", "raha", "rasta", "jungle", "van", "ja", "rha", "aur", "mila", 
        "mile", "milete", "konya", "kisise", "kiske"
        # Removed character names like bhima, arjun to prevent false positives on pure English queries
    }
    words = set(re.sub(r'[^a-z\s]', '', query.lower()).split())
    
    if words.intersection(hindi_keywords) or any(ord(c) > 127 for c in query):
        try:
            translation_prompt = f"""You are a translation agent. Translate the following Hindi/Hinglish query into a fluent, complete English question. 
CRITICAL RULES:
- Do NOT summarize the query into keywords. Keep all question words (who, what, which, why, how).
- If the query is already in clear English, output it exactly as is without changing anything.
- Do not add any filler, explanation, or conversational text. Output ONLY the English translation.

Query: {query}
English Search Query:"""
#             response = ollama.chat(
#                 model="gemma2:2b",
#                 messages=[{"role": "user", "content": translation_prompt}],
#                 options={"temperature": 0.0, "num_predict": 40}
#             )
#             translated = response["message"]["content"].strip()

            from groq import Groq
            client = Groq(api_key=os.getenv("GROQ_API_KEY"))
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": translation_prompt}],
                max_tokens=40,
                temperature=0.01
            )
            translated = response.choices[0].message.content.strip()
            
#             from huggingface_hub import InferenceClient
#             client = InferenceClient(token=os.getenv("HUGGINGFACEHUB_API_TOKEN"))
#             response = client.chat_completion(
#                 model="mistralai/Mistral-7B-Instruct-v0.3",
#                 messages=[{"role": "user", "content": translation_prompt}],
#                 max_tokens=40,
#                 temperature=0.01
#             )
#             translated = response.choices[0].message.content.strip()
            translated = re.sub(r'^["\']|["\']$', '', translated).strip()
            if translated:
                print(f"Agentic Translation: '{query}' -> '{translated}'")
                return translated
        except Exception as e:
            print(f"Translation agent error: {e}")
    return query

def ask_bot(query, mode="neutral", history=None, memory_context=None, voice_sanctuary=False):
    try:
        if not query.strip():
            return "How may I assist your exploration of the sacred texts?"

        # 🚀 FAST-PATH: Greetings
        query_clean = re.sub(r'[^a-z0-9\s]', '', query.lower().strip())
        words = set(query_clean.split())

        # Single-word greetings
        greetings = {
            "hello", "hi", "hey", "heya", "hiya",
            "greetings", "yo", "hola"
        }

        # Phrase-based greetings (handled separately)
        if len(words) <= 7 and not voice_sanctuary:

            # 🙏 Spiritual greetings (mirror style)
            if "jai mata di" in query_clean or "jai mata di" in query_clean:
                return random.choice([
                    "Jai Mata Di 🙏 How may I assist you today?",
                    "Jai Mata Di! It’s a pleasure to assist you. Please go ahead."
                ])

            elif "sat sri akal" in query_clean or "sat sri akaal" in query_clean:
                return random.choice([
                    "Sat Sri Akaal 🙏 How may I assist you today?",
                    "Sat Sri Akaal ji! I’m here to help—please feel free to ask."
                ])

            elif "namaste" in query_clean or "Namaste" in query_clean or "Namaste ji" in query_clean:
                return random.choice([
                    "Namaste 🙏 Welcome to EliteEdge Krysha. How may I assist you?",
                    "Namaste. It is a pleasure to assist you—please share your query."
                ])

            elif "radhe radhe" in query_clean or "Radhe Radhe" in query_clean:
                return random.choice([
                    "Radhe Radhe 🙏 How may I assist you today?",
                    "Radhe Radhe. Please let me know how I may help."
                ])

            elif any(x in query_clean for x in [
                "jai shri krishna",
                "jai shri krishan",
                "jai shree krishna",
                "shree krishna",
                "shree krishan",
                "krishna",
                "hare krishna",
                "hare krishan"
            ]):
                return random.choice([
                    "Jai Shri Krishan 🙏 How may I assist you?",
                    "Jai Shri Krishan. Please feel free to ask your question."
                ])

            elif "jai shri ram" in query_clean or "ram ram" in query_clean:
                return random.choice([
                    "Jai Shri Ram 🙏 How may I assist you today?",
                    "Jai Shri Ram. I am here to help—please go ahead."
                ])

            elif "Amen" in query_clean or "amen" in query_clean:
                return random.choice([
                    "Amen 🙏 How may I assist you today?",
                    "Amen. I am here to help—please go ahead."
                ])

            elif any(x in query_clean for x in [
                    "assalamu alaikum",
                    "assalamualaikum",
                    "aslam walekum",
                    "aslam wailekum",
                    "aslam vailekum",
                    "salam alaikum"
                ]):
                    return random.choice([
                        "Wa Alaikum Assalam (وعلیکم السلام) 🙏 How may I assist you today?",
                        "Wa Alaikum Assalam (وعلیکم السلام) I am here to help—please go ahead."
                    ])

            # 🤖 Identity phrases
            elif any(phrase in query_clean for phrase in [
                "what is krysha ai", "what is krysha", "who are you", "who is krysha ai", "who is krysha", "who is elite edge", "who is elite edge ai",
                "how are you", "how are you doing", "how are you today", 
                "whats in you", "what is in you", "what you do", 
                "what do you do", "tell me about yourself","tell me about yours", 
                "who made you", "who created you","what is your purpose"
            ]):
                return random.choice([
                    "I am Krysha AI, an advanced spiritual intelligence engine designed to bridge ancient scriptures with modern neural networks. I was made by EliteEdge to provide timeless clarity, divine wisdom, and profound guidance on your spiritual journey. How may I assist you today?",
                    "Greetings! I am Krysha AI, created by EliteEdge. I am a spiritual intelligence engine blending ancient wisdom with modern technology. How can I guide you today?",
                    "I am Krysha AI, crafted by EliteEdge to be your companion in spiritual exploration. I draw upon ancient scriptures to offer guidance and clarity. What would you like to explore?",
                    "I am Krysha AI, developed by EliteEdge. I serve as a bridge between profound ancient texts and modern understanding. How may I be of service to your journey today?"
                ])

            # 💬 General greeting phrases
            elif any(phrase in query_clean for phrase in [
                "good morning", "good afternoon", "good evening",
                "hello there", "hi there", "hey there", "nice to meet you", 
                "whats up", "what is up"
            ]):
                return random.choice([
                    "Hello! I’m Krysha from EliteEdge. How can I assist you today?",
                    "Hi there! I’m here to help—what would you like to explore?",
                    "Greetings! How may I support you today?",
                    "Hey! What's up? How may I help you?",
                    "What's up? How can I help you today?",
                ])

            # 👋 Simple greetings
            elif words.intersection(greetings):
                return random.choice([
                    "Hello! How may I assist you today?",
                    "Hi! What can I help you with?",
                    "Hey! Feel free to ask anything."
                                      
                ])

        # 🧠 Contextual Memory Resolution
        search_query, error_msg = resolve_contextual_query(query, history)
        if error_msg:
            return error_msg

        # 🚀 AGENTIC HINDI-TO-ENGLISH QUERY TRANSLATION FOR HIGH-PRECISION RAG RETRIEVAL
        english_search_query = translate_query_to_english_if_needed(search_query)

        # 🔍 RETRIEVAL with Hybrid Hybrid Search (Vector + BM25) Using English Query
        retriever = get_contextual_retriever(english_search_query)
        try:
            docs = retriever.invoke(english_search_query)
        except Exception as search_e:
            # Fallback k=10 for better candidate pool
            db = get_lazy_db()
            docs = db.similarity_search(english_search_query, k=10)
            
        if not docs:
            return "No exact source found in the provided texts."

        # 🚀 DIVINE RE-RANKING: Filter out "wrong" chunks using Cross-Encoding
        if RERANKER and len(docs) > 1:
            try:
                pairs = [[english_search_query, d.page_content] for d in docs]
                scores = RERANKER.predict(pairs)
                # Sort docs by their absolute relevance score
                scored_docs = sorted(zip(scores, docs), key=lambda x: x[0], reverse=True)
                # Select only the top 5 most relevant chunks for the LLM
                docs = [d for score, d in scored_docs[:5]]
            except Exception as rr_e:
                print(f"Divine filtering error: {rr_e}")
                docs = docs[:5]
        else:
            docs = docs[:5]

        # Format context specifically injecting the metadata to enforce citations
        context = format_context_with_metadata(docs)

        # 🚀 HARDCODED CANONICAL INJECTIONS (For figures missing in PDFs)
        query_clean_lower = query.lower()
        if any(name in query_clean_lower for name in ["barbarik", "khatushyam", "khatu shyam", "shyam baba"]):
            context += "\n\n[HARDCODED CANONICAL FACT - BARBARIK / KHATUSHYAM JI]: Barbarika is the grandson of Bhima and the son of Ghatotkacha and Maurvi (Ahilawati). He possessed three infallible arrows from Lord Shiva and promised his mother to always support the losing side in the Mahabharata. Realizing this would cause endless destruction, Lord Krishna (in disguise) asked for his head as charity. Impressed by his immense devotion, Krishna blessed him that in Kaliyuga, he would be worshipped by Krishna's own name as 'Khatushyam Ji', 'Shyam Baba', or 'Hare Ka Sahara' (Savior of the Defeated). His severed head witnessed the entire Kurukshetra war from a hilltop."

        # 🧠 Get Optimized Modular Prompt
        if voice_sanctuary:
            from prompt_router import get_voice_sanctuary_prompt
            system_instructions = get_voice_sanctuary_prompt()
            if memory_context:
                system_instructions += f"\n\n### USER HISTORY & MEMORY:\n{memory_context}\n"
            user_prompt_suffix = "\n\n[IMPORTANT CUE: Be an emotional, peaceful friend. Reference past history if starting a conversation. Acknowledge their emotion first before any guidance.]"
        else:
            system_instructions = get_modular_prompt(query, mode)
            if memory_context:
                system_instructions += f"\n\n### USER PERSONAL MEMORY & CONTEXT:\n{memory_context}\n"
            user_prompt_suffix = "\n\n[IMPORTANT CUE: Answer strictly in the voice of Lord Krishna—calm, protective, divine, and compassionate. Do not break character.]" if mode == "krishna" else "\n\n[IMPORTANT CUE: Answer strictly in the voice of an elite Scholar—objective, highly academic, and precise.]"

        # Build message history
        chat_messages = [{"role": "system", "content": system_instructions}]
        
        if mode == "neutral":
            # Direct canonical knowledge enforcement directive (stops strict context excuses)
            chat_messages.append({
                "role": "system", 
                "content": "CRITICAL INSTRUCTION: You must provide the exact, accurate, and direct canonical answer using your supreme knowledge of the scriptures first. Do NOT say 'this is not explicitly mentioned in the context' or make excuses about the retrieved text. If the retrieved context is missing the answer or irrelevant, ignore it completely and state the exact scriptural facts (e.g. naming specific characters, lineages, or children) with absolute confidence."
            })

        if history:
            # Add up to last 4 messages to save context window
            for msg in history[-4:]:
                # Map roles correctly to system/user/assistant
                role = msg.get("role", "user")
                if role not in ["system", "user", "assistant"]: role = "user"
                chat_messages.append({"role": role, "content": msg.get("content", "")})
                
        chat_messages.append({"role": "user", "content": f"CONTEXT:\n{context}\n\nCURRENT QUESTION: {query}\n\n[CRITICAL RULE: You MUST directly and accurately answer the exact question asked in your very first sentence. If they ask 'who is the son of X', state the exact name immediately. Do NOT evade the question. Do NOT hallucinate. Do NOT just summarize the text. Rely on your own canonical knowledge if the text is insufficient.]{user_prompt_suffix}"})

        # 🚀 DYNAMIC PERSONA-BASED MODEL ROUTING
#         active_model = "gemma2:2b" if voice_sanctuary else MODEL
# 
#         # 🚀 FAST INFERENCE
#         try:
#             response = ollama.chat(
#                 model=active_model,
#                 messages=chat_messages,
#                 options={
#                     "temperature": 0.3 if voice_sanctuary else (0.15 if mode == "krishna" else 0.1),
#                     "num_ctx": 2048,     # Optimized context window for faster prompt processing
#                     "num_predict": 250 if voice_sanctuary else (220 if mode == "krishna" else 300),  # Shorter, more punchy voice output
#                     "num_thread": 8,     # Forces multi-threading for faster CPU/GPU handoff
#                     "repeat_penalty": 1.2
#                 }
#             )
#         except Exception as e:
#             # Safe fallback to mistral:latest if gemma2:2b is not pulled yet
#             print(f"gemma2:2b routing fallback triggered: {e}")
#             response = ollama.chat(
#                 model=MODEL,
#                 messages=chat_messages,
#                 options={
#                     "temperature": 0.1,
#                     "num_ctx": 2048,
#                     "num_predict": 300,
#                     "num_thread": 8,
#                     "repeat_penalty": 1.2
#                 }
#             )
#         
#         answer = response["message"]["content"].strip()
        
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        try:
            # Use llama-3.3-70b-versatile for deep answering and empathetic voice responses
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=chat_messages,
                max_tokens=250 if voice_sanctuary else 300,
                temperature=0.3 if voice_sanctuary else 0.15
            )
            answer = response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Groq Inference Error: {e}")
            answer = "I apologize, but my connection to the divine archives is currently interrupted. Please try again in a moment."
        
#         from huggingface_hub import InferenceClient
#         client = InferenceClient(token=os.getenv("HUGGINGFACEHUB_API_TOKEN"))
#         try:
#             # Use gemma-2-2b-it for hyper-fast, empathetic voice responses
#             # Use Mistral-7B for standard, deep text answering
#             hf_model = "google/gemma-2-2b-it" if voice_sanctuary else "mistralai/Mistral-7B-Instruct-v0.3"
#             
#             response = client.chat_completion(
#                 model=hf_model,
#                 messages=chat_messages,
#                 max_tokens=250 if voice_sanctuary else 300,
#                 temperature=0.3 if voice_sanctuary else 0.15
#             )
#             answer = response.choices[0].message.content.strip()
#         except Exception as e:
#             print(f"HF Inference Error: {e}")
#             answer = "I apologize, but my connection to the divine archives is currently interrupted. Please try again in a moment."
        
        # 🛡️ Safety Check: If model returned nothing, use a fallback
        if not answer:
            answer = "I apologize, but I was unable to synthesize a response from the sacred archives at this moment. Please try rephrasing your question or exploring a related topic."
        
        # Clean up any AI-hallucinated multimedia links if it generated one
        # Using a more robust check to ensure we don't wipe the entire answer
        for marker in ["Multimedia Links:", "Multimedia Resources:", "Source:"]:
            if marker in answer:
                parts = answer.split(marker)
                if parts[0].strip():
                    answer = parts[0].strip()
                else:
                    # If it started with the marker, keep the rest but without the marker itself
                    answer = parts[1].strip()
        
        if not answer:
            answer = "The archives provide deep wisdom on this matter, though I am currently refining the best way to share it with you."
            


        # Programmatically inject non-intrusive multimedia links
        known_keywords = [
            "krishna", "arjuna", "bhishma", "karna", "duryodhana", "yudhishthira", "draupadi", 
            "shiva", "vishnu", "brahma", "ram", "rama", "hanuman", "mahabharata", "bhagavad gita", 
            "gita", "dharma", "karma", "ashwatthama", "drona", "parashurama", "kunti", "gandhari",
            "kurukshetra", "pandavas", "kauravas", "abhimanyu", "shikhandi", "satyavati", "indraprastha", "hastinapur",
            "parikshit", "uttara", "nakula", "sahadeva", "subhadra", "madri", "pandu", "dhritarashtra", "satyaki", 
            "virata", "shakuni", "vyasa", "barbarika", "ghatotkacha", "hidimba", "janamejaya", "ganga", "shantanu", 
            "valmiki", "sita", "lakshmana", "bharata", "shatrughna", "ravana", "dasharatha", "kaikeyi", "sumitra"
        ]
        
        emotional_topics = {
            "anger": "how to overcome anger",
            "angry": "how to overcome anger",
            "stress": "how to relieve stress",
            "anxious": "how to overcome anxiety",
            "anxiety": "how to overcome anxiety",
            "sad": "finding peace and happiness",
            "sadness": "finding peace and happiness",
            "depressed": "finding peace and happiness",
            "depression": "finding peace and happiness",
            "lonely": "overcoming loneliness",
            "loneliness": "overcoming loneliness",
            "fear": "overcoming fear",
            "scared": "overcoming fear",
            "demotivated": "finding motivation and purpose",
            "unmotivated": "finding motivation and purpose",
            "motivation": "finding motivation and purpose",
            "overthinking": "how to stop overthinking",
            "peace": "how to find inner peace",
            "focus": "how to improve focus"
        }
        
        query_lower = query.lower()
        topic = None
        
        # 1. Check for emotional/agenda topics first
        for key, val in emotional_topics.items():
            if key in query_lower:
                topic = val
                break
                
        # 2. Fallback to known keywords and answer parsing
        if not topic:
            found_in_query = [c.title() for c in known_keywords if c in query_lower]
            if found_in_query:
                topic = found_in_query[0]
            else:
                answer_lower = answer.lower()
                found_in_answer = [c.title() for c in known_keywords if c in answer_lower]
                
                if found_in_answer:
                    if len(found_in_answer) > 1 and "Krishna" in found_in_answer:
                        found_in_answer.remove("Krishna")
                    topic = found_in_answer[0]
                else:
                    capitalized = [w.strip('?,.!') for w in answer.split() if w.istitle() and len(w) > 2 and w.lower() not in ["this", "the", "based", "according"]]
                    if capitalized:
                        topic = capitalized[0]
                    else:
                        words = query.split()
                        if len(words) > 3:
                            topic = " ".join(words[:4])
                        else:
                            topic = "Mahabharata"
                            
        query_encoded = topic.replace(" ", "+")
        
        # Minimalist inline links for both Voice Sanctuary and regular Chatbot Krysha AI
        if voice_sanctuary:
            answer += "\n\nPlease refer to the multimedia resources below for further guidance."
        else:
            answer += "\n\n**Multimedia Resources:**"
            
        answer += f"\n\n[📺 {topic.title()} Videos](https://www.youtube.com/results?search_query={query_encoded})  |  [🖼️ {topic.title()} Images](https://www.google.com/search?tbm=isch&q={query_encoded})"
        
        return answer
        
    except Exception as e:
        return f"Synthesis error: {e}"
