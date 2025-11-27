<template>
  <!-- 左侧侧边栏 -->
  <a-layout-sider class="side-menu" :collapsed="menuCollapsed" :theme="sideTheme" :trigger="null" collapsible width="210" @collapse="onCollapse">
    <!-- 侧边栏logo标题 -->
    <a-layout-header class="side-menu-header">
        <img class="logo" :src="defaultSettings.logo"/>
        <span class="title">{{ defaultSettings.title }}</span>
    </a-layout-header>
    <div class="side-menu-body">
      <!-- 侧边栏菜单 -->
      <a-menu mode="inline" :inline-indent="16" :theme="sideTheme" :openKeys="openKeys" :selectedKeys="selectedKeys"
              @select="onSelect" @openChange="onOpenChange">
        <MenuItem v-for="route in menuList" :key="route.path" :item="route"/>
      </a-menu>
    </div>
    <!--  侧边栏footer  -->
    <template #trigger>
      <div class="side-menu-footer">
        <SettingBar/>
        <span>MY管理系统</span>
        <Hamburger/>
      </div>
    </template>
  </a-layout-sider>
</template>

<script setup>
import { useMenuStore, useSettingsStore } from '@/store'
import defaultSettings from '@/config/settings';

import { useRoute, useRouter } from "vue-router";
import MenuItem from "@/layout/components/SideBar/MenuItem.vue";
import Hamburger from "@/layout/components/NavBar/Hamburger/index.vue";
import SettingBar from "@/layout/components/NavBar/SettingBar/index.vue";
import { constRoutes } from '@/router'

const settingsStore = useSettingsStore()
const menuStore = useMenuStore()
const route = useRoute()
const router = useRouter()

const openKeys = ref([])
const selectedKeys = ref([])

const menuList = computed(() => {
  // 这里使用的是静态+动态路由, 若使用menuStore.menuList则只有动态菜单
  return [...constRoutes, ...menuStore.menuList]
  // return [...menuStore.menuList]
})

const menuCollapsed = computed(() => {
  return settingsStore.menuCollapsed
})

const sideUniqueOpen = computed(() => {
  return settingsStore.sideUniqueOpen
})

const theme = computed(() => {
  return settingsStore.theme
})
const sideTheme = computed(() => {
  return theme.value
})

// 首次加载会调用onMounted但route不会改变
onMounted(() => {
  // 模块菜单
  showModuleMenu()
  // 首次加载时，只有当前菜单的目录为openKeys
  showThisMenuItem()
})

// 非首次加载则不再调用onMounted，但route会改变。任何地方改变路由时都会被监听到
watch(route, (to) => {
  showThisMenuItem()
})

// 根据当前路由判断显示哪个module的menu
function showModuleMenu() {
  // 依靠面包屑获取当前路由的顶层模块
  const moduleItem = route.meta.breadcrumb ? route.meta.breadcrumb[0] : {}
  // 路由到模块首页
  let moduleCode = null
  menuStore.moduleList.filter((item) => {
    if (item.path === moduleItem.path) {
      moduleCode = item.code
    }
  })
  // 有moduleCode则切换，否则保持原样
  if (moduleCode) {
    // 路由到模块的首页
    menuStore.switchModule(moduleCode)
  }
}

// 监听路由处理需要展示的内容，如高亮选中、菜单展开等
const showThisMenuItem = () => {
  // 从根路由到当前路径的完整路由层级结构
  let matched = route.matched
  // 每一层级的路径列表
  let pathList = []
  matched.forEach((item) => {
    pathList.push(item.path)
  })
  if (pathList.length) {
    // 设置选中菜单及展开目录
    nextTick(() => {
      // path中最后一个为菜单，应当选中此菜单高亮。同时在层级路径列表中移除此菜单，路径列表中的剩余元素为菜单所在的目录
      selectedKeys.value = pathList.splice(pathList.length - 1, 1)
      // console.log('selectedKeys', selectedKeys.value)
      // 若菜单折叠时，菜单和目录均不做任何展示
      if (menuCollapsed.value) {
        // console.log("menuCollapsed", menuCollapsed.value)
        return
      }
      // 若为排他打开, 则openKeys只包含当前菜单的目录
      if (sideUniqueOpen.value) {
        // 排他打开时, 只有当前菜单的目录为openKeys
        openKeys.value = pathList
      } else {
        // 非排他打开时，即将新open的keys要加入到原来的openKey中去
        let newKeys = pathList.filter(e => !openKeys.value.includes(e));
        openKeys.value = openKeys.value.concat(newKeys);
      }
      // console.log('openKeys', openKeys.value)
    })
  }
}

