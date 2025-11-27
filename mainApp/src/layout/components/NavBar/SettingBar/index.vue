<template>
	<!-- 系统设置Bar -->
  <div class="bar-item" @click="openSetting">
<!--    <SettingOutlined />-->
    <LayoutOutlined />
  </div>
  <!-- 系统设置抽屉 -->
  <a-drawer v-model:open="settingsOpen" :closable="false" width="300">
    <setting />
  </a-drawer>
</template>
<script setup>
  import { SettingOutlined, LayoutOutlined } from "@ant-design/icons-vue"
  import Setting from "@/layout/components/NavBar/SettingBar/setting.vue"

  const settingsOpen = ref(false)

  // 设置抽屉
  const openSetting = () => {
    settingsOpen.value = true
  }
</script>

<style scoped>
</style>
