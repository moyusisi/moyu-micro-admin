import WujieVue from "wujie-vue3";

const { bus, setupApp, preloadApp, destroyApp } = WujieVue;

// 打印 import.meta.env
console.log('===== 打印 import.meta.env =====', import.meta.env)
console.log('当前环境模式：', import.meta.env.MODE)
console.log('是否为开发环境：', import.meta.env.DEV)

// 子应用的域名(<name,host>)映射
export const microMap: Record<string, string> = {
  "subApp1": import.meta.env.MODE === 'dev' ? 'http://82.157.187.160:84' : 'http://82.157.187.160:84',
  "subApp2": "//localhost:84",
};

const lifecycles = {
  beforeLoad: (window) => console.log(`${window.__WUJIE.id} beforeLoad 生命周期`),
  beforeMount: (window) => console.log(`${window.__WUJIE.id} beforeMount 生命周期`),
  afterMount: (window) => console.log(`${window.__WUJIE.id} afterMount 生命周期`),
  beforeUnmount: (window) => console.log(`${window.__WUJIE.id} beforeUnmount 生命周期`),
  afterUnmount: (window) => console.log(`${window.__WUJIE.id} afterUnmount 生命周期`),
  activated: (window) => console.log(`${window.__WUJIE.id} activated 生命周期`),
  deactivated: (window) => console.log(`${window.__WUJIE.id} deactivated 生命周期`),
  loadError: (url, e) => console.log(`${url} 加载失败`, e),
};

// 启动 wujie 微前端
export const startWujie = () => {
  const props = {
    "token": localStorage.getItem('TOKEN'),
    "userInfo": JSON.parse(<string>localStorage.getItem('USER_INFO')),
  };
  setupApp({
    // 应用唯一name
    name: "subApp1",
    // 需要渲染的url
    url: microMap["subApp1"],
    // 注入给子应用的属性
    props: props,
    // 预执行
    exec: true,
    ...lifecycles
  });
  setupApp({
    // 应用唯一name
    name: "subApp2",
    // 需要渲染的url
    url: microMap["subApp2"],
    // 注入给子应用的属性
    props: props,
    // 预执行
    exec: true,
    ...lifecycles
  });
};