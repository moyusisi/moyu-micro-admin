import service from '@/utils/request'

/**
 * 用户接口api
 */
export default {
	// 分页查询用户列表
	userPage(data) {
		return service.postJson('/api/sys/user/page', data)
	},
	// 获取用户详情
	userDetail(data) {
		return service.postJson('/api/sys/user/detail', data)
	},
	// 新增用户
	addUser(data) {
		return service.postJson('/api/sys/user/add', data)
	},
	// 删除用户，通过ids删除
	deleteUser(data) {
		return service.postJson('/api/sys/user/delete', data)
	},
	// 编辑用户
	editUser(data) {
		return service.postJson('/api/sys/user/edit', data)
	},
	// 修改密码
	updatePassword(data) {
		return service.postJson('/api/sys/user/updatePwd', data)
	},
	// 重置密码
	resetPassword(data) {
		return service.postJson('/api/sys/user/resetPwd', data)
	},

}
