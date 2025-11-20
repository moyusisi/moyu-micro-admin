<template>
  <!-- 表格上方操作区 -->
  <a-row>
    <!-- 左上方操作区插槽 -->
    <a-col :span="20">
      <slot name="operator"></slot>
    </a-col>
    <!-- 右上方工具栏 -->
    <a-col :span="4" v-if="props.tool.refresh || props.tool.columnSetting || props.tool.height" style="min-height: 28px">
      <a-flex gap="small" class="tool-area" justify="flex-end" align="flex-center">
        <!-- 刷新 -->
        <a-tooltip v-if="props.tool.refresh" title="刷新" @click="refresh">
          <sync-outlined class="tool-icon" />
        </a-tooltip>
        <!-- 列展示 -->
        <a-popover v-if="props.tool.columnSetting" trigger="click" placement="topLeft" arrow-point-at-center>
          <template #content>
            <columnSetting :columns="props.columns" @columnChange="columnChange" />
          </template>
          <a-tooltip title="列设置">
            <component class="tool-icon" is="setting-outlined"></component>
          </a-tooltip>
        </a-popover>
        <!-- 表格密度 -->
        <a-dropdown v-if="props.tool.height" trigger="click">
          <template #overlay>
            <a-menu selectable :selectedKeys="[localData.size]" @click="changeSize">
              <a-menu-item key="large">宽松</a-menu-item>
              <a-menu-item key="middle">中等</a-menu-item>
              <a-menu-item key="small">紧凑</a-menu-item>
            </a-menu>
          </template>
          <a-tooltip title="表格密度">
            <component class="tool-icon" is="column-height-outlined"></component>
          </a-tooltip>
        </a-dropdown>
      </a-flex>
    </a-col>
  </a-row>
  <a-table v-bind="{...renderTableProps}"
           ref="tableRef"
           :loading="dataLoading"
           :row-key="props.rowKey"
           @change="onChange"
           @expand="onExpand"
           @resizeColumn="onResizeColumn"
           @expandedRowsChange="onExpandedRowsChange"
           :scroll="{ x: tableWidth }"
           bordered
  >
    <template v-for="slotKey in slotKeys" #[slotKey]="scope" >
      <slot v-if="slotKey" :name="slotKey" :scope="scope" v-bind="scope || {}"></slot>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { ref, onMounted, useSlots, h } from 'vue'
import { tableProps } from 'ant-design-vue/es/table/Table.js'
import { DeleteOutlined, PlusOutlined, SyncOutlined } from "@ant-design/icons-vue"
import { useSettingsStore } from "@/store"
import columnSetting from "@/components/MTable/columnSetting.vue"

// store
const settingsStore = useSettingsStore()
// 自动获取父组件传递过来的插槽
const slots = useSlots()
// 所有的事件均参考官方文档 https://www.antdv.com/components/table-cn#api
const emit = defineEmits(['selectedChange', 'change', 'expand', 'expandedRowsChange'])
// 计算属性 获取父组件过来的插槽数量，便于循环
const slotKeys = computed(() => {
  return Object.keys(slots)
})
// 计算属性 表格宽度 超过宽度则会出现x轴上的scroll
const tableWidth = computed(() => {
  return settingsStore.menuCollapsed ? `calc(100% - 80px -24px)` : `calc(100% - 210px -24px)`
})

// 组件props 通过tableProps()支持Table原属性
const props = defineProps(
    Object.assign({}, tableProps(), {
      rowKey: {
        type: [String, Function],
        default: "id"
      },
      // 数据加载函数
      loadData: {
        type: Function,
        required: true
      },
      // 是否展示行选择，为true时会产生事件selectedChange
      showRowSelection: {
        type: Boolean,
        default: false
      },
      // 配置工具栏
      tool: {
        type: Object,
        default: () => ({
          refresh: true,
          height: true,
          columnSetting: true
        })
      }
    })
)
// 表格props，在a-table中后面设置属性会覆盖renderTableProps的同名属性
const renderTableProps = ref({})

const tableRef = ref()
// 表格的加载状态
const dataLoading = ref(false)
// 已选中的行
const selectedRowKeys = ref([])
// 表格行选择配置
const rowSelection = ref({
  selectedRowKeys: selectedRowKeys,
  onChange: (selectedKeys, selectedRows) => {
    selectedRowKeys.value = selectedKeys
    // console.log('MTable.localData.rowSelection中的onChange,selectedKeys:', selectedKeys);
    emit('selectedChange', selectedKeys, selectedRows)
  }
});
// 表格的分页配置
const paginationRef = ref({
  // 当前页码
  current: 1,
  // 每页显示条数
  pageSize: 10,
  // 总条数，需要通过接口获取
  total: 0,
  // 显示总记录数
  showTotal: (total, range) => `共 ${total} 条 `,
  // 是否可改变每页显示条数
  showSizeChanger: true,
  // 只有一页或没有数据时隐藏分页栏
  // hideOnSinglePage: true,
  onChange: (page, pageSize) => {
    // console.log('MTable.localData.pagination中的onChange...')
    // 处理分页切换的逻辑
    paginationRef.value.current = page
    paginationRef.value.pageSize = pageSize
  },
})


