<template>
  <a-drawer
      :open="visible"
      title="站内信详情"
      :width="drawerWidth"
      :maskClosable="false"
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
        <a-card>
          <template #title>
            <span><RightSquareFilled style="color: dodgerblue;"/> 基本信息</span>
          </template>
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item name="code" label="唯一编码" tooltip="" >
                <span>{{ formData.code }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="expireTime" label="过期时间" tooltip="过期时间" >
                <span>{{ formData.expireTime }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="title" label="标题" tooltip="" required>
                <span>{{ formData.title }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="content" label="内容" tooltip="" required>
                <span>{{ formData.content }}</span>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
      </a-form>
    </a-spin>
    <a-card>
      <template #title>
        <span><RightSquareFilled style="color: dodgerblue;"/> 触达列表</span>
      </template>
      <!--  表格数据区  -->
      <MTable ref="tableRef"
              :columns="columns"
              :loadData="loadTableData"
              :row-key="(row) => row.id"
      >
        <template #operator>
          <a-space wrap style="margin-bottom: 6px">
            <a-radio-group v-model:value="queryFormData.hasRead" button-style="solid">
              <!-- 字典 0未读 1已读 -->
              <a-radio-button :value="null" @click="hasReadChange(null)">全部</a-radio-button>
              <a-radio-button :value="0" @click="hasReadChange(0)">未读</a-radio-button>
              <a-radio-button :value="1" @click="hasReadChange(1)">已读</a-radio-button>
            </a-radio-group>
          </a-space>
        </template>
        <template #bodyCell="{ column, record, index, text }">
          <template v-if="column.dataIndex === 'index'">
            <span>{{ index + 1 }}</span>
          </template>
          <template v-if="column.dataIndex === 'name'">
            <!-- 长文本省略提示 -->
            <a-tooltip :title="text" placement="topLeft">
              <span>{{ text }}</span>
            </a-tooltip>
          </template>
          <template v-if="column.dataIndex === 'hasRead'">
            <a-tag v-if="record.hasRead === 0">未读</a-tag>
            <a-tag v-if="record.hasRead === 1" color="green">已读</a-tag>
          </template>
        </template>
      </MTable>
    </a-card>
    <!--  底部操作区  -->
    <template #footer>
      <a-flex gap="small" justify="flex-end">
        <a-button type="primary" danger @click="onClose"> 关闭</a-button>
      </a-flex>
    </template>
  </a-drawer>
</template>
<script setup>
  import messageApi from '@/api/dev/messageApi.js'

  import { useSettingsStore } from "@/store"
  import MTable from "@/components/MTable/index.vue"

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
  // 消息触达列表查询
  const queryFormData = ref({
    hasRead: null
  })
  /***** 表格相关对象 start *****/
  const tableRef = ref()
  // 表格列配置
  const columns = ref([
    // 不需要序号可以删掉
    {
      title: '序号',
      dataIndex: 'index',
      align: 'center',
      width: 50,
    },
    {
      title: "用户名",
      dataIndex: "name",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "状态",
      dataIndex: "hasRead",
      align: "center",
      resizable: true,
      width: 100,
    },
    {
      title: "接收时间",
      dataIndex: "createTime",
      align: "center",
      width: 160,
    },
    {
      title: "已读时间",
      dataIndex: "readTime",
      align: "center",
      width: 160,
    },
  ])

  // 打开抽屉
  const onOpen = (row) => {
    if (row) {
      // 表单数据赋值
      loadData(row)
    }
  }
  // 关闭抽屉
  const onClose = () => {
    visible.value = false
  }

  // 加载数据
  const loadData = (row) => {
    dataLoading.value = true
    // 组装请求参数
    let param = { id: row.id }
    messageApi.messageDetail(param).then((res) => {
      formData.value = res.data
      queryFormData.value.code = res.data.code
    }).finally(() => {
      dataLoading.value = false
      // 数据就绪之后显示
      visible.value = true
    })
  }

  // 加载表格数据
  const loadTableData = (parameter) => {
    queryFormData.value.code = formData.value.code
    // 分页参数
    let param = Object.assign(parameter, queryFormData.value)
    return messageApi.userMessagePage(param).then((res) => {
      // res.data 为 {total, records}
      return res.data
    }).catch((err) => {
      console.error(err)
    })
  }
  // 切换已读/未读
  const hasReadChange = (hasRead) => {
    queryFormData.value.hasRead = hasRead
    tableRef.value.refresh(true)
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
