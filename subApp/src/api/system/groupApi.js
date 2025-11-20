import service from '@/utils/request'

/**
 * 分组(角色组、岗位)相关接口
 */
export default {
	// 查询岗位分组列表
	groupList(data) {
		return service.postJson('/api/sys/group/list', data)
	},
	// 分页查询岗位分组列表
	groupPage(data) {
		return service.postJson('/api/sys/group/page', data)
	},
	// 获取岗位分组详情
	groupDetail(data) {
		return service.postJson('/api/sys/group/detail', data)
	},
	// 新增岗位分组
	addGroup(data) {
		return service.postJson('/api/sys/group/add', data)
	},
	// 删除岗位分组，通过ids删除
	deleteGroup(data) {
		return service.postJson('/api/sys/group/delete', data)
	},
	// 编辑岗位分组
	editGroup(data) {
		return service.postJson('/api/sys/group/edit', data)
	},
	// 查询岗位包含的角色列表
	groupRoleList(data) {
		return service.postJson('/api/sys/group/roleList', data)
	},
	// 岗位新增角色
	groupAddRole(data) {
		return service.postJson('/api/sys/group/addRole', data)
	},
	// 岗位移除角色
	groupDeleteRole(data) {
		return service.postJson('/api/sys/group/deleteRole', data)
	},
	// 查询岗位包含的用户列表
	groupUserList(data) {
		return service.postJson('/api/sys/group/userList', data)
	},
	// 岗位新增用户
	groupAddUser(data) {
		return service.postJson('/api/sys/group/addUser', data)
	},
	// 岗位移除用户
	groupDeleteUser(data) {
		return service.postJson('/api/sys/group/deleteUser', data)
	},
}
