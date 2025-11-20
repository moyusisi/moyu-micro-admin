<template>
	<div class="admin-ui-navbar">
		<!-- 左侧面板 -->
		<div class="left-panel">
			<!-- 汉堡包 -->
			<Hamburger/>
			<!-- 面包屑 -->
			<Breadcrumb />
		</div>
		<!-- 右侧面板 -->
		<div class="right-panel">
      <SearchBar />
      <!-- 全屏 -->
      <div class="bar-item" @click="fullscreen">
        <FullscreenOutlined />
      </div>
			<UserBar />
		</div>
	</div>
</template>
<script setup>
	import Breadcrumb from '@/layout/components/Breadcrumb/index.vue'
  import Hamburger from "@/layout/components/NavBar/Hamburger/index.vue"
  import SearchBar from "@/layout/components/NavBar/SearchBar/index.vue"
	import UserBar from "@/layout/components/NavBar/UserBar/index.vue"
  import screenFull from "screenfull";
  import { FullscreenOutlined } from "@ant-design/icons-vue";

  // 全屏
  const fullscreen = () => {
    const element = document.documentElement
    if (screenFull.isEnabled) {
      screenFull.toggle(element)
    }
  }
</script>

<style scoped>
.admin-ui-navbar {
	display: flex;
	justify-content: space-between;
	background: #FFFFFF;
  border-bottom: 1px solid rgba(246, 246, 246, 0.85);
	box-shadow: 0 0.4px 0.5px rgb(0 21 41 / 12%);
}
.admin-ui-navbar .left-panel {
	display: flex;
	align-items: center;
}
.admin-ui-navbar .right-panel {
	display: flex;
	align-items: center;
  margin-right: 10px;
}

</style>
