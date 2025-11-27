<template>
  <div class="scrollbar">
    <a-divider>
      <h3 class="setting-item-title">整体风格设置</h3>
    </a-divider>
    <div class="setting-checkbox">
      <a-tooltip v-for="(a, i) in sideStyleList" :key="i" placement="top">
        <template #title>
          <span>{{ a.tips }}</span>
        </template>
        <div :class="['setting-checkbox-item', a.style]" @click="setSideStyle(a.value)">
          <check-outlined v-if="theme === a.value" class="setting-checkbox-item-select-icon"/>
        </div>
      </a-tooltip>
    </div>
    <a-divider/>
    <a-form ref="formRef" class="text-right">
      <a-form-item label="模块坞">
        <a-switch :checked="moduleOpen" @change="toggleState('moduleOpen')"/>
      </a-form-item>
      <a-form-item label="面包屑">
        <a-switch :checked="breadcrumbView" @change="toggleState('breadcrumbView')"/>
      </a-form-item>
      <a-form-item label="多标签">
        <a-switch :checked="tagsView" @change="toggleState('tagsView')"/>
      </a-form-item>
      <a-form-item label="折叠菜单">
        <a-switch :checked="menuCollapsed" @change="toggleState('menuCollapsed')"/>
      </a-form-item>
      <a-form-item label="菜单排他展开">
        <a-switch :checked="sideUniqueOpen" @change="toggleState('sideUniqueOpen')"/>
      </a-form-item>
      <a-form-item label="登录用户水印">
        <a-switch :checked="watermarkEnabled" @change="toggleState('watermarkEnabled')"/>
      </a-form-item>
    </a-form>
    <a-alert
        message="以上配置可实时预览，开发者可在 config/settings.js 中配置默认值，不建议在生产环境下开放布局设置"
        type="warning"
    />
  </div>
</template>
<script setup>
  import { useSettingsStore } from '@/store'

  const settingsStore = useSettingsStore()
  const sideStyleList = ref([
    {
      tips: '暗色主题风格',
      value: 'dark',
      style: 'setting-checkbox-item-dark'
    },
    {
      tips: '亮色主题风格',
      value: 'light',
      style: 'setting-checkbox-item-light'
    }
  ])
  const theme = computed(() => {
    return settingsStore.theme
  })
  const moduleOpen = computed(() => {
    return settingsStore.moduleOpen
  })
  const breadcrumbView = computed(() => {
    return settingsStore.breadcrumbView
  })
  const tagsView = computed(() => {
    return settingsStore.tagsView
  })
  const menuCollapsed = computed(() => {
    return settingsStore.menuCollapsed
  })
  const sideUniqueOpen = computed(() => {
    return settingsStore.sideUniqueOpen
  })
  const watermarkEnabled = computed(() => {
    return settingsStore.watermarkEnabled
  })
  const toggleState = (stateName) => {
    settingsStore.toggleConfig(stateName)
  }
  // 设置整体风格主题
  const setSideStyle = (value) => {
    settingsStore.setTheme(value)
  }

  onMounted(() => {
  })
</script>

<style scoped>
	.setting-checkbox {
		display: flex;
		margin-bottom: 20px;
	}
	.setting-checkbox-item {
		position: relative;
		width: 44px;
		height: 36px;
		margin-right: 16px;
		overflow: hidden;
		background-color: #ebeef1;
		border-radius: 2px;
		box-shadow: 0 1px 2.5px 0 rgb(0 0 0 / 18%);
		cursor: pointer;
	}
	.setting-checkbox-item::before {
		position: absolute;
		top: 0;
		left: 0;
		width: 33%;
		height: 100%;
		background-color: #fff;
		content: '';
	}
	.setting-checkbox-item::after {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 25%;
		background-color: #fff;
		content: '';
	}
	.setting-checkbox-item-light {
		background-color: #ebeef1;
		content: '';
	}
	.setting-checkbox-item-light::before {
		background-color: #fff;
		content: '';
	}
	.setting-checkbox-item-light::after {
		background-color: #fff;
	}
	.setting-checkbox-item-dark {
		z-index: 1;
		background-color: #ebeef1;
		content: '';
	}
	.setting-checkbox-item-dark::before {
		z-index: 1;
		background-color: #001529;
		content: '';
	}
	.setting-checkbox-item-dark::after {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 25%;
		background-color: #fff;
		content: '';
	}
	.setting-checkbox-item-realdark {
		background-color: rgba(0, 21, 41, 0.85);
	}
	.setting-checkbox-item-realdark::before {
		z-index: 1;
		background-color: rgba(0, 21, 41, 0.65);
		content: '';
	}
	.setting-checkbox-item-realdark::after {
		background-color: rgba(0, 21, 41, 0.85);
	}
	.setting-checkbox-item-select-icon {
		position: absolute;
		right: 8px;
		bottom: 8px;
		color: #1677FF;
		font-weight: 700;
		font-size: 14px;
		pointer-events: none;
	}
	.setting-theme-color-colorBlock {
		margin-top: 8px;
		width: 20px;
		height: 20px;
		border-radius: 2px;
		float: left;
		cursor: pointer;
		margin-right: 8px;
		padding-left: 0px;
		padding-right: 0px;
		text-align: center;
		color: #fff;
		font-weight: 700;
	}
	.setting-layout-menu-doublerow {
		z-index: 1;
		background-color: #ebeef1;
		content: '';
	}
	.setting-layout-menu-doublerow::before {
		z-index: 1;
		width: 16%;
		background-color: #001529;
		content: '';
	}
	.setting-layout-menu-doublerow-inner {
		position: absolute;
		top: 0;
		left: 0;
		display: block;
		width: 33%;
		height: 100%;
		background-color: #fff;
		content: '';
	}
	.setting-layout-menu-doublerow::after {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 25%;
		background-color: #fff;
		content: '';
	}
	.setting-layout-menu-classical {
		z-index: 1;
		background-color: #ebeef1;
		content: '';
	}
	.setting-layout-menu-classical::before {
		z-index: 1;
		background-color: #001529;
		content: '';
	}
	.setting-layout-menu-classical::after {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 25%;
		background-color: #fff;
		content: '';
	}
	.setting-layout-menu-top {
		z-index: 1;
		background-color: #ebeef1;
		content: '';
	}
	.setting-layout-menu-top::before {
		z-index: 1;
		background-color: #ebeef1;
		content: '';
	}
	.setting-layout-menu-top::after {
		z-index: 2;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 25%;
		background-color: #001529;
		content: '';
	}
	.scrollbar {
		margin: 0 auto;
	}
	.setting-item-title {
		color: rgba(0, 0, 0, 0.88);
	}
	:deep(.ant-form-item) {
		margin-bottom: 12px !important;
	}
</style>
