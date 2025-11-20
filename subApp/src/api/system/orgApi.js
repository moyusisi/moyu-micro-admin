import service from '@/utils/request'

/**
 * 组织机构接口
 */
export default {
	// 查询组织机构列表
	orgList(data) {
		return service.postJson('/api/sys/org/list', data)
	},
	// 分页查询组织机构列表
	orgPage(data) {
		return service.postJson('/api/sys/org/page', data)
	},
	// 获取组织机构树
	orgTree(data) {
		return service.postJson('/api/sys/org/tree', data)
	},
	// 获取组织机构详情
	orgDetail(data) {
		return service.postJson('/api/sys/org/detail', data)
	},
	// 新增组织机构
	addOrg(data) {
		return service.postJson('/api/sys/org/add', data)
	},
	// 删除组织机构，通过codes删除，会集联删除整个树
	deleteOrgTree(data) {
		return service.postJson('/api/sys/org/deleteTree', data)
	},
	// 编辑组织机构
	editOrg(data) {
		return service.postJson('/api/sys/org/edit', data)
	},

}
