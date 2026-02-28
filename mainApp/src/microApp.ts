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
        name: 'subApp1',
        activeWhen: '/subApp1',
        entry: import.meta.env.MODE === 'dev' ? '//localhost:82/' : '/subApp1/',
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
      console.log('子应用afterLoad..', appInfo.name);
    },
    afterMount(appInfo) {
      console.log('子应用afterMount..', appInfo.name);
    },
    afterUnmount(appInfo) {
      console.log('子应用afterUnmount..', appInfo.name);
    }
  });
}
