import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      '/api/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openai/, ''),
        secure: true,
      },
      '/api/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ollama/, ''),
      },
      '/api/engine/beta': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/engine\/beta/, ''),
        secure: true,
      },
      '/api/engine/alpha': {
        target: 'https://api.groq.com/openai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/engine\/alpha/, ''),
        secure: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'sitemap.xml', 'app_icon.png'],
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,webmanifest,txt,xml}']
      },
      manifest: {
        name: 'RobuxMinerPro',
        short_name: 'RobuxMinerPro',
        description: 'Fast. Simple. Always on.',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/app_icon.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/app_icon.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/app_icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.debug'] : []
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          charts: ['recharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
}));
