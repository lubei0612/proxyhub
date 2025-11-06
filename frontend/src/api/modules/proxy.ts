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
 */
export function getInventory(ipType: 'shared' | 'premium' = 'shared', duration: number = 30) {
  return request({
    url: '/proxy/static/inventory',
    method: 'get',
    params: { ipType, duration },
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

