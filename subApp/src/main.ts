import { createApp, App as VueApp, h } from 'vue'
import router from '@/router'
import Antd from 'ant-design-vue'
import * as antdvIcons from '@ant-design/icons-vue'
import App from './App.vue'
import { vueBridge } from '@garfish/bridge-vue-v3';

// style
import 'ant-design-vue/dist/reset.css'
import '@/style/index.css'

import { setupStore } from "@/store";
import { setupI18n } from "@/locale";
import { setupVxeTable } from "@/plugin/vxeTable.ts";
import { setupHighlight } from "@/plugin/highlight.ts";

/**
 * 使用工厂函数创建vue实例，目的是支持微应用模式每次加载子应用得到新实例
 */
const usePlugin = (app) => {
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

}

// 独立运行模式直接渲染
if (!window.__GARFISH__) {
  // 非微前端环境直接运行
  const app = createApp(App);
  usePlugin(app)
  app.mount('#app')
}

/********** 子应用模式 **********/
// 导出Garfish的provider函数
export const provider = vueBridge({
  rootComponent: App,
  // 可选，注册 vue-router或状态管理对象
  appOptions: ({ basename, dom, appName, props }) => {
    // console.log(appName, "appOptions...");
    return {
      el: '#app',
      render: () => h(App),
      // router: createAppRouter(basename),
    };
  },
  handleInstance: (vueInstance, { basename, dom, appName, props}) => {
    // console.log(appName, "handleInstance...");
    usePlugin(vueInstance)
    // console.log(window.Garfish)

    if (props?.token) {
      // 存储token
      localStorage.setItem('TOKEN', props.token)
      // console.log('token 已存储到子应用');
    }
    if (props?.userInfo) {
      // 存储到userInfo
      localStorage.setItem('USER_INFO', JSON.stringify(props.userInfo))
      // console.log('userInfo 已存储到子应用');
    }
  },
});