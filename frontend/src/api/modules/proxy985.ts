import request from '../request';

/**
 * 985Proxy API客户端
 */

// ==================== 库存相关 ====================

/**
 * 获取IP库存列表
 * @param ipType - IP类型 ('shared' | 'premium')
 * @param duration - 时长（天）
 */
export function getInventory(ipType: string, duration: number) {
  return request({
    url: '/proxy985/inventory',
    method: 'get',
    params: { ipType, duration },
  });
}

// ==================== 价格计算 ====================

export interface PriceCalculationRequest {
  productType: 'static_residential' | 'dynamic_residential';
  duration: number; // 天数
  locations: {
    country: string;
    city?: string;
    quantity: number;
  }[];
}

/**
 * 计算价格（实时从985Proxy获取）
 */
export function calculatePrice(data: PriceCalculationRequest) {
  return request({
    url: '/pricing/realtime',
    method: 'post',
    data,
  });
}

// ==================== 我的IPs ====================

/**
 * 获取我的IP列表
 * @param page - 页码
 * @param limit - 每页数量
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
 * @param id - IP ID
 */
export function getIPDetail(id: number) {
  return request({
    url: `/proxy/static/${id}`,
    method: 'get',
  });
}

// ==================== IP续费 ====================

export interface RenewIPRequest {
  ip: string;
  duration: number; // 天数
}

/**
 * 续费IP
 */
export function renewIP(data: RenewIPRequest) {
  return request({
    url: '/proxy/static/renew',
    method: 'post',
    data,
  });
}

// ==================== 订单状态 ====================

/**
 * 查询订单状态
 * @param orderNo - 订单号
 */
export function checkOrderStatus(orderNo: string) {
  return request({
    url: `/proxy/static/order/${orderNo}/status`,
    method: 'get',
  });
}

/**
 * 购买静态IP
 */
export interface PurchaseStaticProxyRequest {
  ipType: 'shared' | 'premium';
  duration: number; // 天数
  locations: {
    country: string;
    city: string;
    quantity: number;
  }[];
}

export function purchaseStaticProxy(data: PurchaseStaticProxyRequest) {
  return request({
    url: '/proxy/static/purchase',
    method: 'post',
    data,
  });
}

