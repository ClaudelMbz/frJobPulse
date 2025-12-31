import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement (.env, .env.local, etc.)
  const env = loadEnv(mode, '.', '')

  return {
    // 🔴 OBLIGATOIRE pour GitHub Pages
    // En local (dev), Vite ignore ce base
    base: '/frJobPulse/',

    plugins: [react()],

    // Serveur de développement
    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    // ⚠️ ATTENTION :
    // Les variables définies ici sont injectées dans le JS client
    // NE PAS exposer de clés sensibles en production
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY ?? ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY ?? ''),
    },

    // Alias de chemins
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    // Build options (safe defaults)
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})
