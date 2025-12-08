/// <reference types="vite/client" />

/**
 * Type declarations for Vite environment variables.
 * These are loaded from .env files and accessible via import.meta.env
 */
interface ImportMetaEnv {
  /**
   * The n8n webhook URL for sending holiday emails.
   * Set this in .env.local for local development or in Vercel for production.
   */
  readonly VITE_WEBHOOK_URL?: string;

  /**
   * The backend API URL for logging email batches to Postgres.
   * Set this in .env.local for local development or in Vercel for production.
   */
  readonly VITE_API_BASE_URL?: string;

  /**
   * Optional hint text to display on the login page.
   * E.g., "Contact admin for access"
   */
  readonly VITE_ACCESS_PASSWORD_HINT?: string;

  /**
   * API key for authenticating with the backend.
   * Must match API_KEY_FRONTEND on the backend.
   */
  readonly VITE_API_KEY_FRONTEND?: string;

  /**
   * Secret header sent with n8n webhook requests.
   * Used to verify requests come from the legitimate frontend.
   */
  readonly VITE_N8N_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
