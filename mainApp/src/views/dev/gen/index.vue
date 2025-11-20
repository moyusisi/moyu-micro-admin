<template>
  <!-- 上方选择区 -->
  <a-card size="small">
    <a-form ref="queryFormRef" :model="queryFormData" layout="inline">
      <a-form-item name="searchKey" label="搜索关键词">
        <a-input v-model:value="queryFormData.searchKey" placeholder="请输入关键词" allowClear/>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" :icon="h(SearchOutlined)" @click="querySubmit">查询</a-button>
          <a-button :icon="h(RedoOutlined)" @click="reset">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </a-card>
  <a-card size="small">
    <a-row>
      <a-col :span="20" style="margin-bottom: 12px">
        <a-space wrap>
          <a-button type="primary" :icon="h(PlusOutlined)" @click="sqlFormRef.onOpen()">从SQL导入</a-button>
          <a-button type="primary" :icon="h(CloudUploadOutlined)" @click="importFormRef.onOpen()">导入</a-button>
          <a-popconfirm title="确定要批量删除吗？" :disabled ="selectedRowKeys.length < 1" @confirm="batchDelete">
            <a-button danger :icon="h(DeleteOutlined)" :disabled="selectedRowKeys.length < 1">
              批量删除
            </a-button>
          </a-popconfirm>
          <a-popconfirm title="确定要批量生成代码并下载吗？" :disabled ="selectedRowKeys.length < 1" @confirm="downloadCode">
            <a-button type="primary" :icon="h(CloudDownloadOutlined)" :disabled="selectedRowKeys.length < 1">
              批量生成
            </a-button>
          </a-popconfirm>
        </a-space>
      </a-col>
      <a-col :span="4">
        <a-flex gap="small" class="tool-area" justify="flex-end" align="flex-start">
