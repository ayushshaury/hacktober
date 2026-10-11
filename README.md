# BIT Sindri Clubs Dashboard — Hacktoberfest Project

A full-stack monorepo web platform designed to unify college club activities, events, induction workflows, and student engagement at BIT Sindri.

Built with a **Node.js Express** backend (PostgreSQL database) and a **React (Vite)** modern frontend.

---

## 📁 Project Structure

```
.
├── backend/                  # Node.js & Express REST API
│   ├── src/
│   │   ├── db/               # PostgreSQL connection, schema & seed scripts
│   │   ├── middleware/       # JWT auth & role validation middleware
│   │   ├── routes/           # Auth, Clubs, Events, Induction, Admin & Upload routes
│   │   ├── utils/            # Audit logging & helper utilities
│   │   └── index.js          # Express app entrypoint & configuration
│   └── package.json
├── frontend/                 # Vite + React client
│   ├── src/
│   │   ├── components/       # Navbar, Footer, ImageUploader, ProtectedRoute
│   │   ├── context/          # Auth context and session management
│   │   ├── pages/            # Home, Clubs, Events, Induction, Admin dashboards
│   │   ├── App.jsx           # Main routing & layout
│   │   └── main.jsx          # React DOM entrypoint
│   └── package.json
└── package.json              # Monorepo root scripts
```

---

## ✨ Features

- **Authentication & Roles**: Secure JWT authentication supporting `student`, `club_admin`, and `super_admin` roles.
- **Club Directory**: Browse all technical, cultural, and sports clubs with detailed info, coordinator contacts, and social links.
- **Event Management**: Create, update, and discover upcoming college events and workshops.
- **Induction Portal**: Submit student induction applications, review candidate submissions, and manage statuses.
- **Admin Dashboards**: Dedicated management interfaces for club coordinators and college super-administrators.
- **Recommendations**: Smart club recommendation engine based on user interests.
- **Media Uploads**: Image upload endpoints for event banners, club logos, and profile avatars.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### 1. Root Installation
You can install dependencies for root, backend, and frontend at once:
```bash
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
2. Configure your PostgreSQL credentials in `.env`:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_here
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_NAME=bit_sindri_clubs
   ```
3. Initialize and seed database tables:
   ```bash
   npm run init-db
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   # Server runs on http://localhost:5000
   ```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Vite client runs on http://localhost:5173
```

Other available frontend commands:
- `npm run build` — Build production assets to `dist/`
- `npm run preview` — Locally preview the production build

---

## 📜 License
ISC
