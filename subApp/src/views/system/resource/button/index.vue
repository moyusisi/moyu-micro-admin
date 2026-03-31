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
    <vxe-grid ref="gridRef" v-bind="gridOptions">
      <!-- 左侧操作栏 -->
      <template #operator>
        <a-space wrap style="margin-bottom: 6px">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen(null, module)">新增接口</a-button>
          <a-button danger :icon="h(DeleteOutlined)" @click="gridRef?.commitProxy('delete')">批量删除</a-button>
        </a-space>
      </template>
      <!-- 字段插槽 -->
      <template #code="{row, rowIndex, column, columnIndex}">
        <a @click="detailRef.onOpen(row)">{{ row.code }}</a>
      </template>
      <template #path="{row, rowIndex, column, columnIndex}">
        <a-tag v-if="row.path" :bordered="false">{{ row.path }}</a-tag>
      </template>
      <template #permission="{row, rowIndex, column, columnIndex}">
        <a-tag v-if="row.permission" :bordered="false">{{ row.permission }}</a-tag>
      </template>
      <template #visible="{row, rowIndex, column, columnIndex}">
          <span v-if="row.resourceType === 6" >
            <a-tag v-if="row.visible === 1" color="green">有</a-tag>
            <a-tag v-else>无</a-tag>
          </span>
        <span v-else ></span>
      </template>
      <template #action="{row:record, rowIndex, column, columnIndex}">
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
    </vxe-grid>
  </a-card>
  <Form ref="formRef" @successful="refresh()" />
  <Detail ref="detailRef"/>
</template>

<script setup>
  import resourceApi from '@/api/system/resourceApi.js'

  import { h, ref } from "vue"
  import { useRoute, useRouter } from "vue-router";
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined, UpOutlined, DownOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"
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
  const gridRef = ref()
  const gridOptions = ref({
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
      { field: 'name', title: '名称', width: 150 },
      { field: 'code', title: '唯一编码', width: 150, slots: { default: 'code' } },
      { field: 'path', title: '接口地址', width: 150, slots: { default: 'path' } },
      { field: 'permission', title: '权限标识', width: 150, slots: { default: 'permission' } },
      { field: 'visible', title: '数据权限', width: 80, slots: { default: 'visible' } },
      { field: 'sortNum', title: '排序顺序', width: 80 },
      { field: 'remark', title: '备注' },
      { field: 'updateTime', title: '变更时间', width: 170 },
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
  const loadData = async (parameter) => {
    if (!moduleId.value) {
      await init()
    }
    // 分页参数
    let param = Object.assign(parameter, queryFormData.value)
    param.module = moduleId.value
    return resourceApi.resourcePage(param).then((res) => {
      // res.data 为 {total, records}
      return res.data
    })
  }
  // 模块选择发生变更
  const onModuleChange = (value) => {
    queryFormData.value.module = value
    module.value = moduleList.value.find((e) => e.code === value)
    refresh()
  }

  // 删除
  const deleteButton = (record) => {
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
