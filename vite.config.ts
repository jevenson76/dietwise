import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@services': path.resolve(__dirname, 'services'),
          '@components': path.resolve(__dirname, 'components'),
          '@hooks': path.resolve(__dirname, 'hooks'),
          '@constants': path.resolve(__dirname, 'constants.ts'),
          '@appTypes': path.resolve(__dirname, 'types.ts')
        }
      }
    };
});
