<template>
	<!-- 模块导航，多于1个才显示 -->
  <div class="module-menu-wrapper" v-if="moduleList && moduleList.length > 1">
    <!-- 展开 -->
    <div class="" v-if="moduleOpen">
      <a-menu v-bind:selectedKeys="selectedKeys" mode="horizontal" class="module-menu">
        <a-menu-item
            v-for="item in moduleList"
            :key="item.code"
            class="module-menu-item"
            @click="switchModule(item.code)"
            :class="{ 'ant-menu-item-select': item.code === module }"
        >
          <template #icon>
            <component :is="item.meta.icon" />
          </template>
          <span class="">{{ item.meta.title }}</span>
        </a-menu-item>
      </a-menu>
    </div>
    <!-- 折叠 -->
    <div class="" v-else>
      <a-popover trigger="click" placement="bottomRight">
        <template #content>
          <a-menu v-model:selectedKeys="selectedKeys" class="module-menu">
            <a-menu-item
                v-for="item in moduleList"
                :key="item.code"
                class="module-menu-item"
                @click="switchModule(item.code)"
                :class="{ 'ant-menu-item-select': item.code === module }"
            >
              <template #icon>
                <component :is="item.meta.icon" />
              </template>
              <span class="">{{ item.meta.title }}</span>
            </a-menu-item>
          </a-menu>
        </template>
        <div class="bar-item">
          <AppstoreOutlined/>
        </div>
      </a-popover>
    </div>
  </div>
</template>
<script setup>
  import { h, toRefs } from 'vue'
  import { useRoute, useRouter } from "vue-router";
  import { useMenuStore, useSettingsStore, useTagsViewStore } from '@/store/index.js'
  import { AppstoreOutlined, FullscreenOutlined, MenuUnfoldOutlined } from "@ant-design/icons-vue";

  const settingsStore = useSettingsStore()
  const tagsViewStore = useTagsViewStore()
  const menuStore = useMenuStore()
  const route = useRoute()
  const router = useRouter()

  // 缓存页面集合, 直接解构store中的同名字段
  const { moduleList, module } = toRefs(menuStore);
  // module菜单是否打开
  const moduleOpen = computed(() => {
    return settingsStore.moduleOpen
  })
  // 选中的module
  const selectedKeys = computed(() => {
    return [module.value]
  })

  // 切换模块
  const switchModule = (code) => {
    // 未变化不切换
    if (module.value === code) {
      return
    }
    // 路由到模块首页
    let moduleHome
    menuStore.moduleList.filter((item) => {
      if (item.code === code) {
        moduleHome = item.redirect
      }
    })
    // 模块首页
    if (!moduleHome) {
      moduleHome = "/index"
    }
    // 路由到模块的首页
    menuStore.switchModule(code)
    tagsViewStore.initTags()
    router.push({ path: moduleHome })
  }

</script>

<style scoped>

/* 单个操作图标Bar */
.module-menu-wrapper {
  height: 100%;
  display: flex;
}

.module-menu {
  line-height: 50px;
  border-bottom: 0;
  width: 100%;
  flex: 0 0 auto;
  border-inline-end: none !important;
}

/** 不显示选中的下划线 **/
:deep(.ant-menu-horizontal > .ant-menu-item::after,
.ant-menu-horizontal > .ant-menu-submenu::after) {
  display: none;
}
</style>
