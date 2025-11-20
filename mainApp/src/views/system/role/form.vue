<template>
  <a-drawer
      :open="visible"
      :title="title"
      :width="drawerWidth"
      :closable="false"
      :maskClosable="false"
      :footerStyle="{'display': 'flex', 'justify-content': 'flex-end' }"
      :destroy-on-close="true"
      @close="onClose"
  >
    <!--  上方操作区  -->
    <template #extra>
      <a-button type="primary" size="small" @click="onClose"><CloseOutlined /></a-button>
    </template>
    <!--  数据区  -->
    <a-spin :spinning="dataLoading">
      <a-form ref="formRef" :model="formData" layout="vertical">
        <a-form-item name="name" label="角色名称" tooltip="角色名称" required>
          <a-input v-model:value="formData.name" placeholder="角色名称" allowClear showCount :maxlength="20" />
        </a-form-item>
        <a-form-item name="code" label="角色编码" tooltip="不填将自动生成，创建后不可更改" >
          <a-input v-model:value="formData.code" placeholder="唯一编码，不填将自动生成，创建后不可更改" :disabled="edit" allowClear />
        </a-form-item>
        <!-- 使用状态 -->
        <a-form-item name="status" label="使用状态" tooltip="使用状态（0正常 1停用）" >
          <a-radio-group v-model:value="formData.status" option-type="button" button-style="solid" :options="statusOptions"/>
        </a-form-item>
        <a-form-item name="sortNum" label="排序顺序" tooltip="排序顺序" >
          <a-input-number v-model:value="formData.sortNum" placeholder="排序顺序" />
        </a-form-item>
        <a-form-item name="extJson" label="扩展信息" tooltip="扩展信息,json格式" >
          <a-textarea v-model:value="formData.extJson" placeholder="扩展信息" allowClear />
        </a-form-item>
        <a-form-item name="remark" label="备注" tooltip="备注" >
          <a-textarea v-model:value="formData.remark" placeholder="备注" allowClear showCount :maxlength="100" />
        </a-form-item>
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
  import roleApi from '@/api/system/roleApi'

  import { required } from '@/utils/formRules'
  import { message } from "ant-design-vue"
  import { useSettingsStore } from "@/store"

  // store
  const settingsStore = useSettingsStore()

  // 定义emit事件
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
  const formData = ref({})
  const dataLoading = ref(false)
  const submitLoading = ref(false)
  // 使用状态options（0正常 1停用）
  const statusOptions = [
    { label: "正常", value: 0 },
    { label: "已停用", value: 1 }
  ]

  // 打开抽屉
  const onOpen = (row) => {
    if (row) {
      edit.value = true
      title.value = "编辑角色"
      // 表单数据赋值
      loadData(row)
    } else {
      edit.value = false
      title.value = "新增角色"
      // 数据就绪之后显示
      visible.value = true
    }
  }
  // 关闭抽屉
  const onClose = () => {
    formData.value = {}
    visible.value = false
  }
  // 加载数据
  const loadData = (row) => {
    dataLoading.value = true
    // 组装请求参数
    let param = { id: row.id }
    roleApi.roleDetail(param).then((res) => {
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
      // formData.value 加工处理  add/edit
      let fun = roleApi.addRole
      if (edit.value) {
        fun = roleApi.editRole
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
