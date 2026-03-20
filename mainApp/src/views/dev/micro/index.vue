<template>
  <div class="admin-ui-main">
    <div id="microApp"></div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { watch } from "vue";
import { microMap, startQiankun } from "@/microApp.ts";

// 获取当前路由对象（route 是响应式的，路由变化时会自动更新）
const route = useRoute()
const subAppUrl = ref(null);
let subAppName = ref("subApp");

// 在mount之前初始化乾坤所需参数
onBeforeMount(() => {
  console.log('主应用中的挂载容器#microApp已就绪...')
  // 确保启动Qiankun时挂载点已经就绪
  startQiankun()
})

</script>

<style scoped>

</style>
