# Backend – Sports Reconnect Certificate Generator

Node.js/Express backend for bulk certificate generation using HTML templates and Puppeteer.

## Setup

From the monorepo root:

```bash
cd backend
npm install
npm run dev
```

The server listens on port `4000` by default.

### Environment variables

Create a `.env` file in `backend/` (optional):

```bash
PORT=4000
FRONTEND_URL=http://localhost:5173
```

## Certificate generation flow

- HTML templates live in `backend/templates` and use placeholders: `{{NAME}}`, `{{COURSE}}`, `{{DATE}}`, `{{CERT_ID}}`.
- Excel rows parsed on the frontend are sent as JSON records to the backend.
- Each row is mapped into the placeholders and rendered to PDF via Puppeteer.
- All PDFs are zipped and streamed back as a single downloadable ZIP.

## API

### `POST /api/certificates/generate-bulk`

**Body (JSON)**:

```json
{
  "templateId": "aurora-edge",
  "records": [
    {
      "Name": "Alex Doe",
      "Course": "Basketball Coaching 101",
      "Date": "2025-01-10",
      "Certificate ID": "SR-001"
    }
  ]
}
```

The backend is flexible with column names and will try common variants for each placeholder.

**Response**:

- `200 OK` with `application/zip` body containing one PDF per record.

