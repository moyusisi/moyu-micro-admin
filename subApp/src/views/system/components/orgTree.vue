<template>
  <!-- 组织树 -->
  <a-card size="small" :loading="cardLoading" :bodyStyle="{paddingLeft:'5px', paddingRight:'5px'}" style="min-width:200px; height: 100%;">
    <a-tree
        v-if="treeData.length > 0"
        v-model:expandedKeys="defaultExpandedKeys"
        :tree-data="treeData"
        :field-names="treeFieldNames"
        :showLine="{ showLeafIcon:false }"
        show-icon
        @select="onSelect"
    >
      <template #icon="{ orgType, selected }">
        <span v-if="orgType === 1" style="color:#1980FF;"><ClusterOutlined /></span>
<!--        <span v-else-if="orgType === 2" style="color:#87D068;"><ApartmentOutlined /></span>-->
      </template>
      <template #title="{ name, key }">
        <!-- 长文本省略提示 -->
        <a-tooltip :title="name" placement="topLeft">
          <span>{{ name }}</span>
        </a-tooltip>
      </template>
    </a-tree>
    <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" />
  </a-card>
</template>

<script setup lang="ts">
import orgApi from "@/api/system/orgApi";

import { Empty } from "ant-design-vue"

// 树的节点数据
const treeData = ref([])
// 替换treeNode 中 children,title,key
const treeFieldNames = { children: 'children', title: 'name', key: 'code' }
// 默认展开的节点
const defaultExpandedKeys = ref([])
const cardLoading = ref(true)

onMounted(() => {
  loadTreeData()
})

const emit = defineEmits(['onSelect'])
// 树节点被选中时调用(https://antdv.com/components/tree-select-cn#api)
const onSelect = (value, node) => {
  // 传递被选中的节点key
  emit('onSelect', value, node)
}

// 加载左侧的树
const loadTreeData = () => {
  cardLoading.value = true
  // 获取当前登陆者的orgTree 获取所有组织机构可使用orgApi.orgTree
  orgApi.orgTree().then((res) => {
    cardLoading.value = false
    if (res.data !== null) {
      treeData.value = res.data
      defaultExpandedKeys.value = [res.data[0]?.code]
    }
  }).finally(() => {
    cardLoading.value = false
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
