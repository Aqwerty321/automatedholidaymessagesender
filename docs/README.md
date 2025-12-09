# Documentation

Welcome to the Holiday Email Orchestrator documentation.

## 📚 Guides

| Document | Description |
|----------|-------------|
| [Main README](../README.md) | Project overview, quick start, and architecture |
| [Frontend README](../frontend/README.md) | Frontend-specific setup and deployment |
| [Render Backend Guide](render-backend.md) | Deploy n8n on Render |
| [Contributing Guide](../CONTRIBUTING.md) | How to contribute to the project |

## 🏗️ Architecture Overview

The Holiday Email Orchestrator consists of two main components:

### Frontend (React + Vite)

A static single-page application that:
- Collects email request details from users
- Validates input client-side
- Sends requests to the n8n webhook
- Displays success/error feedback

**Deploy to:** Vercel, Netlify, or any static hosting

### Backend (n8n)

A workflow automation platform that:
- Receives webhook requests from the frontend
- Calls Toolhouse AI to generate personalized emails
- Sends emails via Gmail SMTP
- Returns responses to the frontend

**Deploy to:** Render, Railway, DigitalOcean, or self-hosted

## 🔗 Related Links

- [n8n Documentation](https://docs.n8n.io)
- [Toolhouse Documentation](https://toolhouse.ai/docs)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)

## 📝 API Reference

### Webhook Payload

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

### Field Specifications

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `holiday_name` | string | ✅ | Non-empty |
| `tone` | string | ❌ | Defaults to "warm" |
| `sender_name` | string | ✅ | Non-empty |
| `audience_type` | string | ✅ | "business" or "personal" |
| `language` | string | ✅ | "en" or "hi" |
| `recipients` | string | ✅ | At least one valid email |

### Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success - emails queued for sending |
| 400 | Bad request - invalid payload |
| 500 | Server error - check n8n logs |

## 🛠️ Environment Variables

### Frontend

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_WEBHOOK_URL` | n8n webhook endpoint | `https://n8n.example.com/webhook/abc` |

### Backend (n8n on Render)

| Variable | Description |
|----------|-------------|
| `N8N_HOST` | `0.0.0.0` |
| `N8N_PORT` | `5678` |
| `N8N_PROTOCOL` | `https` |
| `WEBHOOK_URL` | Render service URL |
| `N8N_ENCRYPTION_KEY` | Random 32-byte hex string |
| `N8N_BASIC_AUTH_ACTIVE` | `true` |
| `N8N_BASIC_AUTH_USER` | Admin username |
| `N8N_BASIC_AUTH_PASSWORD` | Admin password |
