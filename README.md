# BIT Sindri Clubs Dashboard & HnCC Induction Engine

A comprehensive full-stack platform designed to unify college club activities, induction workflows, AI candidate evaluation, event management, and secure role-based administration for **BIT Sindri**.

Built with a **Node.js Express** backend (with embedded PGlite / PostgreSQL), **Python AI Ranking Engine**, and a **React (Vite)** frontend.

---

## 🌟 Key Features & Recent Updates

### 🤖 1. AI-Powered Candidate Evaluation & Ranking (HnCC)
- **Multi-Factor Scoring Engine**: Automated evaluation pipeline evaluating candidates on:
  - Technical skills (80%)
  - Communication skills (20%)
- **Applicant Workspace Integration**: Positioned directly below the applicant directory in the Club Workspace for immediate decision-making.
- **Custom CSV Evaluation**: Upload custom applicant CSVs for live AI scoring, score distributions, and exportable ranking reports.
- **Status Management**: Filter and transition candidates across `Shortlisted`, `Under Review`, `Waitlisted`, and `Rejected`.

### 🛡️ 2. Privacy & Data Masking Guards
- **Candidate Anonymization for Club Admins**:
  - Seeded applicant names are automatically masked to initials (e.g. `Ayush Kumar` $\to$ `AK`, `Gaurav Roy` $\to$ `GR`).
  - Applicant phone numbers are hashed (e.g. `98765410` $\to$ `987****210`).
  - Full details remain accessible exclusively to the Master Administrator.
- **Dynamic Scope**: User-uploaded CSV candidate records retain original formatting and are not masked.
- **Admin Directory Privacy**: Restricted admin views mask fellow administrators' email addresses and phone numbers.

### 🔐 3. Granular Role-Based Access Control (RBAC)
- **Super / Master Admin Privilege**:
  - Only master admin has the authority to grant or revoke club administrator roles.
  - Non-master admins have administrative promotion/revocation controls disabled and hidden.
- **Applicant Restrictions**:
  - Club administrators are restricted from applying to any club inductions (enforced across backend routes and client UI).
- **Post-Login Routing**: Automatic redirection to the Home Page on login for intuitive navigation.

### 🎨 4. Modern UI, Pixel Art Animations & Interactive Experience
- **Pre-Configured Demo Accounts**: 3 quick-fill demo cards on the Login page:
  - **Rahul (HnCC Admin)**: Full administrative and induction privileges.
  - **Demo Student 1 & 2**: Student profile testing for induction applications and club exploration.
- **Pixelated Art Login Experience**: Retro 8-bit style visual branding and animated transitions upon successful sign-in.
- **Curated HnCC FAQs**: Interactive accordion FAQ section curated directly from official HnCC resources on the Events page.
- **Club Event Workspace**: View and manage upcoming college hackathons, coding contests, and workshops with custom banner art.

### ⚡ 5. Dual-Engine Database Architecture
- **Embedded PGlite Support**: Uses `@electric-sql/pglite` (WASM PostgreSQL in Node.js) for instantaneous, zero-configuration local development without installing an external database server.
- **Production PostgreSQL**: Seamless fallback to standard PostgreSQL connection pools via environment variables.

---

## 🏗️ Detailed Architecture & System Flow

