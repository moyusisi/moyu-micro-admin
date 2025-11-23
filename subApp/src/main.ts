import { createApp, App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import Antd from 'ant-design-vue'
import i18n from "@/locale"
import App from './App.vue'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

// style
import 'ant-design-vue/dist/reset.css'
import '@/style/index.css'
import * as antdvIcons from '@ant-design/icons-vue'
// 代码高亮风格，选择更多风格需导入 node_modules/hightlight.js/styles/ 目录下其它css文件
import 'highlight.js/styles/github-dark.min.css'
import 'highlight.js/lib/common'
import hljsVuePlugin from '@highlightjs/vue-plugin'

let vueApp: VueApp | null = null
/**
 * 使用工厂函数创建vue实例，目的是支持微应用模式每次加载子应用得到新实例
 */
const createNewApp = () => {
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
  return app
}

// 1. 独立运行时直接渲染
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}

// 封装渲染函数
function render(props: any = {}) {
  const { container } = props
  // 微应用模式：挂载到主应用提供的容器；独立运行：挂载到自身的节点 #app
  const mountNode = container ? container.querySelector('#app') : '#app'
  vueApp = createNewApp()
  vueApp.mount(mountNode!)
}

/********** 子应用模式 **********/

// 2. 微应用模式：导出 qiankun 生命周期
renderWithQiankun({
  // 初始化（只会执行一次）
  bootstrap() {
    console.log('subApp bootstrap...');
  },
  // 挂载（每次切换到微应用时执行）
  mount(props) {
    console.log('subApp mount...', props)
    render(props)
  },
  // 卸载（每次离开微应用时执行）
  unmount() {
    console.log('subApp unmount...');
    if(vueApp) {
      vueApp.unmount()
      vueApp = null
    }
  },
  // 可选，仅使用 loadMicroApp 方式加载微应用时生效
  update(props) {
    console.log('subApp update props...', props);
    return undefined;
  },
})
