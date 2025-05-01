import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config
export default defineConfig({
    plugins: [vue()],
    assetsInclude: ['**/*.wasm'],
    optimizeDeps: {
        exclude: ['@dimforge/rapier3d'],
    },
})
