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
 * ✅ 删除用户
 */
export function deleteUser(userId: string) {
  return request({
    url: `/admin/users/${userId}`,
    method: 'delete',
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

/**
 * 获取收入趋势（管理员）
 */
export function getRevenueTrend(days = 7) {
  return request({
    url: '/admin/revenue-trend',
    method: 'get',
    params: { days },
  });
}

/**
 * 赠送余额（管理员）
 */
export function giftBalance(userId: string, amount: number, remark?: string) {
  return request({
    url: `/admin/users/${userId}/gift-balance`,
    method: 'post',
    data: { amount, remark },
  });
}

/**
 * 扣除余额（管理员）
 */
export function deductBalance(userId: string, amount: number, remark?: string) {
  return request({
    url: `/admin/users/${userId}/deduct-balance`,
    method: 'post',
    data: { amount, remark },
  });
}

/**
 * 获取用户级IP池（用于价格覆盖管理）
 * @param userId 用户ID
 */
export function getUserIpPool(userId: number) {
  return request({
    url: `/price/user-ip-pool/${userId}`,
    method: 'get',
  });
}

/**
 * 批量更新用户级价格覆盖
 * @param userId 用户ID
 * @param data 更新数据 { updates: [...] }
 */
export function updateUserPriceOverrides(userId: number, data: { updates: any[] }) {
  return request({
    url: `/price/user-overrides/${userId}/batch`,
    method: 'post',
    data,
  });
}

/**
 * 获取用户购买的IP列表（管理员）
 */
export function getUserIPs(userId: string) {
  return request({
    url: `/admin/users/${userId}/ips`,
    method: 'get',
  });
}

/**
 * 创建新用户（管理员）
 */
export function createUser(data: { email: string; password: string; role: string; initialBalance: number }) {
  return request({
    url: '/admin/users',
    method: 'post',
    data,
  });
}

