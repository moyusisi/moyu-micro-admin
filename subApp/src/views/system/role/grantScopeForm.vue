<template>
  <a-drawer
    title="角色授权-数据权限"
    :open="visible"
    :width="drawerWidth"
    :closable="false"
    :maskClosable="false"
    :destroy-on-close="true"
    @close="onClose"
  >
    <template #extra>
      <a-button type="primary" size="small" @click="onClose"><CloseOutlined /></a-button>
    </template>
    <a-alert message="已授权且有数据权限的接口才可设置数据范围。" type="error" />
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
            <a-form-item name="name" label="接口名称">
              <a-input v-model:value="queryFormData.name" placeholder="搜索接口名称" allowClear />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="searchKey" label="接口地址">
              <a-input v-model:value="queryFormData.searchKey" placeholder="搜索接口地址" allowClear />
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
    <!-- 菜单权限授权表格 -->
    <a-card size="small">
      <a-table size="small" ref="tableRef"
               :columns="columns"
               :data-source="tableData"
               :loading="dataLoading"
               :row-key="(record) => record.code"
               @resizeColumn="onResizeColumn"
               :scroll="{ x: tableWidth }"
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
            <!-- 唯一键点击查看详情 -->
            <a-tooltip :title="text" placement="topLeft">
              <a>{{ text }}</a>
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
          <template v-if="column.dataIndex === 'dataScope'">
            <a-flex vertical>
              <a-radio-group v-model:value="record.dataScope" option-type="button" button-style="solid">
                <!-- 数据范围(字典 1本人 2本机构 3本机构及以下 4本公司及以下 5自定义) -->
                <a-radio-button :value="0">不限制</a-radio-button>
                <a-radio-button :value="1">仅本人</a-radio-button>
                <a-radio-button :value="2">仅本机构</a-radio-button>
                <a-radio-button :value="3">本机构及以下</a-radio-button>
                <a-radio-button :value="4">本公司及以下</a-radio-button>
                <a-radio-button :value="5">自定义</a-radio-button>
              </a-radio-group>
              <OrgTreeSelect v-if="record.dataScope === 5" :tree-data="treeData" :defaultValue="record.scopeList" multiSelect @onChange="(value) => onScopeChange(value, record)"/>
            </a-flex>
          </template>
        </template>
      </a-table>
    </a-card>
    <template #footer>
      <a-flex gap="small" justify="flex-end">
        <a-button @click="onClose">关闭</a-button>
        <a-button type="primary" :loading="submitLoading" @click="onSubmit">保存</a-button>
      </a-flex>
    </template>
  </a-drawer>
</template>

