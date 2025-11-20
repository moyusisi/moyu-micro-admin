# moyu-antdv-admin

`moyu-adntdv-admin`是一个使用antdv组件的前端管理系统。 
使用前端技术栈有 Vue3 + Vite6 + TypeScript5 + Vue Router + Pinia + Ant Design Vue 4 等

## 启动项目

```bash
# 克隆项目
git clone https://github.com/moyusisi/moyu-antdv-admin.git

# 进入项目目录
cd moyu-antdv-admin

# 安装依赖
npm install

# 可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npmmirror.com

# 启动服务
npm run dev
```

## 检查更新

```bash
# 安装npm-check-updates
npm install -g npm-check-updates --registry=https://registry.npmmirror.com

# 检查更新
ncu --registry=https://registry.npmmirror.com

# 更新package.json中的指定包的版本号
ncu package1 package2 -u --registry=https://registry.npmmirror.com

# 更新package.json中的包版本号
ncu -u --registry=https://registry.npmmirror.com

# 安装更新后的包
npm install --registry=https://registry.npmmirror.com
```
