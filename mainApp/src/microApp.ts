import Garfish from 'garfish';

// 打印 import.meta.env
console.log('===== 打印 import.meta.env =====', import.meta.env)
console.log('当前环境模式：', import.meta.env.MODE)
console.log('是否为开发环境：', import.meta.env.DEV)

// 子应用的激活路径(<name,activePath>)映射
export const microMap: Record<string, string> = {
  "subApp1": "/subApp1",
  "subApp2": "/subApp2",
};

// 注册子应用并启动 Garfish
export const startGarfish = () => {
  // 在 Garfish.run 调用前用于动态更新配置信息的API，参数与 Garfish.run 保持一致。
  Garfish.setOptions({
    basename: '/',
    domGetter: '#microApp',
    // 可选：主应用传递给子应用的数据（子应用 provider 导出函数 生命周期方法中接收）
    props: {
      token: localStorage.getItem('TOKEN'),
      userInfo: JSON.parse(<string>localStorage.getItem('USER_INFO')),
    },
    // 在调用 app.mount 或 app.show 触发
    afterMount(appInfo) {
      console.log('子应用mount完成', appInfo.name);
    },
    // 调用 app.unmount 或 app.hide 触发
    afterUnmount(appInfo) {
      console.log('子应用unmount完成', appInfo.name);
    }
  });
  // 注册子应用信息
  Garfish.registerApp([
      {
        // 子应用的名称，需要唯一
        name: 'subApp1',
        // 基于路由匹配的应用加载模式，会通activeWhen自动判断当前应加载的子应用；手动加载模式（Garfish.loadApp）时将忽略activeWhen选项
        activeWhen: microMap['subApp1'],
        // 子应用的入口资源地址，支持 HTML 和 JS
        entry: import.meta.env.MODE === 'dev' ? 'http://82.157.187.160:83/' : 'http://82.157.187.160:83/',
        sandbox: false,
      },
      {
        // 子应用的名称，需要唯一
        name: 'subApp2',
        activeWhen: microMap['subApp2'],
        // 子应用的入口资源地址，支持 HTML 和 JS
        entry: import.meta.env.MODE === 'dev' ? 'http://82.157.187.160:83/' : 'http://82.157.187.160:83/',
        sandbox: false,
      },
    ]
  );
  // 基于路由匹配模式加载(run) 或 手动加载(loadApp)。要保证Garfish在渲染时挂载点存在
  // Garfish.run();
}
