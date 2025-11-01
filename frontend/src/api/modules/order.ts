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

