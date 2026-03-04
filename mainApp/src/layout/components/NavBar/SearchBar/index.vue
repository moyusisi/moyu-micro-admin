<template>
  <!-- 系统设置Bar -->
  <div class="bar-item" @click="openSearch">
    <SearchOutlined />
  </div>
  <!-- 系统设置抽屉 -->
  <a-drawer v-model:open="searchOpen" :closable="false" width="500">
    <div class="serchPanel">
      <a-divider>
        <h3 class="setting-item-title">菜单搜索</h3>
      </a-divider>
      <a-input
          ref="inputRef"
          v-model="searchText"
          class="search-input radius0"
          allowClear
          placeholder="搜索菜单（支持拼音检索）"
          @change="onSearch"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
      </a-input>

      <a-card :body-style="{ padding: '0 0' }" hoverable class="search-card radius0">
        <div class="search-card-content">
          <a-list item-layout="horizontal" :data-source="resultsList">
            <template #renderItem="{ item, index }">
              <a-list-item @click="handleSelect(item.fullPath)" @mouseover="onCardItemHover(index)" :class="{ active: index === cardIndex }"
              >
                <template #actions>
                  <a><EnterOutlined /></a>
                </template>
                <a-list-item-meta :description="item.fullName">
                  <template #title>
                    <a>{{ item.name }}</a>
                  </template>
                  <template #avatar>
                    <a-avatar style="color: #000000; background-color: transparent" :type="item.icon">
                      <template #icon>
                        <component :is="item.icon" />
                      </template>
                    </a-avatar>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </a-card>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import Fuse from 'fuse.js'
import { SearchOutlined, EnterOutlined } from "@ant-design/icons-vue";
import { useSearchStore } from '@/store'

const searchStore = useSearchStore()

const route = useRoute()
const router = useRouter()

const pool = computed(() => {
  return searchStore.pool
})

// 这份数据是展示在搜索面板下面的
const resultsList = computed(() => {
  return results.value.length === 0 || searchText.value === '' ? pool.value : results.value
})

const inputRef = ref()
const searchText = ref('')
const results = ref([])
const cardIndex = ref(0)
const cardListRef = ref()

const searchOpen = ref(false)

onMounted(() => {
})

// 打开搜索面板
const openSearch = () => {
  searchOpen.value = true
}

// 关闭搜索面板
const closeSearch = () => {
  searchOpen.value = false
  results.value = []
}

// 根据 pool 更新 fuse 实例
const fuse = computed(() => {
  return new Fuse(pool.value, {
    shouldSort: true, // 按分数对结果列表进行排序
    threshold: 0.3, // 什么时候放弃
    location: 0, // 大致位置
    distance: 5, // 接近程度
    minMatchCharLength: 1, // 匹配长度
    keys: ['name', 'namePinyin', 'namePinyinFirst']
  })
})

const onCardItemHover = (index) => {
  cardIndex.value = index
}
// 接收用户在下拉菜单中选中事件
const handleSelect = (path) => {
  // 如果用户选择的就是当前页面 就直接关闭搜索面板
  if (path === route.fullPath) {
    closeSearch()
    return
  }
  router.push({ path })
  closeSearch()
}

// 每次输入框的值发生变化时会触发
const onSearch = (e) => {
  let queryString = e.target.value || ''
  const result = queryString && fuse.value.search(queryString).map((e) => e.item)
  searchText.value = queryString
  results.value = result
}

</script>

<style scoped>

.search-input {

  &:deep() .ant-input {
    height: 35px;
  }

  &:deep() .ant-input-prefix {
    font-size: 20px;
  }
}

.search-card {
  margin: 10px 0;
}

.search-card-content {
  height: 600px;
  overflow: hidden;
  overflow-y: scroll;
}

:deep(.ant-list-item.active) {
  background-color: #e6f7ff;
}

.radius0 {
  border-radius: 0 !important;
}

</style>