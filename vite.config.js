import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/postcss'; // <-- Import dari package baru

export default defineConfig({
  // ... plugin vite lainnya
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        // autoprefixer(), (jika Anda memakainya)
      ],
    },
  },
});