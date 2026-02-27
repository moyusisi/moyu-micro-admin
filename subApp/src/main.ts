import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import router, { createAppRouter } from '@/router'
import Antd from 'ant-design-vue'
import i18n from "@/locale"
import App from './App.vue'
import { vueBridge } from '@garfish/bridge-vue-v3';
import { useUserStore } from '@/store/index.js'

// style
import 'ant-design-vue/dist/reset.css'
import '@/style/index.css'
import * as antdvIcons from '@ant-design/icons-vue'
// 代码高亮风格，选择更多风格需导入 node_modules/hightlight.js/styles/ 目录下其它css文件
import 'highlight.js/styles/github-dark.min.css'
import 'highlight.js/lib/common'
import hljsVuePlugin from '@highlightjs/vue-plugin'

// 创建 Pinia 实例（全局唯一）
const pinia = createPinia();

/**
 * 使用工厂函数创建vue实例，目的是支持微应用模式每次加载子应用得到新实例
 */
const createNewApp = () => {
  const app = createApp(App);
  app.use(pinia)
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
    if (props?.token) {
      // 存储token
      localStorage.setItem('TOKEN', props.token)
      console.log('token 已存储到子应用');
    }
    if (props?.userInfo) {
      // 存储到userInfo
      localStorage.setItem('USER_INFO', props.userInfo)
      console.log('userInfo 已存储到子应用');
    }
    // 必须先让 pinia 生效，才能使用 useUserStore
    const userStore = useUserStore(pinia);
    // 等待用户信息初始化完成（异步）
    userStore.initUserInfo();

    return {
      el: '#app',
      render: () => h(App),
      router: createAppRouter(basename),
    };
  },
});