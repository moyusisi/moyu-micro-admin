<template>
  <a-drawer
    title="角色授权-功能权限"
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
    <a-spin :spinning="spinningLoading">
      <a-space style="margin-bottom: 10px;">
        <a-radio-group v-model:value="moduleId" button-style="solid">
          <a-radio-button v-for="module in moduleDataList" :key="module.code" :value="module.code" @click="moduleChange(module.code)">
            <component :is="module.icon" /> {{ module.name }}
          </a-radio-button>
        </a-radio-group>
      </a-space>
      <!-- 菜单权限授权表格 -->
      <a-table size="small" ref="tableRef"
               :columns="columns"
               :data-source="tableData"
               :row-key="(record) => record.code"
               :row-selection="rowSelection"
               :pagination="false"
               :defaultExpandedRowKeys="defaultExpandedRowKeys"
               bordered>
        <template #bodyCell="{ column, record, index, text }">
          <template v-if="column.dataIndex === 'name'">
            <!-- 长文本省略提示 -->
            <a-tooltip :title="text" placement="top">
              <span v-if="record.resourceType === 1">
                <a-tag color="orange">模块</a-tag>{{ record.name }}
              </span>
              <span v-if="record.resourceType === 2">
                <a-tag color="cyan">目录</a-tag>{{ record.name }}
              </span>
              <span v-if="record.resourceType === 3">
                <a-tag color="blue">菜单</a-tag>{{ record.name }}
              </span>
              <span v-if="record.resourceType === 4">
                <a-tag color="gold">内链</a-tag>{{ record.name }}
              </span>
              <span v-if="record.resourceType === 5">
                <a-tag color="green">链接</a-tag>{{ record.name }}
              </span>
              <span v-if="record.resourceType === 6">
                <a-tag color="purple">按钮</a-tag>{{ record.name }}
              </span>
            </a-tooltip>
          </template>
          <template v-if="column.dataIndex === 'resourceType'">
            <a-tag v-if="record.resourceType === 1" color="orange">模块</a-tag>
            <a-tag v-if="record.resourceType === 2" color="cyan">目录</a-tag>
            <a-tag v-if="record.resourceType === 3" color="blue">菜单</a-tag>
            <a-tag v-if="record.resourceType === 4" color="gold">内链</a-tag>
            <a-tag v-if="record.resourceType === 5" color="green">链接</a-tag>
            <a-tag v-if="record.resourceType === 6" color="purple">按钮</a-tag>
          </template>
          <template v-if="column.dataIndex === 'icon'">
            <span v-if="record.icon && record.icon !== '#'" >
              <component :is="record.icon"/>
            </span>
            <span v-else />
          </template>
          <template v-if="column.dataIndex === 'code'">
            <!-- 唯一键点击查看详情 -->
            <a-tooltip :title="text" placement="topLeft">
              <a @click="null">{{ text }}</a>
            </a-tooltip>
          </template>
          <template v-if="column.dataIndex === 'buttonList'">
            <a-space v-if="record.allButtonList">
              <a-checkbox-group v-model:value="record.grantButtonList"
                        @change="(evt) => onButtonChange(evt, record)">
                <a-checkbox v-for="item in record.allButtonList" :checked="item.checked"
                      :key="item.code" :value="item.code">
                  {{ item.name }}
                </a-checkbox>
              </a-checkbox-group>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-spin>
    <template #footer>
      <a-flex gap="small" justify="flex-end">
        <a-button @click="onClose">关闭</a-button>
        <a-button type="primary" :loading="submitLoading" @click="onSubmit">保存</a-button>
      </a-flex>
    </template>
  </a-drawer>
</template>

