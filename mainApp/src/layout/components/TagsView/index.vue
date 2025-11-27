<template>
  <div class="admin-tabs-container">
    <a-tabs class="admin-tabs" :activeKey="activeKey" type="editable-card" hide-add
            @tabClick="onTabClick" @edit="onTabEdit">
      <template #leftExtra>
        <div class="admin-tabs-arrow" @click="scrollLeft">
          <LeftOutlined/>
        </div>
      </template>
      <template #rightExtra>
        <div class="admin-tabs-arrow" @click="scrollRight">
          <RightOutlined/>
        </div>
      </template>

      <a-tab-pane v-for="tag in tagList" :key="tag.fullPath" :closable="!(tag?.affix===true)">
        <template #tab>
          <span>{{ tag.title }}</span>
        </template>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { useTagsViewStore, useMenuStore } from '@/store'
import { LeftOutlined, RightOutlined } from "@ant-design/icons-vue";

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

// 解构 store中的属性
const { visitedViews } = toRefs(tagsViewStore)

const tagList = computed(() => {
  return visitedViews.value
})

const activeKey = ref()

// 首次加载会调用onMounted但route不会改变
onMounted(() => {
  // console.log('onMounted')
  tagsViewStore.initTags()
  addView(route)
  activeKey.value = route.fullPath
})

// 非首次加载则不再调用onMounted，但route会改变
watch(route, (to) => {
  // console.log('watch')
  addView(to)
  activeKey.value = to.fullPath
})

// 增加tagsView
const addView = (to) => {
  activeKey.value = to.fullPath
  if (to.meta.title) {
    tagsViewStore.addView({
      name: to.name as string,
      title: to.meta.title,
      path: to.path,
      fullPath: to.fullPath,
      affix: to.meta?.affix,
      keepAlive: to.meta?.keepAlive,
    });
  }
}

const onTabEdit = (tabKey, action) => {
  // console.log(action, tabKey)
  if (action === 'remove') {
    const tag = tagList.value.find((tag) => tag.fullPath === tabKey)
    closeSelectedTag(tag)
  }
}
// 关闭tag
const closeSelectedTag = (tag, autoPushLatestView = true) => {
  // 移除时会同步改变 tagList.value
  tagsViewStore.removeView(tag)
  if (autoPushLatestView && isActive(tag)) {
    const latestView = tagList.value.slice(-1)[0]
    // console.log('isActive', latestView)
    if (latestView) {
      router.push(latestView.path)
    } else {
      router.push('/')
    }
  }
}
// 是否激活
const isActive = (tag) => {
  return tag.path === route.path
}
const onTabClick = (tabKey) => {
  // console.log('onTabClick', tabKey)
  router.push(tabKey)
}

const getTabWrapEl = () => {
  return document.querySelector('.ant-tabs-nav-wrap')
}
const scrollLeft = () => {
  const wrapEl = getTabWrapEl()
  if (wrapEl) {
    const event = new WheelEvent('wheel', { deltaX: 0, deltaY: -100 })
    wrapEl.dispatchEvent(event)
  }
}
const scrollRight = () => {
  const wrapEl = getTabWrapEl()
  if (wrapEl) {
    const event = new WheelEvent('wheel', { deltaX: 0, deltaY: 100 })
    wrapEl.dispatchEvent(event)
  }
}
</script>

<style>

.admin-tabs-container {
  height: 40px;
  background: #FFFFFF;
}

.admin-tabs {
  /** 覆盖ant的默认样式 */
  .ant-tabs-nav {
    margin-bottom: 0;
    /** 左右两侧插槽 */
    .ant-tabs-extra-content {
      display: flex;
    }
    /** 整个tabs包裹区(不含两侧插槽) */
    .ant-tabs-nav-wrap {
      /** 选项tab样式 */
      .ant-tabs-tab {
        background: none;
        transition: background-color 0.3s, color 0.3s;
        padding: 0 16px;
        border-radius: 0;
        border: none;
        margin: 0;
        /** 选项tab中, 移除区的样式 */
        .ant-tabs-tab-remove {
          margin: 0;
          padding: 0 0 0 5px;
        }
      }
      /** 选中元素样式 */
      .ant-tabs-tab-active {
        background: #e6f7ff;
      }
      /** 选中元素下方的线 */
      .ant-tabs-ink-bar {
        visibility: visible;
      }
    }
  }

  .admin-tabs-arrow,
  /** tabs操作区 如更多操作 */
  .ant-tabs-nav-operations .ant-tabs-nav-more {
    padding: 0;
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    cursor: pointer;

    .anticon {
      vertical-align: -1px;
    }
  }
}

</style>