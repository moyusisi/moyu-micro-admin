/**
 * 类型定义
 */

// 登录用户信息
export interface UserInfo {
  account?: string;
  name?: string;
  nickname?: string;
  avatar?: string;
  // 角色数组
  roles?: string[];
  // 权限数组
  perms?: string[];
  // 用户组织机构
  orgCode?: string;
  // 当前岗位
  groupCode?: string;
  // 当前岗位归属组织的编码
  groupOrgCode?: string;
  // 所有岗位信息列表
  groupInfoList?: groupInfo[];
}

/**
 * 岗位分组信息
 */
export interface groupInfo {
  // 岗位编码
  code?: string;
  // 岗位名称
  name?: string;
  // 所属组织机构
  orgCode?: string;
  // 所属组织机构名称
  orgName?: string;
  // 所属组织机构全称
  orgFullName?: string;
}