<template>
  <a-drawer
      :open="visible"
      :title="title"
      :width="drawerWidth"
      :closable="false"
      :footerStyle="{display: 'flex', justifyContent: 'flex-end'}"
      :destroy-on-close="true"
      @close="onClose"
  >
    <template #extra>
      <a-button type="primary" size="small" @click="onClose"><CloseOutlined /></a-button>
    </template>
    <!-- 代码预览 -->
    <a-spin :spinning="dataLoading">
      <a-tabs v-model:activeKey="activeTab" type="card">
        <a-tab-pane v-for="(item, index) in codePreviewList" :key="item.codeKey" :tab="item.codeKey">
          <span class="copy-btn"><a @click="copyCode(index)"><CopyOutlined/> 复制</a></span>

<!--          <a-button size="small" type="dashed" ghost :icon="h(CopyOutlined)" @click="copyCode" class="copy-btn">复制</a-button>-->
          <highlightjs autodetect :code="item.content" />
        </a-tab-pane>
      </a-tabs>
    </a-spin>
    <template #footer>
      <a-flex gap="small" justify="flex-end">
        <a-button type="primary" danger @click="onClose"> 关闭</a-button>
        <a-tooltip title="可直接把生成的代码直接写入到项目中">
          <a-button type="primary" ghost @click="openWriteDialog" :disabled="!supportsFSAccess">写入本地</a-button>
        </a-tooltip>
        <a-button type="primary" :loading="submitLoading" @click="downloadCode">下载Zip</a-button>
      </a-flex>
    </template>
  </a-drawer>
  <a-modal :open="writeDialogOpen" title="写入本地" :confirmLoading="writeRunning" :maskClosable="false" @ok="onOk" @cancel="onCancel">
    <a-alert v-if="!supportsFSAccess" closable message="当前浏览器不支持 File System Access API，建议使用 Chrome/Edge 最新版" type="error" />
    <a-spin :spinning="writeRunning" tip="正在写入中...">
      <a-form>
        <a-form-item label="写入范围">
          <a-radio-group v-model:value="writeScope" option-type="button" button-style="solid">
            <a-radio value="all">全部</a-radio>
            <a-radio value="frontend">仅前端</a-radio>
            <a-radio value="backend">仅后端</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="writeScope==='all' || writeScope==='frontend'" label="前端根目录" tooltip="即代码src的父目录" required>
          <a-space-compact>
            <a-input v-model:value="frontendDirName" placeholder="请选择前端根目录" disabled/>
            <a-button :disabled="!supportsFSAccess" @click="pickFrontendDir">选择</a-button>
          </a-space-compact>
        </a-form-item>
        <a-form-item v-if="writeScope==='all' || writeScope==='backend'" label="后端根目录" tooltip="即代码src的父目录" required>
          <a-space-compact>
            <a-input v-model:value="backendDirName" placeholder="请选择后端根目录" disabled/>
            <a-button :disabled="!supportsFSAccess" @click="pickBackendDir">选择</a-button>
          </a-space-compact>
        </a-form-item>
        <a-form-item label="覆盖策略">
          <a-radio-group v-model:value="writeMode" option-type="button" button-style="solid">
            <a-radio value="overwrite">覆盖</a-radio>
            <a-radio value="skip">跳过已存在</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-progress :percent="writeProgress.percent" />
        <a-flex v-if="writeProgress.total > 0" justify="space-between">
          <div>{{ writeProgress.done }}/{{ writeProgress.total }}</div>
          <div>{{ writeProgress.current }}</div>
        </a-flex>
      </a-form>
    </a-spin>
    <template #footer>
      <a-flex gap="small" justify="flex-end">
        <a-button :disabled="writeRunning" @click="onCancel">关闭</a-button>
        <a-button type="primary" :disabled="!canWriteToLocal || writeRunning" @click="onOk">写入</a-button>
      </a-flex>
    </template>
  </a-modal>
</template>
<script setup>
import codegenApi from '@/api/dev/codegenApi'

import { h } from "vue";
import { CopyOutlined } from "@ant-design/icons-vue"
import { message } from 'ant-design-vue'
import { useSettingsStore } from "@/store/index.js"
import { required } from "@/utils/formRules.js";
// import downloadUtil from '@/utils/downloadUtil'

