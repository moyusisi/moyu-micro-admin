<template>
  <a-drawer
      :open="visible"
      :title="title"
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
        <a-card title="基本信息">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item name="account" label="登陆账号" tooltip="" required>
                <a-input v-model:value="formData.account" placeholder="请输入账号" :disabled="edit" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="name" label="姓名" tooltip="姓名" required>
                <a-input v-model:value="formData.name" placeholder="请输入姓名" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="staffCode" label="员工编号" tooltip="员工编号">
                <a-input v-model:value="formData.staffCode" placeholder="请输入员工编号" :disabled="edit" allowClear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="orgCode" label="直属组织" tooltip="" required>
                <OrgTreeSelect :tree-data="treeData" :defaultValue="formData.orgCode" @onChange="parentChange"/>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="gender" label="性别" tooltip="性别" required>
                <a-radio-group v-model:value="formData.gender">
                  <a-radio :value='0'>未知</a-radio>
                  <a-radio :value='1'>男</a-radio>
                  <a-radio :value='2'>女</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="birthday" label="出生日期" tooltip="">
                <a-date-picker v-model:value="formData.birthday" value-format="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="idNo" label="身份证号" tooltip="">
                <a-input v-model:value="formData.idNo" placeholder="请输入身份证号" allow-clear show-count :maxlength="18" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="phone" label="手机号" tooltip="手机号">
                <a-input v-model:value="formData.phone" placeholder="请输入手机" allow-clear show-count :maxlength="11" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="email" label="邮箱" tooltip="邮箱">
                <a-input v-model:value="formData.email" placeholder="请输入邮箱" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="nickName" label="昵称" tooltip="昵称">
                <a-input v-model:value="formData.nickName" placeholder="请输入昵称" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="entryDate" label="入职日期" tooltip="入职日期">
                <a-date-picker v-model:value="formData.entryDate" value-format="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <!-- 账号状态 -->
            <a-col :span="8">
              <a-form-item name="status" label="账号状态" tooltip="" required>
                <a-radio-group v-model:value="formData.status" option-type="button" button-style="solid" :options="statusOptions" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
        <a-card title="更多信息">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item name="college" label="毕业学校" tooltip="毕业学校">
                <a-input v-model:value="formData.college" placeholder="请输入毕业学校" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="education" label="学历" tooltip="">
                <a-input v-model:value="formData.education" placeholder="请输入学历" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="politicalOutlook" label="政治面貌" tooltip="">
                <a-input v-model:value="formData.politicalOutlook" placeholder="请输入政治面貌" allow-clear />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item name="homeTel" label="家庭电话" tooltip="">
                <a-input v-model:value="formData.homeTel" placeholder="请输入家庭电话" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="address" label="家庭住址" tooltip="家庭住址">
                <a-textarea v-model:value="formData.address" placeholder="请输入家庭住址" allowClear showCount :maxlength="100"/>
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
        <a-button type="primary" :loading="submitLoading" @click="onSubmit">保存</a-button>
      </a-flex>
    </template>
  </a-drawer>
</template>

<script setup>
import userApi from '@/api/system/userApi'

import { required } from '@/utils/formRules'
import { message } from "ant-design-vue"
import { useSettingsStore } from "@/store"
import OrgTreeSelect from "@/views/system/components/orgTreeSelect.vue"

// store
const settingsStore = useSettingsStore()

const emit = defineEmits({ successful: null })
// 默认是关闭状态
const visible = ref(false)
const title = ref()
// 计算属性 抽屉宽度
const drawerWidth = computed(() => {
  return settingsStore.menuCollapsed ? `calc(100% - 80px)` : `calc(100% - 210px)`
})

// 组织树
const treeData = ref([])

// 是否为编辑
const edit = ref(false)
// 表单数据
const formRef = ref()
// 有默认值
const formData = ref({
  gender: 0,
  status: 0
})
const dataLoading = ref(false)
const submitLoading = ref(false)
// 使用状态options（0正常 1停用）
const statusOptions = [
  { label: "正常", value: 0 },
  { label: "已停用", value: 1 }
]

// 打开抽屉
const onOpen = (row, tree, orgCode) => {
  // 组织树赋值并展开顶级节点
  treeData.value = tree
  if (row) {
    edit.value = true
    title.value = "编辑用户信息"
    // 组织树默认选中值,若在loadData中赋值则无法默认选中
    formData.value.orgCode = row.orgCode
    // 表单数据赋值
    loadData(row)
  } else {
    edit.value = false
    title.value = "新增用户信息"
    // 表单数据赋值
    formData.value.orgCode = orgCode
    // 数据就绪之后显示
    visible.value = true
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

// 选择上级加载模块的选择框
const parentChange = (value) => {
  formData.value.orgCode = value
}

// 验证并提交数据
const onSubmit = () => {
  formRef.value.validate().then(() => {
    submitLoading.value = true
    // formData.value 加工处理 add/edit
    let fun = userApi.addUser
    if (edit.value) {
      fun = userApi.editUser
    }
    // add/edit 发送不同请求
    fun(formData.value).then((res) => {
      message.success(res.message)
      emit('successful')
      onClose()
    }).finally(() => {
      submitLoading.value = false
    })
  }).catch(() => {
  })
}
// 调用这个函数将子组件的一些数据和方法暴露出去
defineExpose({
  onOpen
})
</script>
