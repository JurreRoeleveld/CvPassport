import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // MapLibre GL ships its own web worker, which breaks Vite's dep pre-bundling.
  optimizeDeps: { exclude: ['maplibre-gl'] },
  plugins: [devtools(), tanstackStart(), viteReact()],
})

export default config
