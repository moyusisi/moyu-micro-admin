<template>
	<template v-if="!isHidden(item)">
		<a-menu-item v-if="hasOnlyOneShownRoute(item) && (!onlyOneRoute.children || onlyOneRoute.noShownChildren) && !item.meta?.alwaysShow" :key="onlyOneRoute.path">
      <!-- 显示具有单个子路由的菜单项或没有子路由的父路由 -->
			<template v-if="onlyOneRoute.meta.icon" #icon>
				<component :is="onlyOneRoute.meta.icon" />
			</template>
			<!--  如果是超链接 新窗口打开  -->
			<a v-if="onlyOneRoute.meta?.type === 'link'" :href="onlyOneRoute.meta.url" target="_blank" @click.stop="() => {}">
				{{ onlyOneRoute.meta?.title }}
			</a>
			<a v-else>{{ onlyOneRoute.meta?.title }}</a>
		</a-menu-item>
		<a-sub-menu v-else :key="item.path" :title="item.meta?.title">
      <!-- 显示具有多个子路由的父菜单项 -->
			<template v-if="item.meta?.icon" #icon>
				<component :is="item.meta.icon" />
			</template>
			<MenuItem v-for="child in item.children" :key="child.path" :item="child" />
		</a-sub-menu>
	</template>
</template>

<script setup>
  const props = defineProps({
    /**
     * 菜单项
     */
    item: {
      type: Object,
      required: true,
    },
  })
	const onlyOneRoute = ref()

	// 是否隐藏 资源类型（字典 1模块 2目录 3菜单 4内链 5外链 6按钮）
	const isHidden = (item) => {
		// 在meta中明确设置hidden==true的才隐藏，否则不隐藏
		return item.meta && item.meta.hidden
	}

	/**
	 * 判断当前路由是否只有一个可以展示的路由
	 *
	 * 1：只有一个可展示的子路由：返回 true
	 * 2：无子路由：返回 true
	 * @param route 当前路由
	 */
	const hasOnlyOneShownRoute = (route) => {
		let children = route.children || []
		// 可展示的子路由集合
		const shownChildren = children.filter((item) => {
			return !isHidden(item)
		});

		// 如果没有子路由，则显示当前路由
		if (shownChildren.length === 0) {
			onlyOneRoute.value = { ...route, noShownChildren: true };
			return true;
		}
		// 如果只有一个子路由, 返回 true (此处决定了单节点的目录是否显示)
		// if (shownChildren.length === 1) {
		// 	onlyOneRoute.value = { ...shownChildren[0] };
		// 	return true;
		// }
		return false;
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
<style>

</style>
