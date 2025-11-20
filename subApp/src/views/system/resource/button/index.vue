<template>
  <!-- 上方模块选择 -->
  <a-card size="small">
    <a-form ref="queryFormRef" :model="queryFormData">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-form-item name="module" label="所属模块">
            <a-select v-model:value="moduleId" @change="onModuleChange" placeholder="请选择模块">
              <a-select-option v-for="item in moduleList" :key="item.code" :value="item.code">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item name="code" label="唯一编码">
            <a-input v-model:value="queryFormData.code" placeholder="查询唯一编码" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item name="name" label="名称">
            <a-input v-model:value="queryFormData.name" placeholder="搜索名称" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item>
            <a-flex gap="small">
              <a-button type="primary" :icon="h(SearchOutlined)" @click="querySubmit">查询</a-button>
              <a-button :icon="h(RedoOutlined)" @click="reset">重置</a-button>
              <a-button v-if="!showMore" type="link" @click="showMore = !showMore">更多条件<DownOutlined /></a-button>
              <a-button v-else type="link"  @click="showMore = !showMore">收起<UpOutlined /></a-button>
            </a-flex>
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="showMore">
          <a-form-item name="path" label="接口地址">
            <a-input v-model:value="queryFormData.path" placeholder="搜索接口地址" allowClear />
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
          <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen(null, module)">新增接口</a-button>
          <a-popconfirm :title=" '确定要删除这 ' + selectedRowKeys.length + ' 条数据吗？' " :disabled ="selectedRowKeys.length < 1" @confirm="batchDelete">
            <a-button danger :icon="h(DeleteOutlined)" :disabled="selectedRowKeys.length < 1">
              批量删除
            </a-button>
          </a-popconfirm>
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
        <template v-if="column.dataIndex === 'permission'">
          <a-tooltip :title="text" placement="topLeft">
            <a-tag v-if="record.permission" :bordered="false">{{ record.permission }}</a-tag>
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
              <a @click="formRef.onOpen(record, module)"><FormOutlined /></a>
            </a-tooltip>
            <a-divider type="vertical" />
            <a-tooltip title="删除">
              <a-popconfirm title="确定要删除吗？" @confirm="deleteButton(record)">
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
  import { useRoute, useRouter } from "vue-router";
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined, UpOutlined, DownOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"
  import MTable from "@/components/MTable/index.vue"
  import Form from "./form.vue"
  import Detail from "../detail.vue"

  // store
  const route = useRoute();
  const router = useRouter();

  // 查询表单相关对象
  const queryFormRef = ref()
  // resourceType=6表示按钮
  const queryFormData = ref({ resourceType: 6 })
  const moduleId = ref()
  const module = ref()
  const moduleList = ref([])
  // 是否展示更多搜索条件
  const showMore = ref(false)

  // 其他页面操作
  const formRef = ref()
  const detailRef = ref()

  /***** 表格相关对象 start *****/
  const tableRef = ref()
  // 已选中的行
  const selectedRowKeys = ref([])
  // 表格列配置
  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: '唯一编码',
      dataIndex: 'code',
      resizable: true,
      ellipsis: true,
      width: 150
    },
    {
      title: "接口地址",
      dataIndex: "path",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "权限",
      dataIndex: "permission",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "排序顺序",
      dataIndex: "sortNum",
      align: "center",
      width: 80
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
      width: 150
    }
  ]
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

  // 初始化
  const init = async () => {
    if (!moduleId.value) {
      // 若无moduleId, 则查询module列表第一个module的code作为默认moduleId
      const moduleRes = await resourceApi.moduleList()
      moduleList.value = moduleRes.data
      module.value = moduleRes.data.length > 0 ? moduleRes.data[0] : null
      moduleId.value = module.value.code
    }
  }

  // 提交查询
  const querySubmit = () => {
    tableRef.value.refresh(true)
  }
  // 重置
  const reset = () => {
    queryFormRef.value.resetFields()
    tableRef.value.refresh(true)
  }
  const loadData = async (parameter) => {
    // 分页参数
    let param = Object.assign(parameter, queryFormData.value)
    if (!moduleId.value) {
      await init()
      param.module = moduleId.value
      return resourceApi.resourcePage(param).then((res) => {
        // res.data 为 {total, records}
        return res.data
      })
    } else {
      param.module = moduleId.value
      return resourceApi.resourcePage(param).then((res) => {
        // res.data 为 {total, records}
        return res.data
      })
    }
  }
  // 选中行发生变化
  const onSelectedChange = (selectedKeys, selectedRows) => {
    selectedRowKeys.value = selectedKeys
    // console.log('onSelectedChange,selectedKeys:', selectedKeys);
  }
  // 模块选择发生变更
  const onModuleChange = (value) => {
    queryFormData.value.module = value
    module.value = moduleList.value.find((e) => e.code === value)
    tableRef.value.refresh(true)
  }

  // 删除
  const deleteButton = (record) => {
    let data = { ids: [record.id] }
    resourceApi.deleteResource(data).then((res) => {
      message.success(res.message)
      tableRef.value.refresh()
    })
  }
  // 批量删除
  const batchDelete = () => {
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
