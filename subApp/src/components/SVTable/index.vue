<template>
  <div class="table-wrapper">
    <div class="table-tool">
      <!--  左侧操作区 -->
      <div class="table-tool-left">
        <!-- 插槽操作按钮 -->
        <slot name="operator"></slot>
      </div>
      <!--  右侧操作区 -->
      <div class="table-tool-right">
      </div>
    </div>
    <!--  表格组件必须指定宽高，否则不显示。 style="min-width: 100px; min-height: 100px"  @onButtonClick="onButtonClick"  -->
    <ListTable ref="vTableRef" :options="tableOptions" :records="records" width="100" height="100"
               @initialized="initTableInstance" @ready="initTableInstance">
      <ListColumn v-if="props.rowKey" cellType="checkbox" headerType="checkbox" field="" min-width="50"
                  max-width="50"/>
      <template v-for="(column, index) in columns" :key="index">
        <ListColumn v-bind:="column"/>
      </template>
      <template>
        <slot></slot>
      </template>
      <!--   最后一列操作栏   -->
      <ListColumn v-if="props.opConfig?.show" field="null" title="操作" :headerStyle="{'textAlign':'center'}">
        <template #customLayout="{ table, row, col, rect, record, height, width }">
          <Group :width="width" :height="height" display="flex" align-items="center">
            <template v-for="(item, index) in opList" :key="index">
              <Text :text="item.text" :fontSize="item.fontSize" :fill="item.color" cursor="pointer"
                    :boundsPadding="item.padding" @click="opClick(item.name, record)"/>
            </template>
          </Group>
        </template>
      </ListColumn>
    </ListTable>
    <a-card size="small" :bordered="false" align="right">
      <a-pagination v-if="props.showPagination" size="small"
                    :current="pagination.pageNum"
                    :total="pagination.total"
                    :page-size="pagination.pageSize"
                    :hideOnSinglePage="true"
                    :showSizeChanger="true"
                    :pageSizeOptions="props.pageSizeOptions"
                    :show-total="(total, range) => `${range[0]}-${range[1]} 共 ${total} 条`"
                    @change="onPageChange"
      />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { VTable, ListTable, ListColumn, Group, Text } from '@visactor/vue-vtable';
import { h } from "vue";
import {
  PlusOutlined,
  MinusOutlined,
  FormOutlined,
  DeleteOutlined,
  RedoOutlined,
  SearchOutlined
} from "@ant-design/icons-vue";
import { OpText } from "@/types/global";

// 组件props
const props = defineProps({
      columns: {
        type: Array,
        required: true,
      },
      // 加载表格数据的方法
      loadData: {
        type: Function,
        required: true
      },
      // 分页参数设置
      showPagination: {
        type: Boolean,
        default: true
      },
      pageNum: {
        type: Number,
        default: 1
      },
      pageSize: {
        type: Number,
        default: 10
      },
      pageSizeOptions: {
        type: Array,
        default: () => ['10', '20', '50', '100']
      },
      // 尾列操作栏
      opConfig: {
        type: Object,
        default: () => ({
          show: true,
          // 点击时触发opClick事件
          opList: ['edit', 'delete']
        })
      },
      // 行选择的key 选择变化时触发 rowSelectChange 事件
      rowKey: {
        type: [String, Function],
        required: false,
      },
    }
)

// 通过checkbox选中的行key集合
const selectedRowKeys = ref([])
const selectedRows = ref([])

// 行内操作列表
const opList = ref<OpText[]>([]);

// 表格数据
const records = ref([])
// 分页参数
const pagination = ref({
  pageNum: props.pageNum,
  pageSize: props.pageSize,
  total: 10,
})
// 表格引用
const vTableRef = ref()
// vTable实例,必须在创建好之后才能获取到 tableInstance = new VTable.ListTable(document.getElementById(ID), option);
const tableInstanceRef = ref()
// 表格配置
const tableOptions = ref({
  columns: props.columns,
  // 自动计算宽度，最大450
  widthMode: "autoWidth",
  // 少时自动撑满 默认false
  autoFillWidth: true,
  // 如果设置 'auto', 会根据表格内容高度撑开 canvas
  canvasHeight: 'auto',
  // 选中高亮整行整列
  select: {
    highlightMode: 'row'  // 可以配置为'cross' 或者 'row' 或者 'column'
  },
  // 选择复制单元格内容
  keyboardOptions: {
    copySelected: true
  },
  // hover交互的模式
  hover: {
    highlightMode: 'cross'
  },
  // 提示弹框
  tooltip: {
    /** 是否显示缩略文字提示框 */
    isShowOverflowTextTooltip: true,
    /** 缩略文字提示框 延迟消失时间 */
    overflowTextTooltipDisappearDelay: 50,
  },
  // 拖拽换位功能
  dragOrder: {
    dragHeaderMode: "all"
  },
  // 序号
  // rowSeriesNumber: {
  //   title: '序号',
  //   width: 'auto',
  // },
  // 入场动画
  // animationAppear: {
  //   duration: 40,
  //   delay: 10,
  //   type: 'one-by-one', // 支持 all 和 one-by-one
  //   direction: 'row' // 支持 row 和 column
  // }
})

