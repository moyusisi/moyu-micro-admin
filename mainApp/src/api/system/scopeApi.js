import service from '@/utils/request'

/**
 * 数据范围分组相关接口
 */
export default {
	// 查询scope列表
	scopeList(data) {
		return service.postJson('/api/sys/scope/list', data)
	},
	// 分页查询scope列表
	scopePage(data) {
		return service.postJson('/api/sys/scope/page', data)
	},
	// 获取scope详情
	scopeDetail(data) {
		return service.postJson('/api/sys/scope/detail', data)
	},
	// 新增岗位分组
	addScope(data) {
		return service.postJson('/api/sys/scope/add', data)
	},
	// 删除scope分组，通过ids删除
	deleteScope(data) {
		return service.postJson('/api/sys/scope/delete', data)
	},
	// 编辑scope分组
	editScope(data) {
		return service.postJson('/api/sys/scope/edit', data)
	},
	// 查询分组包含的用户列表
	scopeUserList(data) {
		return service.postJson('/api/sys/scope/userList', data)
	},
	// scope新增用户
	scopeAddUser(data) {
		return service.postJson('/api/sys/scope/addUser', data)
	},
	// scope移除用户
	scopeDeleteUser(data) {
		return service.postJson('/api/sys/scope/deleteUser', data)
	},
}
