<template>
	<!-- 系统设置Bar -->
  <div class="bar-item" @click="openNotice">
    <a-badge :dot="hasDot">
      <BellOutlined style="font-size: 16px"/>
    </a-badge>
  </div>
  <!-- 消息列表抽屉 -->
  <a-drawer :open="noticeOpen"
            title="通知消息"
            :width="800"
            :closable="false"
            :destroy-on-close="true"
            @close="onClose">
    <!--  上方操作区  -->
    <template #extra>
      <a-button type="primary" size="small" @click="onClose"><CloseOutlined /></a-button>
    </template>
    <!--  表格数据区  -->
    <MTable ref="tableRef"
            :columns="columns"
            :loadData="loadTableData"
            :row-key="(row) => row.id"
    >
      <template #operator>
        <a-space wrap style="margin-bottom: 6px">
          <a-radio-group v-model:value="queryFormData.hasRead" button-style="solid">
            <!-- 字典 0未读 1已读 -->
            <a-radio-button :value="null" @click="hasReadChange(null)">全部</a-radio-button>
            <a-radio-button :value="0" @click="hasReadChange(0)">未读</a-radio-button>
            <a-radio-button :value="1" @click="hasReadChange(1)">已读</a-radio-button>
          </a-radio-group>
        </a-space>
      </template>
      <template #bodyCell="{ column, record, index, text }">
        <template v-if="column.dataIndex === 'index'">
          <span>{{ index + 1 }}</span>
        </template>
        <template v-if="column.dataIndex === 'title'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <a @click="openDetail(record)">{{ text }}</a>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'hasRead'">
          <a-tag v-if="record.hasRead === 0">未读</a-tag>
          <a-tag v-if="record.hasRead === 1" color="green">已读</a-tag>
        </template>
      </template>
    </MTable>
  </a-drawer>
  <Detail ref="detailRef" @successful="tableRef.refresh()"/>
</template>
<script setup>
  import messageApi from '@/api/dev/messageApi.js'
  import { BellOutlined, CloseOutlined } from "@ant-design/icons-vue"
  import MTable from "@/components/MTable/index.vue"
  import { ref } from "vue";
  import Detail from "./detail.vue"
  import Form from "@/views/system/log/form.vue";


  // bell图标上是否有小红点提示
  const hasDot = ref(false)
  // 抽屉是否打开
  const noticeOpen = ref(false)

  // 消息触达列表查询
  const queryFormData = ref({
    hasRead: 0
  })

  // 其他页面操作
  const detailRef = ref()

  /***** 表格相关对象 start *****/
  const tableRef = ref()
  // 已选中的行
  const selectedRowKeys = ref([])
  // 表格列配置
  const columns = ref([
    // 不需要序号可以删掉
    {
      title: '序号',
      dataIndex: 'index',
      align: 'center',
      width: 50,
    },
    {
      title: "标题",
      dataIndex: "title",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 400,
    },
    {
      title: "状态",
      dataIndex: "hasRead",
      align: "center",
      resizable: true,
      width: 100,
    },
    {
      title: "接收时间",
      dataIndex: "createTime",
      align: "center",
      width: 160,
    },
  ])

  onMounted(() => {
    // 未读消息数量
    messageApi.unreadCount({}).then((res) => {
      if (res.data && res.data > 0) {
        hasDot.value = true
      }
    }).catch((err) => {
      console.error(err)
    })
  });

  // 设置抽屉
  const openNotice = () => {
    noticeOpen.value = true
  }
  // 关闭抽屉
  const onClose = () => {
    queryFormData.value.hasRead = 0
    noticeOpen.value = false
  }

  // 加载表格数据
  const loadTableData = (parameter) => {
    // 分页参数
    let param = Object.assign(parameter, queryFormData.value)
    return messageApi.readPage(param).then((res) => {
      // res.data 为 {total, records}
      return res.data
    }).catch((err) => {
      console.error(err)
    })
  }

  // 切换已读/未读
  const hasReadChange = (hasRead) => {
    queryFormData.value.hasRead = hasRead
    tableRef.value.refresh(true)
  }
  // 打开阅读窗
  const openDetail = (row) => {
    detailRef.value.onOpen(row)
  }
</script>

<style scoped>
</style>
