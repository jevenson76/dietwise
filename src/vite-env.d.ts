/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STRIPE_PRICE_MONTHLY: string
  readonly VITE_STRIPE_PRICE_YEARLY: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_GEMINI_API_KEY?: string
  readonly VITE_SENTRY_DSN?: string
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}