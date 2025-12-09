# 🎄 Holiday Email Orchestrator

A production-ready application for sending personalized AI-generated holiday emails. This monorepo contains a React frontend that communicates with an n8n workflow backend powered by Toolhouse AI.

## 📁 Project Structure

```
AutomatedHolidayMessageSender/
├── frontend/                 # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/       # React components (Form, Alert, Field)
│   │   ├── lib/              # Utilities (validation)
│   │   ├── App.tsx           # Main application
│   │   └── config.ts         # Configuration (webhook URL)
│   ├── .env.local.example    # Environment template
│   └── package.json
├── backend/                  # Backend services (optional)
│   └── src/
├── docs/                     # Documentation
│   └── render-backend.md     # Render deployment guide
└── README.md                 # This file
```

## ✨ Features

- 🎄 Send personalized holiday greetings to multiple recipients
- 🤖 AI-powered email generation via Toolhouse
- 🌐 Multi-language support (English, Hindi)
- 💼 Audience-aware tone (business vs personal)
- 🎨 Clean, modern dark-mode UI with TailwindCSS
- 🚀 Deploy frontend to Vercel, backend to Render

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | n8n (workflow automation) |
| AI | Toolhouse AI agents |
| Email | Gmail SMTP (or other providers) |
| Hosting | Vercel (frontend), Render (backend) |

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18
- **n8n** running locally or hosted (Render, n8n.cloud)
- **Toolhouse API key** (for AI email generation)
- **Gmail App Password** (or other SMTP credentials)

### 1. Clone the Repository

```bash
git clone https://github.com/Aqwerty321/AutomatedHolidayMessageSender.git
cd AutomatedHolidayMessageSender
```

### 2. Set Up the Frontend

```bash
cd frontend
npm install
```

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit .env.local and set your webhook URL
# VITE_WEBHOOK_URL=http://localhost:5678/webhook/your-webhook-id
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 📝 Configuration

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_WEBHOOK_URL` | n8n webhook URL | `http://localhost:5678/webhook/abc123` |

### Setting the Webhook URL

**Local Development:**
```bash
# frontend/.env.local
VITE_WEBHOOK_URL=http://localhost:5678/webhook/your-id
```

**Production (Vercel):**
Set `VITE_WEBHOOK_URL` in Vercel project settings.

**Production (Render backend):**
```bash
VITE_WEBHOOK_URL=https://your-n8n.onrender.com/webhook/your-id
```

## 📤 API Contract

The frontend sends a POST request to the webhook with this JSON payload:

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

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `holiday_name` | string | ✅ | Holiday name (e.g., "Diwali", "Christmas") |
| `tone` | string | ❌ | Email tone (e.g., "warm", "formal", "playful") |
| `sender_name` | string | ✅ | Name to sign the email with |
| `audience_type` | string | ✅ | "business" or "personal" |
| `language` | string | ✅ | Language code ("en", "hi") |
| `recipients` | string | ✅ | Comma or newline-separated emails |

### Response

- **Success (2xx):** Request accepted, emails will be generated and sent
- **Error (4xx/5xx):** Error details in response body

## 🏗️ Architecture

```
┌─────────────────┐     POST JSON      ┌─────────────────┐
│                 │ ─────────────────► │                 │
│  React Frontend │                    │  n8n Workflow   │
│  (Vercel)       │ ◄───────────────── │  (Render)       │
│                 │     Response       │                 │
└─────────────────┘                    └────────┬────────┘
                                                │
                                                ▼
                                       ┌─────────────────┐
                                       │  Toolhouse AI   │
                                       │  (Generate      │
                                       │   Emails)       │
                                       └────────┬────────┘
                                                │
                                                ▼
                                       ┌─────────────────┐
                                       │  Gmail SMTP     │
                                       │  (Send Emails)  │
                                       └─────────────────┘
```

## 🚀 Deployment

### Frontend → Vercel

1. Push repository to GitHub
2. Import in [Vercel](https://vercel.com)
3. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Set environment variable:
   - `VITE_WEBHOOK_URL` = your production webhook URL
5. Deploy!

### Backend → Render (n8n)

See [docs/render-backend.md](docs/render-backend.md) for detailed instructions.

**Quick steps:**
1. Create Web Service on Render
2. Use Docker image: `n8nio/n8n`
3. Configure environment variables
4. Set up webhook workflow in n8n
5. Copy webhook URL to frontend config

## 🔧 Local Development with n8n

1. **Start n8n locally:**
   ```bash
   npx n8n
   ```

2. **Create workflow** with Webhook trigger node

3. **Copy webhook URL** and add to `frontend/.env.local`:
   ```bash
   VITE_WEBHOOK_URL=http://localhost:5678/webhook/your-id
   ```

4. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

## 🎨 Customization

### Adding Languages

Edit `frontend/src/config.ts`:

```typescript
export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },  // Add more
] as const;
```

### Adding Audience Types

```typescript
export const AUDIENCE_OPTIONS = [
  { value: "business", label: "Business" },
  { value: "personal", label: "Personal" },
  { value: "family", label: "Family" },  // Add more
] as const;
```

## 📜 Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🐛 Troubleshooting

### "WEBHOOK_URL is not configured" warning

Set `VITE_WEBHOOK_URL` in your `.env.local` file and restart the dev server.

### "Unable to reach the automation server"

- Ensure n8n is running
- Check the webhook URL is correct
- Verify the n8n workflow is activated

### CORS errors

n8n webhooks typically don't cause CORS issues for simple POST requests. If you encounter problems:
1. Check n8n webhook "Response Mode" setting
2. Ensure you're not sending preflight-triggering headers

### Render cold starts

Free tier services sleep after inactivity. First request may take 30-60s. Solutions:
- Upgrade to Starter tier ($7/month)
- Use a ping service (UptimeRobot, cron-job.org)

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ using React, n8n, and Toolhouse AI**
