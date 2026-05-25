# 🎓 PreppyLearn: AI-Powered Study Assistant

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Pinecone-000000?style=for-the-badge&logo=pinecone&logoColor=white" alt="Pinecone" />
</div>

<br />

> **An intelligent, RAG-driven EdTech platform that transforms static study materials into interactive, AI-powered learning experiences.**

**🌐 Live Demo:** [https://preppylearn.vercel.app/login](https://preppylearn.vercel.app/login)

---

## 📖 Problem Statement

**AI Study Assistant for Exam Preparation**

Students often struggle to extract actionable knowledge from dense PDFs, lecture slides, and lengthy notes. Traditional studying is passive, making it difficult to test knowledge retention or quickly find answers to specific concepts within hundreds of pages. 

**PreppyLearn** solves this by allowing students to upload their study materials and instantly interact with them. By leveraging Retrieval-Augmented Generation (RAG), the system ensures that AI responses, summaries, and generated quizzes are strictly bound to the factual context of the uploaded documents, eliminating AI hallucinations and streamlining exam preparation.

## 🎯 Domains Involved
- **Generative AI**
- **Natural Language Processing (NLP)**
- **RAG Systems (Retrieval-Augmented Generation)**
- **EdTech Solutions**

---

## 🚀 Features & Functionalities

* 📄 **Multi-Format Document Support**: Upload PDFs, DOCX, PPTX, and TXT files.
* 💬 **Semantic AI Chat**: Ask questions directly from your documents and get factual, context-aware answers.
* 📝 **Intelligent Summarization**: Generate short, detailed, or exam-focused summaries instantly.
* 🗂️ **Flashcard Generation**: Automatically extract key concepts and generate structured study flashcards.
* ✅ **MCQ Generation**: Test your knowledge with challenging Multiple Choice Questions derived directly from your notes.
* 🧠 **Robust RAG Architecture**: Ensures the AI only answers based on the uploaded material, drastically reducing hallucinations.

---

## 🎥 Demo Video

[▶️ Click here to watch the Demo Video](https://drive.google.com/drive/folders/15CvHSK-uRaX9Wv1O8UnsHGFIIhJvKmv0?usp=sharing)

---

## 🛠️ Tech Stack

**Frontend:**
- **Framework**: React.js, Vite
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API

**Backend:**
- **Framework**: FastAPI
- **Language**: Python
- **Database**: SQLite / PostgreSQL (Production)

**AI & RAG Stack:**
- **LLM**: Google Gemini API
- **Vector Database**: Pinecone *(Supports ChromaDB architecture)*
- **Orchestration**: LangChain (Text Splitters)
- **Embeddings**: Fast dense vector embeddings

**Document Extraction:**
- **PDFs**: `pdfplumber` / `PyMuPDF`
- **Word Docs**: `python-docx`
- **PowerPoints**: `python-pptx`

---

## 🏗️ Architecture & System Design

### RAG Workflow / Implementation Approach
1. **Ingestion**: User uploads a document. The backend parses it using specialized extraction libraries to pull raw text.
2. **Chunking**: The text is split into semantic chunks (e.g., 1000 characters with 200-character overlap) using LangChain.
3. **Embedding**: The chunks are passed through an embedding model to create dense, mathematical vector representations.
4. **Storage**: Vectors and metadata (user IDs, source text) are upserted into the Vector Database.
5. **Retrieval**: When a user asks a question, the query is embedded, and a similarity search fetches the top-K most relevant chunks.
6. **Generation**: The retrieved chunks are injected into a strict prompt and sent to the LLM, generating a highly accurate, context-bound response.

---

## 📂 Folder Structure

```text
PreppyLearn/
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI route controllers
│   │   ├── config/         # Environment & DB configurations
│   │   ├── core/           # Middleware & exception handlers
│   │   ├── models/         # SQLAlchemy database schemas
│   │   ├── rag/            # Semantic chunking & RAG retrieval logic
│   │   ├── services/       # Core business logic (LLM, Embeddings, Extraction)
│   │   └── vectorstore/    # Vector DB clients
│   ├── main.py             # FastAPI entry point
│   └── requirements.txt    # Python dependencies
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/     # Reusable UI components (chat, study, common)
    │   ├── context/        # Auth & Global state providers
    │   ├── pages/          # Full-page routing components
    │   ├── services/       # Axios API client wrapper
    │   ├── App.jsx         # Main React component & Routing
    │   └── main.jsx        # React DOM mounting
    ├── package.json        # Node dependencies
    ├── vite.config.js      # Vite configuration
    └── eslint.config.js    # Linter configuration
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- API Keys for Google Gemini and your chosen Vector DB

### 1. Clone the Repository
```bash
git clone https://github.com/saivivekduvva/PreppyLearn.git
cd PreppyLearn
```

### 2. Backend Setup
```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Variables (`.env.example`)
Create a `.env` file in the `backend/` directory and configure the following:

```env
# Application Settings
APP_NAME="AI Study Assistant API"
DEBUG=True
API_V1_STR="/api/v1"

# Security (JWT)
SECRET_KEY="your-super-secret-cryptographic-key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL="sqlite:///./preppylearn.db" # Or your PostgreSQL URL

# AI & Vector DB
GEMINI_API_KEY="your-google-gemini-api-key"
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX_NAME="preppylearn"
```

### 4. Run the Application

**Start the Backend Server:**
```bash
# From the backend directory with venv activated
uvicorn app.main:app --reload --port 8000
```

**Start the Frontend Server:**
```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser to view the application!

---

## 🔮 Future Improvements

- **Cloud Storage Migration**: Transition local file uploads to AWS S3 for better horizontal scaling.
- **Background Processing**: Implement Celery/Redis for asynchronous document extraction to prevent API timeouts on massive PDFs.
- **Gamification**: Implement a spaced-repetition system (SRS) for the generated flashcards.
- **Audio/Video Support**: Add integrations to transcribe and summarize lecture recordings.

---

## 🤝 Contributors

- **Sai Vivek Duvva** - *Full Stack / AI Engineer* - [GitHub](https://github.com/saivivekduvva) | [LinkedIn](https://www.linkedin.com/in/saivivekduvva)

*(Contributions, issues, and feature requests are welcome!)*

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
