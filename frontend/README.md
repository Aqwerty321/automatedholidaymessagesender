# Holiday Email Orchestrator – Frontend

A React + TypeScript frontend for the Holiday Email Orchestrator system.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local and set VITE_WEBHOOK_URL

# Start development server
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_WEBHOOK_URL` | n8n webhook URL | ✅ |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── components/
│   ├── Alert.tsx       # Success/error banners
│   ├── Field.tsx       # Form field wrapper
│   └── Form.tsx        # Main form component
├── lib/
│   └── validation.ts   # Form validation utilities
├── App.tsx             # Main application layout
├── config.ts           # Configuration (webhook URL)
├── index.css           # TailwindCSS styles
├── main.tsx            # React entry point
└── vite-env.d.ts       # TypeScript declarations
```

## Deployment to Vercel

1. Set **Root Directory** to `frontend`
2. Set **Build Command** to `npm run build`
3. Set **Output Directory** to `dist`
4. Add environment variable: `VITE_WEBHOOK_URL`

See the [main README](../README.md) for full documentation.
