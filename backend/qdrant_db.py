# import os
# from dotenv import load_dotenv
# from langchain_qdrant import QdrantVectorStore
# from qdrant_client import QdrantClient
# from qdrant_client.http import models
# from langchain_community.embeddings import HuggingFaceEmbeddings

# load_dotenv()

# def get_db():
#     url = os.getenv("QDRANT_URL")
#     api_key = os.getenv("QDRANT_API_KEY")
#     collection_name = "mahabharata_bot"

#     # ✅ LOCAL embedding model (NO API CALL)
#     embeddings = HuggingFaceEmbeddings(
#         model_name="BAAI/bge-m3"
#     )

#     client = QdrantClient(url=url, api_key=api_key, timeout=120)

#     if not client.collection_exists(collection_name):
#         client.create_collection(
#             collection_name=collection_name,
#             vectors_config=models.VectorParams(
#                 size=1024,
#                 distance=models.Distance.COSINE
#             ),
#         )

#     return QdrantVectorStore(
#         client=client,
#         collection_name=collection_name,
#         embedding=embeddings
#     )



import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models
from langchain_qdrant import QdrantVectorStore
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()

def get_db(embeddings):
    url = os.getenv("QDRANT_URL")
    api_key = os.getenv("QDRANT_API_KEY")
    collection_name = "mahabharata_bot"

    # Fix for [Errno 11001]: Bypass DNS lookup issues on Windows
    if url and "localhost" in url:
        url = url.replace("localhost", "127.0.0.1")

    client = QdrantClient(url=url, api_key=api_key, timeout=120)

    if not client.collection_exists(collection_name):
        client.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(
                size=1024, # BGE-M3 dimension
                distance=models.Distance.COSINE
            ),
        )

    return QdrantVectorStore(
        client=client,
        collection_name=collection_name,
        embedding=embeddings
    )