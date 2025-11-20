import service from '@/utils/request'

/**
 * 用户中心API，当前登陆用户相关的API
 */
export default {
	// 获取登陆用户的信息
	loginUserInfo(data) {
		return service.postJson('/api/sys/userCenter/userInfo', data)
	},
	// 获取登陆用户的菜单树
	loginUserMenu(data) {
		return service.postJson('/api/sys/userCenter/userMenu', data)
	},
	// 获取登陆用户的组织机构树
	loginUserOrgTree(data) {
		return service.postJson('/api/sys/userCenter/userOrgTree', data)
	},
	// 当前用户拥有的角色列表
	userRoleList(data) {
		return service.postJson('/api/sys/userCenter/userRoleList', data)
	},
	// 获取登陆用户的信息
	switchUserGroup(data) {
		return service.postJson('/api/sys/userCenter/switchUserGroup', data)
	},
}
