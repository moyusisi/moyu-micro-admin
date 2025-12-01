import { defineConfig, loadEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueJSX from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import viteCompression from 'vite-plugin-compression'
import { viteMockServe } from "vite-plugin-mock"
import qiankun from 'vite-plugin-qiankun'
import { resolve } from 'path'

// 微应用的唯一标识（需与主应用注册的名称一致）
const appName = 'subApp1'

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
      // 2.允许跨域（允许qiankun主应用域名跨域访问）
      cors: {
        origin: [
          'http://localhost:81',   // 主应用开发环境域名
          'https://main-app.com'   // 主应用生产环境域名
        ],
        // 允许携带 cookie（如需）
        credentials: true
      },
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
    // 3. 构建配置：输出兼容的资源名称
    build: {
      manifest: true,
      // 生成静态资源的存放路径
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          // 静态资源命名规则
          assetFileNames: 'assets/[name].[hash].[ext]',
          chunkFileNames: 'js/[name].[hash].js',
          entryFileNames: 'js/[name].[hash].js',
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
      // 1. 注册 qiankun 插件
      qiankun(appName, {
        // 开发环境是否开启沙箱（默认 true）
        useDevMode: true
      }),
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

    // 4.定义全局变量：解决 qiankun 沙箱中 window 指向问题
    define: {
      'process.env': process.env,
      '__VUE_OPTIONS_API__': true,
      '__VUE_PROD_DEVTOOLS__': false
    }
  }
})
