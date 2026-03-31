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
    <vxe-grid ref="gridRef" v-bind="gridOptions">
      <!-- 左侧操作栏 -->
      <template #operator>
        <a-space wrap style="margin-bottom: 6px">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen()">新增模块</a-button>
          <a-button danger :icon="h(DeleteOutlined)" @click="gridRef?.commitProxy('delete')">批量删除</a-button>
        </a-space>
      </template>
      <!-- 字段插槽 -->
      <template #code="{row, rowIndex, column, columnIndex}">
        <a @click="detailRef.onOpen(row)">{{ row.code }}</a>
      </template>
      <template #icon="{row, rowIndex, column, columnIndex}">
        <span v-if="row.icon && row.icon !== '#'" >
            <component :is="row.icon"/>
          </span>
        <span v-else />
      </template>
      <template #path="{row, rowIndex, column, columnIndex}">
        <a-tag v-if="row.path" :bordered="false">{{ row.path }}</a-tag>
      </template>
      <template #link="{row, rowIndex, column, columnIndex}">
        <a-tag v-if="row.link" :bordered="false">{{ row.link }}</a-tag>
      </template>
      <template #action="{row:record, rowIndex, column, columnIndex}">
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
    </vxe-grid>
  </a-card>
  <Form ref="formRef" @successful="refresh()" />
  <Detail ref="detailRef"/>
</template>

<script setup>
  import resourceApi from '@/api/system/resourceApi.js'

  import { h, ref } from "vue"
  import { useRoute, useRouter } from "vue-router"
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined, FormOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"
  import Form from "@/views/system/resource/module/form.vue"
  import Detail from "@/views/system/resource/detail.vue"

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
  const gridRef = ref()
  const gridOptions = reactive({
    // 分页配置项
    pagerConfig: {
      enabled: true,
    },
    // 数据代理配置
    proxyConfig: {
      // 获取响应的值配置
      response: {
        // 只对 pager-config 配置时有效，响应结果中获取数据列表的属性（分页场景）
        result: "records",
        // 只对 pager-config 配置时有效，响应结果中获取分页的属性（分页场景）
        total: "total",
      },
      ajax: {
        query: ({ page, sort, sorts, filters, form }) => {
          // 默认接收 Promise<{ result: [], page: { total: 100 } }>
          return loadData({ pageNum: page.currentPage, pageSize: page.pageSize })
        },
        delete: ({ body, form }) => {
          // 删除已选
          const ids = body.removeRecords.map(item => item.id);
          return resourceApi.deleteResource({ ids })
        }
      }
    },
    // 列字段
    columns: [
      { type: 'checkbox', width: 50 },
      { field: 'icon', title: '图标', width: 50, slots: { default: 'icon' } },
      { field: 'name', title: '模块名称', width: 150 },
      { field: 'code', title: '唯一编码', width: 150, slots: { default: 'code' } },
      { field: 'path', title: '路径地址', width: 150, slots: { default: 'path' } },
      { field: 'component', title: '组件', width: 150 },
      { field: 'link', title: '模块主页', width: 150, slots: { default: 'link' } },
      { field: 'remark', title: '备注' },
      { field: 'action', title: '操作', width: 100, slots: { default: 'action' } },
    ],
    // 工具栏配置
    toolbarConfig: {
      // 是否显示个性化列配置
      custom: true,
      // 是否允许最大化显示
      zoom: true,
      // 刷新按钮配置
      refresh: true,
      //插槽
      slots: {
        // 按钮列表
        buttons: "operator",
      },
    },
  })
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
    // reload 返回第一页触发ajax.query
    // query 当前页触发ajax.query
    gridRef.value?.commitProxy("reload")
  }
  // 重置
  const reset = () => {
    queryFormRef.value.resetFields()
    refresh()
  }
  // 重置
  const refresh = () => {
    // 返回第一页触发ajax.query
    gridRef.value?.commitProxy("reload")
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
  // 删除
  const deleteModule = (record) => {
    let data = { ids: [record.id] }
    resourceApi.deleteResource(data).then((res) => {
      message.success(res.message)
      refresh()
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
