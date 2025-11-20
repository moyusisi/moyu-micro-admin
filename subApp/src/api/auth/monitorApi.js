import service from '@/utils/request'

export default {
  // 分页查询会话列表
  analyse(data) {
    return service.postJson('/api/auth/session/analyse', data)
  },
  // 分页查询会话列表
  sessionPage(data) {
    return service.postJson('/api/auth/session/page', data)
  },
  // 删除所有配置
  deleteSession(data) {
    return service.postJson('/api/auth/session/delete', data)
  },
  // 删除所有配置
  deleteToken(data) {
    return service.postJson('/api/auth/session/deleteToken', data)
  },
}