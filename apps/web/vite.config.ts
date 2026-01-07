import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build optimization
  build: {
    // Generate source maps for debugging in production
    sourcemap: false,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - these rarely change
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
        },
        // Add hash to chunk names for cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
  },
  
  // Development server
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  
  // Preview server (production build preview)
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
  },
})
