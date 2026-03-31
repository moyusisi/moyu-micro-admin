<template>
  <a-card size="small">
    <a-form ref="queryFormRef" :model="queryFormData">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-form-item name="code" label="唯一编码">
            <a-input v-model:value="queryFormData.code" placeholder="请输入编码" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item name="name" label="名称">
            <a-input v-model:value="queryFormData.name" placeholder="搜索名称" allowClear />
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
          <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen()">新增角色</a-button>
          <a-button danger :icon="h(DeleteOutlined)" @click="gridRef?.commitProxy('delete')">批量删除</a-button>
        </a-space>
      </template>
      <!-- 字段插槽 -->
      <template #code="{row, rowIndex, column, columnIndex}">
        <a @click="detailRef.onOpen(row)">{{ row.code }}</a>
      </template>
      <template #status="{row, rowIndex, column, columnIndex}">
        <a-tag v-if="row.status === 0" color="green">正常</a-tag>
        <a-tag v-else>已停用</a-tag>
      </template>
      <template #action="{row:record, rowIndex, column, columnIndex}">
        <a-space>
          <template #split>
            <a-divider type="vertical" />
          </template>
          <a-tooltip title="用户列表">
            <a style="color:#53C61D;" @click="roleUserRef.onOpen(record)"><UserAddOutlined /></a>
          </a-tooltip>
          <a-tooltip title="功能权限">
            <a style="color:#1980FF;" @click="grantMenuFormRef.onOpen(record)"><PicLeftOutlined /></a>
          </a-tooltip>
          <a-tooltip title="数据范围">
            <a style="color:#fa541c;" @click="grantScopeFormRef.onOpen(record)"><ApiOutlined /></a>
          </a-tooltip>
          <a-tooltip title="编辑">
            <a @click="formRef.onOpen(record)"><FormOutlined /></a>
          </a-tooltip>
          <a-tooltip title="删除" v-if="hasPerm('sys:role:delete') || hasRole(['ROOT'])">
            <a-popconfirm title="确定要删除吗？" @confirm="deleteRole(record)">
              <a style="color:#FF4D4F;"><DeleteOutlined/></a>
            </a-popconfirm>
          </a-tooltip>
        </a-space>
      </template>
    </vxe-grid>
  </a-card>
  <GrantMenuForm ref="grantMenuFormRef" @successful="refresh()" />
  <GrantScopeForm ref="grantScopeFormRef" />
  <Form ref="formRef" @successful="refresh()" />
  <Detail ref="detailRef"/>
  <RoleUser ref="roleUserRef" />
</template>

<script setup>
  import roleApi from '@/api/system/roleApi'

  import { h, ref } from "vue"
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined, UserAddOutlined, PicLeftOutlined, ApiOutlined, FormOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"
  import { hasPerm, hasRole } from "@/utils/permission"
  import Form from "./form.vue"
  import Detail from "./detail.vue"
  import GrantMenuForm from "./grantMenuForm.vue"
  import GrantScopeForm from "./grantScopeForm.vue"
  import RoleUser from "./roleUser.vue"

  // 查询表单相关对象
  const queryFormRef = ref()
  const queryFormData = ref({})

  // 其他页面操作
  const formRef = ref()
  const detailRef = ref()
  const grantMenuFormRef = ref()
  const grantScopeFormRef = ref()
  const roleUserRef = ref()

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
          return roleApi.deleteRole({ ids })
        }
      }
    },
    // 列字段
    columns: [
      { type: 'checkbox', width: 50 },
      { field: 'name', title: '角色名称', width: 200 },
      { field: 'code', title: '唯一编码', width: 200, slots: { default: 'code' } },
      { field: 'status', title: '状态', width: 100, slots: { default: 'status' } },
      { field: 'sortNum', title: '排序顺序', width: 100 },
      { field: 'remark', title: '备注' },
      { field: 'updateTime', title: '更新时间', width: 170 },
      { field: 'action', title: '操作', width: 250, slots: { default: 'action' } },
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

  // 表格查询 返回 Promise 对象
  const loadData = (parameter) => {
    let param = Object.assign(parameter, queryFormData.value)
    return roleApi.rolePage(param).then((res) => {
      return res.data
    })
  }
  // 查询
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
  // 删除
  const deleteRole = (record) => {
    let data = { ids: [record.id] }
    roleApi.deleteRole(data).then((res) => {
      message.success(res.message)
      refresh(true)
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
