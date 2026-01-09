<template>
  <!-- 上方模块选择 -->
  <a-card size="small">
    <a-flex>
      <a-radio-group v-model:value="moduleId" button-style="solid">
        <a-radio-button v-for="module in moduleList" :key="module.code" :value="module.code" @click="moduleClick(module)">
          <component :is="module.icon" /> {{ module.name }}
        </a-radio-button>
      </a-radio-group>
    </a-flex>
  </a-card>
  <!-- 内容区域 -->
  <a-card size="small">
    <!--  表格数据区  -->
    <MTable ref="tableRef"
            :columns="columns"
            :loadData="loadData"
            :row-key="(row) => row.code"
            :pagination="false"
            showRowSelection
            @selectedChange="onSelectedChange"
    >
      <template #operator>
        <a-space wrap style="margin-bottom: 6px">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="formRef.onOpen(null, module, 2, module.code)">新增菜单</a-button>
          <BatchDeleteButton icon="DeleteOutlined" :selectedRowKeys="selectedRowKeys" @batchDelete="batchDelete" />
        </a-space>
      </template>
      <!--  每行的记录重命名为node,node不一定有id  -->
      <template #bodyCell="{ column, record : node, index, text }">
        <template v-if="column.dataIndex === 'name'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'resourceType'">
          <a-tag v-if="node.resourceType === 1" color="orange">模块</a-tag>
          <a-tag v-if="node.resourceType === 2" color="cyan">目录</a-tag>
          <a-tag v-if="node.resourceType === 3" color="blue">菜单</a-tag>
          <a-tag v-if="node.resourceType === 4" color="gold">内链</a-tag>
          <a-tag v-if="node.resourceType === 5" color="green">链接</a-tag>
          <a-tag v-if="node.resourceType === 6" color="purple">按钮</a-tag>
        </template>
        <template v-if="column.dataIndex === 'code'">
          <!-- 唯一键点击查看详情 -->
          <a-tooltip :title="text" placement="topLeft">
            <!--<a style="text-decoration: underline;" @click="detailRef.onOpen(record)">{{ text }}</a>-->
            <a @click="detailRef.onOpen(node)">{{ text }}</a>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'path'">
          <!-- 长文本省略提示 -->
          <a-tooltip :title="text" placement="topLeft">
            <a-tag v-if="node.path" :bordered="false">{{ node.path }}</a-tag>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'component'">
          <a-tooltip :title="text" placement="topLeft">
            <a-tag v-if="node.component" :bordered="false">{{ node.component }}</a-tag>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'permission'">
          <a-tooltip :title="text" placement="topLeft">
            <a-tag v-if="node.permission" :bordered="false">{{ node.permission }}</a-tag>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'icon'">
          <span v-if="node.icon && node.icon !== '#'" >
            <component :is="node.icon"/>
          </span>
          <span v-else />
        </template>
        <template v-if="column.dataIndex === 'visible'">
          <span v-if="node.resourceType !== 6" >
            <a-tag v-if="node.visible === 1" color="green">可见</a-tag>
            <a-tag v-else>隐藏</a-tag>
          </span>
          <span v-else ></span>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-tooltip v-if="node.resourceType === 2" title="添加菜单">
              <a style="color:#53C61D;" @click="formRef.onOpen(null, module, 3, node.code)"><PlusSquareOutlined /></a>
              <a-divider type="vertical" />
            </a-tooltip>
            <a-tooltip v-else-if="node.resourceType === 3" title="添加按钮">
              <a style="color:#53C61D;" @click="formRef.onOpen(null, module, 6, node.code)"><PlusSquareOutlined /></a>
              <a-divider type="vertical" />
            </a-tooltip>
            <a-tooltip title="编辑">
              <a @click="formRef.onOpen(node, module)"><FormOutlined /></a>
            </a-tooltip>
            <a-divider type="vertical" />
            <a-tooltip title="删除">
              <a-popconfirm title="确定要删除吗？" @confirm="deleteMenu(node)">
                <a style="color:#FF4D4F;"><DeleteOutlined/></a>
              </a-popconfirm>
            </a-tooltip>
          </a-space>
        </template>
      </template>
    </MTable>
  </a-card>
  <Form ref="formRef" @successful="handleSuccess" />
  <Detail ref="detailRef"/>
