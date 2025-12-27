import { defineStore } from 'pinia'
import loginApi from '@/api/auth/loginApi'
import userCenterApi from '@/api/system/userCenterApi'
import { UserInfo } from "@/api/system/types.ts";

export const useUserStore = defineStore('userStore', () => {
  // 定义state
  // 用户信息
  const userInfo = ref<UserInfo>({});

  // 定义action
  // 登录
  const login = async ({ account, password }) => {
    // 获取token
    const res = await loginApi.login({ account, password })
    if (!res.data) {
      // 这等价于 Promise.reject(new Error("Rejected value"))
      throw new Error("登录失败");
    }
    localStorage.setItem('TOKEN', res.data)
  }

  const logout = async () => {
    await loginApi.logout()
    clear()
  }

  const clear = () => {
    // 清理掉个人的一些信息
    localStorage.removeItem('TOKEN')
    localStorage.removeItem('USER_INFO')
    userInfo.value = {}
  }

  // 初始化用户信息
  const initUserInfo = async () => {
    // 优先获取本地数据
    let localUserInfo = JSON.parse(localStorage.getItem('USER_INFO') as string)
    if (localUserInfo) {
      console.log("load localUserInfo...")
      userInfo.value = localUserInfo
    } else {
      // 本地无则从api获取
      await refreshUserInfo()
    }
  }
  // 刷新登录用户信息
  const refreshUserInfo = async () => {
    const res = await userCenterApi.loginUserInfo()
    if (!res.data) {
      // 这等价于 Promise.reject(new Error("Rejected value"))
      throw new Error("更新用户信息失败");
    }
    userInfo.value = res.data
    localStorage.setItem('USER_INFO', JSON.stringify(userInfo.value))
  }

  // 切换用户岗位身份
  const switchUserGroup = async (groupCode: string) => {
    const res = await userCenterApi.switchUserGroup({ code: groupCode })
    localStorage.setItem('TOKEN', res.data)
    await refreshUserInfo()
  }

  return {
    login,
    logout,
    userInfo,
    initUserInfo,
    refreshUserInfo,
    switchUserGroup
  }
})