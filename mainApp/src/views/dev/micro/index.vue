<template>
  <div class="admin-ui-main">
    <div id="microApp"></div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { watch } from "vue";
import { startQiankun } from "@/microApp.ts";

// 获取当前路由对象（route 是响应式的，路由变化时会自动更新）
const route = useRoute()

// 首次加载会调用onMounted但route不会改变
onMounted(() => {
  console.log('AppMain#microApp onMounted...')
  // 确保启动Garfish时挂载点已经就绪
  startQiankun()
})

// 非首次加载则不再调用onMounted，但route会改变
watch(route, (to) => {
  console.log('AppMain#microApp onWatch...')
})

</script>

<style scoped>

</style>
