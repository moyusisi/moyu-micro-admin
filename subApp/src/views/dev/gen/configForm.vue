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
    <a-tabs v-model:activeKey="activeTab" type="card" centered>
      <a-tab-pane key="1" tab="基本配置">
        <a-card>
          <a-form ref="tableFormRef" :model="configFormData" :label-col="{span: 4}">
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="表名" name="tableName" :rules="[required('请输入表名')]">
                  <a-input v-model:value="configFormData.tableName" placeholder="如:sys_user" disabled/>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="表注释" name="tableComment" :rules="[required('请输入表注释')]">
                  <a-input v-model:value="configFormData.tableComment" placeholder="如:用户" disabled/>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="实体名" name="entityName" :rules="[required('请输入实体名')]">
                  <a-input v-model:value="configFormData.entityName" placeholder="如:User"/>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="实体描述" name="entityDesc" :rules="[required('请输入描述')]">
                  <a-input v-model:value="configFormData.entityDesc" placeholder="如:用户"/>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="包名" name="packageName" :rules="[required('请输入包名')]">
                  <a-input v-model:value="configFormData.packageName" placeholder="如:com.moyu.boot"/>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="模块名" name="moduleName" :rules="[required('请输入模块名')]">
                  <a-input v-model:value="configFormData.moduleName" placeholder="如:system"/>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="上级菜单" name="parentCode">
                  <a-tree-select
                      v-model:value="configFormData.parentMenuCode"
                      v-model:treeExpandedKeys="defaultExpandedKeys"
                      placeholder="请选择"
                      allow-clear
                      :tree-data="treeData"
                      :field-names="{ children: 'children', label: 'name', value: 'code' }"
                      :tree-line="{ showLeafIcon:false }"
                      :show-checked-strategy="TreeSelect.SHOW_ALL"
                      @change="null"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="作者" name="author">
                  <a-input v-model:value="configFormData.author" placeholder="如:moyusisi"/>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="2" tab="字段配置">
        <a-card>
          <!-- 数据列表 -->
          <a-table size="small"
                   ref="tableRef"
                   :columns="columns"
                   :data-source="configFormData.fieldConfigList"
                   :row-key="(record) => record.id"
                   :pagination="false"
                   bordered>
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'code'">
                <a-tag v-if="record.code" :bordered="false">{{ record.code }}</a-tag>
              </template>
              <template v-if="column.dataIndex === 'fieldName'">
                <a-input v-model:value="record.fieldName" />
              </template>
              <template v-if="column.dataIndex === 'fieldRemark'">
                <a-input v-model:value="record.fieldRemark" />
              </template>
              <template v-if="column.dataIndex === 'maxLength'">
                <a-input v-model:value="record.maxLength" />
              </template>
              <template v-if="column.dataIndex === 'showInQuery'">
                <a-checkbox v-model:checked="record.showInQuery"/>
              </template>
              <template v-if="column.dataIndex === 'showInList'">
                <a-checkbox v-model:checked="record.showInList"/>
              </template>
              <template v-if="column.dataIndex === 'ellipsis'">
                <a-checkbox v-model:checked="record.ellipsis"/>
              </template>
              <template v-if="column.dataIndex === 'showInForm'">
                <a-checkbox v-model:checked="record.showInForm"/>
              </template>
              <template v-if="column.dataIndex === 'required'">
              <span v-if="record.showInForm" >
                <a-checkbox v-model:checked="record.required"/>
              </span>
                <span v-else>-</span>
              </template>
              <template v-if="column.dataIndex === 'queryType'">
                <a-select v-if="record.showInQuery" v-model:value="record.queryType" :options="queryTypeOptions" placeholder="请选择" style="width: 100%"/>
                <span v-else>-</span>
              </template>
              <template v-if="column.dataIndex === 'formType'">
                <a-select v-model:value="record.formType" :options="formTypeOptions" style="width: 100%"/>
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
      </a-tab-pane>
    </a-tabs>
    <template #footer>
      <a-space style="float:right;">
        <a-button type="primary" :loading="submitLoading" @click="onSubmit">保存</a-button>
        <a-button type="primary" danger ghost @click="onClose"> 关闭</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>
<script setup name="stepsForm">
import codegenApi from '@/api/dev/codegenApi'

import { message, TreeSelect } from 'ant-design-vue'
import { required } from "@/utils/formRules.js";
import { useSettingsStore } from "@/store/index.js";
import resourceApi from "@/api/system/resourceApi.js";
import OrgTreeSelect from "@/views/system/components/orgTreeSelect.vue";

const settingsStore = useSettingsStore()

const emit = defineEmits({ successful: null, closed: null })

