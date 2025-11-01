/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_SUPABASE_URL?: string;
  readonly VITE_PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly VITE_FEATURE_AI_CHAT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
