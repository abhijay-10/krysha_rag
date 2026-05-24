import os
import fitz  # PyMuPDF
from rapidocr_onnxruntime import RapidOCR
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEndpointEmbeddings 
from langchain_qdrant import QdrantVectorStore 
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

load_dotenv()

def ingest_gita_ocr():
    path = "data/Bhagwat Gita.pdf"
    lang = "mixed"
    
    if not os.path.exists(path):
        return print(f"File not found: {path}", flush=True)

    print("Loading Bhagwat Gita and starting RapidOCR (No Tesseract needed)...", flush=True)
    
    try:
        engine = RapidOCR()
        doc = fitz.open(path)
        documents = []

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # Increase resolution for better OCR
            img_bytes = pix.tobytes("png")
            
            result, _ = engine(img_bytes)
            
            if result:
                # result is a list of [box, text, score]
                page_text = "\n".join([line[1] for line in result])
                documents.append(Document(
                    page_content=page_text,
                    metadata={"source": path, "page": page_num + 1, "language": lang}
                ))
            
            if (page_num + 1) % 10 == 0:
                print(f"Processed {page_num + 1}/{len(doc)} pages...", flush=True)

        print(f"Finished OCR. Extracted text from {len(documents)} pages.", flush=True)
    except Exception as e:
        print(f"Error during OCR: {e}", flush=True)
        return

    # Split into chunks
    # Optimized chunk size for better semantic preservation
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks for Gita.", flush=True)

    # Embeddings
    embeddings = HuggingFaceEndpointEmbeddings(
        model="BAAI/bge-m3",
        huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN")
    )

    # Qdrant Client
    client = QdrantClient(
        url=os.getenv("QDRANT_URL"), 
        api_key=os.getenv("QDRANT_API_KEY"), 
        timeout=600 
    )

    collection_name = "mahabharata_bot"

    print("Clearing existing Gita chunks from Qdrant to avoid duplicates...", flush=True)
    try:
        client.delete(
            collection_name=collection_name,
            points_selector=qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="metadata.source", 
                        match=qmodels.MatchValue(value=path)
                    )
                ]
            )
        )
        print("Existing chunks cleared.", flush=True)
    except Exception as e:
        print(f"Could not clear existing chunks: {e}", flush=True)

    vector_store = QdrantVectorStore(
        client=client,
        collection_name=collection_name,
        embedding=embeddings,
    )

    print("Uploading Gita chunks to Qdrant...", flush=True)
    BATCH_SIZE = 15
    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        vector_store.add_documents(batch)
        print(f"Uploaded chunks: {i} to {min(i + BATCH_SIZE, len(chunks))}", flush=True)

    print("SUCCESS: Bhagwat Gita (RapidOCR) stored in Qdrant!", flush=True)

if __name__ == "__main__":
    ingest_gita_ocr()
