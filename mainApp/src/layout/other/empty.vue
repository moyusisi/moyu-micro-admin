<template>
  <router-view></router-view>
</template>

<script setup>

// 加载完毕调用
onMounted(() => {
  console.log("emptyLayout onMounted...")
})

// 加载完毕调用
onUnmounted(() => {
  console.log("emptyLayout onUnmounted...")
})

</script>

<style scoped>

</style>
