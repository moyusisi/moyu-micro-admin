/**
 * 权限工具函数
 *
 * 使用示例:
 * import { hasPerm } from "@/utils/permission"
 * 脚本中：if (hasPerm(['sys:user:add']))
 * 模板中：v-if="hasPerm(['sys:user:add'])"
 */
import { useUserStore } from '@/store/index.js'

const userStore = useUserStore()

// const { roles: userRoles = [], perms: userPerms = [] } = userStore.userInfo;
const userRoles = userStore.userInfo?.roles ?? [];
const userPerms = userStore.userInfo?.perms ?? [];

/**
 * 检查是否有权限
 * @param value 权限标识
 * @returns 是否有权限
 */
export function hasPerm(value: string | string[]): boolean {
  return Array.isArray(value)
    ? hasAnyPerm(value)
    : userPerms.includes(value)
}

/**
 * 检查是否有任一权限
 * @param perms 权限标识数组
 * @returns 是否有任一权限
 */
export function hasAnyPerm(perms: string[]): boolean {
  return perms.some((perm: string) => {
    return userPerms.includes(perm)
  })
}

/**
 * 检查是否有所有权限
 * @param perms 权限标识数组
 * @returns 是否有所有权限
 */
export function hasAllPerms(perms: string[]): boolean {
  return perms.every((perm: string) => {
    return userPerms.includes(perm)
  })
}

/**
 * 检查是否有角色
 * @param value 角色标识
 * @returns 是否有角色
 */
export function hasRole(value: string | string[]): boolean {
  return Array.isArray(value)
    ? hasAnyRole(value)
    : userRoles.includes(value)
}

/**
 * 检查是否有任一角色
 * @param roles 角色标识数组
 * @returns 是否有任一角色
 */
export function hasAnyRole(roles: string[]): boolean {
  return roles.some((role: string) => {
    return userPerms.includes(role)
  })
}

/**
 * 检查是否有所有角色
 * @param roles 角色标识数组
 * @returns 是否有所有角色
 */
export function hasAllRoles(roles: string[]): boolean {
  return roles.every((role: string) => {
    return userPerms.includes(role)
  })
}