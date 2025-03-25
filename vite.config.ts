import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: {
        splash: 'index.html', // Splash screen
        main: 'main.html',     // React app
      },
    },
  },
});
