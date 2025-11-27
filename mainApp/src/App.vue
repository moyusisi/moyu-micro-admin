<template>
  <a-config-provider :locale="locale" :theme="customTheme">
    <a-app id="app" class="app">
      <a-watermark :content="watermarkEnabled && userInfo ? [userInfo.name, userInfo.account] : undefined" class="admin-ui">
        <router-view/>
      </a-watermark>
    </a-app>
  </a-config-provider>
</template>

<script setup lang="ts">
  import { theme } from 'ant-design-vue';
  import { useUserStore, useSettingsStore } from '@/store'
  import i18n from "@/locale"

  const userStore = useUserStore()
  const settingsStore = useSettingsStore()

  // 获取用户信息
  const userInfo = computed(() => {
    return userStore.userInfo
  })
  // 水印开关
  const watermarkEnabled = computed(() => {
    return settingsStore.watermarkEnabled
  })

  // 本地语言
  const locale = i18n.global.messages.value[i18n.global.locale.value].lang

  // 自定义主题
  const customTheme = {
    token: {
      // colorPrimary: '#00b96b',
    },
    algorithm: [theme.defaultAlgorithm],
  }
</script>

<style scoped>

</style>
