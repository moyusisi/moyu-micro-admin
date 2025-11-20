<template>
  <a-drawer
      :open="visible"
      title="资源详情"
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
              <a-form-item name="resourceType" label="资源类型" tooltip="">
                <a-tag v-if="formData.resourceType === 1" color="orange">模块/应用</a-tag>
                <a-tag v-if="formData.resourceType === 2" color="cyan">目录</a-tag>
                <a-tag v-if="formData.resourceType === 3" color="blue">菜单</a-tag>
                <a-tag v-if="formData.resourceType === 4" color="gold">内链</a-tag>
                <a-tag v-if="formData.resourceType === 5" color="green">链接</a-tag>
                <a-tag v-if="formData.resourceType === 6" color="purple">按钮/接口</a-tag>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="name" label="名称" tooltip="" >
                <span>{{ formData.name }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="code" label="唯一编码" tooltip="" >
                <span><a>{{ formData.code }}</a></span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="parentCode" label="上级菜单" tooltip="">
                <MenuTreeSelect :moduleCode="formData.module" :defaultValue="formData.parentCode" disabled/>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="path" label="路由地址" tooltip="" >
                <span>{{ formData.path }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8" v-if="formData.resourceType !== 6">
              <a-form-item name="component" label="组件" tooltip="前端src/view/目录下的页面文件" >
                <span><a-tag>{{ formData.component }}</a-tag></span>
              </a-form-item>
            </a-col>
            <a-col :span="8" v-if="formData.resourceType === 6">
              <a-form-item name="permission" label="权限标识" tooltip="访问后端接口所必需的权限标识" >
                <span><a-tag>{{ formData.permission }}</a-tag></span>
              </a-form-item>
            </a-col>
            <a-col :span="8" v-if="formData.resourceType !== 6">
              <a-form-item name="visible" label="是否可见" tooltip="不可见会在菜单中隐藏" >
                <span>
                  <a-tag v-if="formData.visible === 1" color="green">可见</a-tag>
                  <a-tag v-else>不可见</a-tag>
                </span>
              </a-form-item>
            </a-col>
            <a-col :span="8" v-if="formData.resourceType !== 6">
              <a-form-item name="icon" label="图标" tooltip="">
                <span><a-tag>{{ formData.icon }}</a-tag></span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="remark" label="备注" tooltip="" >
                <span style="white-space: pre-wrap;">{{ formData.remark }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="extJson" label="扩展信息" tooltip="" >
                <span>{{ formData.extJson }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="createTime" label="创建时间" tooltip="" >
                <span>{{ formData.createTime }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="createBy" label="创建者" tooltip="" >
                <span>{{ formData.createBy }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="updateTime" label="更新时间" tooltip="" >
                <span>{{ formData.updateTime }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="updateBy" label="更新者" tooltip="" >
                <span>{{ formData.updateBy }}</span>
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
  import resourceApi from '@/api/system/resourceApi.js'

  import { useSettingsStore } from "@/store"
  import MenuTreeSelect from "@/views/system/components/menuTreeSelect.vue";

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
  // 下拉框选项
  const exampleOptions = [
    { label: "选项一", value: 1 },
    { label: "选项二", value: 2 }
  ]

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
    let param = { id: row.id, code: row.code }
    resourceApi.resourceDetail(param).then((res) => {
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
