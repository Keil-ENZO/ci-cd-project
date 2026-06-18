/// <reference types="vitest" />
import path from "path"
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: "/ci-cd-project/",
  // Injecte l'URL du backend au build (VITE_API_URL en CI ; vide en local -> fallback localhost).
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL ?? ''),
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['dist/**', 'node_modules/**', 'src/tests/unitaire/api.test.ts'],
    reporters: ['default', 'html'],
    outputFile: {
      html: './test-report/index.html',
    },
    coverage: {
      provider: 'v8',
      exclude: [
        'src/components/ui/**',
      ],
    },
  },
  server: {
    host: true,
    port: 5173,
  },

})
