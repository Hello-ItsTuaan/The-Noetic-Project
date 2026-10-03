import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false,
        },
        manifest: {
          name: env.VITE_APP_NAME || 'Website Ôn Tập',
          short_name: 'Ôn Tập',
          start_url: './',
          display: 'standalone',
          background_color: '#0f172a',
          theme_color: '#2563eb',
        },
      }),
    ],
  }
})
