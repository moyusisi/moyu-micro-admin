<template>
	<div v-if="breadcrumbView" class="admin-ui-breadcrumb">
		<a-breadcrumb>
			<template v-for="item in breadList" :key="item.path">
				<a-breadcrumb-item>
					<a v-if="item.redirect" @click.prevent="handleLink(item)">{{ item.title }}</a>
					<span v-else>{{ item.title }}</span>
				</a-breadcrumb-item>
			</template>
		</a-breadcrumb>
	</div>
</template>
<script setup>
	import { useRoute, useRouter } from 'vue-router'
	import { useSettingsStore } from '@/store'
	import { watch } from "vue";

	const settingsStore = useSettingsStore()
	const route = useRoute()
	const router = useRouter()

	const breadcrumbView = computed(() => {
		return settingsStore.breadcrumbView
	})

	const breadList = ref([])

	onMounted(() => {
		getBreadcrumb()
	})
	// 路由变化时要更新面包屑
	watch(route, () => {
		getBreadcrumb()
	})

	// 获取面包屑
	const getBreadcrumb = () => {
    breadList.value = route.meta.breadcrumb
		// 下面的面包屑是route匹配的形式，得到的是route的列表
    // let matched = route.matched.filter(
		// 	(item) => item.meta && item.meta.title
		// );
		// // console.log(route.matched)
		// breadList.value = matched.filter((item) => {
		// 	return item.meta && item.meta.title && item.meta.breadcrumb !== false;
		// });
		// console.log(breadList.value)
	}

	// 处理面包屑中的链接
	const handleLink = (item) => {
		const { redirect, path } = item;
		if (redirect) {
			if (isExternal(redirect)) {
				window.open(redirect)
			} else {
				router.push(redirect).catch((err) => {
					console.warn(err);
				});
			}
		}
	}

	/**
	 *  判断是否为外部链接
	 *
	 * @param {string} path
	 * @returns {Boolean}
	 */
	function isExternal(path) {
		const isExternal = /^(https?:|http?:|mailto:|tel:)/.test(path);
		return isExternal;
	}
</script>

<style scoped>
	.admin-ui-breadcrumb {
		padding-left: 15px;
		min-height: 40px;
		display: flex;
		align-items: center;
	}
	.admin-ui-navbar .admin-ui-breadcrumb {
		padding-left: 0;
	}
</style>
