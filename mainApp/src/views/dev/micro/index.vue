<template>
  <div class="admin-ui-main">
    <!--保活模式，name相同则复用一个子应用实例，改变url无效，必须采用通信的方式告知路由变化 -->
    <WujieVue width="100%" height="100%" :name="subAppName" :url="subAppUrl" :sync="false"></WujieVue>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import WujieVue from "wujie-vue3";
import { microMap } from "@/microApp.ts";

// 获取当前路由对象（route 是响应式的，路由变化时会自动更新）
const route = useRoute()
const subAppUrl = ref(null);
let subAppName = ref("subApp");

// 在mount之前初始化无界所需参数(解决子应用重复mount问题)
onBeforeMount(() => {
  console.log('主应用onBeforeMount挂载容器前初始化无界参数')
  // 通过 fullPath 自动匹配子应用
  let fullPath = route.fullPath;
  for (const appName of Object.keys(microMap)) {
    if (fullPath.startsWith(`/${appName}`)) {
      subAppName.value = appName;
      break;
    }
  }
  fullPath = fullPath.replace(`/${subAppName.value}`, '');
  let host = microMap[subAppName.value]
  // 兼容host结尾包含'/'于fullPath重复的情况
  if (host.endsWith('/')) {
    host = host.slice(0, -1)
  }
  subAppUrl.value = host + fullPath
})

</script>

<style scoped>

</style>
