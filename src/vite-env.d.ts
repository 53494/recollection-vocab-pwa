/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_AI_PROXY_URLS?: string;
  readonly VITE_AI_PROXY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface VitePreloadErrorEvent extends Event {
  payload: unknown;
}

interface WindowEventMap {
  'vite:preloadError': VitePreloadErrorEvent;
}
