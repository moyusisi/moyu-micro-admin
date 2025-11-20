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
    <a-form ref="formRef" :model="formData" :label-col="{span: 6}">
      <a-card title="基本信息">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="name" label="组织名称" tooltip="" required>
              <a-input v-model:value="formData.name" placeholder="请输入显示名称" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="code" label="组织编码" tooltip="不填将自动生成，创建后不可更改">
              <a-input v-model:value="formData.code" :disabled="edit" allowClear/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="parentCode" label="上级组织" tooltip="" required>
              <OrgTreeSelect :tree-data="treeData" :defaultValue="formData.parentCode" @onChange="parentChange"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="orgType" label="组织类型" tooltip="" required>
              <a-radio-group v-model:value="formData.orgType" option-type="button" button-style="solid">
                <!-- 组织机构类型(字典 1公司组织 2部门机构 3虚拟节点) -->
                <a-radio-button :value="1">公司组织</a-radio-button>
                <a-radio-button :value="2">部门机构</a-radio-button>
                <a-radio-button :value="3">虚拟节点</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="sortNum" label="排序顺序" tooltip="排序顺序" required>
              <a-input-number v-model:value="formData.sortNum" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <!-- 使用状态 -->
          <a-col :span="12">
            <a-form-item name="status" label="使用状态" tooltip="" required>
              <a-radio-group v-model:value="formData.status" option-type="button" button-style="solid" :options="statusOptions" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-card>
      <a-card title="资源信息">
        <a-row :gutter="24">
          <!-- 公司层级 -->
          <a-col :span="12" v-if="formData.orgType === 1">
            <a-form-item name="orgLevel" label="公司层级" tooltip="仅组织机构类型为公司时可选" required>
              <a-radio-group v-model:value="formData.orgLevel" button-style="solid">
                <a-radio-button :value="1">总部</a-radio-button>
                <a-radio-button :value="2">二级公司</a-radio-button>
                <a-radio-button :value="3">三级公司</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-card>
    </a-form>
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
  import orgApi from '@/api/system/orgApi'

  import { required } from '@/utils/formRules'
  import { message } from "ant-design-vue"
  import { useSettingsStore } from "@/store"
  import OrgTreeSelect from "@/views/system/components/orgTreeSelect.vue";
  import userApi from "@/api/system/userApi.js";

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

  // 表单数据
  const formRef = ref()
  // 有默认值
  const formData = ref({
    status: 0
  })
  const edit = ref(false)
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
      title.value = "编辑组织机构"
      // 表单数据赋值
      loadData(row)
    } else {
      edit.value = false
      title.value = "新增组织机构"
      // 表单数据赋值
      formData.value.parentCode = orgCode
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
    orgApi.orgDetail(param).then((res) => {
      formData.value = res.data
    }).finally(() => {
      dataLoading.value = false
      // 数据就绪之后显示
      visible.value = true
    })
  }
  // 选择上级加载模块的选择框
  const parentChange = (value) => {
    formData.value.parentCode = value
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
      let fun = orgApi.addOrg
      if (edit.value) {
        fun = orgApi.editOrg
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
