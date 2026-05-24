import streamlit as st
import requests

st.set_page_config(page_title="Mahabharata Bot", layout="centered", page_icon="🕉️")

# Custom CSS for a clean, spiritual look
st.markdown("""
<style>
    .main {
        background-color: #fcfaf5;
    }
    .stTextArea textarea {
        border-radius: 10px !important;
        border: 1px solid #ff9933 !important;
    }
    .stButton>button {
        background-color: #ff9933;
        color: white !important;
        border-radius: 8px;
        font-weight: bold;
        transition: 0.3s;
    }
    .stButton>button:hover {
        background-color: #e68a00;
        border-color: #e68a00;
    }
    .response-box {
        background-color: #ffffff;
        padding: 20px;
        border-left: 5px solid #ff9933;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        margin-top: 20px;
        line-height: 1.6;
        color: #333;
    }
</style>
""", unsafe_allow_html=True)

st.title("🕉️ Mahabharata AI Bot")
st.caption("Wisdom from the Bhagavad Gita & Mahabharata")

# User Input Section
query = st.text_area("What wisdom do you seek?", placeholder="e.g., What is the meaning of Dharma?")
mode = st.selectbox("Response Persona", ["neutral", "krishna"], format_func=lambda x: "🙏 Lord Krishna" if x == "krishna" else "📖 Scholar")

if st.button("Seek Wisdom"):
    if not query.strip():
        st.warning("Please enter a question first.")
    else:
        with st.spinner("Consulting the sacred texts..."):
            try:
                # 1. Make the request to FastAPI
                res = requests.post(
                    "http://127.0.0.1:8000/ask",
                    json={"query": query, "mode": mode},
                    timeout=300  # Increased timeout for API calls
                )

                # 2. Check for HTTP Errors
                if res.status_code == 200:
                    data = res.json()
                    answer = data.get("answer", "I could not find an answer in the texts.")
                    
                    st.markdown("### 📜 The Revelation")
                    st.markdown(f"<div class='response-box'>{answer}</div>", unsafe_allow_html=True)
                
                else:
                    st.error(f"Backend Error ({res.status_code}): {res.text}")

            except requests.exceptions.ConnectionError:
                st.error("❌ Could not connect to the Backend. Is your FastAPI (Uvicorn) running?")
            except Exception as e:
                st.error(f"⚠️ An unexpected error occurred: {e}")

# Footer
st.divider()
st.info("Note: This bot uses AI to interpret texts. For spiritual guidance, always refer to the original Shlokas.")