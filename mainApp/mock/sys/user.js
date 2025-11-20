// mock的接口返回数据
export default [
  // 登陆接口
  {
    url: '/api/auth/login',
    method: 'post',
    response: {
      "code": 0,
      "message": "成功",
      "data": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdXBlckFkbWluIiwianRpIjoiNGZlMjIzY2Y1OTUyNGU0ZTk1NjlkMThkNTU5YzI3NTUiLCJwZXJtcyI6WyJzeXM6dXNlcjp0bXAiLCIxNjM1MTEwNDE2MjYzMjYyMjA5IiwiMTU3MTEzMTA0MzUzMjM0MTI0OSIsIjE1NDg5MDExMTE5OTk3NzM0NDAiLCIxNTQ4OTAxMTExOTk5NzcwOTI2IiwiMTgxMzk1OTY1ODAxMzQzMzg1OCIsIjE1NDg5MDExMTE5OTk3NzM0NDEiLCIxNTQ4OTAxMTExOTk5NzczNDQyIiwiMTU0ODkwMTExMTk5OTc3MzQ0MyIsIjE1NDg5MDExMTE5OTk3NzM0NDQiLCIxNTQ4OTAxMTExOTk5NzcwNTI2IiwiMTU0ODkwMTExMTk5OTc3MzQ0NSIsIjE2MjMzNzg5OTYwOTk0MTE5NjkiLCIxNTQ4OTAxMTExOTk5NzczMzI2IiwiMTU0ODkwMTExMTk5OTc3MTIyNiIsIjE1NDg5MDExMTE5OTk3NzI0MjYiLCIxNTQ4OTAxMTExOTk5NzczNDM4IiwiMTU0ODkwMTExMTk5OTc3MzQzOSIsIjE1NzExMzIzOTM5OTMzNzE2NDkiLCIxNTQ4OTAxMTExOTk5NzcxMDI2IiwiMTU0ODkwMTExMTk5OTc3MjYyNiIsIjY3OTY2NjU2NjQwZTcxOGY3MGEzMjQ1OCIsIjE1NDg5MDExMTE5OTk3NzI4MjYiLCIxNTcxMTMyMDc2ODUzNjU3NjAxIiwiMTgxMTMyODQwMjk4OTY2MjIxMCIsInN5c19vcmdfYWRkIiwiMTgxMTI5MDkzNzUwMzM4NzY1MCIsIjE1NzExMzA3NTYxNTU0MDgzODYiLCIxNTQ4OTAxMTExOTk5NzczNDMwIiwiMTU3MTEzMDgxMTA1ODg0Nzc0NSIsImluZGV4IiwiMTU0ODkwMTExMTk5OTc3MzQzMSIsInN5c19vcmdfZWRpdCIsIjE1NzExMzE0MjczNjE0ODg4OTgiLCIxNTQ4OTAxMTExOTk5NzczNDMyIiwiMTU0ODkwMTExMTk5OTc3MTcyNiIsIjE1NDg5MDExMTE5OTk3NzM0MzMiLCIxNTQ4OTAxMTExOTk5NzcyMDI2IiwiMTU0ODkwMTExMTk5OTc3MzQzNCIsIjE1NDg5MDExMTE5OTk3NzM0MzUiLCJEbFhnUzNVcHlUIiwiMTU0ODkwMTExMTk5OTc3MjIyNiIsIjE1NDg5MDExMTE5OTk3NzM0MzYiLCIxNTQ4OTAxMTExOTk5NzcxMzI2IiwiMTU0ODkwMTExMTk5OTc3MzQzNyIsIjE1NDg5MDExMTE5OTk3NzM0MjciLCIxNjg5ODkyMjAyNjc5Mzc3OTIxIiwiMTU0ODkwMTExMTk5OTc3MzQyOCIsInN5czpvcmc6bGlzdDMiLCIxODExMzMwMzU5Njk1NDAwOTYxIiwiMTU0ODkwMTExMTk5OTc3MzQyOSIsIjE2MzUxMTA1MzY0NTEwNDMzMjkiLCIxNTcxMTMxNzI3NjU2ODc4MDgxIiwiMTU3MTEzMjY1ODg1MTA4NjMzOCIsIjE1NDg5MDExMTE5OTk3NzE5MjYiLCIxODExMjkwOTM3NDg2NjEwNDM0IiwiMTgxMTgwMDU4NDQyNTUwMDY3NCIsIjE1NzExMzI1NzYxNDM2MDU3NjEiLCIxNjg5ODkxNDA1MzY3MzUzMzQ2Iiwic3lzX29yZ19hZGQyIiwiMTU0ODkwMTExMTk5OTc3Mzk4MCIsIjE4MTEyOTA5Mzc0NDQ2NjczOTMiLCIxNTQ4OTAxMTExOTk5NzcwODI2IiwiMTU0ODkwMTExMTk5OTc3MzIyNiIsIjE1NDg5MDExMTE5OTk3NzM5NzgiLCIxNTQ4OTAxMTExOTk5NzcyNTI2IiwiMTU0ODkwMTExMTk5OTc3Mzk3OSIsIjE1NDg5MDExMTE5OTk3NzI3MjYiLCIxNTQ4OTAxMTExOTk5NzcyOTI2IiwiMTU3MTEzMDk3MzI5NDUyNjQ2NSIsIjE4MTEyOTA5Mzc0Njk4MzMyMTciLCJzeXNfdXNyX3RtcF9saXN0IiwiMTgxMTI5MDkzNzQ5NDk5OTA0MiIsIjE2ODk4OTQzMTY1NTQwNjc5NjkiLCJzeXMtb3JnLWxpc3QiLCJzeXNfb3JnX2RlbGV0ZSIsIjE1NDg5MDExMTE5OTk3NzMyNTQiLCIxNTQ4OTAxMTExOTk5NzcxODI2IiwiMTU0ODkwMTExMTk5OTc3MTQyNiIsIjE1NDg5MDExMTE5OTk3NzIzMjYiLCIxNTcxMTMyNDY4MTc4MDI2NDk3IiwiMTU3MTEzMTU0NDk3Mzk2NzM2MSIsIjE1NzExMzExMzcwMDY2MDAxOTMiLCIxNjg5ODk0NTc3MjM4NDUwMTc3IiwiMTYyMzM3ODY3NTU5MTY3MTgxMCIsIjE1NzExMjk5Mjk5NjE0MDY0NjYiLCI2N2E1NmQxY2QxOTA1OWQxY2M3Mzc1OGUiLCIxNTcxMTI5NTI5NTY0NzU4MDE3Il0sInJvbGVzIjpbIjY3NWY5MDNiZDE5MDFiMzI2YTIyODg2NSIsInN1cGVyYWRtaW4iLCJhZG1pbiIsIndlaXlpY29kZSJdfQ.6GXvYA2ec-7c9RlSGwQI6ZkooQA4hTTzLNiCs-FQrDY",
    }
  },
  // 用户信息
  {
    url: '/api/sys/userCenter/userInfo',
    method: 'post',
    response: {
      "code": 0,
      "message": "成功",
      "data": {
        "account": "superAdmin",
        "name": "superAdmin",
        "roles": [
          "ROOT",
          "superAdmin"
        ],
        "perms": [],
        "orgCode": "11000000",
        "groupCode": "G1897207291765641216",
        "dataScope": 3,
        "scopes": [],
        "groupInfoList": [
          {
            "code": "G1897207291765641216",
            "name": "总部兼职岗",
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
    response:{
      "code": 0,
      "message": "成功",
      "data": [
        {
          "code": "sys_module",
          "parentCode": "0",
          "weight": 1,
          "name": "系统模块",
          "path": "/sysModule",
          "component": "",
          "meta": {
            "icon": "appstore-add-outlined",
            "menuType": 1,
            "title": "系统模块"
          },
          "children": [
            {
              "code": "dir_sys_org",
              "parentCode": "sys_module",
              "weight": 4,
              "name": "组织架构",
              "path": "/org",
              "component": "Layout",
              "meta": {
                "icon": "apartment-outlined",
                "menuType": 2,
                "title": "组织架构"
              },
              "children": [
                {
                  "code": "menu_sys_org",
                  "parentCode": "dir_sys_org",
                  "weight": 5,
                  "name": "组织管理",
                  "path": "/sys/org",
                  "component": "sys/org/index",
                  "meta": {
                    "icon": "cluster-outlined",
                    "menuType": 3,
                    "title": "组织管理"
                  }
                },
                {
                  "code": "menu_sys_user",
                  "parentCode": "dir_sys_org",
                  "weight": 6,
                  "name": "用户管理",
                  "path": "/sys/user",
                  "component": "sys/user/index",
                  "meta": {
                    "icon": "user-outlined",
                    "menuType": 3,
                    "title": "用户管理"
                  }
                }
              ]
            },
            {
              "code": "dir_sys_perm",
              "parentCode": "sys_module",
              "weight": 8,
              "name": "权限控制",
              "path": "/perm",
              "component": "Layout",
              "meta": {
                "icon": "user-switch-outlined",
                "menuType": 2,
                "title": "权限控制"
              },
              "children": [
                {
                  "code": "menu_sys_group",
                  "parentCode": "dir_sys_perm",
                  "weight": 7,
                  "name": "岗位权限",
                  "path": "/sys/group",
                  "component": "sys/group/index",
                  "meta": {
                    "icon": "team-outlined",
                    "menuType": 3,
                    "title": "岗位权限"
                  }
                },
                {
                  "code": "menu_sys_role",
                  "parentCode": "dir_sys_perm",
                  "weight": 9,
                  "name": "角色管理",
                  "path": "/sys/role",
                  "component": "sys/role/index",
                  "meta": {
                    "icon": "deployment-unit-outlined",
                    "menuType": 3,
                    "title": "角色管理"
                  }
                }
              ]
            },
            {
              "code": "dir_sys_resource",
              "parentCode": "sys_module",
              "weight": 12,
              "name": "资源管理",
              "path": "/sys/resource",
              "component": "Layout",
              "meta": {
                "icon": "trademark-circle-outlined",
                "menuType": 2,
                "title": "资源管理"
              },
              "children": [
                {
                  "code": "menu_sys_module",
                  "parentCode": "dir_sys_resource",
                  "weight": 10,
                  "name": "模块管理",
                  "path": "/sys/module",
                  "component": "sys/resource/module/index",
                  "meta": {
                    "icon": "appstore-add-outlined",
                    "menuType": 3,
                    "title": "模块管理"
                  }
                },
                {
                  "code": "menu_sys_menu",
                  "parentCode": "dir_sys_resource",
                  "weight": 11,
                  "name": "菜单管理",
                  "path": "/sys/menu",
                  "component": "sys/resource/menu/index",
                  "meta": {
                    "icon": "pic-left-outlined",
                    "menuType": 3,
                    "title": "菜单管理"
                  }
                },
                {
                  "code": "menu_sys_button",
                  "parentCode": "dir_sys_resource",
                  "weight": 12,
                  "name": "接口管理",
                  "path": "/sys/button",
                  "component": "sys/resource/button/index",
                  "meta": {
                    "icon": "api-outlined",
                    "menuType": 3,
                    "title": "接口管理"
                  }
                }
              ]
            }
          ]
        },
        {
          "code": "biz_module",
          "parentCode": "0",
          "weight": 2,
          "name": "业务模块",
          "path": "/bizModule",
          "component": "",
          "meta": {
            "icon": "profile-outlined",
            "menuType": 1,
            "title": "业务模块"
          },
          "children": [
            {
              "code": "dir_biz_company",
              "parentCode": "biz_module",
              "weight": 51,
              "name": "公司架构",
              "path": "/1nlpdpnief",
              "component": "Layout",
              "meta": {
                "icon": "cluster-outlined",
                "menuType": 2,
                "title": "公司架构"
              },
              "children": [
                {
                  "code": "menu_biz_pos",
                  "parentCode": "dir_biz_company",
                  "weight": 54,
                  "name": "岗位管理",
                  "path": "/biz/position",
                  "component": "biz/position/index",
                  "meta": {
                    "icon": "apartment-outlined",
                    "menuType": 3,
                    "title": "岗位管理"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },
];