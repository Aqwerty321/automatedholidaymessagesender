# Holiday Email Orchestrator – Frontend

A minimal, production-ready React frontend for sending personalized AI-generated holiday emails. This app communicates with an n8n workflow that uses Toolhouse AI agents to generate and send personalized emails via Gmail.

## Features

- 🎄 Send personalized holiday greetings to multiple recipients
- 🤖 AI-powered email generation via Toolhouse
- 🌐 Multi-language support (English, Hindi)
- 💼 Audience-aware tone (business vs personal)
- 🎨 Clean, modern dark-mode UI with TailwindCSS

## Prerequisites

- **Node.js** >= 18
- **n8n** running locally (or accessible via network)
- The webhook URL from your n8n workflow

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure the webhook URL:**
   
   Create a `.env.local` file in the project root:
   ```bash
   VITE_WEBHOOK_URL=http://localhost:5678/webhook/YOUR_WEBHOOK_ID
   ```
   
   > **Note:** Get the webhook URL from your n8n workflow's Webhook trigger node.

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser** at `http://localhost:3000`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## How the Backend Works

The frontend sends a POST request to an n8n webhook, which triggers a workflow that:

1. Receives the holiday email request payload
2. Calls a **Toolhouse AI agent** to generate personalized holiday emails
3. Splits the generated emails per recipient
4. Sends them via **Gmail SMTP**
5. (Optionally) Logs the sent emails

The AI agent considers the holiday name, tone, language, and audience type to craft appropriate messages.

## API Contract

The frontend POSTs JSON to the n8n webhook with the following structure:

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
| `holiday_name` | string | ✅ | The holiday to celebrate (e.g., "Diwali", "Christmas", "New Year") |
| `tone` | string | ❌ | The tone of the email (e.g., "warm", "formal", "playful"). Defaults to "warm" |
| `sender_name` | string | ✅ | The name to sign the email with |
| `audience_type` | string | ✅ | Either "business" or "personal" |
| `language` | string | ✅ | Language code (e.g., "en" for English, "hi" for Hindi) |
| `recipients` | string | ✅ | Comma or newline-separated email addresses |

### Response

- **Success (2xx):** Request accepted, emails will be generated and sent
- **Error (4xx/5xx):** Server error with details in the response body

## Customization

### Adding Languages

Edit `src/config.ts` to add more language options:

```typescript
export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },  // Add new languages here
  { value: "fr", label: "French" },
] as const;
```

### Adding Audience Types

Edit `src/config.ts` to add more audience types:

```typescript
export const AUDIENCE_OPTIONS = [
  { value: "business", label: "Business" },
  { value: "personal", label: "Personal" },
  { value: "family", label: "Family" },  // Add new types here
] as const;
```

### Styling

The app uses TailwindCSS with a dark color scheme. You can customize colors and styles in:
- `tailwind.config.js` - Theme configuration
- `src/index.css` - Global styles
- Individual component files - Component-specific styles

## Project Structure

```
src/
├── components/
│   ├── Alert.tsx      # Success/error banner component
│   ├── Field.tsx      # Reusable form field wrapper
│   └── Form.tsx       # Main form component
├── lib/
│   └── validation.ts  # Form validation utilities
├── App.tsx            # Main app layout
├── config.ts          # Configuration (webhook URL, options)
├── index.css          # Global styles
└── main.tsx           # App entry point
```

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling

## Local Development with n8n

To develop locally with n8n running on your machine:

1. **Start n8n locally:**
   ```bash
   npx n8n
   ```
   n8n will be available at `http://localhost:5678`.

2. **Create your workflow** with a Webhook trigger node. Copy the webhook URL from the node (it looks like `http://localhost:5678/webhook/<id>`).

3. **Create a `.env.local` file** in the project root:
   ```bash
   VITE_WEBHOOK_URL=http://localhost:5678/webhook/<your-webhook-id>
   ```

4. **Start the frontend:**
   ```bash
   npm run dev
   ```

5. The app will now call your local n8n instance when you submit the form.

> **Tip:** The Developer Info section at the bottom of the app shows the currently configured webhook URL.

## Deployment on Vercel

This is a static Vite + React app that can be easily deployed to Vercel.

### Steps to Deploy

1. **Push your repository to GitHub** (or GitLab/Bitbucket).

2. **Import the repository in Vercel:**
   - Go to [vercel.com](https://vercel.com) and click "Add New Project"
   - Select your repository

3. **Configure build settings** (Vercel usually auto-detects these):
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Set the environment variable:**
   - Go to Project Settings → Environment Variables
   - Add a new variable:
     - **Name:** `VITE_WEBHOOK_URL`
     - **Value:** Your public n8n webhook URL
   
   > **Important:** For production, your n8n instance must be publicly accessible. 
   > Options include:
   > - Use [ngrok](https://ngrok.com) to expose your local n8n: `ngrok http 5678`
   > - Deploy n8n to a cloud provider (Railway, Render, DigitalOcean, etc.)
   > - Use [n8n.cloud](https://n8n.cloud) (hosted n8n)

5. **Trigger a deploy** (Vercel will automatically build and deploy).

6. **Verify** by visiting your Vercel URL and checking the Developer Info section shows the correct webhook URL.

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_WEBHOOK_URL` | The n8n webhook URL to call | `https://your-n8n.ngrok.io/webhook/abc123` |

### CORS Considerations

If you encounter CORS errors, ensure your n8n webhook node has the "Respond" option set correctly and that your n8n instance allows cross-origin requests from your Vercel domain.

## Using a Render-hosted Backend (n8n)

This frontend is **backend-agnostic** — it simply POSTs JSON to any webhook URL that implements the API contract described above. A popular production setup is hosting n8n on [Render](https://render.com).

### Why Render?

- Free tier available (with some limitations)
- Easy Docker deployments
- Automatic HTTPS
- Persistent storage options for n8n data

### Render URL Format

When you deploy n8n on Render, your webhook URLs will look like:

```
https://<your-service-name>.onrender.com/webhook/<n8n-webhook-id>
```

### Setup Steps

1. **Deploy n8n on Render:**
   - Create a new Web Service on Render
   - Use the official n8n Docker image: `n8nio/n8n`
   - See [docs/render-backend.md](docs/render-backend.md) for detailed instructions

2. **Create your workflow in n8n:**
   - Access your Render-hosted n8n at `https://<service>.onrender.com`
   - Import or create the Holiday Email workflow with a Webhook trigger
   - Copy the webhook URL from the trigger node

3. **Configure the frontend:**

   **For local development:**
   ```bash
   # .env.local
   VITE_WEBHOOK_URL=https://<service>.onrender.com/webhook/<id>
   ```

   **For Vercel deployment:**
   - Set `VITE_WEBHOOK_URL` in Vercel project settings

4. **Restart/redeploy** to pick up the new environment variable.

### Important Notes

- **Cold starts:** Render's free tier may sleep after inactivity. The first request after sleeping can take 30-60 seconds.
- **Secrets stay on the backend:** SMTP credentials, Toolhouse API keys, and other secrets are configured in n8n, not in this frontend.
- **Any HTTP backend works:** You can use any backend that accepts the same JSON payload — n8n on Railway, a custom Express server, AWS Lambda, etc.

## Using Other Backends

This frontend works with any HTTP backend that:

1. Accepts POST requests with `Content-Type: application/json`
2. Expects the JSON payload documented in the [API Contract](#api-contract) section
3. Returns a 2xx status on success

Simply set `VITE_WEBHOOK_URL` to your backend's URL.

## License

MIT
