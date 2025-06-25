import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [
        react(),
        visualizer({
          filename: 'dist/stats.html',
          open: false,
          gzipSize: true
        }),
        // Only add Sentry plugin in production builds
        ...(mode === 'production' && env.VITE_SENTRY_AUTH_TOKEN ? [
          sentryVitePlugin({
            org: env.VITE_SENTRY_ORG,
            project: env.VITE_SENTRY_PROJECT,
            authToken: env.VITE_SENTRY_AUTH_TOKEN,
            silent: true,
            sourcemaps: {
              assets: ['./dist/**']
            }
          })
        ] : [])
      ],
      define: {
        // API key removed - now handled securely by backend
        // Provide fallback for process.env in browser environment
        'process.env.NODE_ENV': JSON.stringify(mode),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@services': path.resolve(__dirname, 'services'),
          '@components': path.resolve(__dirname, 'components'),
          '@hooks': path.resolve(__dirname, 'hooks'),
          '@constants': path.resolve(__dirname, 'constants.ts'),
          '@appTypes': path.resolve(__dirname, 'types.ts'),
          '@utils': path.resolve(__dirname, 'src/utils')
        }
      },
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            secure: false
          }
        }
      },
      build: {
        target: 'es2018', // Mobile browser compatibility
        cssCodeSplit: true,
        minify: true, // Use default minification
        rollupOptions: {
          output: {
            assetFileNames: (assetInfo) => {
              const name = assetInfo.name || '';
              const extType = name.split('.')[1];
              if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                return `assets/[name]-[hash][extname]`;
              }
              return `assets/[name]-[hash]-${Date.now()}[extname]`;
            },
            chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
            entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
            manualChunks: {
              // Vendor chunks for large libraries
              'react-vendor': ['react', 'react-dom'],
              'chart-vendor': ['chart.js', 'chartjs-adapter-date-fns'],
              'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
              'date-vendor': ['date-fns'],
              'pdf-vendor': ['jspdf', 'jspdf-autotable'],
              'capacitor-vendor': ['@capacitor/core', '@capacitor/camera'],
              'scanner-vendor': ['@zxing/library'],
              'ai-vendor': ['@google/genai']
            }
          }
        },
        chunkSizeWarningLimit: 500 // Stricter limit for mobile
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'date-fns', 'chart.js'] // Pre-bundle common deps
      }
    };
});
