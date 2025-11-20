import { createI18n } from 'vue-i18n'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enGB from 'ant-design-vue/es/locale/en_GB'
import zh_cn from './lang/zh-cn.ts'
import en from './lang/en.ts'
import defaultSettings from '@/config/settings'

export const messages = {
  'zh-cn': {
    lang: zhCN,
    ...zh_cn
  },
  en: {
    lang: enGB,
    ...en
  }
}

const i18n = createI18n({
  legacy: false,
  locale: defaultSettings.lang,
  fallbackLocale: 'zh-cn',
  messages: messages,
  globalInjection: true,
})

export default i18n
