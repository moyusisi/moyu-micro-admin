import { registerMicroApps, start, setDefaultMountApp } from 'qiankun'

// 打印 import.meta.env
console.log('===== 打印 import.meta.env =====', import.meta.env)
console.log('当前环境模式：', import.meta.env.MODE)
console.log('是否为开发环境：', import.meta.env.DEV)

// 注册微应用列表
registerMicroApps([
  {
    // 子应用唯一标识：必须与子应用 vite.config.js 中定义的 appName 一致
    name: 'subApp1',
    // 子应用入口地址：
    // - 开发环境：子应用的 Vite 开发服务器地址（需先启动子应用）
    // - 生产环境：子应用打包后的静态资源地址（如 CDN 或主应用的子路径）
    // entry: '//localhost:82/',
    entry: import.meta.env.MODE === 'dev' ? '//localhost:82/' : '/subApp1/',
    // 主应用中挂载子应用的容器 DOM 节点（需在主应用模板中定义）
    container: '#microApp',
    // 子应用的激活规则：当主应用路由匹配到该路径时，自动挂载子应用
    activeRule: '/subApp1',
    // 可选：传递给子应用的自定义参数（子应用在 mount 生命周期中可接收）
    props: {
      token: localStorage.getItem('TOKEN'),
      userInfo: JSON.parse(<string>localStorage.getItem('USER_INFO')),
    },
  },
]);

// 可选：设置默认挂载的子应用（启动主应用时自动激活）
// setDefaultMountApp('/subApp1');

// 启动 qiankun 微前端
export const startQiankun = () => {
  start({
    // 可选：开启严格的样式隔离
    sandbox: { experimentalStyleIsolation: true },
    // 可选：禁用预加载（开发环境可关闭，生产环境建议开启）
    prefetch: false,
    // 可选：自定义 fetch 方法（解决跨域或请求拦截）
    // fetch: customFetch
  });
};