// 加载表格数据 total, records
const loadListData = () => {
  // 获取请求数据
  props.loadData(pagination.value).then((data) => {
    pagination.value.total = data.total
    records.value = data.records
  })
}

// 页码或 pageSize 改变的回调，参数是改变后的页码及每页条数
const onPageChange = (page, pageSize) => {
  // console.log("onPageChange", page, pageSize)
  pagination.value.pageNum = page
  pagination.value.pageSize = pageSize
  // 获取请求数据
  loadListData()
}

// 定义触发事件
const emit = defineEmits(['opClick', 'rowSelectChange'])
const opClick = (name, record) => {
  // 传递被点击的操作
  emit('opClick', name, record)
}

// 初始化vTable实例
const initTableInstance = (instance?: any) => {
  // 通过vue引用获取实例，必须在创建好之后才能获取到
  // tableInstanceRef.value = vTableRef.value.vTableInstance
  // 通过回调获取实例
  tableInstanceRef.value = instance
  // console.log("initialized", instance)

  const tableInstance = tableInstanceRef.value

  // 复选框点击事件
  tableInstance.on('checkbox_state_change', args => {
    const { col, row, value, dataValue, checked, field, originData } = args
    // console.log('checkbox_state_change', args);
    // 表头
    if (row === 0) {
      if (checked) {
        // 全选
        // console.log('全选');
        records.value.forEach((record) => {
          const key = (typeof props.rowKey === 'function' && props.rowKey(record)) || record[props.rowKey]
          selectedRowKeys.value.push(key)
          selectedRows.value.push(record)
        })
      } else {
        // console.log('取消全选');
        selectedRowKeys.value = []
        selectedRows.value = []
      }
    } else {
      // 非表头，点击时要么选中 要么取消选中
      const record = originData // tableInstance.getCellOriginRecord(col, row)
      const key = (typeof props.rowKey === 'function' && props.rowKey(record)) || record[props.rowKey]
      if (!selectedRowKeys.value?.includes(key)) {
        // 不包含，说明之前没选中，本次为选中
        selectedRowKeys.value.push(key)
        selectedRows.value.push(record)
      } else {
        // 包含，说明之前选中了，本次为取消选中
        const index = selectedRowKeys.value?.findIndex((itemKey) => itemKey === key)
        selectedRowKeys.value.splice(index, 1)
        selectedRows.value.splice(index, 1)
      }
    }
    // console.log('selectedRowKeys变化', selectedRowKeys.value);
    emit('rowSelectChange', selectedRowKeys.value, selectedRows.value)
  });
}

// 初始化行内操作列表
const initOpList = () => {
  // 行内操作的默认属性
  const opObject = {
    name: "example",
    text: "示例",
    color: "#1677FF",
    fontSize: 14,
    padding: [0, 0, 0, 10],
  }
  if (props.opConfig?.opList && props.opConfig?.opList.length > 0) {
    props.opConfig.opList.forEach(item => {
      if (typeof item === 'string') {
        // 默认提供几个操作
        if (item === 'add') {
          opList.value.push(Object.assign({}, opObject, { name: "add", text: "新增" }))
        } else if (item === 'edit') {
          opList.value.push(Object.assign({}, opObject, { name: "edit", text: "编辑" }))
        } else if (item === 'delete') {
          opList.value.push(Object.assign({}, opObject, { name: "delete", text: "删除", color: "#FF4D4F" }))
        }
      } else if (typeof item === 'object') {
        opList.value.push(Object.assign({}, opObject, item))
      }
    })
  }

}

// 初始化
const init = () => {
  initOpList()
  loadListData()
}

// 清空 table 已选中项
const clearSelected = () => {
  if (selectedRowKeys.value && selectedRowKeys.value.length > 0) {
    selectedRowKeys.value = []
    selectedRows.value = []
    emit('rowSelectChange', selectedRowKeys.value, selectedRows.value)
  }
}

// 刷新
const refresh = (bool = false) => {
  if (bool) {
    // 重置分页参数
    pagination.value.pageNum = props.pageNum
    pagination.value.pageSize = props.pageSize
  }
  clearSelected()
  loadListData()
}

// 暴露子组件的方法
defineExpose({
  refresh,
})
onMounted(() => {
  init()
  // 必须放在数据加载之后
  // initTableInstance()
})

</script>

<style scoped>

</style>