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
    <a-form ref="formRef" :model="formData" layout="vertical">
      <a-form-item name="name" label="模块名称" tooltip="模块或应用名称" required>
        <a-input v-model:value="formData.name" placeholder="请输入显示名称" allow-clear/>
      </a-form-item>
      <a-form-item name="code" label="唯一编码" tooltip="不填将自动生成，创建后不可更改">
        <a-input v-model:value="formData.code" placeholder="唯一编码，不填将自动生成，创建后不可更改" :disabled="edit" allowClear/>
      </a-form-item>
      <a-form-item name="path" label="路径地址" tooltip="以反斜杠'/'开头">
        <a-input v-model:value="formData.path" placeholder="请输入模块路径地址" allow-clear />
      </a-form-item>
      <a-form-item name="component" label="组件地址" tooltip="">
        <a-input v-model:value="formData.component" placeholder="请输入组件:Layout" allow-clear/>
      </a-form-item>
      <a-form-item name="link" label="模块主页" tooltip="内部链接以反斜杠'/'开头，外部链接以反斜杠'http(s)'开头">
        <a-input v-model:value="formData.link" placeholder="请输入模块主页地址" allow-clear />
      </a-form-item>
      <a-form-item name="icon" label="图标">
        <a-input v-model:value="formData.icon" placeholder="请选择图标" style="width: calc(100% - 70px)" allow-clear disabled />
        <a-button type="primary" @click="iconSelectorRef.showIconModal(formData.icon)">选择</a-button>
      </a-form-item>
      <a-form-item label="排序顺序" name="sortNum" tooltip="排序顺序" required>
        <a-input-number v-model:value="formData.sortNum" style="width: 100%"/>
      </a-form-item>
      <a-form-item name="remark" label="备注" tooltip="备注" >
        <a-textarea v-model:value="formData.remark" placeholder="备注" allowClear showCount :maxlength="100" />
      </a-form-item>
    </a-form>
    <!--  底部操作区  -->
    <template #footer>
      <a-flex gap="small" justify="flex-end">
        <a-button type="primary" danger @click="onClose"> 关闭</a-button>
        <a-button type="primary" :loading="submitLoading" @click="onSubmit">保存</a-button>
      </a-flex>
    </template>
    <Icon-selector ref="iconSelectorRef" @iconCallBack="iconCallBack" />
  </a-drawer>
</template>

<script setup>
  import resourceApi from '@/api/system/resourceApi.js'

  import { required } from '@/utils/formRules'
  import { message } from "ant-design-vue"
  import { useSettingsStore } from "@/store"
  import IconSelector from '@/components/Selector/iconSelector.vue'

  // store
  const settingsStore = useSettingsStore()

  const emit = defineEmits({ successful: null })
  // 默认是关闭状态
  const visible = ref(false)
  const title = ref()
  // 计算属性 抽屉宽度
  const drawerWidth = computed(() => {
    return 550
    // return settingsStore.menuCollapsed ? `calc(100% - 80px)` : `calc(100% - 210px)`
  })

  // 是否为编辑
  const edit = ref(false)
  // 表单数据
  const formRef = ref()
  const formData = ref({
    resourceType: 1,
    visible: 1,
    sortNum: 99,
  })
  const dataLoading = ref(false)
  const submitLoading = ref(false)
  const iconSelectorRef = ref()

  // 打开抽屉
  const onOpen = (row) => {
    if (row) {
      edit.value = true
      title.value = "编辑模块"
      // 表单数据赋值
      loadData(row)
    } else {
      edit.value = false
      title.value = "新增模块"
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
    // 获取模块信息
    resourceApi.resourceDetail(param).then((res) => {
      formData.value = res.data
    }).finally(() => {
      dataLoading.value = false
      // 数据就绪之后显示
      visible.value = true
    })
  }
  // 图标选择器回调
  const iconCallBack = (value) => {
    if (value) {
      formRef.value.clearValidate('icon')
    }
    formData.value.icon = value
  }

  // 验证并提交数据
  const onSubmit = () => {
    formRef.value.validate().then(() => {
      submitLoading.value = true
      // formData.value 加工处理 add/edit
      let fun = resourceApi.addResource
      if (edit.value) {
        fun = resourceApi.editResource
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
