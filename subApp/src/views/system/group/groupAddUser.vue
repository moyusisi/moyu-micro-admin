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
        <a-card size="small" :loading="cardLoading" :bodyStyle="{paddingLeft:'5px', paddingRight:'5px'}">
          <a-tree
            v-if="treeData.length > 0"
            v-model:expandedKeys="defaultExpandedKeys"
            :tree-data="treeData"
            :field-names="treeFieldNames"
            @select="treeSelect"
          />
          <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </a-card>
      </a-col>
      <a-col :span="19">
        <a-alert message="用户只能加入一个分组，若用户已加入其他分组，需在其他分组删除后才可添加。" type="warning" />
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
  import groupApi from '@/api/system/groupApi'

  import { useSettingsStore } from "@/store";
  import { Empty, message } from "ant-design-vue";
  import { h } from "vue";
  import { PlusOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue"
  import userApi from "@/api/system/userApi"

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
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      resizable: true,
      width: 200
    }
  ]

  // 默认是关闭状态
  const visible = ref(false)
  const group = ref()
  const title = ref()
  const emit = defineEmits({ successful: null })
  // 节点树
  const treeData = ref([])
  // 默认展开的节点(顶级)
  const defaultExpandedKeys = ref([])
  // 替换treeNode 中 children,title,key
  const treeFieldNames = { children: 'children', title: 'name', key: 'code' }
  const cardLoading = ref(false)
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
      console.log('onChange,selectedKeys:', selectedKeys);
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
  const onOpen = (record, tree) => {
    // 组织树赋值并展开顶级节点
    treeData.value = tree
    defaultExpandedKeys.value = [tree[0]?.code]
    group.value = record;
    title.value = group.value.name + "-添加用户"
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
    let data = { code: group.value.code, codeSet: selectedRowKeys.value }
    groupApi.groupAddUser(data).then((res) => {
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