const settingsStore = useSettingsStore()

const emit = defineEmits({ successful: null, closed: null })

// 默认是关闭状态
const visible = ref(false)
const title = ref()
const recordData = ref()
const activeTab = ref("entity.java")
const codePreviewList = ref([])
const dataLoading = ref(false)
const submitLoading = ref(false)

// 抽屉宽度
const drawerWidth = computed(() => {
  return `calc(100%)`
  // return settingsStore.menuCollapsed ? `calc(100% - 80px)` : `calc(100% - 210px)`
})

/***** 写入本地磁盘相关 *****/
const supportsFSAccess = typeof (window.showDirectoryPicker) === "function"
const writeDialogOpen = ref(false);
const frontendDirHandle = ref();
const backendDirHandle = ref();
const frontendDirName = ref("");
const backendDirName = ref("");
const writeScope = ref("all");
const writeMode = ref("overwrite");

const writeProgress = ref({ total: 0, done: 0, percent: 0, current: "" });
const writeRunning = ref(false);
const needFrontend = computed(() => {
      return writeScope.value === "all" || writeScope.value === "frontend"
})
const needBackend = computed(() => {
  return writeScope.value === "all" || writeScope.value === "backend"
})
const canWriteToLocal = computed(() => {
  if (!codePreviewList.value.length) return false;
  const frontOk = needFrontend.value ? !!frontendDirHandle.value : true;
  const backOk = needBackend.value ? !!backendDirHandle.value : true;
  return frontOk && backOk;
});

// 打开抽屉
const onOpen = (record) => {
  recordData.value = record;
  title.value = recordData.value.tableName + "-代码生成预览"
  // 加载数据
  loadData()
  visible.value = true
  // 写入本地对话框中的初始化
  writeProgress.value.total = 0
  writeProgress.value.done = 0
  writeProgress.value.percent = 0
  writeProgress.value.current = ""
}
// 关闭抽屉
const onClose = () => {
  visible.value = false
}
// 加载数据
const loadData = () => {
  dataLoading.value = true
  // 获取组织信息
  codegenApi.preview({ id: recordData.value.id }).then((res) => {
    codePreviewList.value = res.data
    activeTab.value = "entity.java"
  }).finally(() => {
    dataLoading.value = false
  })
}

// 复制代码
const copyCode = (index) => {
  const code = codePreviewList.value[index]?.content
  navigator.clipboard.writeText(code).then(() => {
    message.success('复制成功')
  })
}

// 下载代码
const downloadCode = () => {
  if (!recordData.value.id) {
    message.warning("无法获取配置id，无法下载")
    return
  }
  let data = { ids: [recordData.value.id] }
  submitLoading.value = true
  codegenApi.download(data).then((res) => {
    emit('successful')
    onClose()
  }).catch(err => {
    console.log(err)
  }).finally(() => {
    submitLoading.value = false
  })
}

// =============== 写入本地 ===============
// 对话框打开
const openWriteDialog = () => {
  writeDialogOpen.value = true
}
// 对话框确定
const onOk = () => {
  writeToLocal()
  writeDialogOpen.value = true
}
// 对话框取消
const onCancel = () => {
  writeDialogOpen.value = false
}

const pickFrontendDir = async () => {
  try {
    frontendDirHandle.value = await window.showDirectoryPicker()
    frontendDirName.value = frontendDirHandle.value?.name || ""
    message.success("前端目录选择成功")
  } catch {
    // 用户取消或浏览器不支持
  }
};

const pickBackendDir = async () => {
  try {
    // @ts-ignore
    backendDirHandle.value = await window.showDirectoryPicker()
    backendDirName.value = backendDirHandle.value?.name || ""
    message.success("后端目录选择成功")
  } catch {
    // 用户取消或浏览器不支持
  }
};

