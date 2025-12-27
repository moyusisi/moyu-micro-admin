<template>
  <!-- 上方查询区 -->
  <a-card size="small">
    <a-form ref="queryFormRef" :model="queryFormData">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-form-item name="orgCode" label="组织机构">
            <OrgTreeSelect ref="treeRef" @onChange="orgChange"/>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item name="name" label="岗位名称">
            <a-input v-model:value="queryFormData.name" placeholder="搜索岗位名称" allowClear />
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
    <!--  表格数据区  -->
    <MTable
        ref="tableRef"
        :columns="columns"
        :loadData="loadData"
        :row-key="(row) => row.id"
        showRowSelection
        @selectedChange="onSelectedChange"
    >
      <!--  表格上方左侧操作区  -->
      <template #operator>
        <a-space wrap style="margin-bottom: 6px">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen(null, treeRef.treeData, queryFormData.orgCode)">新增</a-button>
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
          <a-tooltip :title="text" placement="topLeft">
            <a @click="detailRef.onOpen(record)">{{ record.code }}</a>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'orgName'">
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'status'">
          <a-tag v-if="record.status === 0" color="green">正常</a-tag>
          <a-tag v-else>已停用</a-tag>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-tooltip title="分配角色">
              <a style="color:#1980FF;" @click="groupRoleRef.onOpen(record)"><DeploymentUnitOutlined /></a>
            </a-tooltip>
            <a-divider type="vertical" />
            <a-tooltip title="分配用户">
              <a style="color:#53C61D;" @click="groupUserRef.onOpen(record, treeRef.treeData)"><UsergroupAddOutlined /></a>
            </a-tooltip>
            <a-divider type="vertical" />
            <a-tooltip title="编辑">
              <a @click="formRef.onOpen(record, treeRef.treeData)"><FormOutlined /></a>
            </a-tooltip>
            <a-divider type="vertical" />
            <a-tooltip title="删除">
              <a-popconfirm title="确定要删除吗？" @confirm="deleteGroup(record)">
                <a style="color:#FF4D4F;"><DeleteOutlined/></a>
              </a-popconfirm>
            </a-tooltip>
          </a-space>
        </template>
      </template>
    </MTable>
  </a-card>
  <Form ref="formRef" @successful="tableRef.refresh(true)" />
  <Detail ref="detailRef"/>
  <GroupRole ref="groupRoleRef" @successful="handleSuccess()" />
  <GroupUser ref="groupUserRef" @successful="handleSuccess()" />
</template>

<script setup>
  import groupApi from '@/api/system/groupApi'
  import { onMounted, h } from "vue"
  import { message } from 'ant-design-vue'
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue"
  import Form from './form.vue'
  import Detail from './detail.vue'
  import GroupRole from './groupRole.vue'
  import GroupUser from './groupUser.vue'
  import MTable from "@/components/MTable/index.vue"
  import OrgTreeSelect from "@/views/system/components/orgTreeSelect.vue"
  import BatchDeleteButton from "@/components/BatchDeleteButton/index.vue";

  // 查询表单相关对象
  const queryFormRef = ref()
  const queryFormData = ref({})
  // 使用状态options（0正常 1停用）
  const statusOptions = [
    { label: "正常", value: 0 },
    { label: "已停用", value: 1 }
  ]
  // 定义treeRef
  const treeRef = ref()

  // 其他页面操作
  const formRef = ref()
  const detailRef = ref()
  const groupUserRef = ref()
  const groupRoleRef = ref()

  /***** 表格相关对象 start *****/
  const tableRef = ref()
  // 已选中的行
  const selectedRowKeys = ref([])
  // 表格列配置
  const columns = [
    {
      title: "岗位名称",
      dataIndex: "name",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "唯一编码",
      dataIndex: "code",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150
    },
    {
      title: "所属组织机构",
      dataIndex: "orgName",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 200,
    },
    {
      title: "状态",
      dataIndex: "status",
      align: "center",
      resizable: true,
      width: 80,
    },
    {
      title: "排序顺序",
      dataIndex: "sortNum",
      align: "center",
      resizable: true,
      width: 80,
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
      width: 200,
    }
  ]

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
    return groupApi.groupPage(param).then((res) => {
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

  // 组织机构变更
  const orgChange = (value) => {
    queryFormData.value.orgCode = value
  }
  // 删除
  const deleteGroup = (record) => {
    let data = { ids: [record.id] }
    groupApi.deleteGroup(data).then((res) => {
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
    groupApi.deleteGroup(data).then((res) => {
      message.success(res.message)
      tableRef.value.refresh()
    })
  }
  // 成功回调
  const handleSuccess = () => {
    querySubmit()
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