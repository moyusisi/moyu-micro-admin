<template>
  <a-drawer
      :open="visible"
      title="用户信息详情"
      :width="drawerWidth"
      :closable="false"
      :maskClosable="false"
      :destroy-on-close="true"
      @close="onClose"
  >
    <!--  上方操作区  -->
    <template #extra>
      <a-button type="primary" size="small" @click="onClose"><CloseOutlined /></a-button>
    </template>
    <!--  数据区  -->
    <a-spin :spinning="dataLoading">
      <a-form ref="formRef" :model="formData" :label-col="{span: 6}">
        <a-card>
          <template #title>
            <span><RightSquareFilled style="color: dodgerblue;"/>基本信息</span>
          </template>
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item name="account" label="账号" tooltip="账号" >
                <span><a>{{ formData.account }}</a></span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="name" label="姓名" tooltip="" >
                <span>{{ formData.name }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="staffCode" label="员工编码" tooltip="" >
                <span>{{ formData.staffCode }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="orgCode" label="直属组织" tooltip="">
                <OrgTreeSelect :defaultValue="formData.orgCode" disabled/>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="gender" label="性别 " tooltip="" >
                <span>
                  <a-tag v-if="formData.gender === 1" color="blue">男</a-tag>
                  <a-tag v-else-if="formData.gender === 2" color="pink">女</a-tag>
                  <a-tag v-else>未知</a-tag>
                </span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="birthday" label="出生日期" tooltip="" >
                <span>{{ formData.birthday }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="idNo" label="身份证号" tooltip="" >
                <span>{{ formData.idNo }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="phone" label="手机" tooltip="" >
                <span>{{ formData.phone }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="email" label="邮箱" tooltip="" >
                <span>{{ formData.email }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="nickName" label="昵称" tooltip="" >
                <span>{{ formData.nickName }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="entryDate" label="入职日期" tooltip="" >
                <span>{{ formData.entryDate }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="status" label="账号状态" tooltip="" >
                <span>
                  <a-tag v-if="formData.status === 0" color="green">正常</a-tag>
                  <a-tag v-else>已停用</a-tag>
                </span>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
        <a-card>
          <template #title>
            <span><RightSquareFilled style="color: dodgerblue;"/>更多信息</span>
          </template>
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item name="address" label="联系地址" tooltip="" >
                <span>{{ formData.address }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="remark" label="备注" tooltip="" >
                <span style="white-space: pre-wrap;">{{ formData.remark }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="extJson" label="扩展信息" tooltip="" >
                <span>{{ formData.extJson }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="createTime" label="创建时间" tooltip="" >
                <span>{{ formData.createTime }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="createBy" label="创建者" tooltip="" >
                <span>{{ formData.createBy }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="updateTime" label="更新时间" tooltip="" >
                <span>{{ formData.updateTime }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="updateBy" label="更新者" tooltip="" >
                <span>{{ formData.updateBy }}</span>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
      </a-form>
    </a-spin>
    <!--  底部操作区  -->
    <template #footer>
      <a-flex gap="small" justify="flex-end">
        <a-button type="primary" danger @click="onClose"> 关闭</a-button>
      </a-flex>
    </template>
  </a-drawer>
</template>
<script setup>
  import userApi from '@/api/system/userApi.js'

  import { useSettingsStore } from "@/store"
  import { useRoute, useRouter } from "vue-router";
  import OrgTreeSelect from "@/views/system/components/orgTreeSelect.vue";

  // store
  const route = useRoute();
  const router = useRouter();
  const settingsStore = useSettingsStore()

  // 默认是关闭状态
  const visible = ref(false)
  // 计算属性 抽屉宽度
  const drawerWidth = computed(() => {
    return settingsStore.menuCollapsed ? `calc(100% - 80px)` : `calc(100% - 210px)`
  })

  // 表单数据
  const formRef = ref()
  const formData = ref({})
  const dataLoading = ref(false)
  const submitLoading = ref(false)

  // 打开抽屉
  const onOpen = (row) => {
    if (row) {
      // 表单数据赋值
      loadData(row)
    }
  }
  // 关闭抽屉
  const onClose = () => {
    formRef.value.resetFields()
    visible.value = false
  }
  // 加载数据
  const loadData = (row) => {
    dataLoading.value = true
    // 组装请求参数
    let param = { id: row.id }
    userApi.userDetail(param).then((res) => {
      formData.value = res.data
    }).finally(() => {
      dataLoading.value = false
      // 数据就绪之后显示
      visible.value = true
    })
  }

  // 调用这个函数将子组件的一些数据和方法暴露出去
  defineExpose({
    onOpen
  })
</script>

<style scoped>
  /** 后代选择器 **/
  .ant-card .ant-form-item {
    margin-bottom: 12px !important;
  }
</style>
