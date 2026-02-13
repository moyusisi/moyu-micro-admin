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
          <a-form-item name="sendTime1" label="起始时间">
            <a-date-picker v-model:value="queryFormData.sendTime1" placeholder="起始时间" :showTime="{ format: 'HH:mm:ss' }" format="YYYY-MM-DD HH:mm:ss" valueFormat="YYYY-MM-DD HH:mm:ss"/>
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="showMore">
          <a-form-item name="sendTime2" label="截止时间">
            <a-date-picker v-model:value="queryFormData.sendTime2" placeholder="截止时间" :showTime="{ format: 'HH:mm:ss' }" format="YYYY-MM-DD HH:mm:ss" valueFormat="YYYY-MM-DD HH:mm:ss"/>
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
          <a-form-item name="content" label="内容">
            <a-input v-model:value="queryFormData.content" placeholder="搜索内容" allowClear />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-card>
  <a-card size="small">
    <!--  表格数据区  -->
    <MTable ref="tableRef"
            :columns="columns"
            :loadData="loadData"
            :row-key="(row) => row.id"
            showRowSelection
            @selectedChange="onSelectedChange"
    >
      <!--  表格上方左侧操作区  -->
      <template #operator>
        <a-space wrap style="margin-bottom: 8px">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen()">发送站内信</a-button>
          <a-popconfirm :title=" '确定要删除这 ' + selectedRowKeys.length + ' 条数据吗？' " :disabled ="selectedRowKeys.length < 1" @confirm="batchDelete">
            <a-button danger :icon="h(DeleteOutlined)" :disabled="selectedRowKeys.length < 1">
              批量删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
      <template #bodyCell="{ column, record, index, text }">
        <template v-if="column.dataIndex === 'index'">
          <span>{{ index + 1 }}</span>
        </template>
        <template v-if="column.dataIndex === 'code'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <a @click="openDetail(record)">{{ text }}</a>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'title'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <a @click="openDetail(record)">{{ text }}</a>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'content'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-tooltip title="删除">
              <a-popconfirm title="确定要删除吗？" @confirm="deleteMessage(record)">
                <a style="color:#FF4D4F;">删除</a>
              </a-popconfirm>
            </a-tooltip>
          </a-space>
        </template>
      </template>
    </MTable>
  </a-card>
  <Form ref="formRef" @successful="tableRef.refresh()"/>
  <Detail ref="detailRef"/>
</template>

<script setup>
  import messageApi from '@/api/dev/messageApi.js'

  import { h, ref } from "vue"
  import { useRoute, useRouter } from "vue-router"
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined, DownOutlined, UpOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"
  import MTable from "@/components/MTable/index.vue"
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
  const tableRef = ref()
  // 已选中的行
  const selectedRowKeys = ref([])
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
      title: "标题",
      dataIndex: "title",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 250,
    },
    {
      title: "内容",
      dataIndex: "content",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 300,
    },
    {
      title: "发送时间",
      dataIndex: "sendTime",
      align: "center",
      width: 160,
    },
    {
      title: "过期时间",
      dataIndex: "expireTime",
      align: "center",
      width: 160,
    },
    // 单行操作，不需要可以删掉
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 80,
    },
  ])
  /***** 表格相关对象 end *****/

  // 加载完毕调用
  onMounted(() => {

  })

  // 提交查询
  const querySubmit = () => {
    tableRef.value.refresh(true)
  }
  // 重置
  const reset = () => {
    queryFormRef.value.resetFields()
    tableRef.value.refresh(true)
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
  // 选中行发生变化
  const onSelectedChange = (selectedKeys, selectedRows) => {
    selectedRowKeys.value = selectedKeys
    // console.log('onSelectedChange,selectedKeys:', selectedKeys);
  }

  // 删除
  const deleteMessage = (record) => {
    let data = { ids: [record.id] }
    messageApi.deleteMessage(data).then((res) => {
      message.success(res.message)
      tableRef.value.refresh()
    })
  }
  // 批量删除
  const batchDelete = () => {
    if (selectedRowKeys.value.length < 1) {
      message.warning("请至少选择一条数据")
      return
    }
    let data = { ids: selectedRowKeys.value }
    messageApi.deleteMessage(data).then((res) => {
      message.success(res.message)
      tableRef.value.refresh()
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
