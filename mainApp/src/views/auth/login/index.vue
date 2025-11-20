<template>
  <div class="app-container">
    <a-row :gutter="16">
      <a-col :span="14">
        <a-image :src="loginPng" />
      </a-col>
      <a-col :span="10">
        <div class="login-container">
          <a-card>
            <div slot="header" class="login-title">
              <div>请登录</div>
            </div>
            <a-form ref="loginForm" :model="loginForm" :rules="loginRules">
              <a-form-item label="用户名" prop="username">
                <a-input v-model="loginForm.username" placeholder="请输入手机号" maxlength="11"/>
              </a-form-item>
              <a-form-item label="密码" prop="password">
                <a-input v-model="loginForm.password" placeholder="请输入密码" show-password/>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" style="width: 100%" @click="loginClick('loginForm')">登录</a-button>
              </a-form-item>
            </a-form>
          </a-card>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>

export default {
  name: 'Login',
  components: { },

  data() {
    const checkUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请填写手机号'))
      }
      // 使用正则表达式进行验证手机号码
      if (!/^1[3456789]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
      }
      // 自定义校验规则 需要调用callback()函数！
      callback()
    }
    const checkPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入密码'))
      }
      // 自定义校验规则 需要调用callback()函数！
      callback()
    }
    return {
      loginPng: '/img/login.png?' +new Date(),
      loginForm: {
        username: '',
        password: '',
        rememberMe: false,
        verCode: ''
      },
      codeCd: false,
      codeCdCount: 60,
      dialogVisible: false,
      verifySuccess: false,
      redirect: undefined,
      otherQuery: {},
      loginRules: {
        username: [{ validator: checkUsername, trigger: 'blur' }],
        password: [{ validator: checkPassword, trigger: 'blur' }]
      }
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
    // this.getCookie()
  },
  methods: {
    // 获取验证码
    getCode() {
      // getCodeImg().then(res => {
      //   this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled;
      //   if (this.captchaEnabled) {
      //     this.codeUrl = "data:image/gif;base64," + res.img;
      //     this.loginForm.uuid = res.uuid;
      //   }
      // })
    },
    // 获取cookie数据
    getCookie() {
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)

      }
    },
    loginClick(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          // 打开滑块验证
          this.dialogVisible = true
        } else {
          return false
        }
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          var username = this.loginForm.username
          var password = this.loginForm.password
          this.$store.dispatch('user/login', { username, password }).then(() => {
            this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    },
    dialogBeforeClose() {
      this.dialogVisible = false
    },
    onSuccess() {
      this.dialogVisible = false
      this.handleLogin()
      // 重置滑块验证
      this.$refs.slideblock.reset()
    }
  }
}
</script>

<style>
/* tab内容的样式 */
.tab {
  width: 60px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* tab的高度自适应 */
.el-tabs__item {
  height: 100%;
}

.image {

}
.login-container {
  width: 400px;
  height: 500px;
}
.login-title {
  display: flex;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}
</style>
