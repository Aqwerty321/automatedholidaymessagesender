/// <reference types="vite/client" />

/**
 * Type declarations for Vite environment variables.
 * These are loaded from .env files and accessible via import.meta.env
 */
interface ImportMetaEnv {
  /**
   * The n8n webhook URL for the Holiday Email Orchestrator.
   * Set this in .env.local for local development or in Vercel for production.
   */
  readonly VITE_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
