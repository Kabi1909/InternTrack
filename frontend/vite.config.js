import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [
    {
      name: 'jsx-in-js',
      async transform(code, id) {
        if (/src\/.*\.js$/.test(id.replaceAll('\\', '/')))
          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
          });
      },
    },
    react(),
    tailwindcss(),
  ],
  server: { proxy: { '/api': 'http://localhost:5000' } },
  optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
});
