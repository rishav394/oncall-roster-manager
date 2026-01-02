import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use root path for Cloudflare Pages, subdirectory for GitHub Pages
const base = process.env.VITE_DEPLOY_TARGET === 'cloudflare' ? '/' : '/oncall-roster-manager/'

export default defineConfig({
  plugins: [react()],
  base: base,
})
