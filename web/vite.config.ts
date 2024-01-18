import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    checker({
      overlay: true,
      typescript: true,
      // eslint: {
      //   lintCommand: 'eslint . -c ../eslint.config.js',
      //   useFlatConfig: true,
      // },
    }),
  ],
  define: {
    global: 'window',
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
