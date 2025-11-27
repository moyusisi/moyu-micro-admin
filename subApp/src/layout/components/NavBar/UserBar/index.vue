<template>
	<div class="user-bar">
		<a-dropdown class="user-bar-item">
			<div class="user-avatar">
        <a-avatar :src="userInfo.avatar ? userInfo.avatar : avatarImg">Me</a-avatar>
				<label>{{ userInfo.name }}</label>
			</div>
			<template #overlay>
				<a-menu>
          <a-sub-menu v-if="userInfo.groupInfoList && userInfo.groupInfoList.length > 1" key="groupSubMenu" :icon="h(UserSwitchOutlined)" title="岗位切换">
            <template v-for="group in userInfo.groupInfoList" :key="group.code" :item="group">
              <a-menu-item :class="{'item-selected':userInfo.groupCode === group.code}" @click="switchUserGroup(group.code)">
                <user-outlined class="mr8" />
                <span>{{ group.name }}</span>
                <div class="item-sub-title">{{ group.orgFullName }}</div>
              </a-menu-item>
            </template>
          </a-sub-menu>
          <a-menu-divider />
          <a-menu-item key="logOut" @click="userLogout()">
            <export-outlined class="mr8" />
            <span>退出登录</span>
          </a-menu-item>
				</a-menu>
			</template>
		</a-dropdown>
	</div>

</template>

<script setup>
  import { h, createVNode } from 'vue'
  import { ExclamationCircleOutlined, UserSwitchOutlined } from '@ant-design/icons-vue'
  import { Modal } from 'ant-design-vue'
  import { message } from 'ant-design-vue'
  import { useMenuStore, useTagsViewStore, useUserStore } from '@/store/index.js'
  import { useRoute, useRouter } from 'vue-router'

  const userStore = useUserStore()
  const menuStore = useMenuStore()
  const tagsViewStore = useTagsViewStore()
  const route = useRoute()
  const router = useRouter()
  const avatarImg = '/img/avatar.gif?' +new Date()

  const userInfo = computed(() => {
    return userStore.userInfo
  })

  // 切换用户岗位
  const switchUserGroup = async (groupCode) => {
    if (userInfo.value.groupCode === groupCode) {
      message.success('当前已是所选岗位')
      return
    }
    try {
      await userStore.switchUserGroup(groupCode)
      message.loading('切换中...', 0.5)
      await menuStore.reloadRoutes()
      tagsViewStore.initTags()
      router.push({ path: '/' })
      // window.location.href = '/index'
      message.success('切换成功')
    } catch (err) {
      message.error('切换失败')
      console.log(err)
    }
  }
  // 退出登陆
  const userLogout = () => {
    Modal.confirm({
      title: '提示',
      content: '确认退出当前用户？',
      icon: createVNode(ExclamationCircleOutlined),
      maskClosable: false,
      onOk() {
        message.loading('退出中...', 0.5)
        userStore.logout().then(() => {
          menuStore.clear()
          tagsViewStore.initTags()
          router.push(`/login?redirect=${route.fullPath}`);
          // router.push({ path: '/login' })
        }).catch((err) => {
          localStorage.clear()
          router.push({ path: '/login' })
        })
      },
      onCancel() {
      }
    })
  }
</script>

<style>
	.user-bar {
		display: flex;
		align-items: center;
		height: 100%;
	}
  .user-bar .user-bar-item {
    padding: 0 10px;
    cursor: pointer;
    height: 100%;
    display: flex;
    align-items: center;
  }
  .user-bar .user-bar-item:hover {
    background: rgba(0, 0, 0, 0.08);
  }
	.user-bar .user-avatar {
		height: 49px;
		display: flex;
		align-items: center;
	}
	.user-bar .user-avatar label {
		display: inline-block;
		margin-left: 5px;
		cursor: pointer;
	}
	.setting {
		margin-right: 10px;
	}
  .mr8 {
    margin-right: 8px;
  }
  .item-sub-title {
    font-size: 12px;
    color: #737373;
  }
  .item-selected {
    background-color: #e6f7ff;
  }
</style>
