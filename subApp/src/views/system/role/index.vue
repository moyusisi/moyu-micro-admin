<template>
  <a-card size="small">
    <a-form ref="queryFormRef" :model="queryFormData">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item name="name" label="名称">
            <a-input v-model:value="queryFormData.name" placeholder="搜索名称" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="状态" name="status">
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
    <MTable ref="tableRef"
            :columns="columns"
            :loadData="loadData"
            :row-key="(row) => row.id"
            showRowSelection
            @selectedChange="onSelectedChange"
    >
      <template #operator>
        <a-space wrap style="margin-bottom: 6px">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen()">新增角色</a-button>
          <a-popconfirm :title=" '确定要删除这 ' + selectedRowKeys.length + ' 条数据吗？' " :disabled ="selectedRowKeys.length < 1" @confirm="deleteBatchRole">
            <a-button danger :icon="h(DeleteOutlined)" :disabled="selectedRowKeys.length < 1">
              批量删除
            </a-button>
          </a-popconfirm>
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
          <a-tooltip :title="text" placement="topLeft">
            <a-tag v-if="record.code" :bordered="false">{{ record.code }}</a-tag>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'status'">
          <a-tag v-if="record.status === 0" color="green">正常</a-tag>
          <a-tag v-else>已停用</a-tag>
        </template>
        <template v-if="column.dataIndex === 'remark'">
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <template #split>
              <a-divider type="vertical" />
            </template>
            <a-tooltip title="分配权限">
              <a style="color:#1980FF;" @click="grantMenuFormRef.onOpen(record)"><DeploymentUnitOutlined /></a>
            </a-tooltip>
            <a-tooltip title="分配用户">
              <a style="color:#53C61D;" @click="roleUserRef.onOpen(record)"><UserAddOutlined /></a>
            </a-tooltip>
            <a-tooltip title="编辑">
              <a @click="formRef.onOpen(record)"><FormOutlined /></a>
            </a-tooltip>
            <a-tooltip title="删除">
              <a-popconfirm title="确定要删除吗？" @confirm="deleteRole(record)">
                <a style="color:#FF4D4F;"><DeleteOutlined/></a>
              </a-popconfirm>
            </a-tooltip>
          </a-space>
        </template>
      </template>
    </MTable>
  </a-card>
  <grant-menu-form ref="grantMenuFormRef" @successful="tableRef.refresh()" />
  <Form ref="formRef" @successful="tableRef.refresh()" />
  <RoleUser ref="roleUserRef" />
</template>

<script setup>
  import roleApi from '@/api/system/roleApi'

  import { h, ref } from "vue"
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"
  import Form from "./form.vue"
  import MTable from "@/components/MTable/index.vue"
  import GrantMenuForm from "./grantMenuForm.vue"
  import RoleUser from "./roleUser.vue"

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150
    },
    {
      title: '唯一编码',
      dataIndex: 'code',
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 200
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      resizable: true,
      width: 100
    },
    {
      title: "排序顺序",
      dataIndex: "sortNum",
      align: "center",
      resizable: true,
      width: 100,
    },
    {
      title: "备注",
      dataIndex: "remark",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      align: 'center',
      width: 160
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 200
    }
  ]
  const selectedRowKeys = ref([])
  // 使用状态options（0正常 1停用）
  const statusOptions = [
    { label: "正常", value: 0 },
    { label: "已停用", value: 1 }
  ]

  // 定义tableDOM
  const tableRef = ref()
  const formRef = ref()
  const grantMenuFormRef = ref()
  const roleUserRef = ref()
  const queryFormRef = ref()
  const queryFormData = ref({})

  // 表格查询 返回 Promise 对象
  const loadData = (parameter) => {
    let param = Object.assign(parameter, queryFormData.value)
    return roleApi.rolePage(param).then((res) => {
      return res.data
    })
  }
  // 查询
  const querySubmit = () => {
    tableRef.value.refresh(true)
  }
  // 重置
  const reset = () => {
    queryFormRef.value.resetFields()
    tableRef.value.refresh(true)
  }
  // 选中行发生变化
  const onSelectedChange = (selectedKeys, selectedRows) => {
    selectedRowKeys.value = selectedKeys
    // console.log('onSelectedChange,selectedKeys:', selectedKeys);
  }
  // 删除
  const deleteRole = (record) => {
    let data = { ids: [record.id] }
    roleApi.deleteRole(data).then((res) => {
      message.success(res.message)
      tableRef.value.refresh(true)
    })
  }
  // 批量删除
  const deleteBatchRole = (params) => {
    let data = { ids: selectedRowKeys.value }
    roleApi.deleteRole(data).then((res) => {
      message.success(res.message)
      tableRef.value.refresh(true)
    })
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
