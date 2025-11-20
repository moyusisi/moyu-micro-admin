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
              <a-form-item name="name" label="岗位名称" required>
                <a-input v-model:value="formData.name" placeholder="请输入显示名称" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="code" label="唯一编码" tooltip="不填将自动生成，创建后不可更改">
                <a-input v-model:value="formData.code" placeholder="唯一编码，不填将自动生成，创建后不可更改" :disabled="edit" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="orgCode" label="直属组织" tooltip="" required>
                <OrgTreeSelect :tree-data="treeData" :defaultValue="formData.orgCode" @onChange="parentChange"/>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="dataScope" label="数据范围" tooltip="用于控制本岗位人员的数据权限" required>
                <a-radio-group v-model:value="formData.dataScope" option-type="button" button-style="solid">
                  <!-- 数据范围(字典 1本人 2本机构 3本机构及以下 4自定义) -->
                  <a-radio-button :value="1">仅本人</a-radio-button>
                  <a-radio-button :value="2">仅本机构</a-radio-button>
                  <a-radio-button :value="3">本机构及以下</a-radio-button>
                  <a-radio-button :value="4">自定义</a-radio-button>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <!-- 使用状态 -->
            <a-col :span="12">
              <a-form-item name="status" label="使用状态" tooltip="" required>
                <a-radio-group v-model:value="formData.status" option-type="button" button-style="solid" :options="statusOptions" />
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="formData.dataScope === 4">
              <a-form-item name="scopeList" label="自定义范围" tooltip="自定义数据范围时必填">
                <OrgTreeSelect :tree-data="treeData" :defaultValue="scopeList" multiSelect @onChange="scopeChange"/>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="sortNum" label="排序顺序" tooltip="排序顺序" required>
                <a-input-number v-model:value="formData.sortNum" style="width: 100%"/>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
      </a-form>
    </a-spin>
    <template #footer>
      <a-flex gap="small" justify="flex-end">
        <a-button type="primary" danger @click="onClose"> 关闭</a-button>
        <a-button type="primary" :loading="submitLoading" @click="onSubmit">保存</a-button>
      </a-flex>
    </template>
  </a-drawer>
</template>

<script setup>
  import groupApi from '@/api/system/groupApi'

  import { required } from '@/utils/formRules'
  import { message } from "ant-design-vue"
  import { useSettingsStore } from "@/store"
  import OrgTreeSelect from "@/views/system/components/orgTreeSelect.vue"

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

  // 组织树
  const treeData = ref([])
  // 自定义数据范围列表
  const scopeList = ref([])

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
  const onOpen = (row, tree, orgCode) => {
    // 组织树赋值并展开顶级节点
    treeData.value = tree
    if (row) {
      edit.value = true
      title.value = "编辑岗位(Group)信息"
      // 加载数据,成功后显示
      loadData(row)
    } else {
      edit.value = false
      title.value = "新增岗位(Group)信息"
      // 表单数据赋值
      formData.value.orgCode = orgCode
      // 无异步加载数据，可以直接显示
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
    groupApi.groupDetail(param).then((res) => {
      formData.value = res.data
      if(res.data.scopeSet) {
        scopeList.value = res.data.scopeSet.split(',')
      }
    }).finally(() => {
      dataLoading.value = false
      // 数据就绪之后显示
      visible.value = true
    })
  }
  // 选择上级加载模块的选择框
  const parentChange = (value) => {
    formData.value.orgCode = value
  }
  // 自定义数据范围变更
  const scopeChange = (value) => {
    scopeList.value = value
  }

  // 验证并提交数据
  const onSubmit = () => {
    formRef.value.validate().then(() => {
      submitLoading.value = true
      // formData.value 加工处理 add/edit
      const param = formData.value
      if (scopeList.value) {
        param.scopeSet = scopeList.value.join(',');
      }
      let fun = groupApi.addGroup
      if (edit.value) {
        fun = groupApi.editGroup
      }
      // add/edit 发送不同请求
      fun(param).then((res) => {
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
