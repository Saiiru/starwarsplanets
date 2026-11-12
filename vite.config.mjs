import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {proxy: {'/api': {target:'http://127.0.0.1:4358',changeOrigin:false}}},
  base: process.env.GITHUB_PAGES === 'true' ? '/starwarsplanets/' : '/',
})
