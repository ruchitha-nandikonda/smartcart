import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
    hmr: {
      clientPort: 443,
    },
    allowedHosts: [
      'geological-par-relatives-warrior.trycloudflare.com',
      '.trycloudflare.com', // Allow all trycloudflare.com subdomains
      'sherrie-kittenlike-determinatively.ngrok-free.dev',
      '.ngrok-free.dev', // Allow all ngrok-free.dev subdomains
      'localhost',
      '127.0.0.1',
    ],
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 5173,
  },
})
