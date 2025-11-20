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
      <a-col :span="24">
        <a-card size="small">
          <!-- 上方查询框 -->
          <a-form ref="searchFormRef" :model="searchFormData">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item name="searchKey">
                  <a-input v-model:value="searchFormData.searchKey" placeholder="搜索角色名称" allowClear />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-space>
                  <a-button type="primary" :icon="h(SearchOutlined)" @click="loadTableData()">查询</a-button>
                  <a-button :icon="h(RedoOutlined)" @click="reset">重置</a-button>
                </a-space>
              </a-col>
              <a-col :span="8" style="text-align: right">
                <a-space>
                  <a-button type="dashed" @click="groupAddRoleRef.onOpen(group)" :icon="h(PlusOutlined)" style="color: #52C41AFF; border-color: #52C41AFF">添加角色</a-button>
                  <a-button type="dashed" danger @click="delRows" :icon="h(MinusOutlined)">移除角色</a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-form>
          <!-- 数据列表 -->
          <a-table size="small"
               ref="tableRef"
               :columns="columns"
               :data-source="tableData"
               :row-key="(record) => record.code"
               :row-selection="rowSelection"
               :pagination="false"
               bordered>
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'code'">
                <a-tag v-if="record.code" :bordered="false">{{ record.code }}</a-tag>
              </template>
              <template v-if="column.dataIndex === 'status'">
                <a-tag v-if="record.status === 0" color="green">正常</a-tag>
                <a-tag v-else>已停用</a-tag>
              </template>
              <template v-if="column.dataIndex === 'action'">
                <a-space>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 弹窗 -->
    <GroupAddRole ref="groupAddRoleRef" @successful="handleSuccess()" />

  </a-drawer>
</template>

<script setup>
  import groupApi from '@/api/system/groupApi'

  import { useSettingsStore } from "@/store";
  import { h } from "vue";
  import { PlusOutlined, MinusOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue";
  import { message } from "ant-design-vue";
  import GroupAddRole from './groupAddRole.vue'
  import MTable from "@/components/MTable/index.vue";

  const settingsStore = useSettingsStore()
  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      resizable: true,
      width: 100
    },
    {
      title: '唯一编码',
      dataIndex: 'code',
      resizable: true,
      width: 200
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 100
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      width: 160
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
      resizable: true,
      width: 150
    }
  ]

  // 默认是关闭状态
  const visible = ref(false)
  const group = ref()
  const title = ref()
  const emit = defineEmits({ successful: null })
  const groupAddRoleRef = ref()
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

  // 抽屉宽度
  const drawerWidth = computed(() => {
    return settingsStore.menuCollapsed ? `calc(100% - 80px)` : `calc(100% - 210px)`
  })

  // 打开抽屉
  const onOpen = (record) => {
    group.value = record;
    title.value = record.name + "-角色列表"
    // 加载数据
    loadTableData()
    visible.value = true
  }
  // 关闭抽屉
  const onClose = () => {
    // 表单清空
    searchFormData.value = {}
    // table数据清空
    tableData.value = []
    selectedRowKeys.value = []
    // 关闭
    visible.value = false
  }

  // 表格查询
  const loadTableData = async () => {
    selectedRowKeys.value = []
    let param = Object.assign({ "code": group.value.code }, searchFormData.value)
    const res = await groupApi.groupRoleList(param)
    tableData.value = res.data
  }
  // 重置
  const reset = () => {
    searchFormData.value = {}
    loadTableData()
  }
  // 删减记录
  const delRows = () => {
    if (selectedRowKeys.value.length < 1) {
      message.warning('请选择一条或多条数据')
      return
    }
    let data = { code: group.value.code, codeSet: selectedRowKeys.value }
    groupApi.groupDeleteRole(data).then((res) => {
      message.success(res.message)
      // 删掉之后重新加载数据
      loadTableData()
    })
  }
  // 成功回调
  const handleSuccess = () => {
    loadTableData()
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
</style>
