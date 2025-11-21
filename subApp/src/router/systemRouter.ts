import Layout from '@/layout/index.vue'

/**
 * 静态路由
 * * path 要以"/"开头的绝对路径,children中的path也要写绝对路径
 * * name 必填
 * * meta.title 菜单名称
 * * meta.hidden 是否隐藏
 * * meta.alwaysShow 空目录是否显示
 */
const routes = [
	{
		path: "/redirect",
		name: 'redirect',
		component: Layout,
		meta: { hidden: true },
		children: [
			{
				path: "/redirect/:path(.*)",
				component: () => import("@/views/redirect/index.vue"),
				meta: { title: '重定向', hidden: true }
			},
		],
	},
	{
		path: '/',
		name: 'layout',
		component: Layout,
		redirect: '/index',
		meta: { title: '系统菜单', hidden: false, alwaysShow: false, icon: 'home-outlined' },
		children: [
			{
				path: '/index',
				// 用于 keep-alive 功能，需要与 SFC 中自动推导或显式声明的组件名称一致
				// 参考文档: https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude
				name: 'Index',
				component: () => import('@/views/home/index.vue'),
				meta: { title: '首页', icon: 'home-outlined', affix: true }
			}
		]
	},
	{
		path: '/login',
		name: 'Login',
		component: () => import('@/views/auth/login/login.vue'),
		meta: { title: '登录', hidden: true }
	},
	// 兜底路由，最后匹配的路由
	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		component: () => import('@/views/other/404.vue'),
		meta: { title: '404', hidden: true }
	}
]

export default routes