### High-Level System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   BIT SINDRI UNIFIED CLUBS PLATFORM                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  👥 USER ROLES & PERSONAS
  ┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
  │         🎓 STUDENT        │      │       🛡️ CLUB ADMIN       │      │      👑 MASTER ADMIN      │
  │  (Apply, Explore, Events) │      │  (Manage Club & Inductions)│     │(Full Access, RBAC Control)│
  └─────────────┬─────────────┘      └─────────────┬─────────────┘      └─────────────┬─────────────┘
                │                                  │                                  │
                ▼                                  ▼                                  ▼
  💻 FRONTEND CLIENT TIER (React 18 + Vite)
  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • React Router v6 & Protected Routes                                                                  │
  │ • AuthContext (JWT Session Management & RBAC UI Guards)                                               │
  │ • Pages: Home, Clubs, ClubDetail, Events, ApplyInduction, AdminDashboard, Login                      │
  │ • Components: HnccCandidateRanking, ClubCard, Navbar, Footer, ImageUploader, PixelArtLoader         │
  │ • Themed UI: Glassmorphism, Retro Pixel-Art Animations, Micro-interactions                            │
  └──────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                     │ HTTP / REST API (Bearer JWT)
                                                     ▼
  ⚙️ BACKEND API & CONTROLLER TIER (Node.js & Express)
  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ • Express Server & REST Router (CORS, JSON BodyParser, Multer File Uploads)                          │
  │ • Authentication & JWT Middleware (Token Verification & Role Extraction)                              │
  │ • Role-Based Access Control (RBAC) & Permission Guards                                                │
  │ • Privacy & Anonymization Engine (Initial Masking, Phone Hashing, Scope Filtering)                    │
  │                                                                                                       │
  │ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                │
  │ │  /api/auth       │  │  /api/admin      │  │  /api/clubs      │  │  /api/events     │                │
  │ └──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘                │
  │ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                                      │
  │ │  /api/induction  │  │  /api/upload     │  │  /api/health     │                                      │
  │ └──────────────────┘  └──────────────────┘  └──────────────────┘                                      │
  └───────────────────────────────┬──────────────────────────────────────┬────────────────────────────────┘
                                  │                                      │
                                  ▼                                      ▼
  🤖 AI / ML EVALUATION ENGINE                     🗄️ PERSISTENCE & DATA TIER
  ┌──────────────────────────────────────────┐    ┌───────────────────────────────────────────────────────┐
  │ • Python NLP Subprocess Pipeline         │    │ • Dual Database Engine:                               │
  │ • Script: hncc_candidate_ranker.py       │    │   - Embedded PGlite (WASM PostgreSQL in Node.js)      │
  │ • Scoring Formula:                       │    │   - Standalone PostgreSQL (Production Fallback)       │
  │   - 80% Technical Skills                 │    │ • Relational Tables:                                  │
  │   - 20% Communication Skills             │    │   - users, clubs, events, applications,               │
  │ • Track Weighting & Normalization        │    │     candidate_rankings, audit_logs                    │
  └──────────────────────────────────────────┘    └───────────────────────────────────────────────────────┘
```

### Component Architecture & Interactions

```mermaid
graph TB
    subgraph Client_Tier ["Client Tier (React 18 + Vite)"]
        UI_Home["Home & Discovery Page"]
        UI_Events["Events & HnCC FAQs"]
        UI_ClubDetail["Club Portal & Details"]
        UI_Apply["Induction Application Form"]
        UI_Admin["Club Admin Dashboard"]
        UI_AI["AI Candidate Ranking UI"]
        UI_Login["Login & Pixel Art Loader"]
        AuthCtx["AuthContext & RBAC State"]
    end

    subgraph Server_Tier ["Server Tier (Node.js & Express)"]
        JWTMiddleware["JWT Auth & Role Guard"]
        PrivacyEngine["Privacy & Masking Filter"]
        AuthController["Auth Controller"]
        AdminController["Admin Management Controller"]
        ClubController["Club & Event Controller"]
        InductionController["Induction Controller"]
        AIRunner["AI Ranking Process Handler"]
    end

    subgraph AI_Tier ["AI Engine (Python)"]
        RankerScript["hncc_candidate_ranker.py"]
        TechScorer["Technical Evaluator (80%)"]
        CommScorer["Communication Evaluator (20%)"]
    end

    subgraph Data_Tier ["Data & Storage Tier"]
        DB["PostgreSQL / PGlite (WASM)"]
        Uploads["Static Media Storage (/uploads)"]
    end

    UI_Login --> AuthController
    AuthController --> DB
    UI_Apply --> InductionController
    UI_Admin --> AdminController
    UI_Events --> ClubController
    UI_AI --> AIRunner

    InductionController --> JWTMiddleware
    AdminController --> JWTMiddleware
    ClubController --> JWTMiddleware

    JWTMiddleware --> PrivacyEngine
    PrivacyEngine --> DB
    AdminController --> DB
    ClubController --> DB
    InductionController --> DB

    AIRunner --> RankerScript
    RankerScript --> TechScorer
    RankerScript --> CommScorer
    TechScorer --> AIRunner
    CommScorer --> AIRunner
    AIRunner --> DB
