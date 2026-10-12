# 🚀 BIT Sindri Unified Clubs Platform

### 📌 Project Overview
The **BIT Sindri Unified Clubs Platform** is a full-stack, AI-driven college platform designed to unify club discovery, event management, induction workflows, and administrative operations across all 26+ campus clubs at BIT Sindri.

Before this platform, club activities and recruitment notices were scattered across WhatsApp groups, Instagram posts, and posters, while club coordinators faced extreme screening fatigue manually reviewing **500+ raw induction applications** each recruitment cycle. This project serves as a single source of truth for students, club coordinators, and institute administrators.

---

### 🌟 Key Features

#### 1. 🎓 Student Discovery & Induction Portal
* **Verified Club Directory:** Explore all 26+ technical, cultural, and sports clubs with official contacts, categories, and verified social handles.
* **Events & Workshops:** Discover upcoming college hackathons, technical workshops, and club orientations with 1-click registration.
* **Dynamic Induction Applications:** Students apply directly through customized induction forms and track real-time application statuses (*Submitted, Under Review, Shortlisted, Selected, Rejected*).
* **AI Club Finder:** Students describe their interests in natural language (*"I want to do competitive programming, learn AI, and attend hackathons"*), and the system recommends the top 1–3 best-fit clubs with transparent reason tags.

#### 2. 🧠 AI Candidate Shortlisting & Ranking System (Core Highlight)
Solves the challenge of evaluating **500+ applicant responses** objectively:
* **Sentence Transformers (`all-MiniLM-L6-v2`):** Converts students' open-ended experience, project descriptions, and skill summaries into **384-dimensional dense semantic embeddings** rather than relying on basic keyword searches.
* **Domain Track Scoring:** Evaluates candidates across 3 core technical tracks:
  1. **CP / DSA** (Data structures, algorithms, problem-solving, complexity analysis)
  2. **Web Development** (Frontend, APIs, full-stack architectures, databases)
  3. **AI / ML** (Python, machine learning, deep learning, NLP, computer vision)
* **Hybrid Scoring Formula:**
  $$\mathbf{80\%\ \text{Technical Skills}}\ (70\%\ \text{Semantic Match} + 20\%\ \text{Keywords} + 10\%\ \text{Languages}) + \mathbf{20\%\ \text{Communication Rating}}$$
* **Raw CSV Ingestion:** Coordinators can upload any raw Google Forms induction responses (`.csv`). The Python engine automatically normalizes columns, computes embeddings on the fly, and caches candidate leaderboard percentiles.

#### 3. 🛡️ Club Admin Portal (Strict Isolation)
* **Isolated Scope:** A club coordinator can only view and manage their assigned club (`Admin ➔ Assigned Club only`).
* **Dynamic Form Builder:** Admins create and modify custom induction forms (short/long text, multiple choice, URLs, resume uploads) without touching code.
* **Applicant Review Dashboard:** Real-time applicant search, filtering, status transitions, and AI rank review.

#### 4. 👑 Super Admin Governance
* Institute-level moderation of all clubs.
* Assign and revoke club admin roles.
* Global event approvals and comprehensive audit trail logging (`who, what, when`).

---

### 🏗️ Technical Architecture & Stack

```
[ Students / Admins ]
        │
        ▼ (HTTP / Bearer JWT)
[ Frontend: React 18 + Vite ]
   ├── Pixel Art UI & Glassmorphism Theme
   ├── React Router v6 & Protected Routes
   └── Auth Context
        │
        ▼ (REST API)
[ Backend: Node.js + Express ]
   ├── JWT Auth & Role-Based Access Control (RBAC)
   ├── Multer Media Uploads (/uploads)
   ├── SQLite / PostgreSQL Layer (schema.sql)
   └── Route Controllers (Auth, Clubs, Events, Induction, Admin, Recs)
        │
        ├──► [ Database: PostgreSQL / SQLite ]
        └──► [ AI Engine: Python NLP (Sentence-Transformers MiniLM-L6-v2) ]
```

* **Frontend:** React 18, Vite, React Router v6, Lucide Icons, Custom Pixel-Art Component Engine.
* **Backend:** Node.js, Express.js REST API, JSON Web Tokens (JWT), Multer.
* **Database:** PostgreSQL (with SQLite compatibility layer for offline development).
* **AI & Machine Learning:** Python 3, `sentence-transformers`, PyTorch, Scikit-learn, Pandas, NumPy.

---

### 🔒 Security & Data Integrity

1. **Server-Side RBAC:** Middleware verifies token roles on protected routes (`student`, `club_admin`, `super_admin`).
2. **Cross-Club Data Isolation:** Club admins cannot view or alter another club's applications; access queries strictly enforce `WHERE club_id = req.user.club_id`.
3. **No Fabricated Information:** Only verified club activities, domains, and official links are stored.
4. **Audit Logs:** Sensitive administrative updates record action timestamps and user metadata for full traceability.