<script setup>
  import roleApi from '@/api/system/roleApi'
  import { ref } from "vue";
  import { message } from "ant-design-vue";
  import { CloseOutlined, DeleteOutlined } from "@ant-design/icons-vue"
  import { useMenuStore } from '@/store/menu'
  import { useUserStore } from '@/store/user'
  import { useSettingsStore } from "@/store/settings";

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

  // 表单数据
  const roleCode = ref('')
  const moduleId = ref('')
  const spinningLoading = ref(false)
  const submitLoading = ref(false)

  /***** 表格相关对象 start *****/
  const tableRef = ref()
  // 所有模块的菜单数据(loadData中会更新)
  const moduleDataList = ref([])
  // 表格中的数据(loadData中会更新)
  const tableData = ref([])
  // 已选中的菜单(loadData中会更新)
  const selectedRowKeys = ref([])
  // 默认展开的行(loadData中会更新)
  const defaultExpandedRowKeys = ref([])
  // 列表选择配置
  const rowSelection = ref({
    checkStrictly: false,
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      selectedRowKeys.value = selectedKeys
      console.log('onChange,selectedKeys:', selectedKeys);
    },
    onSelect: (record, selected, selectedRows) => {
      // 取消选择时，menu下的按钮也要取消，同时递归取消子节点下已授权按钮
      if (selected === false) {
        cleanGrantButtonList([record])
      }
    }
  });
  // 表格列配置
  const columns = [
    {
      title: '菜单权限',
      dataIndex: 'name',
      resizable: true,
      ellipsis: true,
      width: 200
    },
    {
      title: '按钮权限',
      dataIndex: 'buttonList',
      resizable: true,
      ellipsis: true,
    }
  ]

  // 打开抽屉
  const onOpen = (record) => {
    visible.value = true
    roleCode.value = record.code
    // 再查询授权清单树
    loadData()
  }
  // 加载数据
  const loadData = async (parameter) => {
    // 已有数据不重复查询
    if (moduleDataList.value.length > 0) {
      // 选中模块的菜单权限清单
      tableData.value = moduleDataList.value.find((e) => e.code === moduleId.value).children
    } else {
      // 菜单权限树
      spinningLoading.value = true
      const res = await roleApi.menuTreeForGrant({ code: roleCode.value })
      moduleDataList.value = res.data
      moduleId.value = moduleDataList.value[0].code
      tableData.value = moduleDataList.value[0].children
      spinningLoading.value = false
    }
    // 选中有权限的行，同时展开所有行
    selectedRowKeys.value = getCheckedMenuList(tableData.value)
  }

  // 通过应用分菜单
  const moduleChange = (value) => {
    moduleId.value = value
    loadData()
  }
  // 按钮授权列表变更
  const onButtonChange = (evt, record) => {
    // 选中按钮时，若菜单未选中，则需要选中菜单
    if (evt.length > 0 && selectedRowKeys.value.indexOf(record.code) === -1) {
      selectedRowKeys.value = [...selectedRowKeys.value, record.code]
      record.checked = true
    }
  }
  // 关闭抽屉
  const onClose = () => {
    // 将这些缓存的给清空
    moduleId.value = ''
    moduleDataList.value = []
    tableData.value = []
    visible.value = false
    emit('successful')
  }
  // 获取有权限的菜单列表(初始化选中菜单时用)
  const getCheckedMenuList = (recordList) => {
    if (!recordList) {
      return []
    }
    const selectedList = []
    recordList.forEach((record) => {
      // 选中状态的记录则有权限
      if (record.checked) {
        selectedList.push(record.code)
      }
      // 如果有子节点,继续遍历子节点的列表
      if (record.children) {
        const list = getCheckedMenuList(record.children)
        selectedList.push(...list)
        // 默认展开的行，有子节点就展开
        defaultExpandedRowKeys.value.push(record.code)
      }
    })
    return selectedList
  }
  // 清空节点下的按钮权限(取消父节点时用)
  const cleanGrantButtonList = (recordList) => {
    const selectedList = []
    recordList.forEach((record) => {
      // selectedRowKeys还未更新，不能通过selectedRowKeys.value.indexOf(record.code) === -1)判定
      // 存在授权的按钮则清空
      if (record.grantButtonList) {
        // 用.slice(0)重新设置一遍list，强制刷新，参考：https://www.cnblogs.com/wiliam/p/13892649.html
        record.grantButtonList.splice(0, record.grantButtonList.length)
      }
      // 如果有子节点,继续遍历子节点的列表
      if (record.children) {
        cleanGrantButtonList(record.children)
      }
    })
    return selectedList
  }
  // 收集选中的按钮权限(提交之前用)
  const collectGrantButtonList = (recordList) => {
    const checkedList = []
    recordList.forEach((record) => {
      // 选中状态的记录则有权限
      if (record.grantButtonList) {
        checkedList.push(...record.grantButtonList)
      }
      // 如果有子节点,继续遍历子节点的列表
      if (record.children) {
        const list = collectGrantButtonList(record.children)
        checkedList.push(...list)
      }
    })
    return checkedList
  }
  // 验证并提交数据
  const onSubmit = () => {
    // 收集所有的已选菜单和已选按钮
    const buttonList = tableData.value ? collectGrantButtonList(tableData.value) : []
    const menuList = selectedRowKeys.value
    const param = {
      code: roleCode.value,
      module: moduleId.value,
      grantMenuList: [...menuList, ...buttonList]
    }
    submitLoading.value = true
    roleApi.roleGrantMenu(param).then((res) => {
      message.success(res.message)
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

</style>
