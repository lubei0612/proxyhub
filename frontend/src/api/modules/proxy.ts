import request from '../request';

/**
 * 获取静态代理列表
 */
export function getStaticProxyList(params?: any) {
  return request({
    url: '/proxy/static/list',
    method: 'get',
    params,
  });
}

/**
 * 购买静态代理
 */
export function purchaseStaticProxy(data: any) {
  return request({
    url: '/proxy/static/purchase',
    method: 'post',
    data,
  });
}

/**
 * 切换自动续期
 */
export function toggleAutoRenew(id: string) {
  return request({
    url: `/proxy/static/${id}/auto-renew`,
    method: 'put',
  });
}

/**
 * 更新备注
 */
export function updateProxyRemark(id: string, remark: string) {
  return request({
    url: `/proxy/static/${id}/remark`,
    method: 'put',
    data: { remark },
  });
}

/**
 * 获取实时库存信息（985Proxy API）
 * @param ipType - 'shared' | 'premium'
 * @param duration - 时长（天）
 * @param businessScenario - 业务场景（可选）
 */
export function getInventory(ipType: 'shared' | 'premium' = 'shared', duration: number = 30, businessScenario?: string) {
  return request({
    url: '/proxy/static/inventory',
    method: 'get',
    params: { ipType, duration, businessScenario },
  });
}

/**
 * 获取业务场景列表（985Proxy API）
 */
export function getBusinessScenarios() {
  return request({
    url: '/proxy/static/business-scenarios',
    method: 'get',
  });
}

/**
 * 获取国家列表（985Proxy API）
 */
export function getCountryList() {
  return request({
    url: '/proxy/static/country-list',
    method: 'get',
  });
}

/**
 * 获取城市列表（985Proxy API）
 * @param country 国家代码
 */
export function getCityList(country: string) {
  return request({
    url: '/proxy/static/city-list',
    method: 'get',
    params: { country },
  });
}

/**
 * 计算购买价格（985Proxy API）
 */
export function calculateStaticProxyPrice(data: {
  items: Array<{
    country: string;
    city: string;
    quantity: number;
  }>;
  ipType: 'shared' | 'premium';
  duration: number;
  channelName: string;
}) {
  return request({
    url: '/proxy/static/calculate-price',
    method: 'post',
    data,
  });
}

/**
 * 获取我的IP列表（985Proxy集成）
 */
export function getMyIPs(page: number = 1, limit: number = 20) {
  return request({
    url: '/proxy/static/my-ips',
    method: 'get',
    params: { page, limit },
  });
}

/**
 * 获取IP详情
 */
export function getIPDetail(ip: string) {
  return request({
    url: `/proxy/static/ip/${ip}`,
    method: 'get',
  });
}

/**
 * 续费IP（通过985Proxy）
 */
export function renewIPVia985(ip: string, duration: number) {
  return request({
    url: `/proxy/static/ip/${ip}/renew`,
    method: 'post',
    data: { duration },
  });
}

/**
 * 查询订单状态
 */
export function getOrderStatus(orderNo: string) {
  return request({
    url: `/proxy/static/order/${orderNo}/status`,
    method: 'get',
  });
}

/**
 * 续费静态代理
 */
export function renewStaticProxy(id: number, duration: number) {
  return request({
    url: `/proxy/static/${id}/renew`,
    method: 'post',
    data: { duration },
  });
}

/**
 * 释放静态代理
 */
export function releaseStaticProxy(id: number) {
  return request({
    url: `/proxy/static/${id}`,
    method: 'delete',
  });
}

// ============== 动态住宅代理 API ==============

/**
 * 获取动态通道列表
 */
export function getDynamicChannels(params?: any) {
  return request({
    url: '/proxy/dynamic/channels',
    method: 'get',
    params,
  });
}

/**
 * 创建动态通道
 */
export function createDynamicChannel(data: any) {
  return request({
    url: '/proxy/dynamic/channels',
    method: 'post',
    data,
  });
}

/**
 * 更新动态通道
 */
export function updateDynamicChannel(id: number, data: any) {
  return request({
    url: `/proxy/dynamic/channels/${id}`,
    method: 'put',
    data,
  });
}

/**
 * 删除动态通道
 */
export function deleteDynamicChannel(id: number) {
  return request({
    url: `/proxy/dynamic/channels/${id}`,
    method: 'delete',
  });
}

/**
 * 提取动态住宅IP
 */
export function extractDynamicProxy(data: {
  channelId: number;
  area?: string;
  state?: string;
  city?: string;
  life?: number;
  num?: number;
}) {
  return request({
    url: '/proxy/dynamic/extract',
    method: 'post',
    data,
  });
}

/**
 * 获取城市列表（985Proxy API）
 */
export function getDynamicCityList() {
  return request({
    url: '/proxy/dynamic/city-list',
    method: 'get',
  });
}

/**
 * 获取动态通道统计信息
 */
export function getDynamicStatistics() {
  return request({
    url: '/proxy/dynamic/statistics',
    method: 'get',
  });
}

