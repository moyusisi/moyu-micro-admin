import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import Antd from 'ant-design-vue'
import i18n from "@/locale"
import App from './App.vue'
import { startQiankun } from './microApp.ts';
import WujieVue from "wujie-vue3";
const { bus, setupApp, preloadApp, destroyApp } = WujieVue;

// style
import 'ant-design-vue/dist/reset.css'
import '@/style/index.css'
import * as antdvIcons from '@ant-design/icons-vue'
// 代码高亮风格，选择更多风格需导入 node_modules/hightlight.js/styles/ 目录下其它css文件
import 'highlight.js/styles/github-dark.min.css'
import 'highlight.js/lib/common'
import hljsVuePlugin from '@highlightjs/vue-plugin'

const app = createApp(App);
app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(i18n)
app.use(WujieVue)

// 统一注册antdv图标
for (const icon in antdvIcons) {
  app.component(icon, antdvIcons[icon])
}

// 注册代码高亮组件 https://www.jb51.net/javascript/339354fqv.htm
app.use(hljsVuePlugin)

setupApp({
  props: {}, // 主应用给子应用传递的参数
  name: "sub1",
  url: "//82.157.187.160:81/",
  exec: true,
  alive: false
});

// 挂载app
app.mount('#app')

// 携带登录态credentials必须为include
export default function fetch(url, options) {
  console.log("fetch", url, options);
  return window.fetch(url, { ...options, credentials: "omit" });
}
// 启动 qiankun 微前端
// startQiankun();