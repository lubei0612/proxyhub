import request from '../request';

/**
 * 获取用户仪表盘概览数据
 */
export function getDashboardOverview() {
  return request({
    url: '/dashboard/overview',
    method: 'get',
  });
}

/**
 * 获取用户消费趋势
 */
export function getSpendingTrend() {
  return request({
    url: '/dashboard/spending-trend',
    method: 'get',
  });
}

