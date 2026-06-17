import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'bundle-report.html',
      gzipSize: true,
      brotliSize: true,
    })
  ],
  assetsInclude: ['**/*.PNG', '**/*.png'],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd', '@ant-design/icons'],
          axios: ['axios'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
        }
      }
    }
  }
})
