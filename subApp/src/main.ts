import { createApp, App as VueApp } from 'vue'
import router from './router'
import Antd from 'ant-design-vue'
import * as antdvIcons from '@ant-design/icons-vue'
import App from './App.vue'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

// style
import 'ant-design-vue/dist/reset.css'
import '@/style/index.css'

import { setupStore } from "@/store";
import { setupI18n } from "@/locale";
import { setupVxeTable } from "@/plugin/vxeTable.ts";
import { setupHighlight } from "@/plugin/highlight.ts";

let vueApp: VueApp | null = null
/**
 * 使用工厂函数创建vue实例，目的是支持微应用模式每次加载子应用得到新实例
 */
const createNewApp = () => {
  const app = createApp(App);
  // 核心配置
  setupStore(app)
  app.use(router)
  app.use(Antd)
  setupI18n(app)

  // 全局组件 antdv图标
  for (const icon in antdvIcons) {
    app.component(icon, antdvIcons[icon])
  }

  // 第三方插件
  setupVxeTable(app)
  setupHighlight(app)

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
  // const mountNode = container ? container.querySelector('#app') : '#app'
  const mountNode = container ? container : '#app'
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
    if (props?.token) {
      // 存储token
      localStorage.setItem('TOKEN', props.token)
    }
    if (props?.userInfo) {
      // 存储到userInfo
      localStorage.setItem('USER_INFO', JSON.stringify(props.userInfo))
    }
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
