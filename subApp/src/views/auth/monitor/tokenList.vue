<template>
  <a-drawer
    :open="visible"
    title="令牌列表"
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
    <a-card size="small">
      <!-- 上方操作 -->
      <a-space wrap style="margin-bottom: 8px">
        <a-popconfirm :title=" '确定要批量强退这 ' + selectedRowKeys.length + ' 个令牌吗？' " :disabled ="selectedRowKeys.length < 1" @confirm="batchDelete">
          <a-button danger :icon="h(DeleteOutlined)" :loading="submitLoading" :disabled="selectedRowKeys.length < 1">
            批量强退
          </a-button>
        </a-popconfirm>
      </a-space>
      <a-table size="small"
               ref="tableRef"
               :columns="columns"
               :data-source="tableData"
               :row-key="(record) => record.tokenValue"
               :row-selection="rowSelection"
               @resizeColumn="onResizeColumn"
               :scroll="{ x: tableWidth }"
               bordered>
        <template #bodyCell="{ column, record, index, text }">
          <template v-if="column.dataIndex === 'index'">
            <span>{{ index + 1 }}</span>
          </template>
          <template v-if="column.dataIndex === 'tokenDevice'">
            <a-tag v-if="record.tokenDevice === 'PC'" color="blue">
              {{ text }}
            </a-tag>
            <a-tag v-if="record.tokenDevice === 'DEF'" color="green">
              {{ text }}
            </a-tag>
            <a-tag v-if="record.tokenDevice === 'APP'" color="purple">
              {{ text }}
            </a-tag>
            <a-tag v-if="record.tokenDevice === 'MINI'" color="orange">
              {{ text }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'tokenValue'">
            <!-- 长文本省略提示 -->
            <a-tooltip :title="text" placement="topLeft">
              <span>{{ text }}</span>
            </a-tooltip>
          </template>
          <template v-if="column.dataIndex === 'tokenTimeout'">
            <a-tooltip>
              <template #title>
                <span v-if="record.sessionTimeout <= 0">永久有效</span>
                <a-statistic-countdown v-else :value="record.deadline" format="D 天 H 时 m 分 s 秒" :valueStyle="{fontSize:'14px', color:'#fff'}" />
              </template>
              <a-progress v-if="record.tokenTimeoutPercent * 100 > 80"
                          status="success" :percent="record.tokenTimeoutPercent * 100" :show-info="false"/>
              <a-progress v-if="record.tokenTimeoutPercent * 100 > 20 && record.tokenTimeoutPercent * 100 < 80"
                          status="active" :percent="record.tokenTimeoutPercent * 100" :show-info="false"/>
              <a-progress v-if="record.tokenTimeoutPercent * 100 < 20"
                          status="exception" :percent="record.tokenTimeoutPercent * 100" :show-info="false"/>
            </a-tooltip>
          </template>
        </template>
      </a-table>
    </a-card>
  </a-drawer>
</template>

<script setup>
  import monitorApi from "@/api/auth/monitorApi.js";

  import { message } from "ant-design-vue";
  import { h } from "vue";
  import { DeleteOutlined } from "@ant-design/icons-vue";
  import { useSettingsStore } from "@/store";

  const settingsStore = useSettingsStore()

  const columns = ref([
    // 不需要序号可以删掉
    {
      title: '序号',
      dataIndex: 'index',
      align: 'center',
      width: 50,
    },
    {
      title: '登录设备',
      dataIndex: 'tokenDevice',
      align: "center",
      width: 80
    },
    {
      title: '令牌',
      dataIndex: 'tokenValue',
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150
    },
    {
      title: '有效期',
      dataIndex: 'tokenTimeout',
      align: "center",
      resizable: true,
      width: 100
    },
    {
      title: '令牌签发时间',
      dataIndex: 'createTime',
      align: 'center',
      width: 160
    },
  ])

  // 默认是关闭状态
  const visible = ref(false)
  const record = ref()
  const emit = defineEmits({ successful: null })
  const dataLoading = ref(false)
  const submitLoading = ref(false)
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
    return 750
    // return settingsStore.menuCollapsed ? `calc(100% - 80px)` : `calc(100% - 210px)`
  })
  // 计算属性 表格宽度 超过宽度则会出现x轴上的scroll
  const tableWidth = computed(() => {
    return `calc(100%)`
  })

  // 打开抽屉
  const onOpen = (row) => {
    dataLoading.value = true
    record.value = row;
    selectedRowKeys.value = []
    tableData.value = record.value.tokenList
    // 数据就绪之后显示
    visible.value = true
  }
  // 关闭抽屉
  const onClose = () => {
    // table数据清空
    tableData.value = []
    selectedRowKeys.value = []
    // 关闭
    visible.value = false
  }

  // 批量强退
  const batchDelete = () => {
    if (selectedRowKeys.value.length < 1) {
      message.warning('请选择一条或多条数据')
      return
    }
    submitLoading.value = true
    let data = { codes: selectedRowKeys.value }
    monitorApi.deleteToken(data).then((res) => {
      message.success(res.message)
      selectedRowKeys.value = []
      // 移除表格中删除的rows
      console.log(tableData.value)
      tableData.value.forEach((item, index, array) => {
        data.codes.forEach((code) => {
          if (item.tokenValue === code) {
            delete array[index]
          }
        })
      })
      console.log(tableData.value)
      emit('successful')
    }).finally(() => {
      submitLoading.value = false
    })
  }
  // 可伸缩列
  const onResizeColumn = (w, column) => {
    console.log("onResizeColumn...", column.width)
    column.width = w
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
