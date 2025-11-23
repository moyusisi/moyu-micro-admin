<template>
  <a-config-provider :locale="locale" :theme="customTheme">
    <a-app id="app" class="app">
      <a-watermark :content="watermarkEnabled && userInfo ? [userInfo.name, userInfo.account] : undefined" class="admin-ui">
<!--        <router-view/>-->
        <!-- 微应用挂载容器：子应用会被渲染到这里 -->
<!--        <div id="microApp"></div>-->
        <Layout/>
      </a-watermark>
    </a-app>
  </a-config-provider>
</template>

<script setup lang="ts">
  import { theme } from 'ant-design-vue';
  import { useRoute } from 'vue-router'
  import { useUserStore, useSettingsStore } from '@/store'
  import i18n from "@/locale"
  import Layout from '@/layout/index.vue'

  const userStore = useUserStore()
  const settingsStore = useSettingsStore()

  // 获取当前路由对象（route 是响应式的，路由变化时会自动更新）
  const route = useRoute()
  const microApp = ref(false)
  // 仅监听路由路径的变化
  watch(() => route.path, (newPath) => {
    console.log('当前路由路径：', newPath)
    // 定义子应用的路由前缀列表
    const microAppRules = ['/subApp1', '/subApp2']
    // 判断当前路由是否属于子应用
    microApp.value = microAppRules.some(prefix => route.path.startsWith(prefix))
  })

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