// 展开-收起时的回调函数
const onCollapse = (collapsed, type) => {
  // console.log("onCollapse", collapsed)
  // 处理选中菜单及打开菜单所在目录
  showThisMenuItem()
}

// 当设置trigger="null"时@collapse会不生效，通过监听状态变更达到@collapse事件的效果
watch(menuCollapsed, (collapsed) => {
  onCollapse(collapsed)
})

// 当菜单被选中时 { item, key, selectedKeys }
const onSelect = (obj) => {
  // console.log("onSelect:", obj)
  // 数组最后一个元素即最新选中的，也可直接使用obj.key
  const path = obj.keyPath[obj.keyPath.length - 1]
  // 跳转到新path
  router.push({ path })
  // 设置选中
  selectedKeys.value = obj.selectedKeys
}

// 菜单展开/关闭的回调
const onOpenChange = (keys) => {
  // console.log("onOpenChange:", keys)
  // console.log("openKeys:", openKeys.value)
  // 排他打开时，只打开最新的
  if (sideUniqueOpen.value) {
    // openKey=新打开的key，关闭时为 undefined。
    // openKeys中是原来打开的，key不存在则表示key为新打开，若key都存在则意味着关闭
    const openKey = keys.find(key => openKeys.value.indexOf(key) === -1);
    if (openKey) {
      // 新打开 openKey 按照目录树获取上级
      openKeys.value = getParentKeys(menuList.value, openKey)
    } else {
      // 关闭
      openKeys.value = keys
    }
  } else {
    // 非排他打开时，可以全打开
    openKeys.value = keys
  }
}
// 获取上级keys(包括当前key)
const getParentKeys = (menuList, key) => {
  // 递归查找
  return traverse(menuList, key)
}
// 递归查找菜单树的节点，并返回路径
const traverse = (array, key) => {
  // 递归父级key
  for (const element of array) {
    if (element.path === key) {
      return [element.path]
    }
    if (element.children) {
      const sub = traverse(element.children, key)
      if (sub) {
        return [element.path].concat(sub)
      }
    }
  }
}

</script>

<style scoped>

.side-menu {
  height: 100vh;
  overflow: auto;
}

.side-menu-header {
  padding: 0;
  /** a-layout-header默认高度为64,此处改为50 */
  height: 50px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: #ffffff;
  border-bottom: 1px solid rgba(246, 246, 246, 0.85);
}

.side-menu-header .logo {
  width: 40px;
  height: 40px;
  margin-left: 20px;
  margin-right: 10px;
}
.side-menu-header .title {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 20px;
}

.side-menu-body {
  /** 高度为 页面100% - header高度 - trigger(footer)高度
  height: calc(100vh - 50px - 48px); */
  height: calc(100vh - 50px);
  /** scroll在body中,注释掉则出现在side-menu，即header也会滑动 */
  overflow: auto;
}

.side-menu-footer {
  /** trigger高度默认为48 */
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(246, 246, 246, 0.85);
}

/* a-sider折叠时的class */
.ant-layout-sider-collapsed {
  /* 嵌套选择器，等效于后代选择器 */
  .side-menu-header > span {
    display: none;
  }
  .side-menu-footer > span {
    display: none;
  }
}

/* a-sider暗色时的class */
.ant-layout-sider-dark {
  .side-menu-header {
    background: #001529;
    border: 0;
    color: #fff;
  }
  .side-menu-footer {
    border: 0;
    color: #fff;
  }
}
</style>
