<template>
  <div class="admin-ui-main">
    <div id="microApp"></div>
    <!--保活模式，name相同则复用一个子应用实例，改变url无效，必须采用通信的方式告知路由变化 -->
    <WujieVue width="100%" height="100%" name="subApp1" :url="subAppUrl" :sync="true"></WujieVue>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { watch } from "vue";
import { microMap } from "@/microApp.ts";

// 获取当前路由对象（route 是响应式的，路由变化时会自动更新）
const route = useRoute()
const subAppUrl = ref("");

// 首次加载会调用onMounted但route不会改变
onMounted(() => {
  console.log('AppMain#microApp onMounted...')
  // 通过 fullPath 自动匹配子应用
  let fullPath = route.fullPath;
  let subAppName = 'subApp';
  for (const appName of Object.keys(microMap)) {
    if (fullPath.startsWith(`/${appName}`)) {
      subAppName = appName;
    }
  }
  fullPath = fullPath.replace(`/${subAppName}`, '');
  subAppUrl.value = microMap[subAppName] + fullPath
})

// 非首次加载则不再调用onMounted，但route会改变
watch(route, (to) => {
  console.log('AppMain#microApp onWatch...')
})

</script>

<style scoped>

</style>
