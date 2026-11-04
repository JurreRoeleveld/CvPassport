import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'

// GitHub Pages serves the site under /<repo>/; override with BASE_PATH if needed.
const basepath = process.env.BASE_PATH ?? '/'

const config = defineConfig({
  base: basepath,
  resolve: { tsconfigPaths: true },
  // MapLibre GL ships its own web worker, which breaks Vite's dep pre-bundling.
  optimizeDeps: { exclude: ['maplibre-gl'] },
  plugins: [
    devtools(),
    tanstackStart({
      router: { basepath },
      // Static site: prerender the index page for GitHub Pages.
      prerender: { enabled: true, crawlLinks: true },
    }),
    viteReact(),
  ],
})

export default config
