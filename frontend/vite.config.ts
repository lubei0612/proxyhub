import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0', // 监听所有网络接口，解决IPv6连接问题
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    // 使用esbuild压缩（更快，更稳定）
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // 简化分包策略，避免循环依赖
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Element Plus单独打包
            if (id.includes('element-plus')) {
              return 'element-plus';
            }
            // Vue全家桶打包
            if (id.includes('vue') || id.includes('pinia') || id.includes('@vue') || id.includes('vue-router')) {
              return 'vue-vendor';
            }
            // ECharts单独打包
            if (id.includes('echarts')) {
              return 'echarts';
            }
            // 其他第三方库
            return 'vendor';
          }
        },
      }
    }
  }
})