</template>

<script setup>
  import resourceApi from '@/api/system/resourceApi.js'

  import { h, ref } from "vue"
  import { useRoute, useRouter } from "vue-router";
  import { PlusOutlined, DeleteOutlined } from "@ant-design/icons-vue"
  import { message } from "ant-design-vue"
  import Form from './form.vue'
  import BatchDeleteButton from '@/components/BatchDeleteButton/index.vue'
  import MTable from "@/components/MTable/index.vue"
  import Detail from "@/views/system/resource/detail.vue"

  // store
  const route = useRoute();
  const router = useRouter();

  // 查询表单相关对象
  const moduleList = ref([])
  const module = ref()
  const moduleId = ref()
  // 其他页面操作
  const formRef = ref()
  const detailRef = ref()

  /***** 表格相关对象 start *****/
  const tableRef = ref()
  // 已选中的行
  const selectedRowKeys = ref([])
  // 表格列配置
  const columns = [
    {
      title: '显示名称',
      dataIndex: 'name',
      resizable: true,
      ellipsis: true,
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'resourceType',
      align: 'center',
      width: 80
    },
    {
      title: '图标',
      dataIndex: 'icon',
      align: 'center',
      width: 50
    },
    {
      title: '唯一编码',
      dataIndex: 'code',
      resizable: true,
      ellipsis: true,
      width: 150
    },
    {
      title: '地址',
      dataIndex: 'path',
      resizable: true,
      ellipsis: true,
      width: 150
    },
    {
      title: '组件',
      dataIndex: 'component',
      resizable: true,
      ellipsis: true,
      width: 150
    },
    {
      title: '权限',
      dataIndex: 'permission',
      resizable: true,
      ellipsis: true,
      width: 150
    },
    {
      title: '是否可见',
      dataIndex: 'visible',
      align: 'center',
      width: 80
    },
    {
      title: '排序',
      dataIndex: 'sortNum',
      align: 'center',
      width: 80
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      width: 150
    }
  ]
  /***** 表格相关对象 end *****/

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
  // 加载数据
  const loadData = async (parameter) => {
    // 分页参数
    let param = Object.assign({}, parameter)
    if (!moduleId.value) {
      await init()
      param.module = moduleId.value
      const treeRes = await resourceApi.menuTree(param)
      return treeRes.data ? treeRes.data : []
    } else {
      param.module = moduleId.value
      // menuTree获取到的data中的id和parentId均为code
      const treeRes = await resourceApi.menuTree(param)
      return treeRes.data ? treeRes.data : []
    }
  }
  // 选中行发生变化
  const onSelectedChange = (selectedKeys, selectedRows) => {
    selectedRowKeys.value = selectedKeys
    // console.log('onSelectedChange,selectedKeys:', selectedKeys);
  }
  // 切换应用标签查询菜单列表
  const moduleClick = (value) => {
    module.value = value
    moduleId.value = module.value.code
    tableRef.value.refresh(true)
  }
  // 单个删除
  const deleteMenu = (node) => {
    let data = { codes: [node.code] }
    resourceApi.deleteMenuTree(data).then((res) => {
      message.success(res.message)
      tableRef.value.refresh()
    })
  }
  // 批量删除
  const batchDelete = () => {
    if (selectedRowKeys.value.length < 1) {
      message.warning("请至少选择一条数据")
      return
    }
    let data = { codes: selectedRowKeys.value }
    resourceApi.deleteMenuTree(data).then((res) => {
      message.success(res.message)
      tableRef.value.refresh()
    })
  }
  // 成功回调
  const handleSuccess = () => {
    tableRef.value.refresh(true)
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
