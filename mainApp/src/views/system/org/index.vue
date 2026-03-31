<template>
  <a-row :gutter="8">
    <!-- 左侧组织树 -->
    <a-col :span="4">
      <OrgTree ref="treeRef" @onSelect="treeSelect"></OrgTree>
    </a-col>
    <!-- 右侧内容 -->
    <a-col :span="20">
      <a-card size="small">
        <a-form ref="queryFormRef" :model="queryFormData">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item name="code" label="编码">
                <a-input v-model:value="queryFormData.code" placeholder="组织编码" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="name" label="名称">
                <a-input v-model:value="queryFormData.name" placeholder="搜索组织名称" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item name="orgType" label="类型">
                <a-select v-model:value="queryFormData.orgType" placeholder="请选择" :options="orgTypeOptions" allowClear />
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
              <a-form-item name="orgLevel" label="组织层级">
                <a-select v-model:value="queryFormData.orgLevel" placeholder="请选择" :options="orgLevelOptions" allowClear />
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
              <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen(null, treeRef.treeData, queryFormData.parentCode)">新增</a-button>
              <a-button danger :icon="h(DeleteOutlined)" @click="gridRef?.commitProxy('delete')">批量删除</a-button>
            </a-space>
          </template>
          <!-- 字段插槽 -->
          <template #code="{row, rowIndex, column, columnIndex}">
            <a @click="openDetail(row)">{{ row.code }}</a>
          </template>
          <template #orgType="{row, rowIndex, column, columnIndex}">
            <a-tag v-if="row.orgType === 1" color="cyan">公司组织</a-tag>
            <a-tag v-if="row.orgType === 2" color="blue">部门机构</a-tag>
            <a-tag v-if="row.orgType === 3" color="purple">虚拟节点</a-tag>
          </template>
          <template #status="{row, rowIndex, column, columnIndex}">
            <a-tag v-if="row.status === 0" color="green">正常</a-tag>
            <a-tag v-else>已停用</a-tag>
          </template>
          <template #action="{row:record, rowIndex, column, columnIndex}">
            <a-space>
              <a-tooltip title="编辑">
                <a @click="formRef.onOpen(record, treeRef.treeData)"><FormOutlined /></a>
              </a-tooltip>
              <a-divider type="vertical" />
              <a-tooltip title="删除">
                <a-popconfirm title="确定要删除吗？" @confirm="deleteOrg(record)">
                  <a style="color:#FF4D4F;"><DeleteOutlined/></a>
                </a-popconfirm>
              </a-tooltip>
            </a-space>
          </template>
        </vxe-grid>
      </a-card>
    </a-col>
  </a-row>
  <Form ref="formRef" @successful="handleSuccess" />
  <Detail ref="detailRef"/>
</template>

<script setup>
  import orgApi from '@/api/system/orgApi'

  import { onActivated, h, ref } from "vue"
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"
  import OrgTree from "../components/orgTree.vue"
  import Form from "./form.vue"
  import Detail from "./detail.vue"

  // 查询表单相关对象
  const queryFormRef = ref()
  const queryFormData = ref({})
  // 是否展示更多搜索条件
  const showMore = ref(false)
  // 组织机构类型(字典 1公司组织 2部门机构 3虚拟节点)
  const orgTypeOptions = [
    { label: "公司组织", value: 1 },
    { label: "部门机构", value: 2 },
    { label: "虚拟节点", value: 3 }
  ]
  // 组织层级(字典 1一级公司 2二级公司 3三级公司)
  const orgLevelOptions = [
    { label: "一级公司", value: 1 },
    { label: "二级公司", value: 2 },
    { label: "三级公司", value: 3 }
  ]
  // 其他页面操作
  const formRef = ref()
  const detailRef = ref()
  // 定义treeRef
  const treeRef = ref()

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
          const codes = body.removeRecords.map(item => item.code);
          return orgApi.deleteOrgTree({ codes })
        }
      }
    },
    // 列字段
    columns: [
      { type: 'checkbox', width: 50 },
      { field: 'code', title: '组织编码', width: 120, slots: { default: 'code' } },
      { field: 'name', title: '组织名称' },
      { field: 'orgType', title: '组织类型', width: 100, slots: { default: 'orgType' } },
      { field: 'orgLevel', title: '组织层级', width: 80 },
      { field: 'sortNum', title: '排序', width: 80 },
      { field: 'status', title: '状态', width: 80, slots: { default: 'status' } },
      { field: 'updateTime', title: '修改时间', width: 170 },
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

  // 加载完毕调用
  onMounted(() => {
    // console.log("org/index onMounted...")
  })

  // 调用时机为首次挂载 以及 每次从缓存中被重新插入时
  onActivated(() => {
    // console.log("org/index onActivated...")
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
  // 表格查询 返回 Promise 对象
  const loadData = (parameter) => {
    // 分页参数
    let param = Object.assign(parameter, queryFormData.value)
    return orgApi.orgPage(param).then((res) => {
      // res.data 为 {total, records}
      return res.data
    }).catch((err) => {
      console.error(err)
    })
  }
  // 点击树查询
  const treeSelect = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      queryFormData.value.parentCode = selectedKeys.toString()
    } else {
      delete queryFormData.value.parentCode
    }
    refresh()
  }
  // 删除
  const deleteOrg = (record) => {
    let data = { codes: [record.code] }
    orgApi.deleteOrgTree(data).then((res) => {
      message.success(res.message)
      refresh()
    })
  }
  // 打开详情页
  const openDetail = (row) => {
    detailRef.value.onOpen(row, treeRef.value)
    // 独立页面打开(与抽屉打开二选一)
    // router.push({ path: "/system/sysOrg/detail", query: { id: row.id } })
  }
  // 成功回调
  const handleSuccess = () => {
    treeRef.value.refresh()
    refresh()
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
