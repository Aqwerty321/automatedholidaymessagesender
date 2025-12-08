# Holiday Email Orchestrator - Frontend

Vite + React + TypeScript + TailwindCSS frontend for sending personalized holiday emails.

## Overview

This frontend provides a user interface for:
- **Password-protected login** (credentials validated by backend)
- Composing holiday email batches with customizable options
- Sending emails via n8n webhook + Toolhouse AI
- Viewing email batch logs from the backend API

## Security Model

The frontend implements secure authentication:

1. **Password Login**: Users enter an access password, which is verified by the backend.
2. **JWT Storage**: The backend returns a JWT token, stored in localStorage (and memory).
3. **Authenticated Requests**: All API calls include the JWT token and an API key.
4. **Webhook Secret**: Calls to n8n include a secret header for verification.
5. **Auto-Logout**: Expired tokens trigger automatic logout.

**Important**: The access password is NEVER stored in the frontend. Only the JWT token (valid for 8 hours) is stored locally.

## Prerequisites

- Node.js >= 18
- Backend API running (required for authentication and logs)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your environment variables:

```env
# URLs (required)
VITE_WEBHOOK_URL=https://your-n8n.app.n8n.cloud/webhook/holiday-email
VITE_API_BASE_URL=http://localhost:4000

# Security (required)
VITE_API_KEY_FRONTEND=your-api-key-must-match-backend
VITE_N8N_SECRET=your-n8n-webhook-secret

# Optional
VITE_ACCESS_PASSWORD_HINT=Contact admin for access
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_WEBHOOK_URL` | Yes | Your n8n webhook URL for email generation |
| `VITE_API_BASE_URL` | Yes | Backend API URL (for auth and logging) |
| `VITE_API_KEY_FRONTEND` | Yes | API key matching backend's `API_KEY_FRONTEND` |
| `VITE_N8N_SECRET` | Yes | Secret header sent to n8n webhook |
| `VITE_ACCESS_PASSWORD_HINT` | No | Optional hint shown on login page |

### Supported Backend Types

The app auto-detects your backend type from the URL:

- **n8n Cloud**: URLs containing `.n8n.cloud` or `n8n.io`
- **Render**: URLs containing `.render.com` or `.onrender.com`
- **Local**: URLs containing `localhost` or `127.0.0.1`
- **Other**: Any other URL

This is displayed in the form header so you know which webhook is configured.

## Features

### Login

Users must authenticate with the access password before accessing the app. The password is verified by the backend, which returns a JWT token valid for 8 hours.

### Email Form

- **Holiday Name**: Required, e.g., "Christmas", "Diwali", "Thanksgiving"
- **Sender Name**: Required, who the email is from
- **Tone**: Optional, e.g., "warm", "formal", "humorous"
- **Language**: Select from English, Hindi, or Spanish
- **Audience Type**: Business or Personal
- **Recipients**: One or more email addresses (comma or newline separated)

### Email Logs

Click "View Logs" to see a history of email batches sent. This requires the backend API to be running and `VITE_API_BASE_URL` to be configured.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Deployment on Vercel

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your repository

### 2. Configure Build Settings

- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3. Set Environment Variables

In Vercel Project Settings → Environment Variables:

```
VITE_WEBHOOK_URL = https://your-n8n.app.n8n.cloud/webhook/holiday-email
VITE_API_BASE_URL = https://your-backend.onrender.com
VITE_API_KEY_FRONTEND = (same value as API_KEY_FRONTEND in backend)
VITE_N8N_SECRET = (same value as N8N_WEBHOOK_SECRET in n8n)
VITE_ACCESS_PASSWORD_HINT = Contact admin for access (optional)
```

### 4. Deploy

Click "Deploy". Vercel will build and deploy your frontend.

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx             # App entry point
│   ├── App.tsx              # Main layout with auth check
│   ├── config.ts            # Environment configuration
│   ├── context/
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── components/
│   │   ├── Login.tsx        # Password login form
│   │   ├── Form.tsx         # Email composition form
│   │   ├── Field.tsx        # Reusable form field component
│   │   ├── Alert.tsx        # Success/error alert component
│   │   └── AdminLogs.tsx    # Email batch log viewer
│   └── lib/
│       └── validation.ts    # Email and form validation
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── README.md
```

## Tech Stack

- **Build Tool**: Vite 5.x
- **Framework**: React 18
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS
- **Linting**: ESLint

## API Integration

### Webhook Payload

The form sends the following to your n8n webhook (includes secret header):

```typescript
// Headers
{
  "Content-Type": "application/json",
  "X-N8N-SECRET": "<VITE_N8N_SECRET>"
}

// Body
{
  holiday_name: string;    // e.g., "Christmas"
  tone: string;            // e.g., "warm"
  sender_name: string;     // e.g., "John Doe"
  audience_type: string;   // "business" or "personal"
  language: string;        // "en", "hi", or "es"
  recipients: string[];    // ["alice@example.com", "bob@example.com"]
}
```

### Backend Logging

After a successful webhook call, the form logs the batch to the backend API (authenticated):

```typescript
// Headers
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <jwt-token>",
  "X-API-Key": "<VITE_API_KEY_FRONTEND>"
}

// Body
POST /api/log-email-batch
{
  holidayName: string;
  tone: string;
  senderName: string;
  audienceType: string;
  language: string;
  recipients: string[];
  status: "sent";
}
```

## License

MIT
