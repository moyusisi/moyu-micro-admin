<template>
  <!-- 上方查询区 -->
  <a-card size="small">
    <a-form ref="queryFormRef" :model="queryFormData">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-form-item name="id" label="日志ID">
            <a-input v-model:value="queryFormData.id" placeholder="请输入唯一ID" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item name="module" label="系统/模块">
            <a-input v-model:value="queryFormData.module" placeholder="搜索系统/模块" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item name="business" label="业务">
            <a-input v-model:value="queryFormData.business" placeholder="搜索业务名称" allowClear />
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
          <a-form-item name="operate" label="操作">
            <a-input v-model:value="queryFormData.operate" placeholder="搜索操作" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="showMore">
          <a-form-item name="content" label="内容">
            <a-input v-model:value="queryFormData.content" placeholder="搜索内容" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="showMore">
          <a-form-item name="requestUrl" label="接口地址">
            <a-input v-model:value="queryFormData.requestUrl" placeholder="搜索接口地址" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="showMore">
          <a-form-item name="requestContent" label="请求参数">
            <a-input v-model:value="queryFormData.requestContent" placeholder="搜索请求参数" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="showMore">
          <a-form-item name="createBy" label="操作人">
            <a-input v-model:value="queryFormData.createBy" placeholder="请输入操作人ID" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="showMore">
          <a-form-item name="startTime1" label="起始时间">
            <a-date-picker v-model:value="queryFormData.startTime1" placeholder="起始时间" :showTime="{ format: 'HH:mm:ss' }" format="YYYY-MM-DD HH:mm:ss" valueFormat="YYYY-MM-DD HH:mm:ss"/>
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="showMore">
          <a-form-item name="startTime2" label="截止时间">
            <a-date-picker v-model:value="queryFormData.startTime2" placeholder="截止时间" :showTime="{ format: 'HH:mm:ss' }" format="YYYY-MM-DD HH:mm:ss" valueFormat="YYYY-MM-DD HH:mm:ss"/>
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
        <template v-if="column.dataIndex === 'id'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <!--<a style="text-decoration: underline;" @click="openDetail(record)">{{ text }}</a>-->
            <a @click="openDetail(record)">{{ text }}</a>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'requestUrl'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'module'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'business'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'operate'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'content'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'opBrowser'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'opPlatform'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'opOs'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'requestContent'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'responseContent'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-tooltip title="编辑">
              <a @click="formRef.onOpen(record)">编辑</a>
            </a-tooltip>
            <a-tooltip title="删除">
              <a-popconfirm title="确定要删除吗？" @confirm="deleteLog(record)">
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
  import logApi from '@/api/system/logApi.js'

  import { h, ref } from "vue"
  import { useRoute, useRouter } from "vue-router"
  import { DeleteOutlined, RedoOutlined, SearchOutlined, DownOutlined, UpOutlined } from "@ant-design/icons-vue"
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
    {
      title: "日志ID",
      dataIndex: "id",
      align: "center",
      width: 100,
    },
    {
      title: "时间",
      dataIndex: "startTime",
      align: "center",
      width: 160,
    },
    {
      title: "操作人",
      dataIndex: "createBy",
      align: "center",
      resizable: true,
      width: 100,
    },
    {
      title: "系统/模块",
      dataIndex: "module",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "业务",
      dataIndex: "business",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "操作",
      dataIndex: "operate",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "内容说明",
      dataIndex: "content",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "浏览器",
      dataIndex: "opBrowser",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 100,
    },
    {
      title: "平台",
      dataIndex: "opPlatform",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 100,
    },
    {
      title: "操作系统",
      dataIndex: "opOs",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 100,
    },
    {
      title: "接口地址",
      dataIndex: "requestUrl",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "请求参数",
      dataIndex: "requestContent",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "返回结果",
      dataIndex: "responseContent",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "结束时间",
      dataIndex: "endTime",
      align: "center",
      width: 160,
    },
    {
      title: "执行耗时(ms)",
      dataIndex: "executionTime",
      align: "center",
      resizable: true,
      width: 120,
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      align: "center",
      width: 160,
    },
    // 单行操作，不需要可以删掉
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 100,
    },
  ])
  /***** 表格相关对象 end *****/

  // 挂载前初始化参数
  onBeforeMount(() => {
    if (route.query.id) {
      queryFormData.value.id = route.query.id
    } else if (route.query.id || history.state.id) {
      queryFormData.value.id = history.state.id
    }
  })

  // 挂载后处理
  onMounted(() => {
    if (route.query.id || history.state.id) {
      const row = { id: route.query.id || history.state.id }
      openDetail(row)
    }
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
    return logApi.logPage(param).then((res) => {
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
  const deleteLog = (record) => {
    let data = { ids: [record.id] }
    logApi.deleteLog(data).then((res) => {
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
    logApi.deleteLog(data).then((res) => {
      message.success(res.message)
      tableRef.value.refresh()
    })
  }

  // 打开详情页
  const openDetail = (row) => {
    detailRef.value.onOpen(row)
    // 独立页面打开(与抽屉打开二选一)
    // router.push({ path: "/ops/sys/logDetail", query: { id: row.id } })
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
  .custom-btn {
    background-color: #52C41AFF;
    border-color: #52C41AFF;
    color: #fff;
  }
  .custom-btn:hover {
    background-color: #79D84B;
    border-color: #79D84B;
    color: #fff;
  }
</style>
