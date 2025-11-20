<template>
  <a-drawer
      :open="visible"
      title="从SQL导入"
      :width="drawerWidth"
      :closable="false"
      :footerStyle="{display: 'flex', justifyContent: 'flex-end'}"
      :destroy-on-close="true"
      @close="onClose"
  >
    <template #extra>
      <a-button type="primary" size="small" @click="onClose"><CloseOutlined /></a-button>
    </template>
    <!-- 页面内容 -->
    <a-card size="small">
      <a-row>
        <a-col :span="20">
          <a-alert message="目前仅支持MySql语法。" type="info" />
        </a-col>
        <a-col :span="4">
          <a-flex gap="small" class="tool-area" justify="flex-end" align="center">
            <a-button :icon="h(PlusOutlined)" class="custom-btn" @click="addRows" >导入</a-button>
          </a-flex>
        </a-col>
      </a-row>
      <a-textarea v-model:value="sqlData" placeholder="支持多个建表语句" :rows="20" allowClear/>
    </a-card>
    <!-- 底部内容 -->
    <template #footer>
      <a-space>
        <a-button @click="onClose">关闭</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup>

  import { useSettingsStore } from "@/store";
  import { message } from "ant-design-vue";
  import { h } from "vue";
  import {
    PlusOutlined,
    DeleteOutlined,
    RedoOutlined,
    SearchOutlined,
    CloudUploadOutlined, CloudDownloadOutlined
  } from "@ant-design/icons-vue"
  import userApi from "@/api/system/userApi"
  import codegenApi from "@/api/dev/codegenApi.js";

  const settingsStore = useSettingsStore()

  // 默认是关闭状态
  const visible = ref(false)
  const title = ref()
  const emit = defineEmits({ successful: null })
  // 表单数据
  const sqlData = ref()

  // 抽屉宽度
  const drawerWidth = computed(() => {
    return settingsStore.menuCollapsed ? `calc(100% - 80px)` : `calc(100% - 210px)`
  })

  // 打开抽屉
  const onOpen = () => {
    // 加载数据
    loadData()
    visible.value = true
  }
  // 关闭抽屉
  const onClose = () => {
    visible.value = false
  }
  // 加载数据
  const loadData = () => {
  }
  // 重置
  const reset = () => {
    loadData()
  }
  // 添加记录
  const addRows = () => {
    if (!sqlData.value) {
      message.warning('请输入建表语句')
      return
    }
    let data = { sql: sqlData.value }
    codegenApi.importSql(data).then((res) => {
      message.success(res.message)
      emit('successful')
      onClose()
    })
  }
  // 调用这个函数将子组件的一些数据和方法暴露出去
  defineExpose({
    onOpen
  })
</script>

<style scoped>
  /** 操作区 **/
  .tool-area {
    width: 100%;
    height: 100%;
  }
  .custom-btn {
    background-color: #52C41AFF;
    border-color: #52C41AFF;
    color: #fff;
  }
  .custom-btn:hover {
    background-color: #79D84B;
    border-color: #79D84B;
    color: #fff;
  }
</style>
