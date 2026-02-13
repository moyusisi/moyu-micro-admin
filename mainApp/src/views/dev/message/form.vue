<template>
  <a-drawer
      :open="visible"
      :title="title"
      :width="drawerWidth"
      :closable="false"
      :maskClosable="false"
      :destroy-on-close="true"
      @close="onClose"
  >
    <!--  上方操作区  -->
    <template #extra>
        <a-button type="primary" size="small" @click="onClose"><CloseOutlined /></a-button>
    </template>
    <!--  数据区  -->
    <a-spin :spinning="dataLoading">
      <a-form ref="formRef" :model="formData" :label-col="{span: 6}">
        <a-card title="">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item name="title" label="标题" tooltip="" required>
                <a-input v-model:value="formData.title" placeholder="标题" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="messageType" label="消息类型" tooltip="" >
                <a-select v-model:value="formData.messageType" placeholder="消息类型" :options="messageTypeOptions" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="content" label="内容" tooltip="" required>
                <a-textarea v-model:value="formData.content" placeholder="内容" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="expireTime" label="过期时间" tooltip="一般无需填写" >
                <a-date-picker v-model:value="formData.expireTime" valueFormat="YYYY-MM-DD HH:mm:ss" show-time/>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item name="userList" label="接收人" required>
                <UserSelector v-model:userList="formData.userList" @selectChanged="onSelectChanged" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
      </a-form>
    </a-spin>
    <!--  底部操作区  -->
    <template #footer>
      <a-flex gap="small" justify="flex-end">
        <a-button type="primary" danger @click="onClose"> 关闭</a-button>
        <a-button type="primary" :loading="submitLoading" @click="onSubmit">保存</a-button>
      </a-flex>
    </template>
  </a-drawer>
</template>
<script setup>
  import messageApi from '@/api/dev/messageApi.js'

  import { message } from "ant-design-vue"
  import { useSettingsStore } from "@/store"
  import UserSelector from "@/views/system/components/UserSelector/index.vue"

  // store
  const settingsStore = useSettingsStore()

  const emit = defineEmits({ successful: null })
  // 默认是关闭状态
  const visible = ref(false)
  const title = ref()
  // 计算属性 抽屉宽度
  const drawerWidth = computed(() => {
    return settingsStore.menuCollapsed ? `calc(100% - 80px)` : `calc(100% - 210px)`
  })

  // 是否为编辑
  const edit = ref(false)
  // 表单数据
  const formRef = ref()
  const formData = ref({
    userList:[]
  })
  const dataLoading = ref(false)
  const submitLoading = ref(false)
  // 下拉框选项
  const messageTypeOptions = [
    { label: "系统", value: 1 },
    { label: "业务", value: 2 }
  ]

  // 打开抽屉
  const onOpen = (row) => {
    if (row) {
      edit.value = true
      title.value = "编辑站内信"
      // 表单数据赋值
      loadData(row)
    } else {
      edit.value = false
      title.value = "发送站内信"
      // 数据就绪之后显示
      visible.value = true
    }
  }
  // 关闭抽屉
  const onClose = () => {
    formRef.value.resetFields()
    visible.value = false
  }
  // 加载数据
  const loadData = (row) => {
    dataLoading.value = true
    // 组装请求参数
    let param = { id: row.id }
    messageApi.messageDetail(param).then((res) => {
      formData.value = res.data
    }).finally(() => {
      dataLoading.value = false
      // 数据就绪之后显示
      visible.value = true
    })
  }

  // 用户选择器点击确定返回。如果用 v-model:value 来关联，则不需要再赋值
  const onSelectChanged= (selectedList) => {
    // formData.value.userList = selectedList
    // console.log(formData.value.userList)
  }

  // 验证并提交数据
  const onSubmit = () => {
    formRef.value.validate().then(() => {
      submitLoading.value = true
      const userIdList = [];
      formData.value.userList.forEach((item) => {
        userIdList.push(item.account)
      })
      formData.value.receiveUserList = userIdList

      // formData.value 加工处理 add/edit
      let fun = messageApi.addMessage
      if (edit.value) {
        fun = messageApi.editMessage
      }
      // add/edit 发送不同请求
      fun(formData.value).then((res) => {
        message.success(res.message)
        emit('successful')
        onClose()
      }).finally(() => {
        submitLoading.value = false
      })
    }).catch(() => {
    })
  }
  // 调用这个函数将子组件的一些数据和方法暴露出去
  defineExpose({
    onOpen
  })
</script>
<style scoped>
  .ant-form-item {
  }
</style>
