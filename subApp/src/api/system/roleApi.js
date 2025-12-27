import service from '@/utils/request'

/**
 * 角色相关接口
 */
export default {
	// 查询角色列表
	roleList(data) {
		return service.postJson('/api/sys/role/list', data)
	},
	// 分页查询角色列表
	rolePage(data) {
		return service.postJson('/api/sys/role/page', data)
	},
	// 获取角色详情
	roleDetail(data) {
		return service.postJson('/api/sys/role/detail', data)
	},
	// 新增角色
	addRole(data) {
		return service.postJson('/api/sys/role/add', data)
	},
	// 删除角色，通过ids删除
	deleteRole(data) {
		return service.postJson('/api/sys/role/delete', data)
	},
	// 编辑角色
	editRole(data) {
		return service.postJson('/api/sys/role/edit', data)
	},
	// 获取角色菜单树，用于给角色授权时选择
	menuTreeForGrant(data) {
		return service.postJson('/api/sys/role/menuTreeForGrant', data)
	},
	// 获取角色授权的接口数据范围信息列表
	permScopeForGrant(data) {
		return service.postJson('/api/sys/role/permScopeForGrant', data)
	},
	// 给角色授权菜单
	roleGrantMenu(data) {
		return service.postJson('/api/sys/role/grantMenu', data)
	},
	// 给角色授权数据范围
	roleGrantScope(data) {
		return service.postJson('/api/sys/role/grantScope', data)
	},
	// 角色用户列表
	roleUserList(data) {
		return service.postJson('/api/sys/role/userList', data)
	},
	// 角色添加用户
	roleAddUser(data) {
		return service.postJson('/api/sys/role/roleAddUser', data)
	},
	// 角色删除用户
	roleDeleteUser(data) {
		return service.postJson('/api/sys/role/roleDeleteUser', data)
	},
}
