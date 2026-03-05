<template>
  <template v-if="!isHidden(item)">
    <a-menu-item v-if="showMenuItem(item)" :key="menuItemRoute.path">
      <!-- 显示具有单个子路由的菜单项或没有子路由的父路由 -->
      <template v-if="menuItemRoute.meta?.icon" #icon>
        <component :is="menuItemRoute.meta.icon"/>
      </template>
      <!--  如果是超链接 新窗口打开  -->
      <a v-if="menuItemRoute.meta?.type === 'link'" :href="menuItemRoute.meta.url" target="_blank" @click.stop="() => {}">
        {{ menuItemRoute.meta?.title }}
      </a>
      <a v-else>{{ menuItemRoute.meta?.title }}</a>
    </a-menu-item>
    <a-sub-menu v-else :key="item.path" :title="item.meta?.title">
      <!-- 显示具有多个子路由的父菜单项 -->
      <template v-if="item.meta?.icon" #icon>
        <component :is="item.meta.icon"/>
      </template>
      <MenuItem v-for="child in item.children" :key="child.path" :item="child"/>
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
  // 展示为菜单的路由
  const menuItemRoute = ref()

  // 是否隐藏 资源类型（字典 1模块 2目录 3菜单 4内链 5外链 6按钮）
  const isHidden = (item) => {
    // 在meta中明确设置hidden==true的才隐藏，否则不隐藏
    return item.meta && item.meta.hidden
  }

  /**
   * 判断当前路由是否可以展示为菜单
   *
   * 1. 菜单，无children，返回true，可展示为菜单
   * 2. 目录，有children，只有一个可展示路由且目录设置了简洁模式，a.子路由无children则返回true；b.子路由有children则返回false(此时子路由为目录)
   * 3. 目录，有children，其他情况，返回false(不可展示为菜单)
   * @param route 当前路由
   */
  const showMenuItem = (route) => {
    // 所有子路由
    let children = route.children || []
    // 过滤出可展示的子路由
    const shownChildren = children.filter((item) => {
      return !isHidden(item)
    });
    // 有子路由则当作目录
    if (children.length > 0) {
      // 目录设置了简洁展示，当只有一个可展示的子路由时
      if (shownChildren.length === 1 && route.meta?.brief) {
        menuItemRoute.value = { ...shownChildren[0] };
        // 无children则展示，有则说明是目录
        return !menuItemRoute.children
      } else {
        return false
      }
    } else {
      // 无子路由则为菜单，可展示
      menuItemRoute.value = route;
      return true;
    }
  }

</script>
<style>

</style>
