import type { App } from "vue";

// 代码高亮风格，选择更多风格需导入 node_modules/hightlight.js/styles/ 目录下其它css文件
import 'highlight.js/styles/github-dark.min.css'
import 'highlight.js/lib/common'
import hljsVuePlugin from '@highlightjs/vue-plugin'

// 全局注册 highlight
export function setupHighlight(app: App<Element>) {
// 注册代码高亮组件 https://www.jb51.net/javascript/339354fqv.htm
  app.use(hljsVuePlugin)
}
