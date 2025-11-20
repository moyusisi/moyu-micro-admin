import service from '@/utils/request'

/**
 * 菜单相关接口(菜单树中的id均使用的code)
 */
export default {
	// 查询菜单列表,暂未使用
	resourceList(data) {
		return service.postJson('/api/sys/resource/list', data)
	},
	// 查询模块列表(resourceType=1)
	moduleList(data) {
		return service.postJson('/api/sys/resource/list', { "resourceType": 1 })
	},
	// 分页查询资源列表(模块、按钮列表)
	resourcePage(data) {
		return service.postJson('/api/sys/resource/page', data)
	},
	// 获取菜单树(包括按钮)
	menuTree(data) {
		return service.postJson('/api/sys/resource/tree', data)
	},
	// 获取菜单详情
	resourceDetail(data) {
		return service.postJson('/api/sys/resource/detail', data)
	},
	// 新增菜单
	addResource(data) {
		return service.postJson('/api/sys/resource/add', data)
	},
	// 删除菜单，通过ids删除，不会集联删除
	deleteResource(data) {
		return service.postJson('/api/sys/resource/delete', data)
	},
	// 删除菜单，通过codes删除，会集联删除整个树
	deleteMenuTree(data) {
		return service.postJson('/api/sys/resource/deleteTree', data)
	},
	// 编辑菜单
	editResource(data) {
		return service.postJson('/api/sys/resource/edit', data)
	},
	// 获取菜单树选择器(不包括按钮)
	menuTreeSelector(data) {
		return service.postJson('/api/sys/resource/menuTreeSelector', data)
	},
}
