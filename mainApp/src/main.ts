import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import WujieVue from "wujie-vue3";
import { startWujie } from './microApp.ts';

// 引入antdv的全量样式，组件已使用自动注册
import 'ant-design-vue/dist/reset.css'
import '@/style/index.css'

import { setupStore } from "@/store";
import { setupI18n } from "@/locale";
import { setupVxeTable } from "@/plugin/vxeTable.ts";
import { setupHighlight } from "@/plugin/highlight.ts";

// 创建 Vue 应用实例
const app = createApp(App);

// 核心配置
setupStore(app)
app.use(router)
app.use(WujieVue)
setupI18n(app)

// 第三方插件
setupVxeTable(app)
setupHighlight(app)

// 挂载app
app.mount('#app')

// 启动 wujie 微前端
startWujie();