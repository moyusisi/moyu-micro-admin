import Garfish from 'garfish';

// 打印 import.meta.env
console.log('===== 打印 import.meta.env =====', import.meta.env)
console.log('当前环境模式：', import.meta.env.MODE)
console.log('是否为开发环境：', import.meta.env.DEV)

// 子应用的激活路径(<name,activeWhen>)，使用手动加载 loadApp 时将忽略 activeWhen，需要根据路径手动激活指定应用
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
  // 注册子应用信息，
  Garfish.registerApp([
      {
        // 子应用的名称，需要唯一
        name: 'subApp1',
        activeWhen: '/subApp1',
        // 子应用的入口资源地址，支持 HTML 和 JS
        entry: import.meta.env.MODE === 'dev' ? 'http://82.157.187.160:83/' : 'http://82.157.187.160:83/',
        sandbox: false,
      },
      {
        // 子应用的名称，需要唯一
        name: 'subApp2',
        activeWhen: '/subApp2',
        // 子应用的入口资源地址，支持 HTML 和 JS
        entry: import.meta.env.MODE === 'dev' ? 'http://82.157.187.160:83/' : 'http://82.157.187.160:83/',
        sandbox: false,
      },
    ]
  );

  Garfish.run();
}