const writeToLocal = async () => {
  if (!supportsFSAccess) {
    message.warning("当前浏览器不支持本地写入，请选择下载ZIP");
    return;
  }
  if ((needFrontend.value && !frontendDirHandle.value) || (needBackend.value && !backendDirHandle.value)) {
    message.warning("请先选择所需的前端/后端目录");
    return;
  }
  if (!codePreviewList.value.length) {
    message.warning("请先生成预览");
    return;
  }

  writeRunning.value = true;
  let frontCount = 0;
  let backCount = 0;
  const failed = [];
  const files = codePreviewList.value.filter((e) => {
    return writeScope.value === "all" || e.codeType === writeScope.value;
  });
  writeProgress.value.total = files.length;
  writeProgress.value.done = 0;
  writeProgress.value.percent = 0;
  writeProgress.value.current = "";

  const concurrency = 2;
  const queue = files.slice();
  const workers = [];

  async function worker() {
    while (queue.length) {
      const item = queue.shift()
      try {
        const codeType = item.codeType
        const relativeFileName = item.path + "/" + item.fileName
        if (writeMode.value === "skip") {
          const targetRoot = codeType === "frontend" ? frontendDirHandle.value : backendDirHandle.value
          const exists = await fileExists(targetRoot, relativeFileName)
          if (exists) {
            writeProgress.value.current = relativeFileName
            // 即使continue， finally也会执行
            continue;
          }
        }
        if (codeType === "frontend") {
          await writeFile(frontendDirHandle.value, relativeFileName, item.content || "");
          frontCount++;
        } else {
          await writeFile(backendDirHandle.value, relativeFileName, item.content || "");
          backCount++;
        }
        writeProgress.value.current = relativeFileName
      } catch (err) {
        console.error("写入失败:", item.fileName, err);
        failed.push(item.fileName);
      } finally {
        writeProgress.value.done++;
        writeProgress.value.percent = Math.round((writeProgress.value.done / writeProgress.value.total) * 100);
      }
    }
  }

  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  writeRunning.value = false;
  if (failed.length) {
    message.warning(`部分文件写入失败：${failed.length} 个，成功 前端 ${frontCount} 个/后端 ${backCount} 个`);
  } else {
    message.success(`写入完成：前端 ${frontCount} 个文件，后端 ${backCount} 个文件`);
  }
}

// 判断文件是否存在
async function fileExists(dirHandle, filePath) {
  try {
    const parts = filePath.split("/").filter(Boolean)
    const fileName = parts.pop()
    const targetDir = await ensureDir(dirHandle, parts, false);
    const fileHandle =  await targetDir.getFileHandle(fileName, { create: false });
    return true;
  } catch (err) {
    // console.log(err)
    return false;
  }
}

// 确保目录存在，返回最深一层目录的dirHandle
async function ensureDir(rootDirHandle, pathList, force = true) {
  let current = rootDirHandle
  for (const segment of pathList) {
    try {
      current = await current.getDirectoryHandle(segment, { create: true })
    } catch (err) {
      // 若同名文件阻塞目录创建，尝试强制删除后重建
      if (force && err?.name === "TypeMismatchError") {
        try {
          await current.removeEntry(segment, { recursive: true })
          current = await current.getDirectoryHandle(segment, { create: true })
        } catch {
          throw err
        }
      } else {
        throw err
      }
    }
  }
  return current
}

// 写入文件
async function writeFile(dirHandle, filePath, content) {
  const parts = filePath.split("/").filter(Boolean)
  const fileName = parts.pop()
  const targetDir = await ensureDir(dirHandle, parts, true);
  let fileHandle
  try {
    fileHandle = await targetDir.getFileHandle(fileName, { create: true });
  } catch (err) {
    if (err?.name === "TypeMismatchError") {
      // 存在同名目录，尝试删除后重建文件
      try {
        await targetDir.removeEntry(fileName, { recursive: true });
        fileHandle = await targetDir.getFileHandle(fileName, { create: true });
      } catch {
        throw err;
      }
    } else {
      throw err;
    }
  }
  const writable = await fileHandle.createWritable();
  await writable.write(content ?? "");
  await writable.close();
}

// 对外暴露
defineExpose({
  onOpen,
})
</script>
<style scoped>

/** 复制样式 */
.copy-btn {
  float: right;
  top: 8px;
  right: 8px;
  position: absolute;
  z-index: 1;
}
.copy-btn a {
  color:#606266;
}
.copy-btn a:hover {
  color:#1677FF;
}
</style>
