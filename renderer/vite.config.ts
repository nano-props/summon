import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { execaSync } from 'execa'

function commitHash(): string {
  try {
    return execaSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: import.meta.dirname }).stdout.trim()
  } catch {
    return ''
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: import.meta.dirname,
  base: './',
  define: {
    __GIT_HASH__: JSON.stringify(commitHash()),
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '#': path.resolve(import.meta.dirname, '..'),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, '..', 'dist-renderer'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
