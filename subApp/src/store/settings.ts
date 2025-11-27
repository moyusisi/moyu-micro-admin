import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core"
import config from '@/config/settings';

export const useSettingsStore = defineStore('settings', () => {
	// 是否显示设置
	const title = ref(config.title);
	// 语言
	const lang = ref(config.lang);
	// 菜单是否折叠
	const menuCollapsed = ref(config.menuCollapsed);
	// 菜单是否折叠
	const moduleOpen = ref(config.moduleOpen);
	// 侧边栏菜单是否排他展开
	const sideUniqueOpen = useStorage("sideUniqueOpen", config.sideUniqueOpen);
	// 是否显示面包屑
	const breadcrumbView = useStorage("breadcrumbView", config.breadcrumbView);
	// 是否显示标签视图
	const tagsView = useStorage("tagsView", config.tagsView);
	// 是否启用水印
	const watermarkEnabled = useStorage("watermarkEnabled", config.watermarkEnabled);
	// 主题 light|dark
	const theme = useStorage("theme", config.theme);
	// 主题颜色
	const themeColor = useStorage("themeColor", config.themeColor);

	// actions
	const setTheme = (value) => {
		theme.value = value
	}
	const setThemeColor = (value) => {
		themeColor.value = value
	}

	// 值为bool类型的配置组成的开关map
	const switchMap = {
		moduleOpen,
		menuCollapsed,
		sideUniqueOpen,
		breadcrumbView,
		tagsView,
		watermarkEnabled,
	};

	// 切换指定key的开关值
	function toggleConfig(key) {
		const setting = switchMap[key];
		if (setting) {
			setting.value = !setting.value;
		}
	}

	return {
		title,
		lang,
		moduleOpen,
		menuCollapsed,
		sideUniqueOpen,
		breadcrumbView,
		tagsView,
		watermarkEnabled,
		theme,
		themeColor,
		setTheme,
		setThemeColor,
		toggleConfig
	};
});
