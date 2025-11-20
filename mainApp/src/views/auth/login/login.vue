<template>
	<div class="login-wrapper">
		<div class="login_background">
			<div class="logo_background">
<!--        <img :alt="settings.title" :src="settings.logo" />-->
				<label>{{ settings.title }}</label>
			</div>
			<div class="version">
				<p>{{ settings.copyright }} {{ settings.version }}</p>
			</div>
		</div>
		<div class="login_main">
			<div class="login-form">
				<a-card>
					<div class="login-header">
						<h2>用户登录</h2>
					</div>
					<a-tabs v-model:activeKey="activeKey">
						<a-tab-pane key="userAccount" tab="账号密码">
							<a-form ref="loginForm" :model="formData">
								<a-form-item name="account">
									<a-input
										v-model:value="formData.account"
										placeholder="请输入账号"
										size="large"
										@keyup.enter="login"
									>
										<template #prefix>
											<UserOutlined class="login-icon-gray" />
										</template>
									</a-input>
								</a-form-item>
								<a-form-item name="password">
									<a-input-password
										v-model:value="formData.password"
										placeholder="请输入密码"
										size="large"
										autocomplete="off"
										@keyup.enter="login"
									>
										<template #prefix>
											<LockOutlined class="login-icon-gray" />
										</template>
									</a-input-password>
								</a-form-item>

								<a-form-item>
									<a-button type="primary" class="login-btn" :loading="loading" size="large" @click="login">登陆
									</a-button>
								</a-form-item>
							</a-form>
						</a-tab-pane>
					</a-tabs>
				</a-card>
			</div>
		</div>
	</div>
</template>
<script setup>
	import settings from '@/config/settings'
  import { useUserStore } from "@/store"
  import { useRoute, useRouter } from 'vue-router'
  import { message } from "ant-design-vue"

  const userStore = useUserStore()
  const route = useRoute()
  const router = useRouter()

	const activeKey = ref('userAccount')
	const loading = ref(false)

	const formData = ref({
		account: 'auditor',
		password: 'qwer@123!',
		validCode: '',
		validCodeReqNo: '',
		autologin: false
	})

	//登陆
	const loginForm = ref()
  const login = async () => {
    loginForm.value.validate().then(async () => {
      loading.value = true
      const loginData = {
        account: formData.value.account,
        password: formData.value.password,
        validCode: formData.value.validCode,
        validCodeReqNo: formData.value.validCodeReqNo
      }
      // 获取token
      try {
        // 登录
        await userStore.login(loginData)
        // 初始化用户信息
        await userStore.initUserInfo()
        message.success('登录成功')
        const redirectPath = (route.query.redirect) || "/"
        await router.push(redirectPath)
      } catch (err) {
        message.error('登陆失败')
        console.log(err)
        loading.value = false
      }
    }).catch((err) => {
      console.log(err)
    })
  }

</script>
<style >
.login-icon-gray {
  color: rgba(0, 0, 0, 0.25);
}

.login-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #fff;
  display: flex;
}
.login_background {
  width: 50%;
  height: 100%;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-image: url(/img/login_background.png);
  position: relative;
}

/*background-image:linear-gradient(transparent, #000);*/
.login_main {
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: center;
}
.login-form {
  width: 450px;
  margin-top: 130px;
}
.login-header {
  margin-bottom: 20px;
}
.login-header h2 {
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
}

.logo_background {
  position: absolute;
  left: 0;
  top: 50px;
  height: 60px;
  padding-left: 56px;
  width: 100%;
  background: linear-gradient(120deg, rgb(255 255 255 / 90%), rgba(255, 255, 255, 0));
  display: flex;
  align-items: center;
}

.logo_background a {
  text-decoration: none;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.logo_background a.no-link,
.logo_background a.no-link label {
  cursor: default;
}

.logo_background img {
  height: 40px;
  margin-right: 10px;
}

.logo_background a label {
  font-size: 24px;
  color: #fff;
  cursor: pointer;
}

.login_background .version {
  width: 100%;
  font-size: 14px;
  color: #fff;
  font-weight: 300;
  padding: 0 56px;
  box-sizing: border-box;
  position: absolute;
  bottom: 12px;
}

.login_background .version p {
  line-height: 22px;
  text-align: center;
  margin-bottom: 6px;
}
.login-btn {
  width: 100%;
}
</style>
