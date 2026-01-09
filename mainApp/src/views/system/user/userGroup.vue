<template>
  <a-drawer
      :open="visible"
      title="用户岗位列表"
      :width="drawerWidth"
      :closable="false"
      :maskClosable="false"
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
                  <a-input v-model:value="searchFormData.name" placeholder="搜索岗位名称" allowClear />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-space>
                  <a-button type="primary" :icon="h(SearchOutlined)" @click="loadTableData()">查询</a-button>
                  <a-button :icon="h(RedoOutlined)" @click="reset">重置</a-button>
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
               :pagination="false"
               bordered>
            <template #bodyCell="{ column, record, index, text }">
              <template v-if="column.dataIndex === 'index'">
                <span>{{ index + 1 }}</span>
              </template>
              <template v-if="column.dataIndex === 'name'">
                <!-- 长文本省略提示 -->
                <a-tooltip :title="text" placement="topLeft">
                  <span>{{ text }}</span>
                </a-tooltip>
              </template>
              <template v-if="column.dataIndex === 'code'">
                <a-tooltip :title="text" placement="topLeft">
                  <a>{{ record.code }}</a>
                </a-tooltip>
              </template>
              <template v-if="column.dataIndex === 'orgName'">
                <a-tooltip :title="text" placement="topLeft">
                  <span>{{ text }}</span>
                </a-tooltip>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

  </a-drawer>
</template>

<script setup>
  import groupApi from '@/api/system/groupApi'

  import { useSettingsStore } from "@/store";
  import { h } from "vue";
  import { RedoOutlined, SearchOutlined } from "@ant-design/icons-vue";

  const settingsStore = useSettingsStore()
  const columns = [
    // 不需要序号可以删掉
    {
      title: '序号',
      dataIndex: 'index',
      align: 'center',
      width: 50,
    },
    {
      title: '岗位名称',
      dataIndex: 'name',
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 200
    },
    {
      title: '岗位编码',
      dataIndex: 'code',
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 100
    },
    {
      title: "所属组织机构",
      dataIndex: "orgName",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 200,
    }
  ]

  // 默认是关闭状态
  const visible = ref(false)
  const user = ref()

  // 表单数据
  const searchFormRef = ref()
  const searchFormData = ref({})
  // table数据
  const tableRef = ref()
  // 表格中的数据(loadTableData中会更新)
  const tableData = ref([])

  // 抽屉宽度
  const drawerWidth = computed(() => {
    return settingsStore.menuCollapsed ? `calc(100% - 80px)` : `calc(100% - 210px)`
  })

  // 打开抽屉
  const onOpen = (record) => {
    user.value = record;
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
    // 关闭
    visible.value = false
  }

  // 表格查询
  const loadTableData = async () => {
    let param = Object.assign({ "username": user.value.account }, searchFormData.value)
    const res = await groupApi.userGroupList(param)
    tableData.value = res.data
  }
  // 重置
  const reset = () => {
    searchFormData.value = {}
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
