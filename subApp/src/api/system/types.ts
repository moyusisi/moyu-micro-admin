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
  // 当前组织机构
  orgCode?: string;
  // 当前岗位
  groupCode?: string;
  // 数据权限范围
  dataScope?: number;
  // 自定义数据权限集合
  scopes?: string[];
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