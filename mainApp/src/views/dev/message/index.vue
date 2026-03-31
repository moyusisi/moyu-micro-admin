<template>
  <!-- 上方查询区 -->
  <a-card size="small">
    <a-form ref="queryFormRef" :model="queryFormData">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-form-item name="title" label="标题">
            <a-input v-model:value="queryFormData.title" placeholder="搜索标题" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item name="content" label="内容">
            <a-input v-model:value="queryFormData.content" placeholder="搜索内容" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item name="sendTime1" label="起始时间">
            <a-date-picker v-model:value="queryFormData.sendTime1" placeholder="起始时间" :showTime="{ format: 'HH:mm:ss' }" format="YYYY-MM-DD HH:mm:ss" valueFormat="YYYY-MM-DD HH:mm:ss"/>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item>
            <a-flex gap="small">
              <a-button type="primary" :icon="h(SearchOutlined)" @click="querySubmit">查询</a-button>
              <a-button :icon="h(RedoOutlined)" @click="reset">重置</a-button>
              <a-button v-if="!showMore" type="link" @click="showMore = !showMore">更多条件<DownOutlined /></a-button>
              <a-button v-else type="link"  @click="showMore = !showMore">收起<UpOutlined /></a-button>
            </a-flex>
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="showMore">
          <a-form-item name="sendTime2" label="截止时间">
            <a-date-picker v-model:value="queryFormData.sendTime2" placeholder="截止时间" :showTime="{ format: 'HH:mm:ss' }" format="YYYY-MM-DD HH:mm:ss" valueFormat="YYYY-MM-DD HH:mm:ss"/>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-card>
  <a-card size="small">
    <!--  表格数据区  -->
    <vxe-grid ref="gridRef" v-bind="gridOptions">
      <!-- 左侧操作栏 -->
      <template #operator>
        <a-space wrap style="margin-bottom: 8px">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen()">发送站内信</a-button>
          <a-button danger :icon="h(DeleteOutlined)" @click="gridRef?.commitProxy('delete')">批量删除</a-button>
        </a-space>
      </template>
      <!-- 字段插槽 -->
      <template #title="{row, rowIndex, column, columnIndex}">
        <a-tooltip :title="row.title" placement="topLeft">
          <a @click="openDetail(row)">{{ row.title }}</a>
        </a-tooltip>
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
  <Form ref="formRef" @successful="refresh()"/>
  <Detail ref="detailRef"/>
</template>

<script setup>
  import messageApi from '@/api/dev/messageApi.js'

  import { h, reactive, ref } from "vue"
  import { useRoute, useRouter } from "vue-router"
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined, DownOutlined, UpOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"
  import Form from "./form.vue"
  import Detail from "./detail.vue"

  // store
  const route = useRoute();
  const router = useRouter();

  // 查询表单相关对象
  const queryFormRef = ref()
  const queryFormData = ref({})
  // 是否展示更多搜索条件
  const showMore = ref(false)
  // 其他页面操作
  const formRef = ref()
  const detailRef = ref()

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
          return loadData({ pageNum: page.currentPage, pageSize: page.pageSize })
        },
        delete: ({ body, form }) => {
          // 删除已选
          const ids = body.removeRecords.map(item => item.id);
          return messageApi.deleteMessage({ ids })
        }
      }
    },
    // 列字段
    columns: [
      { type: 'checkbox', width: 50 },
      { type: 'seq', width: 50 },
      { field: 'title', title: '标题', width: 250, slots: { default: 'title' } },
      { field: 'content', title: '内容' },
      { field: 'sendTime', title: '发送时间', width: 170 },
      { field: 'expireTime', title: '过期时间', width: 170 },
      { field: 'action', title: '操作', width: 80, slots: { default: 'action' } },
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

  // 加载完毕调用
  onMounted(() => {

  })

  // 提交查询
  const querySubmit = () => {
    // reload 返回第一页触发ajax.query
    // query 当前页触发ajax.query
    gridRef.value?.commitProxy("reload")
  }
  // 重置
  const reset = () => {
    queryFormRef.value.resetFields()
    refresh()
  }
  // 重置
  const refresh = () => {
    // 返回第一页触发ajax.query
    gridRef.value?.commitProxy("reload")
  }
  // 加载数据
  const loadData = (parameter) => {
    // 分页参数
    let param = Object.assign(parameter, queryFormData.value)
    return messageApi.messagePage(param).then((res) => {
      // res.data 为 {total, records}
      return res.data
    }).catch((err) => {
      console.error(err)
    })
  }

  // 删除
  const deleteMessage = (record) => {
    let data = { ids: [record.id] }
    messageApi.deleteMessage(data).then((res) => {
      message.success(res.message)
      refresh()
    })
  }
  // 打开详情页
  const openDetail = (row) => {
    detailRef.value.onOpen(row)
    // 独立页面打开(与抽屉打开二选一)
    // router.push({ path: "/dev/message/detail", query: { id: row.id } })
  }
</script>

<style scoped>
  /** 后代选择器 **/
  .ant-card .ant-form {
    margin-bottom: -12px !important;
  }
  .ant-card .ant-form-item {
    margin-bottom: 12px !important;
  }
</style>
