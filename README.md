# Holiday Email Orchestrator

A production-ready multi-service application for sending personalized AI-generated holiday emails.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Frontend (React + TypeScript)               │   │
│  │                                                          │   │
│  │  • Holiday Email Form                                    │   │
│  │  • Admin Logs View                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────┬────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                │
┌─────────────────┐  ┌─────────────────┐   │
│  n8n + Toolhouse│  │ Render Backend  │   │
│   (Webhook)     │  │   (Node API)    │   │
│                 │  │                 │   │
│ • AI Email Gen  │  │ • Log Batches   │   │
│ • SMTP Sending  │  │ • Query Logs    │   │
└─────────────────┘  └────────┬────────┘   │
                              │            │
                              ▼            │
                     ┌─────────────────┐   │
                     │ Render Postgres │   │
                     │      (DB)       │   │
                     └─────────────────┘   │
```

### Data Flow

1. **User submits form** in frontend
2. **Frontend POSTs to n8n webhook** → n8n generates emails via Toolhouse AI and sends via SMTP
3. **Frontend POSTs to backend API** → Backend logs the batch to Postgres
4. **Admin can view logs** in the frontend admin panel

## Project Structure

```
/
├── frontend/           # Vite + React + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── components/ # UI components (Form, Alert, AdminLogs)
│   │   ├── lib/        # Utilities (validation)
│   │   ├── config.ts   # Environment config
│   │   └── App.tsx     # Main app
│   ├── package.json
│   └── README.md
│
├── backend/            # Node + Express + TypeScript + Prisma
│   ├── src/
│   │   ├── routes/     # API routes (health, emailLogs)
│   │   ├── db/         # Prisma client
│   │   ├── validation/ # Zod schemas
│   │   └── server.ts   # Express server
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── README.md
│
├── docs/               # Additional documentation
│   └── render-backend.md
│
└── README.md           # This file
```

## Quick Start

### Prerequisites

- Node.js >= 18
- PostgreSQL 17 (local or Render)
- n8n instance (local or hosted)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
npx prisma migrate dev
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with VITE_WEBHOOK_URL and VITE_API_BASE_URL
npm run dev
```

### 3. n8n Workflow

Import or create a workflow with:
- Webhook trigger accepting POST with the JSON payload
- Toolhouse integration for AI email generation
- Gmail/SMTP node for sending emails

## Environment Variables

### Frontend (`/frontend/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_WEBHOOK_URL` | n8n webhook URL | `http://localhost:5678/webhook/abc123` |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:4000` |

### Backend (`/backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Postgres connection string | `postgresql://user:pass@localhost:5432/db` |
| `PORT` | Server port (optional) | `4000` |
| `CORS_ORIGIN` | Allowed origins (optional) | `https://your-frontend.vercel.app` |

## Deployment

### Frontend → Vercel

1. Connect repo to Vercel
2. Set root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables:
   - `VITE_WEBHOOK_URL` = your production n8n webhook
   - `VITE_API_BASE_URL` = your Render backend URL

### Backend → Render

1. Create Web Service on Render
2. Root directory: `backend`
3. Build command: `npm install && npm run build && npm run prisma:generate`
4. Start command: `npm run start`
5. Add environment variable:
   - `DATABASE_URL` = Render Postgres internal URL

### Database → Render Postgres

1. Create PostgreSQL database on Render
2. Copy internal connection string to backend's `DATABASE_URL`
3. Run migrations: `npm run prisma:migrate`

## API Contract

### POST to n8n Webhook

```json
{
  "holiday_name": "Christmas",
  "tone": "warm",
  "sender_name": "John Doe",
  "audience_type": "business",
  "language": "en",
  "recipients": "alice@example.com, bob@example.com"
}
```

### POST to Backend `/api/log-email-batch`

```json
{
  "holidayName": "Christmas",
  "tone": "warm",
  "senderName": "John Doe",
  "audienceType": "business",
  "language": "en",
  "recipients": ["alice@example.com", "bob@example.com"],
  "status": "sent"
}
```

### GET Backend `/api/email-logs`

Returns list of email batches with recipient counts.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Database**: PostgreSQL 17
- **AI/Automation**: n8n, Toolhouse
- **Hosting**: Vercel (frontend), Render (backend + DB)

## License

MIT
