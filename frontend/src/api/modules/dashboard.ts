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

/**
 * 获取流量统计（按类型）- 条形图
 */
export function getTrafficByType() {
  return request({
    url: '/dashboard/traffic-by-type',
    method: 'get',
  });
}

/**
 * 获取网络请求分布 - 饼图
 */
export function getRequestDistribution() {
  return request({
    url: '/dashboard/request-distribution',
    method: 'get',
  });
}

/**
 * 获取7天流量趋势 - 折线图
 */
export function getTrafficTrend() {
  return request({
    url: '/dashboard/traffic-trend',
    method: 'get',
  });
}

/**
 * 获取管理员待处理事项数量
 * ✅ Task 2.3: 实现待处理事项数据动态化
 */
export function getAdminPendingTasks() {
  return request({
    url: '/dashboard/admin-pending-tasks',
    method: 'get',
  });
}

