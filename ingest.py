import os
import time # Added for safety pauses
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader, UnstructuredPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEndpointEmbeddings 
from langchain_qdrant import QdrantVectorStore 
from qdrant_client import QdrantClient
from qdrant_client.http import models

load_dotenv()

def run_ingestion():
    pdf_configs = [
        ("data/Mahabharata (Unabridged in English).pdf", "english"),
        ("data/महाभारत_प्रथम_खंड_hindulibrary.in.pdf", "hindi"),
        ("data/Bhagwat Gita.pdf", "mixed"),
    ]

    docs = []
    print("Loading PDFs using PyPDF...")
    for path, lang in pdf_configs:
        if os.path.exists(path):
            try:
                if "Bhagwat Gita.pdf" in path:
                    print(f"Using Unstructured approach (OCR) for: {path}")
                    # Strategy 'hi_res' is better for image-based PDFs
                    loader = UnstructuredPDFLoader(
                        path, 
                        strategy="hi_res",
                        mode="elements",
                        ocr_languages="eng+hin" # Assuming mixed English/Hindi as per config
                    )
                else:
                    loader = PyPDFLoader(path)
                
                pages = loader.load()
                for p in pages: p.metadata["language"] = lang
                docs.extend(pages)
                print(f"Loaded: {path}")
            except Exception as e:
                print(f"Error loading {path}: {e}")
                if "Bhagwat Gita.pdf" in path:
                    print("Tip: Unstructured OCR requires Tesseract and Poppler on Windows.")
        else:
            print(f"File not found: {path}")

    if not docs: return print("No documents found!")

    # Optimized for religious texts: 1000 chars provides better semantic context than 600
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)
    total_chunks = len(chunks)
    print(f"Created {total_chunks} chunks.")

    embeddings = HuggingFaceEndpointEmbeddings(
        model="BAAI/bge-m3",
        huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN")
    )

    client = QdrantClient(
        url=os.getenv("QDRANT_URL"), 
        api_key=os.getenv("QDRANT_API_KEY"), 
        timeout=600 
    )

    collection_name = "mahabharata_bot"

    RECREATE = False 

    if RECREATE:
        print(f"Recreating collection: {collection_name}")
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(size=1024, distance=models.Distance.COSINE),
        )

    vector_store = QdrantVectorStore(
        client=client,
        collection_name=collection_name,
        embedding=embeddings,
    )

    # --- THE RESUME LOGIC STARTS HERE ---
    # Start from where you left off. Change 2925 to 0 if you ever RECREATE=True.
    START_INDEX = 20130 #15585
    BATCH_SIZE = 15

    print(f"Resuming from chunk {START_INDEX} of {total_chunks}...")

    try:
        # Loop through chunks in batches manually for better control
        for i in range(START_INDEX, total_chunks, BATCH_SIZE):
            batch = chunks[i : i + BATCH_SIZE]
            vector_store.add_documents(batch)
            print(f"Successfully uploaded chunks: {i} to {min(i + BATCH_SIZE, total_chunks)}")
            
            # Optional: Short sleep to avoid rate limiting on Hugging Face Free Tier
            # time.sleep(1) 

        print("SUCCESS: All wisdom stored in Qdrant Cloud!")
        
    except Exception as e:
        print(f"Upload failed at index {i}: {e}")
        print(f"Tip: Next time, set START_INDEX = {i} in your code to resume again.")

if __name__ == "__main__":
    run_ingestion()