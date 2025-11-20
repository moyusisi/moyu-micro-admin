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
              <a-form-item name="name" label="姓名">
                <a-input v-model:value="queryFormData.name" placeholder="搜索姓名" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="用户状态" name="status">
                <a-select v-model:value="queryFormData.status" placeholder="请选择状态" :options="statusOptions" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-space>
                <a-button type="primary" :icon="h(SearchOutlined)" @click="querySubmit">查询</a-button>
                <a-button :icon="h(RedoOutlined)" @click="reset">重置</a-button>
              </a-space>
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
            <a-space wrap style="margin-bottom: 6px">
              <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen(null, treeRef.treeData, queryFormData.orgCode)">新增用户</a-button>
              <BatchDeleteButton icon="DeleteOutlined" :selectedRowKeys="selectedRowKeys" @batchDelete="batchDelete" />
            </a-space>
          </template>
          <template #bodyCell="{ column, record, index, text }">
            <template v-if="column.dataIndex === 'account'">
              <!-- 长文本省略提示 -->
              <a-tooltip :title="text" placement="topLeft">
                <a-tag v-if="record.account" :bordered="false">{{ record.account }}</a-tag>
              </a-tooltip>
            </template>
            <template v-if="column.dataIndex === 'name'">
              <a-tooltip :title="text" placement="topLeft">
                <span>{{ text }}</span>
              </a-tooltip>
            </template>
            <template v-if="column.dataIndex === 'orgName'">
              <a-tooltip :title="text" placement="topLeft">
                <span>{{ text }}</span>
              </a-tooltip>
            </template>
            <template v-if="column.dataIndex === 'gender'">
              <a-tag v-if="record.gender === 1" color="blue">男</a-tag>
              <a-tag v-else-if="record.gender === 2" color="pink">女</a-tag>
              <a-tag v-else>未知</a-tag>
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
                  <a-popconfirm title="确定要删除吗？" @confirm="deleteUser(record)">
                    <a style="color:#FF4D4F;"><DeleteOutlined/></a>
                  </a-popconfirm>
                </a-tooltip>
                <a-divider type="vertical" />
                <a-tooltip title="重置密码">
                  <a-popconfirm title="确定要重置吗？" @confirm="resetPassword(record)">
                  <a style="color:darkorange;"><LockOutlined/></a>
                  </a-popconfirm>
                </a-tooltip>
              </a-space>
            </template>
          </template>
        </MTable>
      </a-card>
    </a-col>
  </a-row>
  <Form ref="formRef" @successful="tableRef.refresh()" />
</template>

<script setup>
  import userApi from '@/api/system/userApi'

  import { h, ref } from "vue"
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"

  import Form from "./form.vue"
  import OrgTree from "../components/orgTree.vue"
  import BatchDeleteButton from "@/components/BatchDeleteButton/index.vue"
  import MTable from "@/components/MTable/index.vue"

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

  /***** 表格相关对象 start *****/
  const tableRef = ref()
  // 已选中的行
  const selectedRowKeys = ref([])
  // 表格列配置
  const columns = ref([
    {
      title: "账号",
      dataIndex: "account",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "姓名",
      dataIndex: "name",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "性别",
      dataIndex: "gender",
      align: "center",
      width: 60
    },
    {
      title: "组织机构",
      dataIndex: "orgName",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "状态",
      dataIndex: "status",
      align: "center",
      resizable: true,
      width: 60
    },
    {
      title: "修改时间",
      dataIndex: "updateTime",
      align: "center",
      width: 160,
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 150
    }
  ])
  /***** 表格相关对象 end *****/

  // 列表选择配置
  const options = {
    alert: {
      show: false,
      clear: () => {
        selectedRowKeys.value = ref([])
      }
    },
    rowSelection: {
      onChange: (selectedRowKey, selectedRows) => {
        selectedRowKeys.value = selectedRowKey
      }
    }
  }
  // 定义treeRef
  const treeRef = ref()


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
  // 加载数据 返回 Promise 对象
  const loadData = (parameter) => {// 分页参数
    let param = Object.assign(parameter, queryFormData.value)
    return userApi.userPage(param).then((res) => {
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
      queryFormData.value.orgCode = selectedKeys.toString()
    } else {
      delete queryFormData.value.orgCode
    }
    tableRef.value.refresh(true)
  }
  // 删除用户
  const deleteUser = (record) => {
    let data = { ids: [record.id] }
    userApi.deleteUser(data).then((res) => {
      message.success(res.message)
      tableRef.value.refresh()
    })
  }
  // 批量删除
  const batchDelete = () => {
    let data = { ids: selectedRowKeys.value }
    userApi.deleteUser(data).then((res) => {
      message.success(res.message)
      tableRef.value.refresh()
    })
  }
  // 批量导出
  const batchExport = (params) => {

  }

  // 重置用户密码
  const resetPassword = (record) => {
    let data = { ids: [record.id] }
    userApi.resetPassword(data).then((res) => {
      message.success(res.message)
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
