<template>
  <a-card size="small">
    <a-form ref="queryFormRef" :model="queryFormData">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-form-item name="code" label="唯一编码">
            <a-input v-model:value="queryFormData.code" placeholder="查询唯一编码" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item name="name" label="模块名称">
            <a-input v-model:value="queryFormData.name" placeholder="搜索模块名称" allowClear />
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
      <!--  表格上方左侧操作区  -->
      <template #operator>
        <a-space wrap style="margin-bottom: 6px">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen()">新增模块</a-button>
          <a-popconfirm :title=" '确定要删除这 ' + selectedRowKeys.length + ' 条数据吗？' " :disabled ="selectedRowKeys.length < 1" @confirm="batchDelete">
            <a-button danger :icon="h(DeleteOutlined)" :disabled="selectedRowKeys.length < 1">
              批量删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
      <template #bodyCell="{ column, record, index, text }">
        <template v-if="column.dataIndex === 'icon'">
          <span v-if="record.icon && record.icon !== '#'" >
            <component :is="record.icon"/>
          </span>
          <span v-else />
        </template>
        <template v-if="column.dataIndex === 'name'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'code'">
          <!-- 唯一键点击查看详情 -->
          <a-tooltip :title="text" placement="topLeft">
            <!--<a style="text-decoration: underline;" @click="detailRef.onOpen(record)">{{ text }}</a>-->
            <a @click="detailRef.onOpen(record)">{{ text }}</a>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'path'">
          <a-tooltip :title="text" placement="topLeft">
            <a-tag v-if="record.path" :bordered="false">{{ record.path }}</a-tag>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'link'">
          <a-tooltip :title="text" placement="topLeft">
            <a-tag v-if="record.link" :bordered="false">{{ record.link }}</a-tag>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'remark'">
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-tooltip title="编辑">
              <a @click="formRef.onOpen(record)"><FormOutlined /></a>
            </a-tooltip>
            <a-divider type="vertical" />
            <a-tooltip title="删除">
              <a-popconfirm title="确定要删除吗？" @confirm="deleteModule(record)">
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
</template>

<script setup>
  import resourceApi from '@/api/system/resourceApi.js'

  import { h, ref } from "vue"
  import { useRoute, useRouter } from "vue-router"
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"
  import Form from "@/views/system/resource/module/form.vue"
  import Detail from "@/views/system/resource/detail.vue"
  import MTable from "@/components/MTable/index.vue"

  // store
  const route = useRoute();
  const router = useRouter();

  // resourceType=1标识模块
  const queryFormRef = ref()
  const queryFormData = ref({ resourceType: 1 })
  // 其他页面操作
  const formRef = ref()
  const detailRef = ref()

  /***** 表格相关对象 start *****/
  const tableRef = ref()
  let selectedRowKeys = ref([])
  const columns = ref([
    {
      title: '图标',
      dataIndex: 'icon',
      align: 'center',
      width: 50
    },
    {
      title: "模块名称",
      dataIndex: "name",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 100,
    },
    {
      title: "唯一编码",
      dataIndex: "code",
      align: "center",
      resizable: true,
      width: 100,
    },
    {
      title: "路径地址",
      dataIndex: "path",
      align: "center",
      resizable: true,
      width: 150,
    },
    {
      title: "组件",
      dataIndex: "component",
      align: "center",
      resizable: true,
      width: 150,
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
      title: '变更时间',
      dataIndex: 'updateTime',
      align: 'center',
      width: 160
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 100
    }
  ])
  /***** 表格相关对象 end *****/

  // 挂载前初始化参数
  onBeforeMount(() => {
    if (route.query.code) {
      queryFormData.value.code = route.query.code
    } else if (route.query.code || history.state.code) {
      queryFormData.value.code = history.state.code
    }
  })

  // 挂载后处理
  onMounted(() => {
    if (route.query.code || history.state.code) {
      const row = { code: route.query.code || history.state.code }
      detailRef.value.onOpen(row)
    }
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
  // 加载数据
  const loadData = (parameter) => {
    // 分页参数
    let param = Object.assign(parameter, queryFormData.value)
    return resourceApi.resourcePage(param).then((res) => {
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
  // 删除
  const deleteModule = (record) => {
    let data = { ids: [record.id] }
    resourceApi.deleteResource(data).then((res) => {
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
    resourceApi.deleteResource(data).then((res) => {
      message.success(res.message)
      tableRef.value.refresh()
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
