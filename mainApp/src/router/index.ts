import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import systemRouter from './systemRouter'
import NProgress from '@/utils/nprogress'
import settings from "@/config/settings.ts"
import { useMenuStore, useUserStore } from "@/store";
import { message } from "ant-design-vue";

export const constRoutes: RouteRecordRaw[] = [...systemRouter]

const router = createRouter({
  history: createWebHistory(),
  routes: constRoutes as RouteRecordRaw[],
  // routes: [] as RouteRecordRaw[],
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

// 白名单路由
const whiteList = ["/login", "/callback"]
// 进度条配置
NProgress.configure({ showSpinner: false, speed: 500 })


// 导航守卫 参考：https://router.vuejs.org/zh/guide/advanced/navigation-guards.html
router.beforeEach(async (to, from) => {
  NProgress.start()
  const userStore = useUserStore()
  const menuStore = useMenuStore()

  // 设置动态标题
  document.title = to.meta.title ? `${to.meta.title} - ${settings.title}` : `${settings.title}`

  // 获取登陆token
  const token = localStorage.getItem("TOKEN")

  // 未登录
  if (!token) {
    // 白名单则放行
    if (whiteList.includes(to.path)) {
      // 返回 true 或 undefined 表示导航是有效的，等同于 next(true)/next()
      return true
    } else {
      // 不在白名单内要跳转登陆页面
      return { path: `/login?redirect=${to.fullPath}` }
    }
  }
  // 下面是已登录的情况
  // 已登录访问登陆页，则跳转到首页
  if (to.path === "/login") {
    // 如果已登录，则重定向，跳转首页
    return { path: "/", replace: true }
  }

  // fullPath是包括 路径、查询参数和哈希值的完整地址。
  console.log("访问地址: " + to.fullPath)
  // 如果未加载用户信息，则先加载用户信息
  if (!userStore.userInfo.account) {
    console.log("加载userInfo...")
    await userStore.initUserInfo();
  }
  // 如果未加载动态路由，则需先加载路由
  if (!menuStore.dynamicRouter) {
    // 生成动态路由
    await menuStore.generateRoutes();
    console.log("动态加载异步路由...")
    // console.log(router.getRoutes())
    // 由于新增加了路由，所以重新导航
    console.log("重新导航...", to)
    return { path: to.fullPath, replace: true }
  }

  // 已登录访问登陆页，则跳转到首页
  if (to.path === "/login") {
    // 如果已登录，则重定向，跳转首页
    return { path: "/", replace: true }
  } else {
    // undefined 或返回 true 则导航是有效的(返回xxx等同于next(xxx))
    return true
  }
})

router.afterEach((to, from) => {
  // TODO
  NProgress.done()
})

router.onError((error) => {
  NProgress.done()
  console.error(error)
})

export default router
