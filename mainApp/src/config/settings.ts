import { AppSettings } from "@/types/global"

/**
 * 系统默认配置
 */
const defaultSettings: AppSettings = {
  // 默认站点名称
  title: "myAdmin",
  // 默认logo
  logo: '/img/logo.svg',
  // 版本
  version: "v1.1.0",
  // 版权
  copyright: 'MY ©2025 Created by my',
  // 语言
  lang: 'zh-cn',
  // 默认主题: light | dark
  theme: "light",
  // 默认主题色
  themeColor: "#1677FF",
  // 模块是否展开
  moduleOpen: true,
  // 菜单是否折叠
  menuCollapsed: false,
  // 侧边菜单是否排他展开
  sideUniqueOpen: true,
  // 是否展示面包屑
  breadcrumbView: true,
  // 是否展示多标签页
  tagsView: false,
  // 是否启用水印
  watermarkEnabled: false,

  // 接口地址
  API_URL: import.meta.env.VITE_API_BASEURL,
  // Token前缀，注意最后有个空格，如不需要需设置空字符串 // Bearer
  TOKEN_PREFIX: 'Bearer ',

}

export default defaultSettings
