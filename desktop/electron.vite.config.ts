import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: { lib: { entry: resolve('main/index.ts') }, outDir: resolve('dist-electron/main') },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: { lib: { entry: resolve('preload/index.ts') }, outDir: resolve('dist-electron/preload') },
  },
  renderer: {
    root: resolve('renderer'),
    envDir: resolve('..'),
    plugins: [react()],
    build: {
      outDir: resolve('dist'),
      rollupOptions: { input: resolve('renderer/index.html') },
    },
  },
})