<script setup>
  import resourceApi from "@/api/system/resourceApi.js";
  import orgApi from "@/api/system/orgApi.js";
  import roleApi from '@/api/system/roleApi'
  import { h, ref } from "vue";
  import { message } from "ant-design-vue";
  import { CloseOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue"
  import { useMenuStore } from '@/store/menu'
  import { useUserStore } from '@/store/user'
  import { useSettingsStore } from "@/store/settings";
  import OrgTreeSelect from "@/views/system/components/orgTreeSelect.vue";

  // store
  const settingsStore = useSettingsStore()
  const userStore = useUserStore()
  const menuStore = useMenuStore()

  // 抽屉参数
  const emit = defineEmits({ successful: null })
  const visible = ref(false)
  // 抽屉宽度
  const drawerWidth = computed(() => {
    return settingsStore.menuCollapsed ? `calc(100% - 80px)` : `calc(100% - 210px)`
  })

  // 计算属性 表格宽度 超过宽度则会出现x轴上的scroll
  const tableWidth = computed(() => {
    return settingsStore.menuCollapsed ? `calc(100% - 80px -24px)` : `calc(100% - 210px - 50px - 25px)`
  })

  // 表单数据
  const roleCode = ref('')
  const dataLoading = ref(false)
  const submitLoading = ref(false)

  // 查询表单相关对象
  const queryFormRef = ref()
  // resourceType=6表示按钮
  const queryFormData = ref({ resourceType: 6 })
  // 模块列表
  const moduleList = ref([])
  // 当前选中模块id
  const moduleId = ref()

  /***** 表格相关对象 start *****/
  const tableRef = ref()
  // 表格中的数据(loadData中会更新)
  const tableData = ref([])
  // 组织树
  const treeData = ref([])
  // 表格列配置
  const columns = ref([
    // 不需要序号可以删掉
    {
      title: '序号',
      dataIndex: 'index',
      align: "center",
      resizable: true,
      width: 50,
    },
    {
      title: "接口名称",
      dataIndex: "name",
      align: "center",
      resizable: true,
      ellipsis: true,
      width: 120,
    },
    {
      title: '唯一编码',
      dataIndex: 'code',
      align: "center",
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
      title: "权限标识",
      dataIndex: "permission",
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: "数据范围",
      dataIndex: "dataScope",
      resizable: true,
      ellipsis: true,
      width: 550,
    },
  ]);

  // 打开抽屉
  const onOpen = async (record) => {
    visible.value = true
    roleCode.value = record.code
    await initModuleList()
    await loadTreeData()
    // 再查询授权清单树
    loadData()
  }

  // 提交查询
  const querySubmit = () => {
    loadData()
  }
  // 重置
  const reset = () => {
    queryFormRef.value.resetFields()
  }

  // 初始化
  const initModuleList = async () => {
    if (!moduleId.value) {
      // 若无moduleId, 则查询module列表第一个module的code作为默认moduleId
      const moduleRes = await resourceApi.moduleList()
      moduleList.value = moduleRes.data
      moduleId.value = moduleList.value[0]?.code
    }
  }

  // 加载组织机构树，用于自定义数据范围
  const loadTreeData = async () => {
    // 获取当前登陆者的orgTree 获取所有组织机构可使用orgApi.orgTree
    orgApi.orgTree().then((res) => {
      if (res.data !== null) {
        treeData.value = res.data
      }
    })
  }

  // 加载数据
  const loadData = async (parameter) => {
    if (!moduleId.value) {
      await initModuleList()
    }
    // 查询参数
    let param = { ...queryFormData.value, code: roleCode.value, module: moduleId.value }
    // 查询数据权限列表
    dataLoading.value = true
    const res = await roleApi.permScopeForGrant(param)
    if(res.data) {
      res.data.forEach((record) => {
        if (record.scopes) {
          record.scopeList = record.scopes.split(',')
        } else {
          record.scopeList = []
        }
      })
    }
    tableData.value = res.data
    dataLoading.value = false
  }

  // 可伸缩列
  const onResizeColumn = (w, col) => {
    col.width = w
  }

  // 模块发生变更
  const onModuleChange = (value) => {
    queryFormData.value.module = value
    loadData()
  }

  // 自定义数据范围变更
  const onScopeChange = (value, record) => {
    record.scopeList = value
  }

  // 关闭抽屉
  const onClose = () => {
    // 将这些缓存的给清空
    moduleId.value = ''
    moduleList.value = []
    tableData.value = []
    visible.value = false
  }

  // 验证并提交数据
  const onSubmit = () => {
    // 数据范围列表
    const scopeList = []
    tableData.value.forEach((record) => {
      const scopeInfo = { code: record.code, dataScope: record.dataScope }
      // <!-- 数据范围(字典 1本人 2本机构 3本机构及以下 4本公司及以下 5自定义) -->
      if (record.dataScope === 5 && record.scopeList) {
        scopeInfo.scopes = record.scopeList.join(',');
      } else {
        scopeInfo.scopes = null;
      }
      scopeList.push(scopeInfo)
    })
    const param = {
      code: roleCode.value,
      grantScopeList: [...scopeList]
    }
    submitLoading.value = true
    roleApi.roleGrantScope(param).then((res) => {
      message.success(res.message)
      loadData()
    }).finally(() => {
      submitLoading.value = false
    })
  }
  // 调用这个函数将子组件的一些数据和方法暴露出去
  defineExpose({
    onOpen
  })
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
