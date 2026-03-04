import { defineConfig, loadEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueJSX from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
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
    // 开发环境服务器选项
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
      // 指定生成静态资源的存放路径,默认:assets。库模式下不能使用
      assetsDir: 'assets',
      // 调整 chunk 体积警告阈值，默认:500 单位KB
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          // 按模块拆分 chunk，减小单个文件体积
          manualChunks: {
            'vue': ['vue', 'vue-router', 'pinia', 'vue-i18n', '@vueuse/core'],
            'axios': ['axios'],
            'hotkeys': ['js-pinyin'],
            'highlight': ['highlight.js'],
            'ant-design-icons': ['@ant-design/icons-vue'],
            'ant-design-vue': ['ant-design-vue'],
          }
        }
      },
      // 库模式
      // lib: {
      //   // 口文件 必需
      //   entry: ['src/main.js'],
      //   // 全局名称(umd/iife 格式必填),浏览器环境下挂载到 window 的名称
      //   name: 'subApp',
      //   // 输出格式（可选，默认 ['es', 'umd']）
      //   formats: ['es', 'umd'],
      //   // 输出的库文件名（可选，默认取 package.json 的 name）
      //   fileName: (format, entryName) => `index.${format}.js`,
      // },
    },
    plugins: [
      vue(),
      VueJSX(),
      viteMockServe({
        // mock文件存放路径（默认是 src/mock）
        mockPath: 'mock',
        // 是否启用mock
        enable: mode === 'dev',
        // 是否在控制台打印 mock 接口请求日志
        logger: true,
      }),
      viteCompression({
        // 压缩算法，默认gizp
        algorithm: 'gzip',
        ext: '.gz',
        // 仅压缩 >10KB 文件
        threshold: 10240,
      }),
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
