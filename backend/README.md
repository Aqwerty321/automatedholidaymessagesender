# Holiday Email Orchestrator - Backend API

Node.js + Express + TypeScript + Prisma backend for logging email batches to PostgreSQL.

## Overview

This backend provides a REST API for:
- **Password-based login** with JWT token issuance
- Logging email batch sends to PostgreSQL
- Retrieving email log history
- Health checks for Render deployments

The actual email generation and sending happens via n8n + Toolhouse. This backend only stores metadata about sends for auditing and monitoring.

## Security Model

This backend implements enterprise-level security:

1. **Password Authentication**: Users must log in with an access password to receive a JWT.
2. **JWT Tokens**: All protected routes require a valid JWT in the `Authorization: Bearer <token>` header.
3. **API Key**: All protected routes require a valid API key in the `X-API-Key` header.
4. **Rate Limiting**: Prevents abuse with configurable request limits per IP.

### Authentication Flow

```
┌─────────────┐     POST /auth/login       ┌─────────────┐
│   Frontend  │ ─────────────────────────▶ │   Backend   │
│             │  { password: "..." }       │             │
│             │ ◀───────────────────────── │             │
│             │  { token: "jwt...", ... }  │             │
└─────────────┘                            └─────────────┘
       │
       │  Protected requests include:
       │  - Authorization: Bearer <jwt>
       │  - X-API-Key: <api-key>
       ▼
┌─────────────┐                            ┌─────────────┐
│   Frontend  │  POST /api/log-email-batch │   Backend   │
│             │ ─────────────────────────▶ │             │
│             │  (with auth headers)       │             │
└─────────────┘                            └─────────────┘
```

## Prerequisites

- Node.js >= 18
- PostgreSQL 17 (local or Render-hosted)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/holiday_emails?schema=public"

# Security (REQUIRED - backend will not start without these)
ACCESS_PASSWORD="your-secure-access-password"
JWT_SECRET="generate-with-node-e-console.log(require('crypto').randomBytes(32).toString('hex'))"
API_KEY_FRONTEND="generate-with-node-e-console.log(require('crypto').randomBytes(24).toString('hex'))"

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_SEC=60
RATE_LIMIT_MAX_REQ=30
```

**⚠️ Important:** The backend will fail to start if `ACCESS_PASSWORD`, `JWT_SECRET`, or `API_KEY_FRONTEND` are not set.

### 3. Run Database Migrations

For local development:

```bash
npx prisma migrate dev
```

This will:
- Create the database schema
- Generate the Prisma client

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:4000`.

## API Endpoints

### Public Routes

#### Health Check

```
GET /health
```

Returns:
```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2025-12-09T12:00:00.000Z"
}
```

#### Login

```
POST /auth/login
Content-Type: application/json

{
  "password": "your-access-password"
}
```

Returns (success):
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 28800
}
```

Returns (failure):
```json
{
  "ok": false,
  "error": "Invalid password",
  "code": "INVALID_PASSWORD"
}
```

### Protected Routes

All protected routes require:
- `Authorization: Bearer <jwt-token>`
- `X-API-Key: <api-key>`

#### Log Email Batch

```
POST /api/log-email-batch
Content-Type: application/json

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

Returns:
```json
{
  "ok": true,
  "batchId": "clxyz123...",
  "recipientCount": 2
}
```

### Get Email Logs

```
GET /api/email-logs?limit=20&offset=0&status=sent
```

Query Parameters:
- `limit` (optional): Number of results (1-100, default 20)
- `offset` (optional): Pagination offset (default 0)
- `status` (optional): Filter by status ("queued", "sent", "error")

Returns:
```json
{
  "ok": true,
  "logs": [
    {
      "id": "clxyz123...",
      "createdAt": "2025-12-09T12:00:00.000Z",
      "holidayName": "Christmas",
      "tone": "warm",
      "audienceType": "business",
      "language": "en",
      "senderName": "John Doe",
      "status": "sent",
      "errorMessage": null,
      "recipientCount": 2
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

### Get Single Batch

```
GET /api/email-logs/:id
```

Returns the batch with all recipients.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Start production server |
| `npm run prisma:migrate` | Run database migrations (production) |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |

## Database Schema

### EmailBatch

Stores metadata about each email batch sent.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier (cuid) |
| createdAt | DateTime | When the batch was created |
| holidayName | String | Holiday being celebrated |
| tone | String? | Email tone (warm, formal, etc.) |
| audienceType | String? | business or personal |
| language | String? | Language code (en, hi, etc.) |
| senderName | String | Who the email is from |
| status | String | queued, sent, or error |
| errorMessage | String? | Error details if status is error |

### EmailRecipient

Stores individual recipients within a batch.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier (cuid) |
| createdAt | DateTime | When the recipient was added |
| email | String | Recipient email address |
| subject | String? | Email subject (optional) |
| batchId | String | Reference to EmailBatch |

## Deployment on Render

### 1. Create a PostgreSQL Database

1. Go to Render Dashboard → New → PostgreSQL
2. Choose a name and region
3. Create the database
4. Copy the **Internal Database URL**

### 2. Create a Web Service

1. Go to Render Dashboard → New → Web Service
2. Connect your repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build && npm run prisma:generate`
   - **Start Command**: `npm run start`
4. Add Environment Variables:
   - `DATABASE_URL` = (paste Internal Database URL)
   - `ACCESS_PASSWORD` = (your secure access password)
   - `JWT_SECRET` = (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `API_KEY_FRONTEND` = (generate: `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`)
   - `RATE_LIMIT_WINDOW_SEC` = `60` (optional)
   - `RATE_LIMIT_MAX_REQ` = `30` (optional)

### 3. Run Migrations

After the first deploy, run migrations via Render Shell or locally:

```bash
# Via Render Shell
cd backend && npm run prisma:migrate

# Or locally with production DATABASE_URL
DATABASE_URL="postgresql://..." npm run prisma:migrate
```

### 4. Verify

Visit `https://your-service.onrender.com/health` to confirm the service is running.

## Project Structure

```
backend/
├── src/
│   ├── server.ts           # Express app entry point
│   ├── db/
│   │   └── client.ts       # Prisma client singleton
│   ├── middleware/
│   │   ├── requireApiKey.ts  # X-API-Key validation
│   │   ├── requireAuth.ts    # JWT validation
│   │   └── rateLimit.ts      # Rate limiting
│   ├── routes/
│   │   ├── auth.ts         # Login endpoint
│   │   ├── health.ts       # Health check route
│   │   └── emailLogs.ts    # Email logging routes
│   └── validation/
│       └── emailLog.ts     # Zod validation schemas
├── prisma/
│   └── schema.prisma       # Database schema
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express
- **Language**: TypeScript
- **ORM**: Prisma
- **Validation**: Zod
- **Database**: PostgreSQL 17

## License

MIT
