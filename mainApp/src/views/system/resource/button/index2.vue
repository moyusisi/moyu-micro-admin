<template>
  <!-- 上方模块选择 -->
  <a-card size="small">
    <a-form ref="queryFormRef" :model="queryFormData">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-form-item name="module" label="所属模块">
            <a-select v-model:value="moduleId" @change="onModuleChange" placeholder="请选择模块">
              <a-select-option v-for="item in moduleList" :key="item.code" :value="item.code">{{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item name="name" label="名称">
            <a-input v-model:value="queryFormData.name" placeholder="搜索名称" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item name="path" label="接口地址">
            <a-input v-model:value="queryFormData.path" placeholder="搜索接口地址" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button type="primary" :icon="h(SearchOutlined)" @click="tableRef.refresh(true)">查询</a-button>
            <a-button :icon="h(RedoOutlined)" @click="reset">重置</a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-form>
  </a-card>
  <a-card size="small">
    <SVTable ref="tableRef" :loadData="loadData" :columns="columns"
             row-key="id" @rowSelectChange="onRowSelectChange"
             :opConfig="opConfig" @opClick="onOpClick">
      <template #operator>
        <!-- 操作区 -->
        <a-space wrap style="padding-bottom: 16px">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen(null, module)">新增</a-button>
          <a-button type="primary" danger :disabled="selectedRowKeys.length!==1" :icon="h(MinusOutlined)" @click="deleteBatchButton">删除</a-button>
          <a-button type="dashed" danger :disabled="selectedRowKeys.length<2" :icon="h(DeleteOutlined)" @click="deleteBatchButton">批量删除</a-button>
          <!--      <a-button type="dashed" @click="null" :icon="h(PlusOutlined)" style="color: #52C41AFF; border-color: #52C41AFF">添加</a-button>-->
        </a-space>
      </template>
      <!--      <ListColumn field="null" title="插槽传入"/>-->
    </SVTable>
  </a-card>
  <Form ref="formRef" @successful="tableRef.refresh(true)"/>
</template>

<script setup>
import resourceApi from '@/api/system/resourceApi.js'
import { h } from "vue";
import {
  DeleteOutlined,
  FormOutlined,
  MinusOutlined,
  PlusOutlined,
  RedoOutlined,
  SearchOutlined
} from "@ant-design/icons-vue";
import Form from "./form.vue";
import { message, Modal } from "ant-design-vue";
import SVTable from "@/components/SVTable/index.vue"

const tableRef = ref()
const selectedRowKeys = ref([])
const selectedRows = ref([])
const records = ref([])
// 列配置
const columns = [
  {
    field: 'name',
    title: '名称',
    width: "auto"
  },
  {
    field: 'code',
    title: '唯一编码',
    width: "auto"
  },
  {
    field: 'path',
    title: '接口地址',
    width: "auto"
  },
  {
    field: 'permission',
    title: '权限',
    width: 'auto',
  },
  {
    field: 'sortNum',
    title: '排序顺序',
    sort: true,
    width: 'auto',
  },
  {
    field: 'updateTime',
    title: '变更时间',
    sort: true,
    width: 'auto',
  },
]
// 操作列配置
const opConfig = { show: true, opList: ['add', 'delete', { name: "other", text: "其他" }] }

// resourceType=6表示按钮
const queryFormData = ref({ resourceType: 6 })
const formRef = ref()
const queryFormRef = ref()
const moduleId = ref()
const module = ref()
const moduleList = ref([])

onMounted(() => {
})

const loadData = async (parameter) => {
  if (!moduleId.value) {
    // 若无moduleId, 则查询module列表第一个module的code作为默认moduleId
    const moduleRes = await resourceApi.moduleList()
    moduleList.value = moduleRes.data
    module.value = moduleRes.data.length > 0 ? moduleRes.data[0] : null
    moduleId.value = module.value.code
    queryFormData.value.module = moduleId.value
    return resourceApi.resourcePage(Object.assign(parameter, queryFormData.value)).then((res) => {
      return res.data
    })
  } else {
    return resourceApi.resourcePage(Object.assign(parameter, queryFormData.value)).then((res) => {
      return res.data
    })
  }
}

// 模块选择发生变更
const onModuleChange = (value) => {
  queryFormData.value.module = value
  module.value = moduleList.value.find((e) => e.code === value)
  tableRef.value.refresh(true)
}

// SVTable中的操作点击事件
const onOpClick = (name, record) => {
  console.log("操作点击的事件名字", name, record.name)
  if (name === "add") {
    formRef.value.onOpen(null, module)
  } else if (name === "delete") {
    deleteButton(record)
  } else if (name === "other") {
    window.alert("点击其他操作")
  }
}

// SVTable中的操作点击事件
const onRowSelectChange = (selectedRowKey, selectedRows) => {
  console.log("onRowSelectChange", selectedRowKey)
  selectedRowKeys.value = selectedRowKey
}

// 重置
const reset = () => {
  queryFormRef.value.resetFields()
  tableRef.value.refresh(true)
}
// 删除
const deleteButton = (record) => {
  let data = { ids: [record.id] }
  // 显示确认对话框
  Modal.confirm({
    title: '确定要删除吗？',
    onOk() {
      resourceApi.deleteResource(data).then((res) => {
        message.success(res.message)
        tableRef.value.refresh(false)
      })
    },
  });
}
// 批量删除
const deleteBatchButton = (params) => {
  let data = { ids: selectedRowKeys.value }
  // 显示确认对话框
  Modal.confirm({
    title: '确定要删除吗？',
    onOk() {
      resourceApi.deleteResource(data).then((res) => {
        message.success(res.message)
        // 清空已选并刷新
        tableRef.value.refresh()
      })
    },
  });
}
</script>

<style scoped>
.ant-form-item {
  margin-bottom: 0 !important;
}
</style>
