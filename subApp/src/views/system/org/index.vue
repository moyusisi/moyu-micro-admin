<template>
  <a-row :gutter="8">
    <!-- 左侧组织树 -->
    <a-col :span="4">
      <OrgTree ref="treeRef" @onSelect="treeSelect"></OrgTree>
    </a-col>
    <!-- 右侧内容 -->
    <a-col :span="20">
      <a-card size="small">
        <a-form ref="queryFormRef" :model="queryFormData">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item name="name" label="组织名称">
                <a-input v-model:value="queryFormData.name" placeholder="搜索组织名称" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="使用状态" name="status">
                <a-select v-model:value="queryFormData.status" placeholder="请选择状态" :options="statusOptions" allowClear />
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
        <MTable ref="tableRef"
                :columns="columns"
                :loadData="loadData"
                :row-key="(row) => row.code"
                showRowSelection
                @selectedChange="onSelectedChange"
        >
          <!--  表格上方左侧操作区  -->
          <template #operator>
            <a-space wrap style="margin-bottom: 6px">
              <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen(null, treeRef.treeData, queryFormData.parentCode)">新增</a-button>
              <BatchDeleteButton icon="DeleteOutlined" :selectedRowKeys="selectedRowKeys" @batchDelete="batchDelete" />
            </a-space>
          </template>
          <template #bodyCell="{ column, record, index, text }">
            <template v-if="column.dataIndex === 'name'">
              <!-- 长文本省略提示 -->
              <a-tooltip :title="text" placement="topLeft">
                <span>{{ text }}</span>
              </a-tooltip>
            </template>
            <template v-if="column.dataIndex === 'code'">
              <!-- 唯一键点击查看详情 -->
              <a-tooltip :title="text" placement="topLeft">
                <a @click="openDetail(record)">{{ text }}</a>
              </a-tooltip>
            </template>
            <template v-if="column.dataIndex === 'orgType'">
              <a-tag v-if="record.orgType === 1" color="cyan">公司组织</a-tag>
              <a-tag v-if="record.orgType === 2" color="blue">部门机构</a-tag>
              <a-tag v-if="record.orgType === 3" color="purple">虚拟节点</a-tag>
            </template>
            <template v-if="column.dataIndex === 'status'">
              <a-tag v-if="record.status === 0" color="green">正常</a-tag>
              <a-tag v-else>已停用</a-tag>
            </template>
            <template v-if="column.dataIndex === 'action'">
              <a-space>
                <a-tooltip title="编辑">
                  <a @click="formRef.onOpen(record, treeRef.treeData)"><FormOutlined /></a>
                </a-tooltip>
                <a-divider type="vertical" />
                <a-tooltip title="删除">
                  <a-popconfirm title="确定要删除吗？" @confirm="deleteOrg(record)">
                    <a style="color:#FF4D4F;"><DeleteOutlined/></a>
                  </a-popconfirm>
                </a-tooltip>
              </a-space>
            </template>
          </template>
        </MTable>
      </a-card>
    </a-col>
  </a-row>
  <Form ref="formRef" @successful="handleSuccess" />
  <Detail ref="detailRef"/>
</template>

<script setup>
  import orgApi from '@/api/system/orgApi'

  import { onActivated, h, ref } from "vue"
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"
  import OrgTree from "../components/orgTree.vue"
  import BatchDeleteButton from "@/components/BatchDeleteButton/index.vue"
  import MTable from "@/components/MTable/index.vue"
  import Form from "./form.vue"
  import Detail from "./detail.vue"

  // 查询表单相关对象
  const queryFormRef = ref()
  const queryFormData = ref({})
  // 使用状态options（0正常 1停用）
  const statusOptions = [
    { label: "正常", value: 0 },
    { label: "已停用", value: 1 }
  ]
  // 其他页面操作
  const formRef = ref()
  const detailRef = ref()
  // 定义treeRef
  const treeRef = ref()

  /***** 表格相关对象 start *****/
  const tableRef = ref()
  // 已选中的行
  const selectedRowKeys = ref([])
  // 表格列配置
  const columns = ref([
    {
      title: '组织编码',
      dataIndex: 'code',
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 120
    },
    {
      title: '组织名称',
      dataIndex: 'name',
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150
    },
    {
      title: '组织类型',
      dataIndex: 'orgType',
      align: 'center',
      width: 80
    },
    {
      title: '组织层级',
      dataIndex: 'orgLevel',
      align: 'center',
      width: 80
    },
    {
      title: '排序',
      dataIndex: 'sortNum',
      align: 'center',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 80
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 100
    }
  ])
  /***** 表格相关对象 end *****/

  // 加载完毕调用
  onMounted(() => {
    console.log("org/index onMounted...")
  })

  // 调用时机为首次挂载 以及 每次从缓存中被重新插入时
  onActivated(() => {
    // console.log("org/index onActivated...")
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
  // 表格查询 返回 Promise 对象
  const loadData = (parameter) => {
    // 分页参数
    let param = Object.assign(parameter, queryFormData.value)
    return orgApi.orgPage(param).then((res) => {
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
  // 点击树查询
  const treeSelect = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      queryFormData.value.parentCode = selectedKeys.toString()
    } else {
      delete queryFormData.value.parentCode
    }
    tableRef.value.refresh(true)
  }
  // 删除
  const deleteOrg = (record) => {
    let data = { codes: [record.code] }
    orgApi.deleteOrgTree(data).then((res) => {
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
    let data = { codes: selectedRowKeys.value }
    orgApi.deleteOrgTree(data).then((res) => {
      message.success(res.message)
      tableRef.value.refresh()
    })
  }
  // 打开详情页
  const openDetail = (row) => {
    detailRef.value.onOpen(row, treeRef.value)
    // 独立页面打开(与抽屉打开二选一)
    // router.push({ path: "/system/sysOrg/detail", query: { id: row.id } })
  }
  // 成功回调
  const handleSuccess = () => {
    treeRef.value.refresh()
    tableRef.value.refresh()
  }
</script>

<style scoped>
/** 后代选择器 **/
.ant-card .ant-form {
  margin-bottom: -12px !important;
}
.ant-form-item {
  margin-bottom: 12px !important;
}
</style>
