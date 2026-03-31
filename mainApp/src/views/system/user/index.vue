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
              <a-form-item name="account" label="账号">
                <a-input v-model:value="queryFormData.account" placeholder="请输入账号" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="name" label="姓名">
                <a-input v-model:value="queryFormData.name" placeholder="搜索姓名" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item name="phone" label="手机">
                <a-input v-model:value="queryFormData.phone" placeholder="请输入手机" allowClear />
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
              <a-form-item name="userId" label="userId">
                <a-input v-model:value="queryFormData.userId" placeholder="请输入userId" allowClear />
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
              <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen(null, treeRef.treeData, queryFormData.orgCode)">新增用户</a-button>
              <a-button danger :icon="h(DeleteOutlined)" @click="gridRef?.commitProxy('delete')">批量删除</a-button>
            </a-space>
          </template>
          <!-- 字段插槽 -->
          <template #account="{row, rowIndex, column, columnIndex}">
            <a @click="openDetail(row)">{{ row.account }}</a>
          </template>
          <template #gender="{row, rowIndex, column, columnIndex}">
            <a-tag v-if="row.gender === 1" color="blue">男</a-tag>
            <a-tag v-else-if="row.gender === 2" color="pink">女</a-tag>
            <a-tag v-else>未知</a-tag>
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
                <a-popconfirm title="确定要删除吗？" @confirm="deleteUser(record)">
                  <a style="color:#FF4D4F;"><DeleteOutlined/></a>
                </a-popconfirm>
              </a-tooltip>
              <a-divider type="vertical" />
              <a-tooltip title="用户岗位">
                <a style="color:#1980FF;" @click="userGroupRef.onOpen(record)"><TeamOutlined /></a>
              </a-tooltip>
              <a-divider type="vertical" />
              <a-tooltip title="重置密码">
                <a-popconfirm title="确定要重置吗？" @confirm="resetPassword(record)">
                  <a style="color:darkorange;"><KeyOutlined/></a>
                </a-popconfirm>
              </a-tooltip>
            </a-space>
          </template>
        </vxe-grid>
      </a-card>
    </a-col>
  </a-row>
  <Form ref="formRef" @successful="refresh()" />
  <Detail ref="detailRef"/>
  <UserGroup ref="userGroupRef"/>
</template>

<script setup>
  import userApi from '@/api/system/userApi'

  import { h, ref } from "vue"
  import { PlusOutlined, DeleteOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"

  import Form from "./form.vue"
  import OrgTree from "../components/orgTree.vue"
  import Detail from "./detail.vue"
  import UserGroup from './userGroup.vue'

  // 查询表单相关对象
  const queryFormRef = ref()
  const queryFormData = ref({})
  // 是否展示更多搜索条件
  const showMore = ref(false)

  // 其他页面操作
  const formRef = ref()
  const detailRef = ref()
  const userGroupRef = ref()

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
          return userApi.deleteUser({ ids })
        }
      }
    },
    // 列字段
    columns: [
      { type: 'checkbox', width: 50 },
      { field: 'account', title: '账号', width: 150, slots: { default: 'account' } },
      { field: 'name', title: '姓名', width: 150 },
      { field: 'gender', title: '性别', width: 60, slots: { default: 'gender' } },
      { field: 'orgName', title: '组织机构' },
      { field: 'status', title: '状态', width: 80, slots: { default: 'status' } },
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

  // 定义treeRef
  const treeRef = ref()

  // 加载完毕调用
  onMounted(() => {

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
  // 加载数据 返回 Promise 对象
  const loadData = (parameter) => {// 分页参数
    let param = Object.assign(parameter, queryFormData.value)
    return userApi.userPage(param).then((res) => {
      // res.data 为 {total, records}
      return res.data
    }).catch((err) => {
      console.error(err)
    })
  }
  // 点击树查询
  const treeSelect = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      queryFormData.value.orgCode = selectedKeys.toString()
    } else {
      delete queryFormData.value.orgCode
    }
    refresh()
  }
  // 删除用户
  const deleteUser = (record) => {
    let data = { ids: [record.id] }
    userApi.deleteUser(data).then((res) => {
      message.success(res.message)
      refresh()
    })
  }
  // 打开详情页
  const openDetail = (row) => {
    detailRef.value.onOpen(row)
    // 独立页面打开(与抽屉打开二选一)
    // router.push({ path: "/system/sysUser/detail", query: { id: row.id } })
  }

  // 重置用户密码
  const resetPassword = (record) => {
    let data = { account: record.account }
    userApi.resetPassword(data).then((res) => {
      message.success(res.message)
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
