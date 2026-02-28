import Garfish from 'garfish';

// 打印 import.meta.env
console.log('===== 打印 import.meta.env =====', import.meta.env)
console.log('当前环境模式：', import.meta.env.MODE)
console.log('是否为开发环境：', import.meta.env.DEV)

// 注册子应用并启动 Garfish
export const startGarfish = () => {
  Garfish.run({
    basename: '/',
    domGetter: '#microApp',
    apps: [
      {
        // 子应用的名称，需要唯一
        name: 'subApp1',
        activeWhen: '/subApp1',
        // 子应用的入口资源地址，支持 HTML 和 JS
        entry: import.meta.env.MODE === 'dev' ? '//localhost:82/' : 'http://82.157.187.160:83/',
        sandbox: false,
        // 可选：传递给子应用的自定义参数（子应用 provider 导出函数 生命周期方法中接收）
        props: {
          token: localStorage.getItem('TOKEN'),
          userInfo: JSON.parse(<string>localStorage.getItem('USER_INFO')),
        },
      },
      {
        name: 'subApp2',
        activeWhen: '/subApp2',
        entry: 'http://localhost:82/index.js', // js入口
      },
    ],
    afterLoad(appInfo) {
      console.log('子应用加载完成', appInfo.name);
    },
    afterMount(appInfo) {
      console.log('子应用渲染完成', appInfo.name);
    },
    afterEval(appInfo) {
      console.log('子应用代码执行完成', appInfo.name);
    },
    afterUnmount(appInfo) {
      console.log('子应用卸载完成', appInfo.name);
    }
  });
}
