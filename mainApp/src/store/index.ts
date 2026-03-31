import type { App } from 'vue'

const store = createPinia();

// 全局注册 store
export function setupStore(app: App<Element>) {
  app.use(store);
}

export * from './settings'
export * from './user'
export * from './menu'
export * from './tagsView'
export * from './search'
export { store };