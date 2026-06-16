/// <reference types="vitest" />
import path from "path"
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: "/ci-cd-project/",
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
    exclude: ['dist/**', 'node_modules/**'],
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
