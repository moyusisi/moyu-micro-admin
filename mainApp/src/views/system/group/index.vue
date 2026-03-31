<template>
  <!-- 上方查询区 -->
  <a-card size="small">
    <a-form ref="queryFormRef" :model="queryFormData">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-form-item name="orgCode" label="组织机构">
            <OrgTreeSelect ref="treeRef" @onChange="orgChange"/>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item name="code" label="唯一编码">
            <a-input v-model:value="queryFormData.code" placeholder="请输入编码" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item name="name" label="岗位名称">
            <a-input v-model:value="queryFormData.name" placeholder="搜索岗位名称" allowClear />
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
    <!--  表格数据区  -->
    <vxe-grid ref="gridRef" v-bind="gridOptions">
      <!-- 左侧操作栏 -->
      <template #operator>
        <a-space wrap style="margin-bottom: 6px">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen(null, treeRef.treeData, queryFormData.orgCode)">新增</a-button>
          <a-button danger :icon="h(DeleteOutlined)" @click="gridRef?.commitProxy('delete')">批量删除</a-button>
        </a-space>
      </template>
      <!-- 字段插槽 -->
      <template #code="{row, rowIndex, column, columnIndex}">
        <a @click="openDetail(row)">{{ row.code }}</a>
      </template>
      <template #permission="{row, rowIndex, column, columnIndex}">
        <a-tag v-if="row.permission" :bordered="false">{{ row.permission }}</a-tag>
      </template>
      <template #status="{row, rowIndex, column, columnIndex}">
        <a-tag v-if="row.status === 0" color="green">正常</a-tag>
        <a-tag v-else>已停用</a-tag>
      </template>
      <template #action="{row, rowIndex, column, columnIndex}">
        <a-space>
          <a-tooltip title="岗位角色">
            <a style="color:#1980FF;" @click="groupRoleRef.onOpen(row)"><DeploymentUnitOutlined /></a>
          </a-tooltip>
          <a-divider type="vertical" />
          <a-tooltip title="用户列表">
            <a style="color:#53C61D;" @click="groupUserRef.onOpen(row, treeRef.treeData)"><UsergroupAddOutlined /></a>
          </a-tooltip>
          <a-divider type="vertical" />
          <a-tooltip title="编辑">
            <a @click="formRef.onOpen(row, treeRef.treeData)"><FormOutlined /></a>
          </a-tooltip>
          <a-divider type="vertical" />
          <a-tooltip title="删除">
            <a-popconfirm title="确定要删除吗？" @confirm="deleteGroup(row)">
              <a style="color:#FF4D4F;"><DeleteOutlined/></a>
            </a-popconfirm>
          </a-tooltip>
        </a-space>
      </template>
    </vxe-grid>
  </a-card>
  <Form ref="formRef" @successful="refresh()" />
  <Detail ref="detailRef"/>
  <GroupRole ref="groupRoleRef" @successful="refresh()" />
  <GroupUser ref="groupUserRef" @successful="refresh()" />
</template>

<script setup>
  import groupApi from '@/api/system/groupApi'
  import { h, ref } from "vue"
  import { useRoute, useRouter } from "vue-router";
  import { message } from "ant-design-vue"
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined, DownOutlined, UpOutlined } from "@ant-design/icons-vue"
  import Form from "./form.vue"
  import Detail from "./detail.vue"
  import GroupRole from './groupRole.vue'
  import GroupUser from './groupUser.vue'
  import OrgTreeSelect from "@/views/system/components/orgTreeSelect.vue"

  // store
  const route = useRoute();
  const router = useRouter();

  // 查询表单相关对象
  const queryFormRef = ref()
  const queryFormData = ref({})
  // 定义treeRef
  const treeRef = ref()

  // 其他页面操作
  const formRef = ref()
  const detailRef = ref()
  const groupUserRef = ref()
  const groupRoleRef = ref()

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
          return groupApi.deleteGroup({ ids })
        }
      }
    },
    // 列字段
    columns: [
      { type: 'checkbox', width: 50 },
      { field: 'name', title: '岗位名称', width: 150 },
      { field: 'code', title: '唯一编码', width: 150, slots: { default: 'code' } },
      { field: 'orgName', title: '所属组织机构', width: 200 },
      { field: 'status', title: '状态', width: 80, slots: { default: 'status' } },
      { field: 'sortNum', title: '排序顺序', width: 80 },
      { field: 'remark', title: '备注' },
      { field: 'updateTime', title: '修改时间', width: 170 },
      { field: 'action', title: '操作', width: 200, slots: { default: 'action' } },
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
    return groupApi.groupPage(param).then((res) => {
      // res.data 为 {total, records}
      return res.data
    }).catch((err) => {
      console.error(err)
    })
  }
  // 组织机构变更
  const orgChange = (value) => {
    queryFormData.value.orgCode = value
  }
  // 删除
  const deleteGroup = (record) => {
    let data = { ids: [record.id] }
    groupApi.deleteGroup(data).then((res) => {
      message.success(res.message)
      refresh()
    })
  }
  // 打开详情页
  const openDetail = (row) => {
    detailRef.value.onOpen(row)
    // 独立页面打开(与抽屉打开二选一)
    // router.push({ path: "/system/sysGroup/detail", query: { id: row.id } })
  }
</script>

<style scoped>
  /** 后代选择器 **/
  .ant-card .ant-form {
    margin-bottom: -12px !important;
  }
  .ant-card .ant-form-item {
    margin-bottom: 12px !important;
  }
</style>