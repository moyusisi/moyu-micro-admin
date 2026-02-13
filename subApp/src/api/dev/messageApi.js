import service from '@/utils/request'

/**
 * 站内消息相关接口
 */
export default {
  // 查询站内消息列表
  messageList(data) {
    return service.postJson('/api/dev/message/list', data)
  },
  // 分页查询站内消息列表
  messagePage(data) {
    return service.postJson('/api/dev/message/page', data)
  },
  // 获取站内消息详情
  messageDetail(data) {
    return service.postJson('/api/dev/message/detail', data)
  },
  // 新增站内消息
  addMessage(data) {
    return service.postJson('/api/dev/message/add', data)
  },
  // 删除站内消息，通过ids删除
  deleteMessage(data) {
    return service.postJson('/api/dev/message/delete', data)
  },
  // 用户触达记录
  userMessagePage(data) {
    return service.postJson('/api/dev/message/userMessagePage', data)
  },

  // 阅读消息，并更新为已读(需登录)
  readMessage(data) {
    return service.postJson('/api/dev/message/read', data)
  },
  // 未读数量(需登录)
  unreadCount(data) {
    return service.postJson('/api/dev/message/unreadCount', data)
  },
  // 未读/已读列表(需登录)
  readPage(data) {
    return service.postJson('/api/dev/message/readPage', data)
  },
}
