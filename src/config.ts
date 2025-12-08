/**
 * Configuration file for the Holiday Email Orchestrator.
 * 
 * WEBHOOK URL CONFIGURATION:
 * 
 * The webhook URL is loaded from the environment variable VITE_WEBHOOK_URL.
 * This allows different URLs for local development vs production (Vercel).
 * 
 * LOCAL DEVELOPMENT:
 * 1. Create a `.env.local` file in the project root (it's gitignored).
 * 2. Add: VITE_WEBHOOK_URL=http://localhost:5678/webhook/<your-webhook-id>
 * 3. Restart the dev server with `npm run dev`.
 * 
 * PRODUCTION (VERCEL):
 * Set the VITE_WEBHOOK_URL environment variable in Vercel project settings
 * to your public n8n webhook URL (e.g., from ngrok or hosted n8n).
 * 
 * FALLBACK:
 * If VITE_WEBHOOK_URL is not set, it defaults to a placeholder URL.
 * The app will show a warning banner if the URL contains "REPLACE_ME".
 */

// ============================================================
// Webhook URL - loaded from environment variable
// ============================================================
export const WEBHOOK_URL: string =
  import.meta.env.VITE_WEBHOOK_URL || "http://localhost:5678/webhook/REPLACE_ME";

/**
 * Helper to check if the webhook URL is properly configured.
 * Returns true if the URL still contains the placeholder text.
 */
export const isWebhookUrlUnconfigured = (): boolean => {
  return WEBHOOK_URL.includes("REPLACE_ME");
};

/**
 * Detects the backend type based on the webhook URL.
 * Useful for displaying environment info in the developer section.
 */
export type BackendType = 'local' | 'render' | 'vercel' | 'ngrok' | 'other';

export const getBackendType = (): BackendType => {
  const url = WEBHOOK_URL.toLowerCase();
  
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return 'local';
  }
  if (url.includes('.onrender.com')) {
    return 'render';
  }
  if (url.includes('.vercel.app')) {
    return 'vercel';
  }
  if (url.includes('ngrok')) {
    return 'ngrok';
  }
  return 'other';
};

/**
 * Returns a human-readable label for the current backend type.
 */
export const getBackendLabel = (): string => {
  const type = getBackendType();
  const labels: Record<BackendType, string> = {
    local: '🖥️ Local',
    render: '🚀 Render',
    vercel: '▲ Vercel',
    ngrok: '🔗 ngrok',
    other: '🌐 Remote',
  };
  return labels[type];
};

// Language options available in the form
export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
] as const;

// Audience type options
export const AUDIENCE_OPTIONS = [
  { value: "business", label: "Business" },
  { value: "personal", label: "Personal" },
] as const;