<!--          <a-button :icon="h(PlusOutlined)" class="custom-btn">设置</a-button>-->
        </a-flex>
      </a-col>
    </a-row>
    <a-table size="middle"
             ref="tableRef"
             :columns="columns"
             :data-source="tableData"
             :row-key="(record) => record.id"
             :row-selection="rowSelection"
             :pagination="paginationRef"
             @change="onChange"
             @resizeColumn="onResizeColumn"
             :scroll="{ x: tableWidth }"
             bordered>
      <template #bodyCell="{ text, record, index, column }">
        <template v-if="column.dataIndex === 'index'">
          <span>{{ index + 1 }}</span>
        </template>
        <template v-if="column.dataIndex === 'entityDesc'">
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'sourceType'">
          <a-tag v-if="record.sourceType === 'TABLE'" color="blue">{{ record.sourceType }}</a-tag>
          <a-tag v-else color="cyan">{{ record.sourceType }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-tooltip title="预览代码">
              <a style="color:#53C61D;" @click="previewRef.onOpen(record)">预览</a>
            </a-tooltip>
            <a-tooltip title="下载生成的代码">
              <a style="color:#1980FF;" @click="downloadCode(record)">生成</a>
            </a-tooltip>
            <a-tooltip title="修改配置">
              <a @click="configFormRef.onOpen(record)">修改</a>
            </a-tooltip>
            <a-tooltip v-if="record.sourceType === 'TABLE'" title="根据表结构重置为默认配置">
              <a @click="resetTable(record)">重置</a>
            </a-tooltip>
            <a-tooltip title="删除配置">
              <a-popconfirm title="确定要删除配置吗？" @confirm="deleteConfig(record)">
                <a style="color:#FF4D4F;">删除</a>
              </a-popconfirm>
            </a-tooltip>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-card>
  <ImportForm ref="importFormRef" @successful="loadData" />
  <SqlForm ref="sqlFormRef" @successful="loadData" />
  <ConfigForm ref="configFormRef" @successful="loadData" />
  <previewCode ref="previewRef" />
</template>

<script setup>
  import codegenApi from '@/api/dev/codegenApi'

  import { h } from "vue"
  import { PlusOutlined, DeleteOutlined, CloudUploadOutlined, CloudDownloadOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"
  import { useSettingsStore } from "@/store"
  import ConfigForm from "./configForm.vue"
  import ImportForm from "./importForm.vue"
  import SqlForm from "./sqlForm.vue"
  import previewCode from "./preview.vue"

  // store
  const settingsStore = useSettingsStore()

  // 计算属性 表格宽度 超过宽度则会出现x轴上的scroll
  const tableWidth = computed(() => {
    return settingsStore.menuCollapsed ? `calc(100% - 80px -24px)` : `calc(100% - 210px -24px)`
  })

  // 查询表单相关对象
  const queryFormRef = ref()
  const queryFormData = ref({})

  // 其他页面操作
  const importFormRef = ref()
  const sqlFormRef = ref()
  const configFormRef = ref()
  const previewRef = ref()

  /***** 表格相关对象 start *****/
  const tableRef = ref()
  // 表格的数据源
  const tableData = ref([])
  // 已选中的行
  const selectedRowKeys = ref([])
  // 表格行选择配置
  const rowSelection = ref({
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      selectedRowKeys.value = selectedKeys
      // console.log('onChange,selectedKeys:', selectedKeys);
    }
  });
  // 表格的分页配置
  const paginationRef = ref({
    // 当前页码
    current: 1,
    // 每页显示条数
    pageSize: 10,
    // 总条数，需要通过接口获取
    total: 0,
    // 显示总记录数
    showTotal: (total, range) => `共 ${total} 条 `,
    // 是否可改变每页显示条数
    showSizeChanger: true,
    // 只有一页或没有数据时隐藏分页栏
    // hideOnSinglePage: true,
    onChange: (page, pageSize) => {
      // 处理分页切换的逻辑
      paginationRef.value.current = page
      paginationRef.value.pageSize = pageSize
    },
  })
  // 表格列配置 TODO 根据字段生成
  const columns = ref([
    // 不需要序号可以删掉
    {
      title: '序号',
      dataIndex: 'index',
      align: 'center',
      width: 50,
    },
    {
      title: '表名称',
      dataIndex: 'tableName',
      align: 'center',
      resizable: true,
      width: 150,
    },
    {
      title: '实体类名',
      dataIndex: 'entityName',
      align: 'center',
      resizable: true,
      width: 150,
    },
    {
      title: '实体描述',
      dataIndex: 'entityDesc',
      align: 'center',
      resizable: true,
      ellipsis: true,
      width: 160,
    },
    {
      title: '来源',
      dataIndex: 'sourceType',
      align: 'center',
      resizable: true,
      width: 100,
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      align: 'center',
      resizable: true,
      width: 160,
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      align: 'center',
      resizable: true,
      width: 160,
    },
    // 单行操作，不需要可以删掉
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 200,
    },
  ])
  /***** 表格相关对象 end *****/

  // 加载完毕调用
  onMounted(() => {
    loadData()
  })

  // 提交查询
  const querySubmit = () => {
    loadData()
  }
  // 重置
  const reset = () => {
    queryFormRef.value = {}
    paginationRef.value.current = 1
    loadData()
  }
  // 加载数据
  const loadData = (parameter) => {
    // 重新加载数据时，清空之前以选中的行
    selectedRowKeys.value = []
    // 分页参数
    let param = { pageNum: paginationRef.value.current, pageSize: paginationRef.value.pageSize }
    return codegenApi.configPage(Object.assign(param, queryFormData.value)).then((res) => {
      paginationRef.value.total = res.data.total
      tableData.value = res.data.records
    })
  }
  // 分页、排序、筛选等操作变化时，会触发 change 事件
  const onChange = (pagination, filters, sorter) => {
    loadData()
  }
  // 可伸缩列
  const onResizeColumn = (w, column) => {
    column.width = w
  }
  // 删除
  const deleteConfig = (record) => {
    let data = { ids: [record.id] }
    codegenApi.deleteConfig(data).then((res) => {
      message.success(res.message)
      loadData()
    })
  }
  // 批量删除
  const batchDelete = () => {
    if (selectedRowKeys.value.length < 1) {
      message.warning("请至少选择一条数据")
      return
    }
    let data = { ids: selectedRowKeys.value }
    codegenApi.deleteConfig(data).then((res) => {
      message.success(res.message)
      loadData()
    })
  }
  // 重置表配置
  const resetTable = (record) => {
    let data = { id: record.id }
    codegenApi.resetTable(data).then((res) => {
      // 添加之后重新加载数据
      message.success(res.message)
      loadData()
    })
  }
  // 下载代码
  const downloadCode = (row) => {
    let ids = []
    if (row && row.id) {
      ids = [row.id]
    } else {
      ids = selectedRowKeys.value
    }
    if (ids.length < 1) {
      message.warning("请至少选择一条数据")
      return
    }
    let data = { ids: ids }
    codegenApi.download(data).then((res) => {
    }).catch(err => {
      console.log(err)
    })
  }
</script>

<style scoped>
  /** 后代选择器 **/
  .ant-card-small .ant-form-inline {
    margin-bottom: -12px !important;
  }
  /** 直接后代选择器 **/
  .ant-form-inline > .ant-form-item {
    margin-bottom: 12px !important;
  }
  /** 操作区 **/
  .tool-area {
    width: 100%;
    height: 100%;
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
