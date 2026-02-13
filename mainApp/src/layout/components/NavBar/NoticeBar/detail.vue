<template>

  <a-modal
      v-model:open="visible"
      title="信息详情"
      :width="1000"
      :destroy-on-close="true"
      @cancel="onClose"
      @ok="onClose"
  >
    <!--  上方操作区  -->
    <template #closeIcon>
      <!-- Modal组件会 closeIcon 插槽默认关联到 cancel 事件，此处无需加@click="onClose" -->
      <a-button type="primary" size="small"><CloseOutlined /></a-button>
    </template>
    <!--  数据区  -->
    <a-spin :spinning="dataLoading">
      <div style="text-align: center;font-size: 30px">{{ formData.title }}</div>
      <br>
      <div style="text-align: right;font-size: 12px">
        <span>发布时间：{{ formData.sendTime }} </span>
      </div>
      <a-divider style="margin-top: 5px"/>
      <div style="min-height: 300px">
        <span>{{ formData.content }} </span>
      </div>
    </a-spin>
  </a-modal>
</template>
<script setup>
  import messageApi from '@/api/dev/messageApi.js'

  const emit = defineEmits({ successful: null })
  // 默认是关闭状态
  const visible = ref(false)

  // 表单数据
  const formData = ref({})
  const dataLoading = ref(false)

  // 打开
  const onOpen = (row) => {
    if (row) {
      // 表单数据赋值
      loadData(row)
    }
  }
  // 关闭
  const onClose = (e) => {
    visible.value = false
    emit('successful')
  }

  // 加载数据
  const loadData = (row) => {
    dataLoading.value = true
    // 组装请求参数
    let param = { code: row.fromId }
    messageApi.readMessage(param).then((res) => {
      formData.value = res.data
    }).finally(() => {
      dataLoading.value = false
      // 数据就绪之后显示
      visible.value = true
    })
  }

  // 调用这个函数将子组件的一些数据和方法暴露出去
  defineExpose({
    onOpen
  })
</script>

<style scoped>
</style>
