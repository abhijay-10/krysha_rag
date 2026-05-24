# Krysha AI – Emotionally Intelligent Spiritual Companion

Krysha AI is an emotionally intelligent spiritual AI companion designed to provide personalized guidance, emotional support, and contextual conversations using Retrieval-Augmented Generation (RAG), voice interaction, and memory-aware AI systems.

The project combines modern AI technologies with spiritual wisdom from scriptures like the Bhagavad Gita and Mahabharata to create a calm, human-like, and meaningful user experience.

---

# Features

## AI Chatbot
- Context-aware spiritual conversations
- Personalized responses using memory retrieval
- Emotionally intelligent interactions
- Scripture-based guidance and storytelling

## Voice Sanctuary
- Real-time voice interaction system
- Human-like spiritual conversations
- Emotion-aware responses
- Calm and immersive UI experience

## Spiritual Journey Tracker
- Daily emotional and spiritual tracking
- Distraction and focus monitoring
- Personalized spiritual guidance
- Habit consistency and reflection system

## Contextual RAG System
- Structured + unstructured PDF ingestion
- Semantic retrieval using embeddings
- Contextual answer generation
- Related image retrieval from scripture context

---

# Tech Stack

## Frontend
- Next.js
- React
- Tailwind CSS

## Backend
- FastAPI
- Python

## AI & Retrieval
- Mistral (main chatbot)
- Gemma2 2B (Voice Sanctuary)
- BAAI/bge-m3 embeddings
- Qdrant Vector Database
- RAG Pipeline

---

# Project Structure

```bash
backend/            # FastAPI backend and RAG pipelines
frontend/           # Next.js frontend UI
knowledge/          # Knowledge and reference data
ingest.py           # Structured PDF ingestion
ingest_gita_only.py # Unstructured Gita PDF chunking
