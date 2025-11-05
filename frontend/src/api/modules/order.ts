import request from '../request';

/**
 * 获取用户订单列表
 */
export function getUserOrders(params?: any) {
  return request({
    url: '/orders',
    method: 'get',
    params,
  });
}

/**
 * 获取订单详情
 */
export function getOrderDetail(id: string) {
  return request({
    url: `/orders/${id}`,
    method: 'get',
  });
}

/**
 * 获取所有订单（管理员）
 */
export function getAllOrders(params?: any) {
  return request({
    url: '/orders/admin/all',
    method: 'get',
    params,
  });
}

/**
 * 取消订单（管理员）
 */
export function cancelOrder(id: number) {
  return request({
    url: `/orders/${id}/cancel`,
    method: 'patch',
  });
}

/**
 * 获取用户事件日志
 */
export function getEventLogs(params?: any) {
  return request({
    url: '/event-logs/my',
    method: 'get',
    params,
  });
}

