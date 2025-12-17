import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],

    // Define environment variables
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '')
    },

    // Path aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },

    // Build configuration for Chrome Extension
    build: {
      outDir: 'dist',
      emptyDirBeforeWrite: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]'
        }
      },
      // Ensure compatibility
      target: 'es2020',
      minify: 'terser',
      sourcemap: false,
    },

    // Dev server (for testing outside extension)
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
