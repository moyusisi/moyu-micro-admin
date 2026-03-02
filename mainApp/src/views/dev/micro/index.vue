<template>
  <div class="admin-ui-main">
    <div id="microApp"></div>
    <a-spin :spinning="!subApp?.mounted" tip="Loading..." size="large" v-if="!subApp?.mounted" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { watch } from "vue";
import { startGarfish, microMap } from "@/microApp.ts";
import Garfish from "garfish";

// 获取当前路由对象（route 是响应式的，路由变化时会自动更新）
const route = useRoute()
// 子应用实例
let subApp = ref()

// 首次加载会调用onMounted但route不会改变
onMounted(async () => {
  console.log('主应用中的挂载容器#microApp已就绪...')
  // 确保启动Garfish时挂载点已经就绪
  // Garfish.run()
  // startGarfish()
  // 子应用手动加载(手动加载方便获取subApp实例并获取状态)
  for (const appName of Object.keys(microMap)) {
    const activePath = microMap[appName];
    if (route.path.startsWith(activePath)) {
      // 路径匹配则加载子应用并挂载
      subApp.value = await Garfish.loadApp(appName)
      await subApp.value.mount()
    }
  }
})

onUnmounted(async () => {
  await subApp.value?.unmount();
})

// 非首次加载则不再调用onMounted，但route会改变
watch(route, (to) => {
  // console.log('mainApp容器#microApp onWatch...')
})

</script>

<style scoped>

</style>
