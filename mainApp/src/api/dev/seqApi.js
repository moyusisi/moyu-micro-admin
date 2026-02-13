import service from '@/utils/request'

/**
 * 站内消息相关接口
 */
export default {
  // 查询站内消息列表
  seqList(data) {
    return service.postForm('/api/seq/day/list', data)
  },
}
