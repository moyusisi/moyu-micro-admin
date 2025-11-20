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
    <template #extra>
      <a-button type="primary" size="small" @click="onClose"><CloseOutlined /></a-button>
    </template>
    <a-form ref="formRef" :model="formData" :label-col="{span: 6}">
      <a-card title="基本信息">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="name" label="显示名称" tooltip="" required>
              <a-input v-model:value="formData.name" placeholder="请输入显示名称" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="code" label="唯一编码" tooltip="不填将自动生成，创建后不可更改">
              <a-input v-model:value="formData.code" placeholder="唯一编码，不填将自动生成，创建后不可更改" :disabled="edit" allowClear/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="parentCode" label="上级菜单" tooltip="" required>
              <MenuTreeSelect :moduleCode="formData.module" :defaultValue="formData.parentCode" @onChange="parentChange"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="resourceType" label="资源类型" tooltip="" required>
              <a-radio-group v-model:value="formData.resourceType" option-type="button" button-style="solid">
                <!-- 字典 1模块 2目录 3菜单 4内链 5外链 6按钮 -->
                <a-radio-button :value="2">目录</a-radio-button>
                <a-radio-button :value="3">菜单</a-radio-button>
                <a-radio-button :value="4">内链</a-radio-button>
                <a-radio-button :value="5">外链</a-radio-button>
                <a-radio-button :value="6">按钮</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="sortNum" label="排序顺序" tooltip="排序顺序" required>
              <a-input-number v-model:value="formData.sortNum" style="width: 100%"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-card>
      <a-card title="资源信息">
        <!-- 路由、组件、权限、图标、可见、排序 -->
        <a-row :gutter="24">
          <!-- 目录、菜单:路由地址 -->
          <a-col :span="12" v-if="formData.resourceType === 2 || formData.resourceType === 3">
            <a-form-item name="path" label="路由地址" tooltip="菜单路由必须以反斜杠'/'开头" required>
              <a-input v-model:value="formData.path" placeholder="请输入路由地址" allow-clear />
            </a-form-item>
          </a-col>
          <!-- 菜单:组件地址 -->
          <a-col :span="12" v-if="formData.resourceType === 3">
            <a-form-item name="component" label="组件地址" tooltip="前端组件(不带.vue)" required>
              <a-input v-model:value="formData.component" addon-before="src/views/" addon-after=".vue" placeholder="请输入组件地址" allow-clear/>
            </a-form-item>
          </a-col>
          <!-- 内链、外链:链接地址 -->
          <a-col :span="12" v-if="formData.resourceType === 4 || formData.resourceType === 5">
            <a-form-item name="path" label="链接地址" tooltip="链接必须以http(s)开头" required>
              <a-input v-model:value="formData.path" placeholder="请输入链接地址" allow-clear />
            </a-form-item>
          </a-col>
        </a-row>
        <!-- 按钮:接口地址、权限标识 -->
        <a-row :gutter="24">
          <!-- 按钮:接口地址 -->
          <a-col :span="12" v-if="formData.resourceType === 6">
            <a-form-item name="path" label="接口地址" tooltip="按钮绑定的接口地址，以反斜杠'/'开头" required>
              <a-input v-model:value="formData.path" placeholder="请输入接口地址" allow-clear />
            </a-form-item>
          </a-col>
          <!-- 按钮:权限标识 -->
          <a-col :span="12" v-if="formData.resourceType === 6">
            <a-form-item name="permission" label="权限标识" tooltip="对应接口的权限标识，如'sys:user:add'" required>
              <a-input v-model:value="formData.permission" placeholder="请输入权限标识" allow-clear/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <!-- 目录、菜单、内链、外链:是否可见 -->
          <a-col :span="12" v-if="formData.resourceType === 2 || formData.resourceType === 3 || formData.resourceType === 4 || formData.resourceType === 5">
            <a-form-item name="visible" label="是否可见" tooltip="仅目录菜单生效" required>
              <a-radio-group v-model:value="formData.visible" option-type="button" button-style="solid" :options="visibleOptions"/>
            </a-form-item>
          </a-col>
          <!-- 目录、菜单、内链、外链:图标 -->
          <a-col :span="12" v-if="formData.resourceType === 2 || formData.resourceType === 3 || formData.resourceType === 4 || formData.resourceType === 5">
            <a-form-item name="icon" label="图标">
              <a-space-compact style="width: 100%">
                <a-input v-model:value="formData.icon" placeholder="请选择前端根目录" disabled/>
                <a-button type="primary" @click="iconSelector.showIconModal(formData.icon)">选择</a-button>
              </a-space-compact>
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
    <Icon-selector ref="iconSelector" @iconCallBack="iconCallBack" />
  </a-drawer>
</template>

<script setup>
  import resourceApi from '@/api/system/resourceApi.js'

  import { required } from '@/utils/formRules'
  import { message } from "ant-design-vue"
  import { useSettingsStore } from "@/store"
  import IconSelector from '@/components/Selector/iconSelector.vue'
  import MenuTreeSelect from "@/views/system/components/menuTreeSelect.vue";

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
    resourceType: 3,
    sortNum: 99,
    visible: 1
  })
  const dataLoading = ref(false)
  const submitLoading = ref(false)
  const treeData = ref([])
  const iconSelector = ref()

  // 打开抽屉
  const onOpen = (node, module, resourceType, parentCode) => {
    if (node) {
      edit.value = true
      title.value = "编辑菜单"
      // 表单数据赋值
      loadData(node)
    } else {
      edit.value = false
      title.value = "新增菜单"
      // 模块赋值
      formData.value.module = module.code
      // parentCode赋值
      formData.value.parentCode = parentCode
      // 若指定了resourceType则赋值  1模块 2目录 3菜单 4内链 5外链 6按钮
      if (resourceType) {
        formData.value.resourceType = resourceType
      }
      // 数据就绪之后显示
      visible.value = true
    }
    // 获取菜单树并加入顶级节点
    const moduleRes = resourceApi.menuTreeSelector({ module: module.code })
    treeData.value = [{
      code: module.code,
      name: module.name,
      children: moduleRes.data
    }]
  }
  // 关闭抽屉
  const onClose = () => {
    formRef.value.resetFields()
    visible.value = false
  }
  // 加载数据
  const loadData = (node) => {
    dataLoading.value = true
    // 组装请求参数
    let param = { code: node.code }
    // 获取模块信息
    resourceApi.resourceDetail(param).then((res) => {
      formData.value = res.data
    }).finally(() => {
      dataLoading.value = false
      // 数据就绪之后显示
      visible.value = true
    })
  }
  // 选择上级加载模块的选择框
  const parentChange = (value, label) => {
    formData.value.parentCode = value
  }
  // 图标选择器回调
  const iconCallBack = (value) => {
    if (value) {
      formRef.value.clearValidate('icon')
    }
    formData.value.icon = value
  }
  // 是否可见options
  const visibleOptions = [
    { label: "可见", value: 1 },
    { label: "不可见", value: 0 }
  ]
  // 验证并提交数据
  const onSubmit = () => {
    formRef.value.validate().then(() => {
      const param = buildParam(formData.value)
      submitLoading.value = true
      // formData.value 加工处理 add/edit
      let fun = resourceApi.addResource
      if (edit.value) {
        fun = resourceApi.editResource
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
  const buildParam = (data) => {
    // 如果用户输入的组件带反斜线，则去掉
    if (data.component && data.component.slice(0, 1) === '/') {
      data.component = data.component.slice(1)
    }
    return data
  }
  // 调用这个函数将子组件的一些数据和方法暴露出去
  defineExpose({
    onOpen
  })
</script>
