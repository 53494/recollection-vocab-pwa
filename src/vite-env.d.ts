/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface VitePreloadErrorEvent extends Event {
  payload: unknown;
}

interface WindowEventMap {
  'vite:preloadError': VitePreloadErrorEvent;
}
