import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./index.js', import.meta.url)),
      formats: ['es'],
      fileName: () => 'vuetify-audio.js'
    },
    rollupOptions: {
      external: id => id === 'vue' || id === 'vuetify' || id.startsWith('vuetify/')
    },
    sourcemap: true
  }
})