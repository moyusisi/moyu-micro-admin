<template>
  <a-drawer
      :open="visible"
      title="系统日志详情"
      :width="drawerWidth"
      :closable="false"
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
            <a-col :span="8">
              <a-form-item name="module" label="系统/模块" tooltip="系统/模块" >
                {{ formData.module }}
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="business" label="业务" tooltip="" >
                {{ formData.business }}
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="operate" label="操作" tooltip="操作" >
                {{ formData.operate }}
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="requestUrl" label="请求路径地址" tooltip="" >
                <a-tag :bordered="false">{{ formData.requestUrl }}</a-tag>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="executionTime" label="执行耗时" tooltip="" >
                {{ formData.executionTime }}ms
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="createBy" label="操作人ID" tooltip="" >
                {{ formData.createBy }}
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="content" label="内容说明" tooltip="" >
                {{ formData.content }}
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="createBy" label="用户IP" tooltip="" >
                {{ formData.opIp }}
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="opBrowser" label="浏览器" tooltip="" >
                {{ formData.opBrowser }}
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="opPlatform" label="平台" tooltip="" >
                {{ formData.opPlatform }}
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="opOs" label="操作系统" tooltip="" >
                {{ formData.opOs }}
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="startTime" label="开始时间" tooltip="" >
                {{ formData.startTime }}
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="endTime" label="结束时间" tooltip="" >
                {{ formData.endTime }}
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="createTime" label="记录时间" tooltip="" >
                {{ formData.createTime }}
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
        <a-card title="请求信息">
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item name="requestUrl" label="请求地址" tooltip="" :label-col="{span: 2}" >
                <a-tag :bordered="false">{{ formData.requestUrl }}</a-tag>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item name="requestContent" label="请求参数" tooltip="" :label-col="{span: 2}" >
                <highlightjs v-if="formData.requestContent" autodetect :code="formData.requestContent" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item name="responseContent" label="返回结果" tooltip="" :label-col="{span: 2}" >
                <highlightjs v-if="formData.responseContent" autodetect :code="formData.requestContent" />
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
      </a-flex>
    </template>
  </a-drawer>
</template>
<script setup>
  import logApi from '@/api/system/logApi.js'

  import { useSettingsStore } from "@/store"

  // store
  const settingsStore = useSettingsStore()

  const emit = defineEmits({ successful: null })
  // 默认是关闭状态
  const visible = ref(false)
  // 计算属性 抽屉宽度
  const drawerWidth = computed(() => {
    return settingsStore.menuCollapsed ? `calc(100% - 80px)` : `calc(100% - 210px)`
  })

  // 表单数据
  const formRef = ref()
  const formData = ref({})
  const dataLoading = ref(false)
  const submitLoading = ref(false)

  // 打开抽屉
  const onOpen = (row) => {
    if (row) {
      // 表单数据赋值
      loadData(row)
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

  // 调用这个函数将子组件的一些数据和方法暴露出去
  defineExpose({
    onOpen
  })
</script>

<style scoped>
/** 后代选择器 **/
.ant-card .ant-form-item {
  margin-bottom: 12px !important;
}

</style>
