import type { App } from "vue";

import VxeUIBase, { VxeUI } from 'vxe-pc-ui'
import 'vxe-pc-ui/es/style.css'
import VxeUITable from 'vxe-table'
import 'vxe-table/lib/style.css'
import VxeUIPluginExportXLSX from '@vxe-ui/plugin-export-xlsx'
import ExcelJS from 'exceljs'

function configVxe() {
  // VxeUI 是 Vxe 库通用全局实例（也可以使用旧别名 VXETable）
  VxeUI.setConfig({
    size: "medium",
    table: {
      border: true,
      // 所有的列对齐方式
      align: "center",
      // 当内容过长时显示为省略号
      showOverflow: "tooltip",
      minHeight: 200,
      // 行配置信息
      rowConfig: {
        useKey: true,
        // 自定义行数据唯一主键的字段名
        keyField: "id",
        // 当鼠标点击行时，是否要高亮当前行
        isCurrent: true,
      },
      // 列配置信息
      columnConfig: {
        // 每一列是否启用列宽拖动
        resizable: true,
      },
      // 个性化信息配置项
      customConfig: {
        immediate: true,
      },
      // 导入配置
      importConfig: {
      },
      // 导出配置
      exportConfig: {
        type: "xlsx",
        sheetName: "sheet1",
      },
    },
    pager: {
      perfect: true,
      // 每页大小，默认 10
      pageSize: 10,
      // 每页大小选项列表
      pageSizes: [10, 20, 50, 100],
      layouts: [
        "Total",
        "Home",
        "PrevPage",
        "Jump",
        "PageCount",
        "NextPage",
        "End",
        "Sizes",
      ],
    },
    grid: {
      // 分页配置项
      pagerConfig: {
      },
      // 工具栏配置
      toolbarConfig: {
        // 是否显示个性化列配置
        custom: true,
        // 是否允许最大化显示
        zoom: true,
        // 刷新按钮配置
        refresh: true,
        //插槽
        slots: {
          // 按钮列表
          buttons: "operator",
        },
      },
    }
  });
}

// 全局注册 vxeTable
export function setupVxeTable(app: App<Element>) {
  configVxe()
  // 导入导出excel格式文件插件
  VxeUI.use(VxeUIPluginExportXLSX, {
    ExcelJS
  })
  app.use(VxeUIBase)
  app.use(VxeUITable)
}