// 本地数据, 同名属性会赋值renderTableProps并重新渲染
const localData = reactive({
  /***** tableProps的同名属性 *****/
  dataSource: [],
  size: props.size || "middle",
  // 不设置分页时，默认配置分页。支持pagination设置为false，所以必须使用null判断
  pagination: props.pagination == null ? paginationRef.value : props.pagination,

  /***** 非tableProps的同名属性 *****/
  columnsSetting: [],
  // 本地配置, 无props时使用
  localRowSelection: rowSelection.value,
})

// 加载完毕调用
onMounted(() => {
  // @ts-ignore
  localData.columnsSetting = props.columns
  loadTableData()
})
// 加载表格中的数据
const loadTableData = () => {
  if (!props.loadData) {
    console.error("loadData不是函数，无法加载数据")
    return
  }
  dataLoading.value = true
  // 重新加载数据时，清空之前选中的行
  clearSelected()
  let param = { }
  // 若有分页，设置分页参数
  if (localData.pagination) {
    param = { pageNum: localData.pagination.current, pageSize: localData.pagination.pageSize }
  }
  props.loadData(param).then((data) => {
    if (localData.pagination) {
      localData.pagination.total = data.total
    }
    localData.dataSource = data instanceof Array ? data : data.records
    dataLoading.value = false
    getTableProps()
  }).catch((err) => {
    console.error(err)
  }).finally(() => {
    dataLoading.value = false
  })
}

// 动态加载table的props
const getTableProps = () => {
  let renderProps = Object.assign(tableProps(), props)
  const localKeys = Object.keys(localData)
  const propsKeys = Object.keys(renderProps)
  // localData中的同名属性赋值给renderProps
  localKeys.forEach((key) => {
    if (propsKeys.includes(key)) {
      renderProps[key] = localData[key]
    }
  })
  // 非同名属性的处理及赋值
  // @ts-ignore
  renderProps.columns = localData.columnsSetting.filter((value) => value.checked === undefined || value.checked)
  // 不设置 rowSelection 时, 使用props。设置 rowSelection 时 优选 props 其次 local
  if (props.showRowSelection) {
    // @ts-ignore 优选 props 其次 local
    renderProps.rowSelection = props.rowSelection || localData.localRowSelection
  }
  renderProps = {
    ...renderProps,
    // @ts-ignore
    columns: localData.columnsSetting.filter((value) => value.checked === undefined || value.checked),
  }
  // 将值为 undefined 或者 null 的 table里props属性进行过滤
  renderTableProps.value = Object.fromEntries(Object.entries(renderProps).filter(([k,v]) => v != null))
}

// 分页、排序、筛选变化时触发
const onChange = (pagination, filters, sorter) => {
  loadTableData()
  // console.log('MTable中的onChange...')
  emit('change', pagination, filters, sorter)
}
// 点击展开图标时触发
const onExpand = (expanded, record) => {
  // console.log('MTable中的expanded...')
  emit('expand', expanded, record)
}

// 点击展开图标时触发
const onExpandedRowsChange = (expandedRows) => {
  emit('expandedRowsChange', expandedRows)
}
// 可伸缩列
const onResizeColumn = (w, column) => {
  column.width = w
}

// 刷新
const refresh = (bool = false) => {
  if (bool) {
    paginationRef.value.current = 1
  }
  loadTableData()
}

// 表格大小切换
const changeSize = (v) => {
  localData.size = v.key
  getTableProps()
}
// 列设置
const columnChange = (v) => {
  localData.columnsSetting = v
  getTableProps()
}
// 清空 table 已选中项
const clearSelected = () => {
  if (props.rowSelection) {
    props.rowSelection.selectedRowKeys = []
    // @ts-ignore
    props.rowSelection.onChange([], [])
  } else {
    localData.localRowSelection.onChange([], [])
  }
}

// 声明额外的选项
defineExpose({
  refresh
})

</script>


<style scoped>
/** 操作区 **/
.tool-area {
  width: 100%;
  height: 100%;
}
/** 操作区图标 **/
.tool-icon {
  font-size: 16px;
}
/** 长文本截断,超过200px省略(约26个字母，15个汉字的长度) **/
.large-text {
  display: inline-block;
  width: 200px;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
}
</style>