# Sports Reconnect – Certificate Generator

A modern, full-stack application for generating dynamic certificates. Built with **Vite + React + TypeScript** on the frontend and a backend API for certificate generation.

## Project Structure

```
.
├── frontend/           # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── backend/            # Backend API (Node.js/Express or your choice)
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md          # This file
```

## Frontend Features

### Pages
1. **Authentication (`/`)**: Login/Sign-up with glassmorphism card, dark theme, toggle between modes, gradient CTA
2. **Landing (`/landing`)**: Template selection page with navbar, hero section, live preview, and responsive certificate template grid

### Tech Stack
- **React 18** with TypeScript
- **Vite** – Fast bundler
- **Tailwind CSS** – Utility-first styling (dark theme, brand palette: #005461, #018790, #00B7B5, #F4F4F4)
- **React Router** – SPA navigation
- **Lucide React** – UI icons

### Getting Started

```bash
cd frontend
npm install
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Production build
npm run preview      # Preview production bundle
```

## Backend (Coming Soon)

Set up your Node.js/Express backend (or Python/Go/etc.) in the `backend/` folder. Refer to [backend/README.md](./backend/README.md) for setup instructions once added.

### Example Backend Tasks
- User authentication & JWT tokens
- Certificate generation (PDF/PNG export)
- Template storage & retrieval
- Upload & processing endpoints

## Development Guidelines

- **Frontend**: Modify components in `frontend/src/`, update styles with Tailwind utilities
- **Backend**: Add API endpoints, database migrations, and auth logic to `backend/`
- **Git**: Commit frontend and backend changes separately for clarity
- **Testing**: Add unit & integration tests in respective folders

## Environment Variables

Create `.env` files in both `frontend/` and `backend/` for local development:

**frontend/.env** (example):
```
VITE_API_URL=http://localhost:3001
```

**backend/.env** (example):
```
DATABASE_URL=postgres://...
JWT_SECRET=your_secret_key
PORT=3001
```

## Deployment

- **Frontend**: Deploy to Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Deploy to Heroku, Railway, AWS EC2, or Docker container

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: description"`
3. Push to GitHub: `git push origin feature/your-feature`
4. Open a PR for review

---

**Project initialized:** December 15, 2025  
**Team:** Aryan & teammates  
**Status:** Frontend scaffolding complete; backend setup pending
