import { defineConfig, loadEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueJSX from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import viteCompression from 'vite-plugin-compression'
import { viteMockServe } from "vite-plugin-mock"
import { resolve } from 'path'

export default defineConfig(({ mode }): UserConfig => {
  // const env = loadEnv(mode, './')
  const env = loadEnv(mode, process.cwd());
  const alias = {
    '~': `${resolve(__dirname, './')}`,
    '@': `${resolve(__dirname, 'src')}`
  }
  return {
    resolve: {
      alias
    },
    server: {
      // 允许IP访问
      host: "0.0.0.0",
      // 应用端口 (默认:3000)
      port: Number(env.VITE_PORT),
      // 运行是否自动打开浏览器
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASEURL,
          // target: 'http://127.0.0.1:8080',
          ws: false,
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'ant-design-vue': ['ant-design-vue'],
            vue: ['vue', 'vue-router', 'pinia', 'vue-i18n']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    plugins: [
      vue(),
      viteMockServe({
        // 模拟数据的配置
        mockPath: 'mock',
        enable: mode === 'dev',
      }),
      viteCompression(),
      vueSetupExtend(),
      VueJSX(),
      // 使用unplugin-auto-import插件，自动导入参考：https://cloud.tencent.com/developer/article/2236166
      AutoImport({
        // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
        imports: ["vue", "vue-router", "pinia", "@vueuse/core", "vue-i18n"],
        // 配置文件生成位置(false:关闭自动生成)
        dts: "src/types/auto-imports.d.ts",
      })
    ],
  }
})
