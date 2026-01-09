<template>
  <a-drawer
      :open="visible"
      title="组织机构详情"
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
        <a-card>
          <template #title>
            <span><RightSquareFilled style="color: dodgerblue;"/>基本信息</span>
          </template>
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item name="name" label="组织名称" tooltip="" >
                <span>{{ formData.name }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="code" label="组织编码" tooltip="" >
                <span><a>{{ formData.code }}</a></span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="staffCode" label="员工编码" tooltip="" >
                <span>{{ formData.staffCode }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="parentCode" label="上级组织" tooltip="">
                <OrgTreeSelect :tree-data="treeData" :defaultValue="formData.parentCode" disabled/>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="orgType" label="组织类型" tooltip="">
                <span>
                  <a-tag v-if="formData.orgType === 1" color="cyan">公司组织</a-tag>
                  <a-tag v-if="formData.orgType === 2" color="blue">部门机构</a-tag>
                  <a-tag v-if="formData.orgType === 3" color="purple">虚拟节点</a-tag>
                </span>
              </a-form-item>
            </a-col>
            <a-col :span="8" v-if="formData.orgType === 1">
              <a-form-item name="orgLevel" label="公司层级" tooltip="">
                <span>
                  <a-tag v-if="formData.orgLevel === 1" color="blue">总部</a-tag>
                  <a-tag v-if="formData.orgLevel === 2" color="blue">二级公司</a-tag>
                  <a-tag v-if="formData.orgLevel === 3" color="blue">三级公司</a-tag>
                </span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="status" label="使用状态" tooltip="" >
                <span>
                  <a-tag v-if="formData.status === 0" color="green">正常</a-tag>
                  <a-tag v-else>已停用</a-tag>
                </span>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
        <a-card>
          <template #title>
            <span><RightSquareFilled style="color: dodgerblue;"/>更多信息</span>
          </template>
          <a-row :gutter="24">
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
  import orgApi from "@/api/system/orgApi.js";

  import { useSettingsStore } from "@/store"
  import OrgTreeSelect from "@/views/system/components/orgTreeSelect.vue";

  // store
  const settingsStore = useSettingsStore()

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
  // 组织树
  const treeData = ref([])

  // 打开抽屉
  const onOpen = (row, tree) => {
    // 组织树赋值并展开顶级节点
    treeData.value = tree
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
    orgApi.orgDetail(param).then((res) => {
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
