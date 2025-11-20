import service from '@/utils/request'

/**
 * 系统日志相关接口
 */
export default {
  // 查询系统日志列表
  logList(data) {
    return service.postJson('/api/sys/log/list', data)
  },
  // 分页查询系统日志列表
  logPage(data) {
    return service.postJson('/api/sys/log/page', data)
  },
  // 获取系统日志详情
  logDetail(data) {
    return service.postJson('/api/sys/log/detail', data)
  },
  // 新增系统日志
  addLog(data) {
    return service.postJson('/api/sys/log/add', data)
  },
  // 编辑系统日志
  editLog(data) {
    return service.postJson('/api/sys/log/edit', data)
  },
  // 删除系统日志，通过ids删除
  deleteLog(data) {
    return service.postJson('/api/sys/log/delete', data)
  }

}
