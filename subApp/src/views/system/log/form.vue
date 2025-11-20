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
        <a-card title="基本信息">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item name="requestUrl" label="请求路径地址" tooltip="请求路径地址" >
                <a-input v-model:value="formData.requestUrl" placeholder="请求路径地址" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="module" label="系统/模块" tooltip="系统/模块" >
                <a-input v-model:value="formData.module" placeholder="系统/模块" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="business" label="业务" tooltip="业务" >
                <a-input v-model:value="formData.business" placeholder="业务" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="operate" label="操作" tooltip="操作" >
                <a-input v-model:value="formData.operate" placeholder="操作" allowClear />
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item name="content" label="内容说明" tooltip="内容说明" >
                <a-textarea v-model:value="formData.content" placeholder="内容说明" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="requestContent" label="请求参数" tooltip="请求参数" >
                <a-textarea v-model:value="formData.requestContent" placeholder="请求参数" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="responseContent" label="返回结果" tooltip="返回结果" >
                <a-textarea v-model:value="formData.responseContent" placeholder="返回结果" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="startTime" label="开始时间" tooltip="开始时间" >
                <a-date-picker v-model:value="formData.startTime" valueFormat="YYYY-MM-DD HH:mm:ss" show-time/>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="endTime" label="结束时间" tooltip="结束时间" >
                <a-date-picker v-model:value="formData.endTime" valueFormat="YYYY-MM-DD HH:mm:ss" show-time/>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="executionTime" label="执行耗时(m" tooltip="执行耗时(ms)" >
                <a-input v-model:value="formData.executionTime" placeholder="执行耗时(ms)" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="createBy" label="操作人ID" tooltip="操作人ID" >
                <a-input v-model:value="formData.createBy" placeholder="操作人ID" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="createTime" label="记录时间" tooltip="记录时间" >
                <a-date-picker v-model:value="formData.createTime" valueFormat="YYYY-MM-DD"/>
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
  import logApi from '@/api/system/logApi.js'

  import { required } from '@/utils/formRules'
  import { message } from "ant-design-vue"
  import { useSettingsStore } from "@/store"

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
  const formData = ref({})
  const dataLoading = ref(false)
  const submitLoading = ref(false)

  // 打开抽屉
  const onOpen = (row) => {
    if (row) {
      edit.value = true
      title.value = "编辑系统日志"
      // 表单数据赋值
      loadData(row)
    } else {
      edit.value = false
      title.value = "新增系统日志"
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
    logApi.logDetail(param).then((res) => {
      formData.value = res.data
    }).finally(() => {
      dataLoading.value = false
      // 数据就绪之后显示
      visible.value = true
    })
  }

  // 验证并提交数据
  const onSubmit = () => {
    formRef.value.validate().then(() => {
      submitLoading.value = true
      // formData.value 加工处理 add/edit
      let fun = logApi.addLog
      if (edit.value) {
        fun = logApi.editLog
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