// 默认是关闭状态
const visible = ref(false)
const activeTab = ref('1');
const title = ref()
const recordData = ref()
const tableFormRef = ref()
const configFormData = ref({
  fieldConfigList: [],
  packageName: "com.moyu.boot",
  author: "moyusisi"
});
// 菜单树选择
const treeData = ref([])
// 默认展开的节点
const defaultExpandedKeys = ref([])
const submitLoading = ref(false)

const columns = [
  {
    title: '列名',
    align: 'center',
    dataIndex: 'columnName',
    width: 100,
    ellipsis: true
  },
  {
    title: '列类型',
    align: 'center',
    dataIndex: 'columnType',
    width: 80,
    ellipsis: true
  },
  {
    title: '字段名',
    align: 'center',
    dataIndex: 'fieldName',
    width: 150,
    ellipsis: true
  },
  {
    title: '字段类型',
    align: 'center',
    dataIndex: 'fieldType',
    width: 100,
    ellipsis: true
  },
  {
    title: '注释',
    align: 'center',
    dataIndex: 'fieldRemark',
    width: 150,
    ellipsis: true
  },
  {
    title: '最大长度',
    align: 'center',
    dataIndex: 'maxLength',
    width: 80,
    ellipsis: true
  },
  {
    title: '查询条件',
    align: 'center',
    dataIndex: 'showInQuery',
    width: 50
  },
  {
    title: '列表显示',
    align: 'center',
    dataIndex: 'showInList',
    width: 50
  },
  {
    title: '省略提示',
    align: 'center',
    dataIndex: 'ellipsis',
    width: 50
  },
  {
    title: '表单填写',
    align: 'center',
    dataIndex: 'showInForm',
    width: 50
  },
  {
    title: '是否必填',
    align: 'center',
    dataIndex: 'required',
    width: 50
  },
  {
    title: '表单类型',
    align: 'center',
    dataIndex: 'formType',
    width: 130
  },
  {
    title: '查询方式',
    align: 'center',
    dataIndex: 'queryType',
    width: 130
  },
  {
    title: '字典类型',
    align: 'center',
    dataIndex: 'dictType',
    width: 140
  },
]

// 查询方式选项
const queryTypeOptions = ref([
  {
    label: "LIKE",
    value: "LIKE"
  },
  {
    label: "=",
    value: "EQ"
  },
  {
    label: "IN",
    value: "IN"
  },
  {
    label: ">",
    value: "GT"
  },
  {
    label: ">=",
    value: "GE"
  },
  {
    label: "<",
    value: "LT"
  },
  {
    label: "<=",
    value: "LE"
  },
  {
    label: "!=",
    value: "NE"
  },
  {
    label: "BETWEEN",
    value: "BETWEEN"
  },
])
// 表单类型选项
const formTypeOptions = ref([
  {
    label: '输入框',
    value: 'INPUT'
  },
  {
    label: '下拉框',
    value: 'SELECT'
  },
  {
    label: '数字输入框',
    value: 'INPUT_NUMBER'
  },
  {
    label: '单选框',
    value: 'RADIO'
  },
  {
    label: '复选框',
    value: 'CHECK_BOX'
  },
  {
    label: '文本框',
    value: 'TEXT_AREA'
  },
  {
    label: '日期选择',
    value: 'DATE'
  },
  {
    label: '时间选择',
    value: 'DATE_TIME'
  },
])

// 抽屉宽度
const drawerWidth = computed(() => {
  return `calc(100%)`
  // return settingsStore.menuCollapsed ? `calc(100% - 80px)` : `calc(100% - 210px)`
})

// 打开抽屉
const onOpen = (record) => {
  recordData.value = record;
  title.value = recordData.value.tableName + "-代码生成配置"
  // 加载数据
  loadData()
  visible.value = true
}
// 关闭抽屉
const onClose = () => {
  visible.value = false
}
// 加载数据
const loadData = async () => {
  // 获取菜单树
  const menuTreeList = await resourceApi.menuTreeSelector({ })
  treeData.value = menuTreeList.data
  defaultExpandedKeys.value = [treeData.value[0]?.code]
  // 获取详细信息
  let res = await codegenApi.configDetail({ id: recordData.value.id })
  configFormData.value = res.data
}

// 提交
const onSubmit = () => {
  // 保存所有配置
  submitLoading.value = true
  codegenApi.saveConfig(configFormData.value).then((res) => {
    message.success(res.message)
    emit('successful')
    onClose()
  }).catch((res) => {
    message.error(res.message)
  }).finally(() => {
    submitLoading.value = false
  })
}

// 生成代码
const seveGenerate = () => {
  const param = {
    id: recordData.value.tableName
  }
}

// 对外暴露
defineExpose({
  onOpen,
})
</script>
<style scoped>

</style>
