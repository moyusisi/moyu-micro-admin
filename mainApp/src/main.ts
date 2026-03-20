import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import Antd from 'ant-design-vue'
import i18n from "@/locale"
import App from './App.vue'

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

// 统一注册antdv图标
for (const icon in antdvIcons) {
  app.component(icon, antdvIcons[icon])
}

// 注册代码高亮组件 https://www.jb51.net/javascript/339354fqv.htm
app.use(hljsVuePlugin)

// 挂载app
app.mount('#app')
