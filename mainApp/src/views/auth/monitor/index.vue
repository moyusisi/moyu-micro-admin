<template>
  <!-- 统计数据 -->
  <a-row :gutter="8">
    <a-col :span="6">
      <a-card size="small" class="analyse-card">
        <template #cover>
          <TeamOutlined style="color: #69c0ff;" class="analyse-card-icon" />
          <div class="analyse-card-title">
							<span>当前会话数：</span><span>{{ analyseData.sessionTotalCount }}</span>
          </div>
        </template>
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card size="small" class="analyse-card">
        <template #cover>
          <VerifiedOutlined style="color: #3f8600;" class="analyse-card-icon" />
          <div class="analyse-card-title">
            <span>当前令牌数：</span><span>{{ analyseData.tokenTotalCount }}</span>
          </div>
        </template>
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card size="small" class="analyse-card">
        <template #cover>
          <InsuranceOutlined style="color: #5cdbd3;" class="analyse-card-icon" />
          <div class="analyse-card-title">
            <span>最大签发令牌：</span><span>{{ analyseData.maxTokenCount }}</span>
          </div>
        </template>
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card size="small" class="analyse-card">
        <template #cover>
          <RiseOutlined style="color: #ff9c6e;" class="analyse-card-icon" />
          <div class="analyse-card-title">
            <span>今日新增：</span><span>{{ analyseData.todayTokenCount }}</span>
          </div>
        </template>
      </a-card>
    </a-col>
  </a-row>
  <!-- 表格数据 -->
  <a-card size="small">
    <vxe-grid ref="gridRef" v-bind="gridOptions">
      <!-- 左侧操作栏 -->
      <template #operator>
        <a-form ref="queryFormRef" :model="queryFormData" style="width: 100%">
          <a-row :gutter="24" style="margin-bottom: 6px">
            <a-col :span="8">
              <a-form-item name="searchKey">
                <a-input v-model:value="queryFormData.searchKey" placeholder="搜索账号" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item>
                <a-flex gap="small">
                  <a-button type="primary" :icon="h(SearchOutlined)" @click="querySubmit">查询</a-button>
                  <a-button :icon="h(RedoOutlined)" @click="reset">重置</a-button>
                </a-flex>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </template>
      <!-- 字段插槽 -->
      <template #sessionTimeout="{row, rowIndex, column, columnIndex}">
        <a-tooltip>
          <template #title>
            <span v-if="row.sessionTimeout <= 0">永久有效</span>
            <a-statistic-countdown v-else :value="row.deadline" format="D 天 H 时 m 分 s 秒" :valueStyle="{fontSize:'14px', color:'#fff'}" />
          </template>
          <a-progress v-if="row.sessionTimeoutPercent * 100 > 80"
                      status="success" :percent="row.sessionTimeoutPercent * 100" :show-info="false"/>
          <a-progress v-if="row.sessionTimeoutPercent * 100 > 20 && row.sessionTimeoutPercent * 100 < 80"
                      status="active" :percent="row.sessionTimeoutPercent * 100" :show-info="false"/>
          <a-progress v-if="row.sessionTimeoutPercent * 100 < 20"
                      status="exception" :percent="row.sessionTimeoutPercent * 100" :show-info="false"/>
        </a-tooltip>
      </template>
      <template #action="{row:record, rowIndex, column, columnIndex}">
        <a-space>
          <template #split>
            <a-divider type="vertical" />
          </template>
          <a-tooltip title="已登录令牌列表">
            <a style="color:#1980FF;" @click="tokenListRef.onOpen(record)">令牌列表</a>
          </a-tooltip>
          <a-tooltip title="强制退出">
            <a-popconfirm title="确定要强制退出此用户的所有登录吗？" placement="topLeft" @confirm="deleteSession(record)">
              <a style="color:#FF4D4F;">强退</a>
            </a-popconfirm>
          </a-tooltip>
        </a-space>
      </template>
    </vxe-grid>
  </a-card>
  <TokenList ref="tokenListRef" @successful="refresh()"/>
</template>

<script setup>
  import monitorApi from "@/api/auth/monitorApi.js";

  import { h, reactive, ref } from "vue"
  import { TeamOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"
  import TokenList from "./tokenList.vue"

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
        }
      }
    },
    // 列字段
    columns: [
      { type: 'seq', width: 50 },
      { field: 'account', title: '账号', width: 200 },
      { field: 'name', title: '姓名', width: 150 },
      { field: 'sessionCreateTime', title: '会话创建时间', width: 170 },
      { field: 'latestLoginTime', title: '最新登录时间', width: 170 },
      { field: 'sessionTimeout', title: '有效期', slots: { default: 'sessionTimeout' } },
      { field: 'tokenCount', title: '令牌数', width: 100 },
      { field: 'action', title: '操作', width: 160, slots: { default: 'action' } },
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
  const selectedRowKeys = ref([])
  /***** 表格相关对象 end *****/

  // 定义tableDOM
  const tokenListRef = ref()
  const queryFormRef = ref()
  const queryFormData = ref({})
  const analyseData = ref({})

  // 加载完毕调用
  onMounted(() => {
    monitorApi.analyse().then((res) => {
      analyseData.value = res.data
    })
  })

  // 表格查询 返回 Promise 对象
  const loadData = (parameter) => {
    let param = Object.assign(parameter, queryFormData.value)
    return monitorApi.sessionPage(param).then((res) => {
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
  const deleteSession = (record) => {
    let data = { codes: [record.account] }
    monitorApi.deleteSession(data).then((res) => {
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
  .ant-card .ant-form-item {
    margin-bottom: 12px !important;
  }

  .analyse-card {
    height: 100px;
    margin-top: 6px;
    margin-bottom: 8px;
  }
  .analyse-card-icon {
    font-size: 30px;
    padding-top: 18px;
    padding-bottom: 5px;
  }
  .analyse-card-title {
    display: flex !important;
    justify-content: center;
    font-size: 16px;
  }
</style>
