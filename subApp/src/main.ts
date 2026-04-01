import { createApp, App as VueApp } from 'vue'
import router from './router'
import App from './App.vue'

// 引入antdv的全量样式，组件已使用自动注册
import 'ant-design-vue/dist/reset.css'
import '@/style/index.css'

import { setupStore } from "@/store";
import { setupI18n } from "@/locale";
import { setupVxeTable } from "@/plugin/vxeTable.ts";
import { setupHighlight } from "@/plugin/highlight.ts";

// 无界会在子应用的window对象中注入一些全局变量
declare global {
  interface Window {
    // 是否存在无界
    __POWERED_BY_WUJIE__?: boolean;
    // 原生的window对象
    __WUJIE_RAW_WINDOW__: Window;
    // 子应用沙盒实例
    __WUJIE: { mount: () => void };
    // 子应用mount函数
    __WUJIE_MOUNT: () => void;
    // 子应用unmount函数
    __WUJIE_UNMOUNT: () => void | Promise<void>;
    // 注入对象
    $wujie: {
      bus: any;
      shadowRoot?: ShadowRoot;
      props?: { [key: string]: any };
      location?: Object;
    };
  }
}

let vueApp: VueApp | null = null
/**
 * 使用工厂函数创建vue实例，目的是支持微应用模式每次加载子应用得到新实例
 */
const createNewApp = () => {
  const app = createApp(App);
  // 核心配置
  setupStore(app)
  app.use(router)
  setupI18n(app)

  // 第三方插件
  setupVxeTable(app)
  setupHighlight(app)

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
  console.log("独立运行 mount")
  vueApp.mount("#app");
}
