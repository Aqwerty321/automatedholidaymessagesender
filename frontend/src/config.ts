/**
 * Configuration file for the Holiday Email Orchestrator.
 * 
 * ENVIRONMENT VARIABLES:
 * 
 * VITE_WEBHOOK_URL - The n8n webhook URL for sending holiday emails
 * VITE_API_BASE_URL - The backend API URL for logging email batches
 * VITE_ACCESS_PASSWORD_HINT - Optional hint for the login page
 * VITE_API_KEY_FRONTEND - API key for backend authentication
 * VITE_N8N_SECRET - Secret header for n8n webhook requests
 * 
 * LOCAL DEVELOPMENT:
 * 1. Create a `.env.local` file in the project root (it's gitignored).
 * 2. Add:
 *    VITE_WEBHOOK_URL=http://localhost:5678/webhook/<your-webhook-id>
 *    VITE_API_BASE_URL=http://localhost:4000
 *    VITE_API_KEY_FRONTEND=your-api-key
 *    VITE_N8N_SECRET=your-n8n-secret
 * 3. Restart the dev server with `npm run dev`.
 * 
 * PRODUCTION (VERCEL):
 * Set all environment variables in Vercel project settings:
 * - VITE_WEBHOOK_URL = your public n8n webhook URL
 * - VITE_API_BASE_URL = your Render backend URL (e.g., https://holiday-backend.onrender.com)
 * - VITE_API_KEY_FRONTEND = matches API_KEY_FRONTEND on backend
 * - VITE_N8N_SECRET = matches N8N_WEBHOOK_SECRET in n8n
 * 
 * FALLBACK:
 * If variables are not set, they default to placeholder/localhost URLs.
 */

// ============================================================
// Webhook URL - n8n endpoint for email generation + sending
// ============================================================
export const WEBHOOK_URL: string =
  import.meta.env.VITE_WEBHOOK_URL || "http://localhost:5678/webhook/REPLACE_ME";

// ============================================================
// API Base URL - Backend API for logging email batches
// ============================================================
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// ============================================================
// Security Configuration
// ============================================================

/**
 * Optional hint text displayed on the login page.
 */
export const ACCESS_PASSWORD_HINT: string | undefined =
  import.meta.env.VITE_ACCESS_PASSWORD_HINT;

/**
 * API key for authenticating with the backend.
 * Must match API_KEY_FRONTEND on the backend.
 */
export const API_KEY_FRONTEND: string =
  import.meta.env.VITE_API_KEY_FRONTEND || "";

/**
 * Secret header sent with n8n webhook requests.
 */
export const N8N_SECRET: string =
  import.meta.env.VITE_N8N_SECRET || "";

/**
 * Helper to check if the webhook URL is properly configured.
 * Returns true if the URL still contains the placeholder text.
 */
export const isWebhookUrlUnconfigured = (): boolean => {
  return WEBHOOK_URL.includes("REPLACE_ME");
};

/**
 * Helper to check if security is properly configured.
 */
export const isSecurityConfigured = (): boolean => {
  return !!API_KEY_FRONTEND && !!N8N_SECRET;
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
