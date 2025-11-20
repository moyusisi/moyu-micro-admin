<template>
  <a-drawer
    :open="visible"
    :title="title"
    :width="drawerWidth"
    :closable="false"
    :footerStyle="{display: 'flex', justifyContent: 'flex-end'}"
    :destroy-on-close="true"
    @close="onClose"
  >
    <template #extra>
      <a-button type="primary" size="small" @click="onClose"><CloseOutlined /></a-button>
    </template>
    <!-- 页面内容 -->
    <a-row :gutter="8">
      <!-- 左侧组织树 -->
      <a-col :span="5">
        <OrgTree ref="treeRef" @onSelect="treeSelect"></OrgTree>
      </a-col>
      <a-col :span="19">
        <a-alert message="角色直接授权的用户，数据权限为仅限本人数据。一旦拥有岗位权限，则将优先使用岗位权限。" type="error" />
        <a-card size="small">
          <a-form ref="searchFormRef" :model="searchFormData">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item name="searchKey">
                  <a-input v-model:value="searchFormData.searchKey" placeholder="请输入用户名" allowClear />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-space>
                  <a-button type="primary" :icon="h(SearchOutlined)" @click="loadTableData()">查询</a-button>
                  <a-button :icon="h(RedoOutlined)" @click="reset">重置</a-button>
                </a-space>
              </a-col>
              <a-col :span="8" style="text-align: right">
                <a-button type="dashed" @click="addRows" :icon="h(PlusOutlined)" style="color: #52C41AFF; border-color: #52C41AFF">添加</a-button>
              </a-col>
            </a-row>
          </a-form>
          <a-table size="small"
               ref="tableRef"
               :columns="columns"
               :data-source="tableData"
               :row-key="(record) => record.account"
               :row-selection="rowSelection"
               :pagination="paginationRef"
               @change="handleTableChange"
               bordered>
            <template #bodyCell="{ column, record }">
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
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
    <!-- 底部内容 -->
    <template #footer>
      <a-space>
        <a-button @click="onClose">关闭</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup>
  import roleApi from '@/api/system/roleApi'

  import { useSettingsStore } from "@/store";
  import { message } from "ant-design-vue";
  import { h } from "vue";
  import { PlusOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue"
  import userApi from "@/api/system/userApi"
  import OrgTree from "@/views/system/components/orgTree.vue";

  const settingsStore = useSettingsStore()

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      align: 'center',
      resizable: true,
      width: 100
    },
    {
      title: '账号',
      dataIndex: 'account',
      align: 'center',
      resizable: true,
      width: 100,
      ellipsis: true
    },
    {
      title: '性别',
      dataIndex: 'gender',
      align: 'center',
      width: 80
    },
    {
      title: '组织机构',
      dataIndex: 'orgName',
      resizable: true,
      width: 200,
      ellipsis: true
    },
    {
      title: '手机',
      dataIndex: 'phone',
      align: 'center',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 80
    }
  ]

  // 默认是关闭状态
  const visible = ref(false)
  const role = ref()
  const title = ref()
  const emit = defineEmits({ successful: null })
  // 定义treeRef
  const treeRef = ref()
  // 表单数据
  const searchFormRef = ref()
  const searchFormData = ref({})
  // table数据
  const tableRef = ref()
  // 表格中的数据(loadTableData中会更新)
  const tableData = ref([])
  // 已选中的菜单(loadTableData中会更新)
  const selectedRowKeys = ref([])
  // 列表选择配置
  const rowSelection = ref({
    checkStrictly: false,
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
    onChange: (page, pageSize) => {
      // 处理分页切换的逻辑
      paginationRef.value.current = page
      paginationRef.value.pageSize = pageSize
    },
  })
  // 抽屉宽度
  const drawerWidth = computed(() => {
    return settingsStore.menuCollapsed ? `calc(100% - 80px)` : `calc(100% - 210px)`
  })

  // 打开抽屉
  const onOpen = (record) => {
    role.value = record;
    title.value = role.value.name + "-添加用户"
    // 加载数据
    loadTableData()
    visible.value = true
  }
  // 关闭抽屉
  const onClose = () => {
    visible.value = false
  }
  // 点击树查询
  const treeSelect = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      searchFormData.value.orgCode = selectedKeys.toString()
    } else {
      delete searchFormData.value.orgCode
    }
    loadTableData()
  }
  // 表格查询
  const loadTableData = async () => {
    selectedRowKeys.value = []
    let param = { pageNum: paginationRef.value.current, pageSize: paginationRef.value.pageSize }
    const res = await userApi.userPage(Object.assign(param, searchFormData.value))
    paginationRef.value.total = res.data.total
    tableData.value = res.data.records
  }
  // 分页、排序、筛选等操作变化时，会触发 change 事件
  const handleTableChange = (pagination, filters, sorter) => {
    let param = { pageNum: paginationRef.value.current, pageSize: paginationRef.value.pageSize }
    userApi.userPage(Object.assign(param, searchFormData.value)).then((res) => {
      paginationRef.value.total = res.data.total
      tableData.value = res.data.records
    })
  }
  // 重置
  const reset = () => {
    searchFormData.value = {}
    paginationRef.value.current = 1
    loadTableData()
  }
  // 添加记录
  const addRows = () => {
    if (selectedRowKeys.value.length < 1) {
      message.warning('请选择一条或多条数据')
      return
    }
    let data = { code: role.value.code, codeSet: selectedRowKeys.value }
    roleApi.roleAddUser(data).then((res) => {
      message.success(res.message)
      emit('successful')
      // 添加之后重新加载数据
      loadTableData()
    })
  }
  // 调用这个函数将子组件的一些数据和方法暴露出去
  defineExpose({
    onOpen
  })
</script>

<style scoped>
  .ant-form-item {
    margin-bottom: 10px !important;
  }
  .selectorTree {
    max-height: 600px;
    overflow: auto;
  }
</style>
