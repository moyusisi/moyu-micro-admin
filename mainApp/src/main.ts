import { createApp } from 'vue'
import router from './router'
import Antd from 'ant-design-vue'
import * as antdvIcons from '@ant-design/icons-vue'
import App from './App.vue'

// style
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
app.use(Antd)
setupI18n(app)

// 全局组件 antdv图标
for (const icon in antdvIcons) {
  app.component(icon, antdvIcons[icon])
}

// 第三方插件
setupVxeTable(app)
setupHighlight(app)

// 挂载app
app.mount('#app')
