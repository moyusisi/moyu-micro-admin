<template>
	<!-- Hamburger -->
	<div class="bar-item" @click="onClick">
		<MenuUnfoldOutlined v-if="menuCollapsed" />
		<MenuFoldOutlined v-else />
	</div>
</template>
<script setup>
	import { useSettingsStore } from '@/store'
	import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons-vue";

	const settingsStore = useSettingsStore()

	const menuCollapsed = computed(() => {
		return settingsStore.menuCollapsed
	})

	const onClick = () => {
		settingsStore.toggleConfig('menuCollapsed')
	}
</script>

<style scoped>
</style>
