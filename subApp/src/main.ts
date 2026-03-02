import { createApp, App as VueApp } from 'vue'
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

// 无界的全局变量
declare global {
  interface Window {
    // 是否存在无界
    __POWERED_BY_WUJIE__?: boolean;
    // 子应用mount函数
    __WUJIE_MOUNT: () => void;
    // 子应用unmount函数
    __WUJIE_UNMOUNT: () => void | Promise<void>;
    // 子应用无界实例
    __WUJIE: { mount: () => void };
  }
}

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

if (window.__POWERED_BY_WUJIE__) {
  window.__WUJIE_MOUNT = () => {
    vueApp = createNewApp()
    console.log("子应用 mount")
    const props = window.$wujie?.props;
    // 存储token
    if (props?.token) {
      localStorage.setItem('TOKEN', props.token)
    }
    // 存储到userInfo
    if (props?.userInfo) {
      localStorage.setItem('USER_INFO', JSON.stringify(props.userInfo))
    }
    vueApp.mount("#app");
  };
  window.__WUJIE_UNMOUNT = () => {
    console.log("子应用 unmount")
    vueApp?.unmount();
  };
  /*
    由于vite是异步加载，而无界可能采用fiber执行机制
    所以mount的调用时机无法确认，框架调用时可能vite还没有加载回来，这里采用主动调用防止用没有mount
    无界mount函数内置标记，不用担心重复mount
  */
  window.__WUJIE.mount()
} else {
  vueApp = createNewApp()
  vueApp.mount("#app");
}
