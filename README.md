# Hacktober

A monorepo containing a React frontend and a Node.js Express backend.

## Project Structure

```
.
├── frontend/   # React app (Vite)
└── backend/    # Node.js Express API
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev    # starts with nodemon on http://localhost:5000
# or
npm start      # starts with node on http://localhost:5000
```

The API exposes:

- `GET /` — welcome message
- `GET /api/health` — health check

Copy `.env.example` to `.env` to configure the port.

### Frontend

```bash
cd frontend
npm install
npm run dev    # starts the Vite dev server
```

- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

## License

ISC
