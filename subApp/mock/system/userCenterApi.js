// mock的接口返回数据
export default [
  // 用户信息
  {
    url: '/api/sys/userCenter/userInfo',
    method: 'post',
    response: {
      "code": "00000",
      "message": "成功",
      "data": {
        "account": "superAdmin",
        "orgCode": "11000000",
        "name": "超管",
        "roles": [
          "r_superAdmin",
          "r_default"
        ],
        "perms": [
          "auth:session:delete",
          "auth:session:deleteToken",
          "auth:session:page"
        ],
        "groupCode": "g_default",
        "groupOrgCode": "11000000",
        "dataScope": 1,
        "groupInfoList": [
          {
            "code": "g_default",
            "name": "系统默认",
            "orgCode": "11000000",
            "orgName": "集团总部",
            "orgFullName": "MY集团-集团总部"
          }
        ]
      }
    },
  },
  // 用户菜单
  {
    url: '/api/sys/userCenter/userMenu',
    method: 'post',
    response: {
      "code": "00000",
      "message": "成功",
      "data": [
        {
          "code": "sys_module",
          "parentCode": "0",
          "weight": 1,
          "name": "系统模块",
          "redirect": "/auth/monitor",
          "path": "/sysModule",
          "component": "Layout",
          "meta": {
            "title": "系统模块",
            "type": "module",
            "icon": "appstore-add-outlined",
            "keepAlive": true
          },
          "children": [
            {
              "code": "dir_sys_org",
              "parentCode": "sys_module",
              "weight": 10,
              "name": "组织架构",
              "path": "/org",
              "meta": {
                "title": "组织架构",
                "type": "dir",
                "icon": "apartment-outlined",
                "keepAlive": true
              },
              "children": [
                {
                  "code": "menu_sys_org",
                  "parentCode": "dir_sys_org",
                  "weight": 1010,
                  "name": "组织管理",
                  "path": "/sys/org",
                  "component": "system/org/index",
                  "meta": {
                    "title": "组织管理",
                    "type": "menu",
                    "icon": "cluster-outlined",
                    "keepAlive": true
                  }
                },
                {
                  "code": "menu_sys_user",
                  "parentCode": "dir_sys_org",
                  "weight": 1020,
                  "name": "用户管理",
                  "path": "/sys/user",
                  "component": "system/user/index",
                  "meta": {
                    "title": "用户管理",
                    "type": "menu",
                    "icon": "user-outlined",
                    "keepAlive": true
                  }
                }
              ]
            },
            {
              "code": "dir_sys_perm",
              "parentCode": "sys_module",
              "weight": 20,
              "name": "权限控制",
              "path": "/perm",
              "meta": {
                "title": "权限控制",
                "type": "dir",
                "icon": "user-switch-outlined",
                "keepAlive": true
              },
              "children": [
                {
                  "code": "menu_sys_group",
                  "parentCode": "dir_sys_perm",
                  "weight": 2010,
                  "name": "岗位权限",
                  "path": "/sys/group",
                  "component": "system/group/index",
                  "meta": {
                    "title": "岗位权限",
                    "type": "menu",
                    "icon": "team-outlined",
                    "keepAlive": true
                  }
                },
                {
                  "code": "menu_sys_role",
                  "parentCode": "dir_sys_perm",
                  "weight": 2020,
                  "name": "角色管理",
                  "path": "/sys/role",
                  "component": "system/role/index",
                  "meta": {
                    "title": "角色管理",
                    "type": "menu",
                    "icon": "deployment-unit-outlined",
                    "keepAlive": true
                  }
                }
              ]
            },
            {
              "code": "dir_sys_resource",
              "parentCode": "sys_module",
              "weight": 30,
              "name": "资源管理",
              "path": "/sys/resource",
              "meta": {
                "title": "资源管理",
                "type": "dir",
                "icon": "trademark-circle-outlined",
                "keepAlive": true
              },
              "children": [
                {
                  "code": "menu_sys_module",
                  "parentCode": "dir_sys_resource",
                  "weight": 3010,
                  "name": "模块管理",
                  "path": "/sys/module",
                  "component": "system/resource/module/index",
                  "meta": {
                    "title": "模块管理",
                    "type": "menu",
                    "icon": "appstore-add-outlined",
                    "keepAlive": true
                  }
                },
                {
                  "code": "menu_sys_menu",
                  "parentCode": "dir_sys_resource",
                  "weight": 3020,
                  "name": "菜单管理",
                  "path": "/sys/menu",
                  "component": "system/resource/menu/index",
                  "meta": {
                    "title": "菜单管理",
                    "type": "menu",
                    "icon": "pic-left-outlined",
                    "keepAlive": true
                  }
                },
                {
                  "code": "menu_sys_button",
                  "parentCode": "dir_sys_resource",
                  "weight": 3030,
                  "name": "接口管理",
                  "path": "/sys/button",
                  "component": "system/resource/button/index",
                  "meta": {
                    "title": "接口管理",
                    "type": "menu",
                    "icon": "api-outlined",
                    "keepAlive": true
                  }
                }
              ]
            },
            {
              "code": "dir_sys_dev",
              "parentCode": "sys_module",
              "weight": 40,
              "name": "系统工具",
              "path": "/dev",
              "meta": {
                "title": "系统工具",
                "type": "dir",
                "icon": "tool-outlined",
                "keepAlive": true
              },
              "children": [
                {
                  "code": "menu_sys_gen",
                  "parentCode": "dir_sys_dev",
                  "weight": 4010,
                  "name": "代码生成",
                  "path": "/dev/gen",
                  "component": "dev/gen/index",
                  "meta": {
                    "title": "代码生成",
                    "type": "menu",
                    "icon": "code-outlined",
                    "keepAlive": true
                  }
                }
              ]
            },
            {
              "code": "dir_sys_ops",
              "parentCode": "sys_module",
              "weight": 50,
              "name": "系统运维",
              "path": "/ops",
              "meta": {
                "title": "系统运维",
                "type": "dir",
                "icon": "hdd-outlined",
                "keepAlive": true
              },
              "children": [
                {
                  "code": "menu_sys_session",
                  "parentCode": "dir_sys_ops",
                  "weight": 5001,
                  "name": "会话管理",
                  "path": "/auth/monitor",
                  "component": "auth/monitor/index",
                  "meta": {
                    "title": "会话管理",
                    "type": "menu",
                    "icon": "usergroup-delete-outlined",
                    "keepAlive": true
                  }
                },
                {
                  "code": "menu_sys_log",
                  "parentCode": "dir_sys_ops",
                  "weight": 5002,
                  "name": "系统日志",
                  "path": "/ops/sys/log",
                  "component": "system/log/index",
                  "meta": {
                    "title": "系统日志",
                    "type": "menu",
                    "icon": "bars-outlined",
                    "keepAlive": true
                  }
                },
								{
									"code": "6921c13293123a2d0d7131f0",
									"parentCode": "biz_module",
									"weight": 5003,
									"name": "子应用菜单",
									"path": "/subApp1/ops/sys/log",
									"component": "log",
									"meta": {
										"title": "子应用菜单",
										"type": "menu"
									}
								}
              ]
            }
          ]
        }
      ]
    }
  },
  // 登陆用户的组织机构树
  {
    url: '/api/sys/userCenter/userOrgTree',
    method: 'post',
    response: {
      "code": "00000",
      "message": "成功",
      "data": [
        {
          "code": "11000000",
          "parentCode": "10000000",
          "weight": 2,
          "name": "集团总部",
          "orgType": 1,
          "sortNum": 2,
          "children": [
            {
              "code": "11001000",
              "parentCode": "11000000",
              "weight": 22,
              "name": "总部财务部",
              "orgType": 2,
              "sortNum": 22
            },
            {
              "code": "11002000",
              "parentCode": "11000000",
              "weight": 24,
              "name": "总部科技部",
              "orgType": 2,
              "sortNum": 24
            }
          ]
        }
      ]
    }
  },
  // 当前用户拥有的角色列表
  {
    url: '/api/sys/userCenter/userRoleList',
    method: 'post',
    response: {
      "code": "00000",
      "message": "成功",
      "data": []
    }
  },
];
