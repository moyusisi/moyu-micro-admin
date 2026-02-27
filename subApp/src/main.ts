import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router, { createNewRouter } from '@/router'

import Antd from 'ant-design-vue'
import i18n from "@/locale"
import App from './App.vue'

import { h } from 'vue';
import { vueBridge } from '@garfish/bridge-vue-v3';

// style
import 'ant-design-vue/dist/reset.css'
import '@/style/index.css'
import * as antdvIcons from '@ant-design/icons-vue'
// 代码高亮风格，选择更多风格需导入 node_modules/hightlight.js/styles/ 目录下其它css文件
import 'highlight.js/styles/github-dark.min.css'
import 'highlight.js/lib/common'
import hljsVuePlugin from '@highlightjs/vue-plugin'

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

// 独立运行模式直接渲染
if (!window.__GARFISH__) {
  // 非微前端环境直接运行
  const app = createNewApp();
  app.mount('#app')
}

/********** 子应用模式 **********/
// 导出Garfish的provider函数
export const provider = vueBridge({
  rootComponent: App,
  // 可选，注册 vue-router或状态管理对象
  appOptions: ({ basename, dom, appName, props }) => {
    console.log(basename, dom, appName, props);
    return {
      el: '#app',
      render: () => h(App),
      router: createNewRouter(basename),
    };
  },
});