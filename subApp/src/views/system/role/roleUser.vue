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
        <a-alert message="角色直接授权的用户，数据权限为仅限本人数据。" type="error" />
        <a-card size="small">
          <!-- 上方查询框 -->
          <a-form ref="searchFormRef" :model="searchFormData">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item name="searchKey">
                  <a-input v-model:value="searchFormData.searchKey" placeholder="请输入关键词" allowClear />
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
                  <a-button type="dashed" @click="roleAddUserRef.onOpen(role)" :icon="h(PlusOutlined)" style="color: #52C41AFF; border-color: #52C41AFF">添加用户</a-button>
                  <a-button type="dashed" danger @click="delRows" :icon="h(MinusOutlined)">移除用户</a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-form>
          <a-table size="small"
                   ref="tableRef"
                   :columns="columns"
                   :data-source="tableData"
                   :row-key="(record) => record.account"
                   :row-selection="rowSelection"
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

    <!-- 弹窗 -->
    <RoleAddUser ref="roleAddUserRef" @successful="handleSuccess()" />

  </a-drawer>
</template>

<script setup>
  import roleApi from '@/api/system/roleApi'

  import { message } from "ant-design-vue";
  import { h } from "vue";
  import { PlusOutlined, MinusOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue";
  import RoleAddUser from "./roleAddUser.vue";
  import { useSettingsStore } from "@/store";
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
  const roleAddUserRef = ref()
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

  const drawerWidth = computed(() => {
    return settingsStore.menuCollapsed ? `calc(100% - 80px)` : `calc(100% - 210px)`
  })

  // 打开抽屉
  const onOpen = (record) => {
    role.value = record;
    title.value = record.name + "-用户列表"
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
    let param = Object.assign({ "code": role.value.code }, searchFormData.value)
    const res = await roleApi.roleUserList(param)
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
    let data = { code: role.value.code, codeSet: selectedRowKeys.value }
    roleApi.roleDeleteUser(data).then((res) => {
      message.success(res.message)
      // 删掉之后重新加载数据
      loadTableData()
    })
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
  .selectorTree {
    max-height: 600px;
    overflow: auto;
  }
</style>
