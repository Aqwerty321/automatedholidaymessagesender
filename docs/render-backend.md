# Deploying n8n on Render (Backend Guide)

This guide explains how to deploy n8n on [Render](https://render.com) to serve as the backend for the Holiday Email Orchestrator frontend.

## What is n8n?

[n8n](https://n8n.io) is an open-source workflow automation tool. In this project, n8n:

1. **Receives webhook requests** from the frontend
2. **Calls the Toolhouse AI agent** to generate personalized holiday emails
3. **Sends emails** via Gmail SMTP (or other providers)
4. **Returns a response** to the frontend

All sensitive credentials (SMTP passwords, API keys) are stored in n8n, not in the frontend.

## Prerequisites

- A [Render account](https://render.com) (free tier works)
- Gmail App Password or other SMTP credentials
- Toolhouse API key

## Deployment Steps

### 1. Create a New Web Service on Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Choose **"Deploy an existing image from a registry"**
4. Enter the Docker image: `n8nio/n8n`
5. Click **"Next"**

### 2. Configure the Service

| Setting | Value |
|---------|-------|
| **Name** | `n8n-holiday-emails` (or your choice) |
| **Region** | Choose closest to your users |
| **Instance Type** | Free (or Starter for better performance) |

### 3. Set Environment Variables

Add these environment variables in Render:

| Variable | Value | Description |
|----------|-------|-------------|
| `N8N_HOST` | `0.0.0.0` | Listen on all interfaces |
| `N8N_PORT` | `5678` | Default n8n port |
| `N8N_PROTOCOL` | `https` | Render provides HTTPS |
| `WEBHOOK_URL` | `https://<your-service>.onrender.com/` | Your Render URL |
| `N8N_ENCRYPTION_KEY` | `<random-string>` | Generate a secure key |
| `N8N_BASIC_AUTH_ACTIVE` | `true` | Protect the n8n editor |
| `N8N_BASIC_AUTH_USER` | `admin` | Your admin username |
| `N8N_BASIC_AUTH_PASSWORD` | `<secure-password>` | Your admin password |

> **Tip:** Generate a random encryption key with: `openssl rand -hex 32`

### 4. Configure Health Check (Optional but Recommended)

- **Health Check Path:** `/healthz`
- This helps Render know when n8n is ready.

### 5. Deploy

Click **"Create Web Service"**. Render will:

1. Pull the n8n Docker image
2. Start the container
3. Assign a URL like `https://n8n-holiday-emails.onrender.com`

The first deploy may take 2-5 minutes.

### 6. Access n8n

1. Go to `https://<your-service>.onrender.com`
2. Log in with the basic auth credentials you set
3. You'll see the n8n workflow editor

## Setting Up the Workflow

### 1. Create a Webhook Trigger

1. Click **"Add first step"** or **"+"**
2. Search for **"Webhook"**
3. Add a **Webhook** trigger node
4. Configure:
   - **HTTP Method:** POST
   - **Path:** `/holiday-emails` (or any path)
   - **Response Mode:** "When Last Node Finishes" or "Respond Immediately"

5. Copy the **Production URL** — it will look like:
   ```
   https://<your-service>.onrender.com/webhook/holiday-emails
   ```

### 2. Add Your Workflow Logic

Connect nodes to:

1. **Parse the incoming JSON** (the webhook node does this automatically)
2. **Call Toolhouse API** to generate emails
3. **Split recipients** (using a Split In Batches or Code node)
4. **Send emails** via Gmail/SMTP node

### 3. Configure Credentials

In n8n, go to **Settings → Credentials** and add:

- **Gmail credentials** (or other SMTP)
- **Toolhouse API credentials** (using HTTP Request or custom node)

### 4. Activate the Workflow

Toggle the workflow to **Active**. Your webhook is now live!

## Connecting the Frontend

### Local Development

Create `.env.local` in your frontend project:

```bash
VITE_WEBHOOK_URL=https://<your-service>.onrender.com/webhook/holiday-emails
```

Restart the dev server:

```bash
npm run dev
```

### Production (Vercel)

Set the environment variable in Vercel:

| Variable | Value |
|----------|-------|
| `VITE_WEBHOOK_URL` | `https://<your-service>.onrender.com/webhook/holiday-emails` |

Redeploy the frontend.

## Troubleshooting

### Cold Starts (Free Tier)

Render's free tier spins down services after 15 minutes of inactivity. The first request after sleeping takes 30-60 seconds.

**Solutions:**
- Upgrade to Starter tier ($7/month) for always-on
- Use a ping service to keep it warm (e.g., UptimeRobot, cron-job.org)

### CORS Issues

n8n webhooks generally don't have CORS issues for simple POST requests. If you encounter problems:

1. In the Webhook node, ensure **Response Mode** is set correctly
2. Check that you're not sending preflight-triggering headers

### Webhook Not Working

1. Verify the workflow is **Active** (toggle in top-right)
2. Check the webhook URL is correct (copy from n8n, not guessed)
3. Test with curl:
   ```bash
   curl -X POST https://<your-service>.onrender.com/webhook/holiday-emails \
     -H "Content-Type: application/json" \
     -d '{"holiday_name":"Test","sender_name":"Dev","recipients":"test@example.com","audience_type":"business","language":"en"}'
   ```

### n8n Editor Not Loading

- Wait for the service to fully start (check Render logs)
- Clear browser cache
- Try incognito mode

## Persistent Storage

By default, Render's free tier doesn't persist data between deploys. Your workflows may be lost!

**Solutions:**

1. **Use Render Disk** (Starter tier) — mount a persistent disk at `/home/node/.n8n`
2. **External Database** — configure `DB_TYPE=postgresdb` and use Render's managed PostgreSQL
3. **Export workflows** — regularly export workflows as JSON backups

## Security Best Practices

1. **Always enable basic auth** for the n8n editor
2. **Use strong passwords** for all credentials
3. **Limit webhook access** if possible (n8n Pro feature)
4. **Monitor executions** in n8n for unexpected activity

## Cost Comparison

| Tier | Monthly Cost | Features |
|------|--------------|----------|
| Free | $0 | 750 hours/month, sleeps after inactivity |
| Starter | $7 | Always-on, 512 MB RAM |
| Standard | $25 | 2 GB RAM, more CPU |

For production use, Starter tier is recommended to avoid cold starts.

## Alternative: n8n Cloud

If you prefer a managed solution, [n8n.cloud](https://n8n.cloud) offers hosted n8n with:

- No infrastructure management
- Automatic updates
- Built-in execution history
- Starting at $20/month

Your frontend works the same way — just use the n8n.cloud webhook URL.

---

**Questions?** Check the [n8n documentation](https://docs.n8n.io) or the [n8n community forum](https://community.n8n.io).
