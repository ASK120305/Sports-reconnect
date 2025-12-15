# Backend – Sports Reconnect Certificate Generator

Backend API for user authentication, certificate generation, template management, and export functionality.

## Setup Instructions (Coming Soon)

Populate this folder with your backend implementation:
- **Framework**: Node.js (Express), Python (Django/FastAPI), Go, etc.
- **Database**: PostgreSQL, MongoDB, or your choice
- **Authentication**: JWT or OAuth2
- **Certificate Generation**: Use libraries like `pdfkit`, `html2pdf`, or Cloudinary for image manipulation

## Example Structure (Node.js/Express)

```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── certificates.js
│   │   └── templates.js
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── server.js
├── .env
├── package.json
└── README.md
```

## Environment Variables

```
DATABASE_URL=postgres://user:password@localhost/sports_reconnect
JWT_SECRET=your_secret_key_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## API Endpoints (Design)

- `POST /api/auth/register` – User registration
- `POST /api/auth/login` – User login
- `GET /api/templates` – Fetch all templates
- `POST /api/certificates/generate` – Generate certificate
- `POST /api/certificates/export` – Export as PDF/PNG

---

**Status**: Setup pending  
**Timeline**: Define based on team roadmap