```

---

## 🔄 Full Platform Flow Diagrams

### 1. End-to-End User Journey & Life Cycle

```mermaid
flowchart TD
    Start([User Visits Platform]) --> LoginChoice{Has Account?}
    
    LoginChoice -->|No| Register[Register Student Account] --> Login[Sign In via Login Screen]
    LoginChoice -->|Yes / Demo| Login
    
    Login --> AuthCheck{Credentials Valid?}
    AuthCheck -->|No| LoginError[Show Error Notification] --> Login
    AuthCheck -->|Yes| PixelArt[Trigger 8-Bit Pixel Art Login Animation]
    
    PixelArt --> RedirectHome[Redirect to Home Page]
    RedirectHome --> RoleFork{User Role?}
    
    %% Student Path
    RoleFork -->|Student| StudentPath[Student Exploration]
    StudentPath --> ViewClubs[Browse 26+ BIT Sindri Clubs]
    StudentPath --> ViewEvents[Explore Events & Curated FAQs]
    StudentPath --> ApplyInduction[Submit Club Induction Form]
    ApplyInduction --> AppSubmitted[Application Saved in DB]
    
    %% Club Admin Path
    RoleFork -->|Club Admin| AdminPath[Club Workspace]
    AdminPath --> ManageEvents[Create / Update Events & Workshops]
    AdminPath --> ViewApplicants[View Club Induction Applicants]
    ViewApplicants --> MaskingCheck{Is Master Admin?}
    MaskingCheck -->|No| MaskData[Mask Seeded Names: 'AK', Hash Phone: '987****210']
    MaskingCheck -->|Yes| FullData[Full Unmasked Details Visible]
    
    MaskData --> AISection[Access AI Candidate Ranking Section]
    FullData --> AISection
    
    AISection --> RunAI[Evaluate / Rank Applicants via AI Model]
    AISection --> UploadCSV[Upload Custom Google Forms CSV]
    UploadCSV --> RunAI
    RunAI --> Decision[Shortlist / Waitlist / Reject Candidates]
    Decision --> ExportCSV[Export Ranked Candidate Report]
    
    %% Master Admin Exclusive Path
    RoleFork -->|Master Admin| MasterPath[Super Admin Controls]
    MasterPath --> AdminRoster[Manage Admin Roster]
    AdminRoster --> GrantRevoke[Grant or Revoke Club Admin Privileges]
```

---

### 2. Authentication & Dynamic Session Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Admin
    participant Client as React Client (Login.jsx)
    participant AuthContext as AuthContext.jsx
    participant API as Express API (/api/auth)
    participant DB as PostgreSQL / PGlite

    User->>Client: Selects Demo Account or enters credentials
    Client->>API: POST /api/auth/login { email, password }
    API->>DB: Query user by email & verify bcrypt password
    DB-->>API: User record (id, name, email, role, club_id)
    API-->>Client: Returns { token, user }
    Client->>Client: Triggers 8-Bit Pixel Art Login Transition Animation
    Client->>AuthContext: Stores token in localStorage & updates state
    AuthContext-->>Client: Dynamic route authorization (Student vs Admin)
    Client->>User: Redirects to Home Page (/) with role-tailored Navbar & Actions
```

---

### 3. AI Candidate Evaluation & Shortlisting Pipeline

```mermaid
flowchart TD
    A[Induction Applications Received] --> B{Source Type?}
    B -->|Portal Form Submission| C[Stored in Database]
    B -->|Custom Induction CSV| D[Raw CSV Upload via Dashboard]
    
    C --> E[Trigger AI Ranking Evaluation]
    D --> E
    
    E --> F[Feature Extraction & Normalization]
    F --> G1[Technical Domain Scoring 80%: Skills, Projects, Stack & GitHub]
    F --> G2[Communication Scoring 20%: Responses, SOP & Clarity]
    
    G1 & G2 --> H[Composite Score Aggregation 0 - 100]
    H --> I{Recommendation Thresholds}
    
    I -->|Score >= 80| J[Tier: Shortlisted 🟢]
    I -->|Score 65 - 79| K[Tier: Under Review 🟡]
    I -->|Score 50 - 64| L[Tier: Waitlisted 🟠]
    I -->|Score < 50| M[Tier: Rejected 🔴]
    
    J & K & L & M --> N[Rendered in HnccCandidateRanking Component]
    N --> O[Score Distributions, Filter Tabs & Export to CSV]
```

---

### 4. Data Privacy, Masking & Role Security Flow

```mermaid
flowchart TD
    A[Admin requests Candidate Records] --> B[JWT Token Verified]
    B --> C{Is Requesting User Master Admin?}
    
    C -->|YES: Master Admin| D[Full Unmasked Visibility]
    D --> E[Full Candidate Name: Ayush Kumar]
    D --> F[Full Phone Number: 9876543210]
    D --> G[Full Email Address: ayush@example.com]
    
    C -->|NO: General Club Admin| H{Data Source of Applicant?}
    H -->|Seeded Data| I[Apply Privacy Masking Pipeline]
    I --> J[Mask Name to Initials: 'Ayush Kumar' ➔ 'AK']
    I --> K[Hash Phone Number: '98765410' ➔ '987****210']
    I --> L[Hide / Obfuscate Email Address]
    
    H -->|User Uploaded CSV| M[Preserve Original Candidate Data]
    M --> N[Show Unmasked CSV Candidate Info]
```

---

### 5. Admin Hierarchy & Privilege Guard Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Club Administrator
    participant API as /api/admin Routes
    participant Middleware as Auth & Role Guard
    participant DB as Users Database

    Admin->>API: POST /api/admin/grant-admin OR /revoke-admin
    API->>Middleware: Inspect JWT session & verify admin status
    alt User is NOT Master Admin
        Middleware-->>API: Access Denied
        API-->>Admin: HTTP 403 Forbidden ("Only Master Admin can modify admin privileges")
    else User IS Master Admin
        Middleware-->>API: Authorized
        API->>DB: Update target user role & log audit entry
        DB-->>API: Success response
        API-->>Admin: HTTP 200 OK (Updated Admin Roster)
    end
