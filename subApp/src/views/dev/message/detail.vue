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
      <vxe-grid ref="gridRef" v-bind="gridOptions">
        <!-- 左侧操作栏 -->
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
        <!-- 字段插槽 -->
        <template #hasRead="{row, rowIndex, column, columnIndex}">
          <a-tag v-if="row.hasRead === 0">未读</a-tag>
          <a-tag v-if="row.hasRead === 1" color="green">已读</a-tag>
        </template>
        <template #action="{row:record, rowIndex, column, columnIndex}">
          <a-space>
            <a-tooltip title="删除">
              <a-popconfirm title="确定要删除吗？" @confirm="deleteMessage(record)">
                <a style="color:#FF4D4F;">删除</a>
              </a-popconfirm>
            </a-tooltip>
          </a-space>
        </template>
      </vxe-grid>
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
  const gridRef = ref()
  const gridOptions = reactive({
    // 分页配置项
    pagerConfig: {
      enabled: true,
    },
    // 数据代理配置
    proxyConfig: {
      // 获取响应的值配置
      response: {
        // 只对 pager-config 配置时有效，响应结果中获取数据列表的属性（分页场景）
        result: "records",
        // 只对 pager-config 配置时有效，响应结果中获取分页的属性（分页场景）
        total: "total",
      },
      ajax: {
        query: ({ page, sort, sorts, filters, form }) => {
          // 默认接收 Promise<{ result: [], page: { total: 100 } }>
          return loadTableData({ pageNum: page.currentPage, pageSize: page.pageSize })
        }
      }
    },
    // 列字段
    columns: [
      { type: 'seq', width: 50 },
      { field: 'name', title: '用户名', width: 200 },
      { field: 'hasRead', title: '状态', width: 100, slots: { default: 'hasRead' } },
      { field: 'createTime', title: '接收时间', width: 170 },
      { field: 'readTime', title: '已读时间', width: 170 },
    ],
    // 工具栏配置
    toolbarConfig: {
      // 是否显示个性化列配置
      custom: true,
      // 是否允许最大化显示
      zoom: true,
      // 刷新按钮配置
      refresh: true,
      //插槽
      slots: {
        // 按钮列表
        buttons: "operator",
      },
    },
  })
  /***** 表格相关对象 end *****/

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
  // 重置
  const refresh = () => {
    // 返回第一页触发ajax.query
    gridRef.value?.commitProxy("reload")
  }
  // 切换已读/未读
  const hasReadChange = (hasRead) => {
    queryFormData.value.hasRead = hasRead
    refresh()
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
