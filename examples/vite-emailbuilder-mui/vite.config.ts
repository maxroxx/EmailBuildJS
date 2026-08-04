import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  base: '/email-builder-js/',
  resolve: {
    dedupe: ['lexical', '@lexical/react', '@lexical/link', '@lexical/rich-text', '@lexical/html'],
  },
});