```

---

## 📁 Project Structure

```
.
├── backend/                       # Node.js Express REST API & AI Service
│   ├── src/
│   │   ├── ai/                    # Python AI ranking script (hncc_candidate_ranker.py)
│   │   ├── db/                    # PGlite / PostgreSQL connection, schema & seeds
│   │   │   ├── init.js            # Table initialization
│   │   │   └── seed_admins.js     # Master & club admin seeding
│   │   ├── middleware/            # JWT authentication & role-based middleware
│   │   ├── routes/                # Auth, Admin, Clubs, Events, Induction, Upload
│   │   └── index.js               # Express application entrypoint
│   └── package.json
├── frontend/                      # React (Vite) Single Page Application
│   ├── src/
│   │   ├── assets/                # Logos, college crests, pixel art graphics
│   │   ├── components/            # HnccCandidateRanking, Navbar, Footer, ClubCard
│   │   ├── context/               # AuthContext session & state management
│   │   ├── pages/                 # Home, Clubs, Events, AdminDashboard, Login
│   │   ├── App.jsx                # Route declarations & layout structure
│   │   └── main.jsx               # React DOM entrypoint
│   └── package.json
├── api/                           # Serverless entrypoint for Vercel deployment
├── vercel.json                    # Monorepo deployment routing configuration
└── package.json                   # Root workspace scripts
```

---

## 🔑 Demo Credentials

| Role | Name | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Master Admin** | Rahul (HnCC) | `hncc.admin@bitsindri.ac.in` | `admin123` | Full access, unmasked candidate data, admin grant/revoke |
| **Club Admin** | Club Admin | `admin@bitsindri.ac.in` | `admin123` | Club workspace, masked seeded candidates, no admin grant/revoke |
| **Student 1** | Aryan Raj | `student.demo@bitsindri.ac.in` | `student123` | Induction applications, event participation |
| **Student 2** | Priya Sharma | `student2.demo@bitsindri.ac.in` | `student123` | Induction applications, club exploration |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Python 3.9+** (optional, for standalone AI ranking execution)

---

### Step 1: Install Dependencies
From the root directory:
```bash
npm run install:all
```
*(Or run `npm install` inside both `backend/` and `frontend/` directories).*

---

### Step 2: Configure Environment Variables
Inside `backend/`:
```bash
cp .env.example .env
```

Ensure `.env` contains:
```env
PORT=5000
JWT_SECRET=super_secret_jwt_key_hacktober
USE_PGLITE=true
```
> **Note**: `USE_PGLITE=true` runs the embedded database engine automatically. If using a standalone PostgreSQL database, set `USE_PGLITE=false` and provide `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.

---

### Step 3: Initialize Database & Seed Admins
```bash
cd backend
npm run init-db
npm run seed-admins
```

---

### Step 4: Run Development Servers

**Option A — Concurrent Root Command:**
```bash
# In the project root
npm run dev
```

**Option B — Independent Terminals:**
```bash
# Terminal 1: Backend API (http://localhost:5000)
cd backend
npm run dev

# Terminal 2: Frontend Client (http://localhost:5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📊 AI Candidate Evaluation Pipeline

The AI evaluation engine evaluates applicants through `backend/src/ai/hncc_candidate_ranker.py`:
1. **Technical Skills Scoring (80%)**: Evaluates competencies against relevant domains (Web Dev, App Dev, ML/AI, Cloud/DevOps, Competitive Programming), GitHub profiles, portfolio links, and branch/year alignment.
2. **Communication Skills Scoring (20%)**: Evaluates candidate responses, statements of purpose, and clarity.
3. **Recommendation Tiers**: Outputs individual sub-scores alongside recommendation tiers (`Shortlisted`, `Under Review`, `Waitlisted`, `Rejected`).

---

## 🛡️ Security & Privacy Guardrails

- **JWT Role Middleware**: Protected routes verify signed JWT tokens on every privileged request.
- **Seeded Data Anonymization**: Automatic string regex masking hides full names and phone numbers from non-master admins while preserving search and filtering integrity.
- **Admin Isolation**: Club administrators cannot self-promote, modify other admin accounts, or submit induction applications as students.

---

## 📜 Contributing & License

Contributions are welcome via Pull Requests. Please ensure all merges with `main` maintain 0 conflicts and pass build checks:
```bash
npm --prefix frontend run build
```

Licensed under the **ISC License**.
