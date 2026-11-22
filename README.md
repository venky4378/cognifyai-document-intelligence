# ⚡ CognifyAI — Enterprise Document Intelligence & Conversational RAG Platform

[![Java 21](https://img.shields.io/badge/Java-21-orange?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot 3](https://img.shields.io/badge/Spring_Boot-3.4+-brightgreen?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 19](https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791?logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel&logoColor=white)](https://cognifyai-document-intelligence.vercel.app)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)](https://cognifyai-document-intelligence.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **CognifyAI** is an end-to-end, full-stack AI SaaS platform that allows users to upload unstructured PDF documents and interact with them in real time using **Retrieval-Augmented Generation (RAG)**. Built with modern enterprise architectural principles, it features a Spring Boot 3 + Java 21 REST API containerized with Docker, a serverless PostgreSQL database with `pgvector`, and a high-contrast Obsidian dark theme React frontend.

---

## 🌐 Live Deployments

| Component | Cloud Platform | Live URL |
| :--- | :--- | :--- |
| **Frontend Web App** | **Vercel** | [https://cognifyai-document-intelligence.vercel.app](https://cognifyai-document-intelligence.vercel.app) |
| **Backend REST API** | **Render** | `https://cognifyai-document-intelligence.onrender.com` |
| **Database & Vector Store** | **Neon.tech** | Serverless PostgreSQL 16 + `pgvector` |

---

## 🏗️ System Architecture

CognifyAI follows a decoupled cloud architecture designed for high availability, low latency, and zero cold starts for frontend consumers:

```
┌─────────────────────────────────────────────────────────────┐
│                   Vercel Global Edge CDN                    │
│     React 19 + Vite SPA (Obsidian Dark SaaS Interface)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST (CORS enabled)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Render Docker Container                     │
│         Spring Boot 3 (Java 21) REST Backend Service         │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │  Spring Security 6    │       │   Document Pipeline   │  │
│  │  JWT + BCrypt + OTP   │       │  Chunking & Indexing  │  │
│  └───────────────────────┘       └───────────┬───────────┘  │
└──────────────┬───────────────────────────────┼──────────────┘
               │                               │
               │ JDBC SSL Connection Pool      │ Embeddings / Prompts
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Neon PostgreSQL DB      │ │      External AI APIs      │
│  • Relational: Users, Docs   │ │  • Gemini 3072d Embeddings │
│  • pgvector: Vector Store    │ │  • Groq High-Speed LLM     │
│  • Cosine Similarity Search  │ │  • Gmail SMTP (OTP Service)│
└──────────────────────────────┘ └────────────────────────────┘
```

---

## ✨ Key Features

- **📑 Multi-Stage Document Ingestion**: Ingests multi-page PDFs using Apache PDFBox, dynamically splitting text into normalized overlapping chunks to preserve contextual continuity.
- **🧠 Native Vector Search (`pgvector`)**: Stores and queries high-dimensional embeddings (3,072 dimensions) directly in PostgreSQL via cosine distance (`COSINE_DISTANCE`), eliminating the overhead of managing a separate vector database.
- **🎯 Grounded RAG with Source Citations**: Queries are augmented with Top-K relevant document chunks and fed to Groq's high-speed inference engine, returning answers with exact page-level citation badges (e.g. `[Document.pdf - Page 5]`).
- **🔐 Enterprise Authentication & Recovery**:
  - Stateless authentication with **Spring Security 6** and **JWT**.
  - Dynamic **HMAC-SHA256 key stretching** to prevent weak secret exceptions.
  - Automated **Forgot Password** workflow delivering a secure 6-digit OTP via Gmail SMTP.
- **🎨 Obsidian Dark SaaS UI**: High-contrast, Linear/Cursor-inspired design with:
  - Multi-stage animated radar upload progress studio.
  - Document library with metadata inspection and delete actions.
  - Interactive AI chat assistant with zero-dependency markdown table & code rendering.
- **🚀 Cloud Native & Containerized**: Built with a multi-stage `Dockerfile` (Maven builder + Alpine JRE runner) for sub-150MB production container images.

---

## 🛠️ Tech Stack

### Backend
- **Language**: Java 21 (LTS)
- **Framework**: Spring Boot 3.4+
- **Security**: Spring Security 6, JJWT (io.jsonwebtoken 0.12.6), BCrypt
- **Persistence**: Spring Data JPA, Hibernate, HikariCP
- **AI & RAG**: Spring AI, Google Gemini Embeddings (`gemini-embedding-001`), Groq API
- **Document Processing**: Apache PDFBox
- **Email Service**: Spring Boot Mail (`JavaMailSender`), Gmail SMTP

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM (v6) with SPA rewrite rules
- **Icons**: Lucide React
- **HTTP Client**: Axios (with base URL auto-normalization & auth interceptors)
- **Styling**: Pure Modular CSS (Obsidian theme `#030407`, glassmorphism, pulse animations)

### Database & DevOps
- **Database**: PostgreSQL 16 on Neon (Serverless) + `pgvector`
- **Containers**: Docker (Multi-stage build)
- **Hosting**: Render (Backend Web Service), Vercel (Frontend Edge CDN)

---

## 📋 Environment Variables Reference

To run this project locally or in production, configure the following environment variables:

| Variable | Description | Example / Format |
| :--- | :--- | :--- |
| `SERVER_PORT` | Port for Spring Boot container | `8080` (or `8181` locally) |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC connection string | `jdbc:postgresql://<host>/neondb?sslmode=require` |
| `DB_USERNAME` | Database username | `neondb_owner` |
| `DB_PASSWORD` | Database password | `<your-neon-password>` |
| `JWT_SECRET` | Secret key for JWT signing (>= 32 chars) | `your-secure-256-bit-secret-key-here` |
| `GROQ_API_KEY` | Groq API Key for LLM chat | `gsk_...` |
| `GOOGLE_GENAI_API_KEY`| Google Gemini API Key for embeddings | `AIza...` |
| `MAIL_USERNAME` | Gmail address for sending OTPs | `your-email@gmail.com` |
| `MAIL_PASSWORD` | 16-character Google App Password | `abcd efgh ijkl mnop` (no spaces) |
| `VITE_API_BASE_URL` | *(Frontend)* Backend REST API URL | `https://cognifyai-document-intelligence.onrender.com/api` |

---

## 🚀 Local Development Setup

### Prerequisites
- **JDK 21** or later
- **Node.js 18+** & npm
- **PostgreSQL** with `pgvector` extension enabled

### 1. Clone the Repository
```bash
git clone https://github.com/venky4378/cognifyai-document-intelligence.git
cd cognifyai-document-intelligence
```

### 2. Configure Backend
Copy `.env.example` or set your environment variables, then run:
```bash
./mvnw clean spring-boot:run
```
Backend will start on `http://localhost:8181`.

### 3. Configure Frontend
```bash
cd frontend/frontend
npm install
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## 🐳 Docker Deployment

To build and run the production container locally:

```bash
# Build the multi-stage Docker image
docker build -t cognifyai-backend .

# Run the container
docker run -p 8080:8080 --env-file .env cognifyai-backend
```

---

## 💡 Engineering Challenges Solved

1. **WeakKeyException Prevention**: Implemented automated SHA-256 key stretching in `JwtService.java`. When any key shorter than 32 bytes (256 bits) is supplied, it is deterministically digested into a cryptographically compliant 256-bit key, eliminating startup crashes.
2. **Hybrid ACID + Vector Store**: Combined relational user tables, authentication entities, and high-dimensional vector embeddings within a single PostgreSQL database using `pgvector`, removing data-sync lag and external vector database subscription costs.
3. **Decoupled CORS & Edge Routing**: Configured Spring Security's `CorsConfigurationSource` with dynamic pattern origins (`setAllowedOriginPatterns(List.of("*"))`) and `allowCredentials(true)` to permit seamless, secure preflight requests between Vercel Edge CDN and Render backend instances.

---

## 👤 Author

**Venkayya Swamy Chamanthi**  
*Java Full Stack Developer*  
- **GitHub**: [@venky4378](https://github.com/venky4378)  
- **LinkedIn**: [Venkayya Swamy](https://www.linkedin.com/in/venkayya-swamy-chamanthi/)

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
