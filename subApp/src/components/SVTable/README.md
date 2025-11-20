VisActor/VTable 组件说明
====

封装说明
----

>  本组件是在开源项目VisActor VTable的基础上进行封装处理， [官方版(Table)](https://visactor.com/vtable/guide/Getting_Started/Getting_Started) 。
>
> 使用分页时，无需在关注分页逻辑，仅需向 Table 组件传递绑定 `:loadData="Promise" :columns="columns"` 即可

内置属性
----

| 属性              | 是否必需 | 说明                                 | 类型                 | 默认值  |
|-----------------|------|------------------------------------|--------------------|------|
| columns         | 是    | 表格列配置，可指定字段和列名                     | Array              | null |
| loadData        | 是    | 加载数据方法，必须为 `Promise` 对象            | Function           | null |
| showPagination  | 否    | 是否显示分页器(单页时会隐藏)                    | Boolean            | true |
| pageNum         | 否    | 当前页码                               | Number             | 1    |
| pageSize        | 否    | 单页大小，每页记录数                         | Number             | 1    |
| pageSizeOptions | 否    | 单页大小，每页记录数                         | Array              | -    |
| opConfig        | 否    | 尾列操作栏配置                            | Object             | -    |
| rowKey          | 否    | 行选择的key 选择变化时触发 rowSelectChange 事件 | [String, Function] | -    |

内置方法
----

通过 `声明的ref去调用 ==> tableRef.value` 调用

`tableRef.value.refresh(true)` 刷新列表 (用户新增/修改数据后，重载列表数据)

> 注意：要调用 `refresh(bool)` 需要给表格组件设定 `ref` 值
>
> `refresh()` 方法可以传一个 `bool` 值，当有传值 或值为 `true` 时，则刷新时会强制刷新到第一页

事件
----
* 列选择变更事件`rowSelectChange`: 当通过`rowKey`指定行选择key时，选择变化时触发。支持参数`(selectedRowKey, selectedRows)`
* 尾列操作事件`opClick`: 当通过`opConfig`定义尾列操作时可以由具体操作触发。支持参数`(name, record)`

插槽
----
* 默认插槽: 可通过`<ListColumn>`在列后面自定义列
* 操作区插槽`operator`: 可在表格上方插入组件

举例
----

```vue
<SVTable ref="tableRef" :loadData="loadData" :columns="columns"
         row-key="id" @rowSelectChange="onRowSelectChange"
         :opConfig="opConfig" @opClick="onOpClick">
  <template #operator>
    <!-- 操作区 -->
    <a-space wrap style="padding-bottom: 16px">
      <a-button type="primary" :icon="h(PlusOutlined)" @click="addFormRef.onOpen(module)">新增</a-button>
      <a-button type="primary" danger :disabled="selectedRowKeys.length!==1" :icon="h(MinusOutlined)" @click="deleteBatchButton">删除</a-button>
      <a-button type="dashed" danger :disabled="selectedRowKeys.length<2" :icon="h(DeleteOutlined)" @click="deleteBatchButton">批量删除</a-button>
    </a-space>
  </template>
  <!--      <ListColumn field="null" title="插槽传入"/>-->
</SVTable>
```

注意事项
----

> 你可能需要为了与后端提供的接口返回结果一致而去修改代码
> 需要注意的是，这里的修改是全局性的，意味着整个项目所有使用该 table 组件都需要遵守这个返回结果定义的字段。

返回 JSON 例子：
```json

```
