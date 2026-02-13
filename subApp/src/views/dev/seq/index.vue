<template>
  <!-- 上方查询区 -->
  <a-card size="small">
    <a-form ref="queryFormRef" :model="queryFormData">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-form-item name="keyword" label="关键词">
            <a-input v-model:value="queryFormData.keyword" placeholder="关键词搜索" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item>
            <a-flex gap="small">
              <a-button type="primary" :icon="h(SearchOutlined)" @click="querySubmit">查询</a-button>
              <a-button :icon="h(RedoOutlined)" @click="reset">重置</a-button>
            </a-flex>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-card>
  <a-card size="small">
    <!--  表格数据区  -->
    <a-table size="small"
             ref="tableRef"
             :columns="columns"
             :data-source="tableData"
             :row-key="(row) => row.idKey"
             :pagination="paginationRef"
             @resizeColumn="onResizeColumn"
             bordered>
      <template #bodyCell="{ column, record, index, text }">
        <template v-if="column.dataIndex === 'index'">
          <span>{{ index + 1 }}</span>
        </template>
        <template v-if="column.dataIndex === 'idKey'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'idValue'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'seq'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup>
  import seqApi from '@/api/dev/seqApi.js'

  import { h, ref } from "vue"
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue"

  // 查询表单相关对象
  const queryFormRef = ref()
  const queryFormData = ref({})

  /***** 表格相关对象 start *****/
  const tableRef = ref()
  // 表格中的数据(loadTableData中会更新)
  const tableData = ref([])
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
    onChange: (page, pageSize) => {
      // 处理分页切换的逻辑
      paginationRef.value.current = page
      paginationRef.value.pageSize = pageSize
    },
  })
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
      title: "序列器",
      dataIndex: "idKey",
      align: "center",
      width: 300,
    },
    {
      title: "序列值",
      dataIndex: "idValue",
      align: "center",
      width: 200,
    },
    {
      title: "序列号",
      dataIndex: "seq",
      align: "center",
    },
  ])
  /***** 表格相关对象 end *****/

  // 加载完毕调用
  onMounted(() => {
    loadTableData()
  })

  // 提交查询
  const querySubmit = () => {
    // 加载数据
    loadTableData()
  }

  // 表格查询
  const loadTableData = async () => {
    // 查询参数
    let param = Object.assign(queryFormData.value)
    const res = await seqApi.seqList(param)
    paginationRef.value.total = res.data.total
    tableData.value = res.data
  }
  // 重置
  const reset = () => {
    queryFormData.value = {}
    loadTableData()
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
