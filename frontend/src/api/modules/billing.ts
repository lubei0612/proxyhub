import request from '../request';

/**
 * 创建充值订单
 */
export function createRecharge(data: { amount: number; method: string }) {
  return request({
    url: '/billing/recharge',
    method: 'post',
    data,
  });
}

/**
 * 获取用户充值记录
 */
export function getUserRecharges(params?: any) {
  return request({
    url: '/billing/recharges',
    method: 'get',
    params,
  });
}

/**
 * 获取用户交易记录
 */
export function getUserTransactions(params?: any) {
  return request({
    url: '/billing/transactions',
    method: 'get',
    params,
  });
}

/**
 * 管理员审核充值
 */
export function approveRecharge(id: string, data: { approved: boolean; remark?: string }) {
  return request({
    url: `/billing/recharge/${id}/approve`,
    method: 'put',
    data,
  });
}

/**
 * 获取所有充值记录（管理员）
 */
export function getAllRecharges(params?: any) {
  return request({
    url: '/billing/admin/recharges',
    method: 'get',
    params,
  });
}

