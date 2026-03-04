import { defineStore } from 'pinia'
import { useStorage } from "@vueuse/core"
import { useSearchStore } from '@/store/search'
import userCenterApi from '@/api/system/userCenterApi'
import router, { constRoutes } from '@/router'
import { RouteRecordRaw } from "vue-router"
// 布局组件, 一般顶层目录使用
import Layout from '@/layout/index.vue'
import EmptyLayout from '@/layout/other/empty.vue'
const NotFound  = () => import('@/layout/other/404.vue')

// login和findPwd路由组件已静态加载，此处不在进行异步加载
const modules = import.meta.glob([
  '/src/views/**/**.vue',
  '!/src/views/auth/findPwd/**.vue',
  '!/src/views/auth/login/**.vue'
])

export const useMenuStore = defineStore('menuStore', () => {
  // state
  // 所有路由(静态路由 + 动态路由)
  const routes = ref<RouteRecordRaw[]>([]);
  const dynamicRouter = ref<boolean>(false)
  // 所有module的所有menu,用于保存后端返回的原始数据
  const moduleList = ref([])
  // 当前使用的module
  // 侧边栏菜单是否排他展开
  const module = useStorage("MODULE_ID", "");
  // 当前module的菜单(即module的子节点)
  const menuList = ref([])

  // actions
  /**
   * 初始化模块及菜单(优先本地，无则api获取)
   */
  const initModuleMenu = async () => {
    // 优先获取本地数据
    const menu = localStorage.getItem('MENU')
    let localMenu = JSON.parse(menu as string)
    if (localMenu) {
      moduleList.value = localMenu
      initMenuList()
    } else {
      // 本地无则从api获取
      await refreshModuleMenu()
    }
  };

  /**
   * 从api更新模块及菜单
   */
  const refreshModuleMenu = async () => {
    const res = await userCenterApi.loginUserMenu()
    if (!res.data) {
      console.log("无任何菜单权限", res.data)
      res.data = []
    }
    localStorage.setItem('MENU', JSON.stringify(res.data))
    moduleList.value = res.data
    initMenuList()
  };

  /**
   * 初始化module对应的菜单menuList
   */
  function initMenuList() {
    if (!module.value) {
      // @ts-ignore
      module.value = moduleList.value[0]?.code
    }
    // @ts-ignore
    const moduleItem = moduleList.value.find((item) => item.code === module.value)
    // @ts-ignore
    menuList.value = moduleItem ? moduleItem.children : []
  }

  /**
   * 清空菜单及路由数据
   */
  const switchModule = (moduleCode: string) => {
    if (module.value === moduleCode) {
      console.log("module未发生变化...")
      return
    }
    // @ts-ignore
    const moduleItem = moduleList.value.filter((item) => item.code === moduleCode)
    if (!moduleItem) {
      console.log("未找到到要切换的module...", moduleCode)
      return
    }
    // module赋值
    module.value = moduleCode
    // 加载module的菜单
    initMenuList()
  }

  /**
   * 清空菜单及路由数据
   */
  const clear = async () => {
    moduleList.value = []
    routes.value = []
    dynamicRouter.value = false
    localStorage.removeItem('MENU')
  }

  /**
   * 生成菜单及异步(动态)路由
   */
  const generateRoutes = async () => {
    // 加载菜单数据(优先本地，其次接口)
    await initModuleMenu()
    // 生成动态路由
    const asyncRoutes: RouteRecordRaw[] = parseAsyncRoutes(moduleList.value);
    // 设置routes
    routes.value = [...constRoutes, ...asyncRoutes];
    // 添加到路由组件中
    addToRouter(asyncRoutes)
    dynamicRouter.value = true
    // 初始化面包屑
    initBreadcrumb(routes.value)
    // 初始化搜索
    const searchStore = useSearchStore()
    searchStore.init(routes.value)
    return asyncRoutes;
  };

  /**
   * 重新生成菜单及异步(动态)路由
   */
  const reloadRoutes = async () => {
    clear()
    // 更新菜单数据
    await refreshModuleMenu()
    // 先移除之前的动态路由
    const currentRoutes = router.getRoutes()
    currentRoutes.forEach(route => {
      let constList = constRoutePathList(constRoutes)
      const isConstRoute = constList.includes(route.path)
      // 静态路由保留，动态路由移除
      if (!isConstRoute) {
        router.removeRoute(route.name as string)
      }
    });
    // 生成动态路由
    await generateRoutes()
  };

  // 递归获取静态路由的所有path
  function constRoutePathList(constRoutes: RouteRecordRaw[]) {
    let pathList: string[] = []
    constRoutes.forEach(route => {
      pathList.push(route.path)
      if (route.children) {
        pathList = [...pathList, ...constRoutePathList(route.children)]
      }
    })
    return pathList
  }

  // 将菜单添加到路由
  const addToRouter = (asyncRoutes: RouteRecordRaw[]) => {
    // 添加到路由组件中
    asyncRoutes.forEach((route: RouteRecordRaw) => {
      // 如果最顶层目录有component=Layout，则直接设置路由。
      router.addRoute(route);
      // 如果顶层route没有component=Layout,则需要指定使用布局的parentName(静态路由中已存在的)
      // router.addRoute('layout', route)
    });
  }

  // 转换为路由对象
  const parseAsyncRoutes = (menus) => {
    const asyncRoutes: RouteRecordRaw[] = [];
    // 遍历所有菜单
    menus.forEach((menu) => {
      menu.meta = menu.meta ? menu.meta : {}
      // 处理外部链接特殊路由
      if (menu.meta.type === 'iframe') {
        menu.meta.url = menu.path
        menu.path = `/${menu.code}`
      }
      // menu转路由对象
      const route: RouteRecordRaw = {
        name: menu.code,
        path: menu.path ? menu.path : "/" + menu.code,
        meta: menu.meta,
        redirect: menu.redirect,
        children: menu.children && menu.children.length > 0 ? parseAsyncRoutes(menu.children) : undefined,
        component: loadComponent(menu)
      }
      asyncRoutes.push(route);
    });
    return asyncRoutes;
  }

  // 加载组件
  const loadComponent = (menu) => {
    // 资源类型（字典 1模块 2目录 3菜单 4内链 5外链）
    let item;
    const component = menu.component
    if (!component) {
      // 如果没有组件，则将组件设置为 undefined 防止错误加载
      item = undefined;
    } else if (component?.toString() === "Layout") {
      item = Layout
    } else {
      item = modules[`/src/views/${component}.vue`] ||
        modules[`/src/views/${component}/index.vue`] ||
        NotFound
    }
    return item
  }

  /**
   * 根据当前routes初始化面包屑(面包屑、搜索、模块菜单等组件均要使用)
   */
  const initBreadcrumb = (routes: RouteRecordRaw[], titlePath: object[] = []) => {
    routes.forEach((route) => {
      // 生成当前route的titleList
      const titleList = [...titlePath]
      // 防止meta为空
      if (!route.meta) {
        route.meta = {}
      }
      titleList.push({
        "name": route.name,
        "path": route.path,
        "title": route.meta?.title,
        "redirect": route.redirect,
      })
      // 设置在route的meta中
      route.meta.breadcrumb = titleList
      // 若有子路由则递归设置子路由
      if (route.children) {
        initBreadcrumb(route.children, titleList)
      }
    })
  }

  return {
    routes,
    dynamicRouter,
    moduleList,
    module,
    menuList,
    clear,
    switchModule,
    generateRoutes,
    reloadRoutes
  }
})
