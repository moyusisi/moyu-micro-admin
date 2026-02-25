<template>
  <!--保活模式，name相同则复用一个子应用实例，改变url无效，必须采用通信的方式告知路由变化 -->
  <WujieVue width="100%" height="100%" name="sub1" :url="url" :sync="false"></WujieVue>
</template>

<script setup>
  import { useRoute, useRouter } from "vue-router"
  // store
  const route = useRoute();
  const router = useRouter();
  const url = "//82.157.187.160:81" + route.fullPath;
  console.log(url);
  /***** 表格相关对象 end *****/

  // 加载完毕调用
  onMounted(() => {

  })

</script>

<style scoped>
</style>
