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
        // 配置代理规则：所有 /api/ 开头的请求(未被 Mock 拦截的)转发到真实后端
        '/api': {
          // 请求转发到的后端地址(未被mock拦截的请求),
          target: 'http://127.0.0.1:8080',
          ws: false,
          // 跨域时修改 Origin 头
          changeOrigin: true,
          // 可选：重写路径（如后端接口无 /api 前缀时）
          // rewrite: (path) => path.replace(/^\/api/, '')
          // 可选：忽略证书错误（本地开发用）
          // secure: false
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
        // mock文件存放路径（默认是 src/mock）
        mockPath: 'mock',
        // 是否启用mock
        enable: mode === 'dev',
        // 是否在控制台打印 mock 接口请求日志
        logger: true,
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
