# 🚀 BIT Sindri Unified Clubs Platform — Hacktoberfest Project

[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-2026-blueviolet?style=for-the-badge&logo=hacktoberfest)](https://hacktoberfest.com/)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_%2F_SQLite-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Sentence Transformers](https://img.shields.io/badge/AI_Engine-Sentence--Transformers_MiniLM-FF6F00?style=for-the-badge&logo=huggingface)](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)

A full-stack, AI-driven college platform designed to unify club activities, events, dynamic induction workflows, and administrative operations across all 26+ campus clubs at **BIT Sindri**.

---

## 🎯 The Core Problem Solved

1. **For Students:** Club information, social links, event posters, and induction forms were fragmented across WhatsApp groups, Instagram pages, and campus noticeboards.
2. **For Clubs:** Technical clubs receive **500+ raw induction applications** each recruitment cycle. Coordinators faced severe fatigue and bias manually reading open-ended responses, projects, and coding profiles.

---

## 🧠 Core AI Innovations (Key Highlight)

### 1. 🤖 AI Candidate Shortlisting & Ranking System
* **Sentence Transformers (`all-MiniLM-L6-v2`):** Converts students' open-ended experience, past projects, and technical skills into **384-dimensional dense semantic embeddings** rather than relying on basic keyword searches.
* **Domain Track Scoring:** Evaluates candidates simultaneously across 3 distinct technical tracks:
  1. **CP / DSA** (Data structures, algorithms, problem-solving, complexity analysis)
  2. **Web Development** (Frontend, REST APIs, full-stack architectures, databases)
  3. **AI / ML** (Python, machine learning, deep learning, NLP, computer vision)
* **Weighted Hybrid Scoring Formula:**
  $$\mathbf{80\%\ \text{Technical Skills}}\ (70\%\ \text{Semantic Match} + 20\%\ \text{Keywords} + 10\%\ \text{Languages}) + \mathbf{20\%\ \text{Communication Rating}}$$
* **Custom Induction CSV Ingestion:** Coordinators can upload any raw Google Forms induction responses (`.csv`). The Python engine automatically normalizes columns, computes embeddings on the fly, and caches candidate leaderboard percentiles.

### 2. 🔍 Student AI Club Finder / Semantic Recommender
* Students describe their interests in natural language (*"I want to do competitive programming, learn AI, and attend hackathons"*).
* Blends **60% Semantic Vector Similarity** with **40% Curated Club Keywords** to recommend the top **1–3 best-fit clubs** with transparent reason tags.

---

## 🏢 Platform Features & Role Portals

* **🎓 Student Portal:**
  * Browse all 26+ verified technical, cultural, and sports clubs.
  * Discover upcoming events, workshops, and hackathons with 1-click registration.
  * Fill customized induction forms and track real-time application statuses (*Submitted, Under Review, Shortlisted, Selected, Rejected*).
  * AI-powered personalized club recommendations.

* **🛡️ Club Admin Portal (Strict Data Isolation):**
  * Isolated scope: A club coordinator can only manage their assigned club (`Admin ➔ Assigned Club only`).
  * Dynamic Form Builder: Create/edit induction questions (short/long text, multiple choice, URLs, file uploads).
  * Applicant Management: Filter, search, and update applicant statuses with AI ranking insights.
  * Publish announcements and update official verified social handles.

* **👑 Super Admin Portal:**
  * Institute-level moderation of all clubs and verified categories.
  * Assign and revoke club admin roles.
  * Platform-wide analytics and audit trail logging (`who, what, when`).

* **🖼️ Media & Uploads:**
  * Multer-powered secure file upload endpoints for club logos, event posters, and candidate resumes.

---

## 🏗️ Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   BIT SINDRI UNIFIED CLUBS PLATFORM                         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
  👥 USER PERSONAS          [ 🎓 Student ]         [ 🛡️ Club Admin ]        [ 👑 Super Admin ]
                                  │                        │                       │
                                  ▼                        ▼                       ▼
  💻 FRONTEND CLIENT        ┌───────────────┐      ┌───────────────┐       ┌───────────────┐
     (React 18 + Vite)      │ Club Discovery│      │ AI Recommender│       │ Dynamic Forms │ ──► [ Admin Portals ]
                            └───────┬───────┘      └───────┬───────┘       └───────┬───────┘
                                    │                      │                       │
                                    └──────────────────────┼───────────────────────┘
                                                           ▼ (HTTP / Bearer JWT)
  ⚙️ BACKEND REST API       ┌───────────────────────────────────────────────────────┐   ┌───────────────────────────┐
     (Node.js & Express)    │ [ JWT Auth ] ──► [ Role-Based Access Control (RBAC) ] │   │       AI / ML ENGINE      │
                            │                      │                                │   ├───────────────────────────┤
                            │                      ▼                                │   │ 1. Hybrid Club Recommender│
                            │ [ API Controllers: Clubs | Events | Induction | Admin]│◄──┼──►  (Semantic + Keywords) │
                            └──────────────────────┬────────────────────────────────┘   │ 2. NLP Candidate Ranker   │
                                                   │                                    │     (all-MiniLM-L6-v2)    │
                                                   ▼                                    └───────────────────────────┘
  🗄️ DATABASE & STORAGE     ┌───────────────────────────────────────────────────────┐   ┌───────────────────────────┐
     (PostgreSQL & FS)      │ [ PostgreSQL DB: Users | Clubs | Apps | Audit Logs ]  │   │ 📁 File Storage (/uploads)│
                            └───────────────────────────────────────────────────────┘   └───────────────────────────┘
```

---

## 📁 Project Structure

```
.
├── backend/                      # Node.js & Express REST API
│   ├── src/
│   │   ├── ai/                   # Python NLP Candidate Shortlisting & Ranking Models
│   │   │   └── hncc_candidate_ranker.py
│   │   ├── data/                 # Raw induction CSVs & ranked cache JSON
│   │   ├── db/                   # Schema (PostgreSQL/SQLite), connection, & seed scripts
│   │   │   ├── db.js
│   │   │   ├── init.js
│   │   │   ├── schema.sql
│   │   │   └── seed_clubs.js
│   │   ├── middleware/           # JWT auth & server-side RBAC validation
│   │   ├── routes/               # Auth, Clubs, Events, Induction, Admin, SuperAdmin, Upload, Recs
│   │   ├── utils/                # Audit logger & helpers
│   │   └── index.js              # Express app entrypoint & middleware setup
│   └── package.json
├── frontend/                     # Vite + React Client
│   ├── public/                   # Public assets & club logos
│   ├── src/
│   │   ├── assets/               # Pixel-art banners & room illustrations
│   │   ├── components/           # Navbar, Footer, PixelIcon, HnccCandidateRanking, ProtectedRoute
│   │   ├── context/              # AuthContext (JWT session management)
│   │   ├── pages/                # Home, Clubs, ClubDetail, Events, ApplyInduction, Admin dashboards
│   │   ├── App.jsx               # Client routes & protected paths
│   │   └── main.jsx              # React DOM entrypoint
│   └── package.json
├── clubs-platform-flow.svg       # Architecture & request flow SVG diagram
├── PROJECT_OVERVIEW.md           # Comprehensive project specification document
└── package.json                  # Monorepo root scripts
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js:** v18+ 
* **npm:** v9+
* **Python (Optional for local AI inference):** 3.9+ with `pip`
* **PostgreSQL (Optional):** v14+ (A local SQLite fallback is built-in for zero-setup demos)

---

### 1. Repository Installation

Clone the repository and install root dependencies:
```bash
git clone https://github.com/rishabh1244/hacktober.git
cd hacktober
npm run install:all
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

1. Create your environment configuration:
   ```bash
   cp .env.example .env
   ```
2. Configure environment variables in `.env`:
   ```env
   PORT=5000
   JWT_SECRET=bit_sindri_clubs_super_secret_jwt_key_2026
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=bit_sindri_clubs
   ```
3. Initialize and seed database tables with verified club data:
   ```bash
   npm run init-db
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   # Backend running at http://localhost:5000
   # Health check: http://localhost:5000/api/health
   ```

---

### 3. AI / Python Engine Setup (For Candidate Ranking)

```bash
cd backend/src/ai
pip install sentence-transformers pandas numpy torch scikit-learn
```

To run the offline candidate shortlisting model on any induction CSV:
```bash
python hncc_candidate_ranker.py --csv ../data/hncc_candidates.csv --output ../data/hncc_ranked_cache.json
```

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Vite client running at http://localhost:5173
```

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Student** | `student@bitsindri.ac.in` | `password123` | Discover clubs, apply, view recommendations |
| **Club Admin** | `hncc.admin@bitsindri.ac.in` | `password123` | Full control over HnCC club & induction applications |
| **Super Admin** | `super.admin@bitsindri.ac.in` | `password123` | Platform-wide verification, moderation & audit logs |

---

## 📜 License
This project is open-source and available under the **ISC License**.
