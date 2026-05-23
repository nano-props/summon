import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#': path.resolve(import.meta.dirname),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'renderer/src/**/*.test.ts', 'renderer/src/**/*.test.tsx'],
    mockReset: true,
    restoreMocks: true,
  },
})
