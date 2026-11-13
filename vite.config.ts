import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' để chạy được ở GitHub Pages (thư mục con) và khi mở bản build tĩnh.
export default defineConfig({
  plugins: [react()],
  base: './',
});
