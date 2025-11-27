import { defineStore } from 'pinia'
import '@/utils/objects'
import { SearchItem } from "@/types/global";
import { RouteRecordRaw } from "vue-router";

export const useSearchStore = defineStore('search', () => {
	// 定义state
	const pool = ref<SearchItem[]>([])
	const hotkey = ref({
		open: 's',
		close: 'esc'
	})
	const active = ref(false)

	// 定义action
	const toggleActive = () => {
		active.value = !active.value
	}
	const setActive = (val) => {
		active.value = val
	}
	const init = (menus: RouteRecordRaw[]) => {
		const poolList: SearchItem[] = []
		const getFullName = function (meta) {
			if (meta.breadcrumb) {
				let list: string[] = []
				meta.breadcrumb.forEach((item) => {
					list.push(item.title)
				})
				return list.join(' / ')
			}
			return meta.title
		}
		const push = function (menus) {
			menus.forEach((m) => {
				if (m.children) {
					push(m.children)
				} else {
					// 菜单且非隐藏则需要搜索
					if (m.meta.title && !m.meta.hidden) {
						var item: SearchItem = {
							icon: m.meta.icon,
							path: m.path,
							fullPath: m.path,
							name: m.meta.title,
							fullName: getFullName(m.meta),
							namePinyin: m.meta.title.toPinyin(),
							namePinyinFirst: m.meta.title.toPinyin(true)
						}
						poolList.push(item)
					}
				}
			})
		}
		push(menus)
		pool.value = poolList
	}

	return {
		pool,
		hotkey,
		active,
		toggleActive,
		setActive,
		init
	}
})
