import request from '../request';

/**
 * 获取所有用户列表（管理员）
 */
export function getAllUsers(params?: any) {
  return request({
    url: '/admin/users',
    method: 'get',
    params,
  });
}

/**
 * 获取系统统计数据（管理员）
 */
export function getAdminStatistics() {
  return request({
    url: '/admin/statistics',
    method: 'get',
  });
}

/**
 * 更新用户状态（管理员）
 */
export function updateUserStatus(userId: string, status: string) {
  return request({
    url: `/admin/users/${userId}/status`,
    method: 'put',
    data: { status },
  });
}

/**
 * 更新用户角色（管理员）
 */
export function updateUserRole(userId: string, role: string) {
  return request({
    url: `/admin/users/${userId}/role`,
    method: 'put',
    data: { role },
  });
}

/**
 * 获取系统设置（管理员）
 */
export function getSystemSettings() {
  return request({
    url: '/admin/settings',
    method: 'get',
  });
}

/**
 * 更新系统设置（管理员）
 */
export function updateSystemSetting(key: string, value: string) {
  return request({
    url: `/admin/settings/${key}`,
    method: 'put',
    data: { value },
  });
}

/**
 * 获取待处理事项（管理员）
 */
export function getPendingItems() {
  return request({
    url: '/admin/pending-items',
    method: 'get',
  });
}

/**
 * 获取最近订单（管理员）
 */
export function getRecentOrders(limit = 5) {
  return request({
    url: '/admin/recent-orders',
    method: 'get',
    params: { limit },
  });
}

