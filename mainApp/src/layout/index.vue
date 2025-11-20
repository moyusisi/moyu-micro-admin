<template>
  <!-- 经典布局 -->
  <a-layout>
    <!-- 左侧侧边栏 a-layout-sider -->
    <SideBar />
    <!-- 右侧布局 -->
    <a-layout>
      <!-- 最上方导航 -->
      <NavBar />
      <!-- 多标签 -->
       <TagsView v-if="tagsView" />
      <!-- 主要内容区域 -->
      <a-layout-content class="main-content-wrapper">
        <AppMain/>
      </a-layout-content>
    </a-layout>
  </a-layout>

</template>

<script setup>
import { notification, Button } from 'ant-design-vue'
import { getLocalHash, checkHash } from '@/utils/version'
import SideBar from "@/layout/components/SideBar/index.vue"
import NavBar from "@/layout/components/NavBar/index.vue"
import TagsView from "@/layout/components/TagsView/index.vue"
import AppMain from "@/layout/components/AppMain/index.vue"
import { useSettingsStore } from "@/store"

const settingsStore = useSettingsStore()
const tagsView = computed(() => {
  return settingsStore.tagsView
})

onMounted(() => {
  updateVersion()
})
// 新版检测
const updateVersion = () => {
  const updateVersionOpen = import.meta.env.VITE_VERSION_UPDATE
  if (updateVersionOpen) {
    setTimeout(async () => {
      // 本地
      let localVersion = getLocalHash()
      // 线上
      let onlineVersion = await checkHash()
      // 如果不一样，提示更新
      if (localVersion !== onlineVersion) {
        if (document.querySelector('.notification-update-version')) {
          return
        }
        const key = `open${Date.now()}`
        notification.open({
          type: 'info',
          message: '发现新版本',
          description: '检测到新版本，请刷新后使用',
          duration: 0,
          class: 'notification-update-version',
          btn: () =>
              h(
                  Button,
                  {
                    type: 'primary',
                    size: 'small',
                    onClick: () => {
                      notification.close(key)
                      window.location.reload()
                    }
                  },
                  { default: () => '立即更新' }
              ),
          key
        })
      }
    }, 3000)
  }
}
</script>

<style scoped>

</style>
