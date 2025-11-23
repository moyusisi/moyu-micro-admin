<template>
  <div class="admin-ui-main">
    <div id="microApp"></div>
    <router-view v-slot="{ Component, route }" v-if="!microApp">
      <keep-alive :include="cachedViews">
        <component :is="currentComponent(Component, route)" :key="route.fullPath"/>
      </keep-alive>
    </router-view>
    <iframe-view/>
  </div>
</template>

<script setup>
import IframeView from "./iframeView.vue"
import { useTagsViewStore } from "@/store"
import { useRoute } from "vue-router";
import { watch } from "vue";
const Error404  = () => import('@/layout/other/404.vue')

const tagsViewStore = useTagsViewStore()

// 缓存页面集合, 直接解构store中的同名字段
const { cachedViews } = toRefs(tagsViewStore);

// 获取当前路由对象（route 是响应式的，路由变化时会自动更新）
const route = useRoute()
// 是否为子应用
const microApp = ref(false)

// 首次加载会调用onMounted但route不会改变
onMounted(() => {
  // console.log('onMounted')
  updateMicroApp(route)
})

// 非首次加载则不再调用onMounted，但route会改变
watch(route, (to) => {
  // console.log('watch')
  updateMicroApp(to)
})

const updateMicroApp = (to) => {
  // 定义子应用的路由前缀列表
  const microAppRules = ['/subApp1', '/subApp2']
  // 判断当前路由是否属于子应用
  microApp.value = microAppRules.some(prefix => to.path.startsWith(prefix))
}

// 当前组件 keep-alive通过组件的name匹配,而不是route的name
const wrapperMap = new Map();
const currentComponent = (component, route) => {
  if (!component) return;
  // 使用路由的fullPath作为组件名称
  const { fullPath: componentName } = route;
  let wrapper = wrapperMap.get(componentName);
  // 对组件进行包装
  if (!wrapper) {
    wrapper = {
      name: componentName,
      render: () => {
        try {
          return h(component);
        } catch (error) {
          console.error(`Error rendering component for route: ${componentName}`, error);
          return h(Error404);
        }
      },
    };
    wrapperMap.set(componentName, wrapper);
  }

  // 添加缓存组件的数量限制
  if (wrapperMap.size > 10) {
    const firstKey = wrapperMap.keys().next().value;
    if (firstKey) {
      wrapperMap.delete(firstKey);
      // 同时移除cachedViews列表中的视图
      tagsViewStore.removeCachedView({ fullPath: firstKey })
    }
  }
  return h(wrapper);
}

</script>

<style scoped>

</style>
