import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => { 
  return {
    // 开发环境 / 生产环境区分base路径
  base: mode === 'production' ? '/recollection-vocab-pwa/' : '/',
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.svg'],
      manifest: {
        name: 'Recollection - 英语词汇学习',
        short_name: 'Recollection',
        description: '深度英语词汇学习应用',
        theme_color: '#1A1A1A',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.deepseek\.com\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ai-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  };
});
