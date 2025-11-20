<template>
  <!-- 组织选择器 -->
  <a-tree-select
      v-model:value="selectValue"
      v-model:treeExpandedKeys="defaultExpandedKeys"
      placeholder="请选择"
      allow-clear
      :listHeight="400"
      :tree-data="treeData"
      :field-names="{ children: 'children', label: 'name', value: 'code' }"
      :tree-line="{ showLeafIcon:false }"
      :tree-checkable="props.multiSelect"
      :show-checked-strategy="TreeSelect.SHOW_ALL"
      @change="onChange"
  />
</template>

<script setup lang="ts">

import { TreeSelect } from "ant-design-vue"
import userCenterApi from "@/api/system/userCenterApi"

const props = defineProps({
  // 是否多选
  multiSelect: {
    type: Boolean,
    default: false
  },
  defaultValue: {
    type: [String, Array]
  },
  // 树的节点数据
  treeData: {
    type: Array,
    default: []
  }
})

const emit = defineEmits(['onChange'])
// 树节点被选中时调用(https://antdv.com/components/tree-select-cn#api)
const onChange = (value, label, extra) => {
  // 传递被选中的节点key
  emit('onChange', value, label, extra)
}

// 默认展开的节点
const defaultExpandedKeys = ref([])
const selectValue = ref()
const treeData = ref()

onMounted(() => {
  // 若传了treeData则以传递的为准,否则内部加载
  if (props.treeData && props.treeData.length > 0) {
    treeData.value = props.treeData
    defaultExpandedKeys.value = [treeData.value[0]?.code]
  } else {
    loadTreeData()
  }
  selectValue.value = props.defaultValue
})

// 加载左侧的树
const loadTreeData = () => {
  // 获取当前登陆者的orgTree 获取所有组织机构可使用orgApi.orgTree
  userCenterApi.loginUserOrgTree().then((res) => {
    if (res.data !== null) {
      treeData.value = res.data
      defaultExpandedKeys.value = [res.data[0]?.code]
    }
  })
}

// 重新加载树的数据
const refresh = () => {
  loadTreeData()
}
// 暴露子组件的方法
defineExpose({
  treeData,
  refresh
})
</script>

<style scoped>

</style>
