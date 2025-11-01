/**
 * 代理管理相关API
 */
import request from './request';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  StaticProxy,
  IPInventory,
  BuyDataItem,
  PriceCalculation,
  ProxyRegion,
  ProxyChannel,
  ExtractedProxies
} from '@/types/proxy';

// ==================== 静态住宅代理 ====================

/**
 * 获取IP库存
 */
export function getIPInventory(params?: {
  static_proxy_type?: 'shared' | 'premium';
  purpose_web?: string;
}) {
  return request.get<ApiResponse<IPInventory[]>>('/proxy/static/inventory', { params });
}

/**
 * 获取我的静态IP列表
 * 修复: /proxy/static/list → /proxy/static/my-proxies
 */
export function getMyStaticIPs(params?: {
  page?: number;
  limit?: number;
  zone?: string;
  country?: string;
  city?: string;
  status?: string;
  keyword?: string;
}) {
  return request.get<ApiResponse<PaginatedResponse<StaticProxy>>>('/proxy/static/my-proxies', { params });
}

/**
 * 获取静态IP详情
 */
export function getStaticIPDetail(id: number) {
  return request.get<ApiResponse<StaticProxy>>(`/proxy/static/${id}`);
}

/**
 * 购买静态IP (新版本 - 支持本地库存购买)
 * POST /proxy/static/purchase
 */
export function purchaseStaticProxy(data: {
  channelName: string;
  scenario?: string;
  ipType: 'normal' | 'native';
  duration: number;
  items: Array<{
    country: string;
    city: string;
    quantity: number;
  }>;
}) {
  return request.post<ApiResponse<{
    success: boolean;
    message: string;
    order: {
      id: string;
      orderNo: string;
      totalPrice: number;
      totalQuantity: number;
      duration: number;
    };
    allocatedIPs: Array<{
      id: string;
      ip: string;
      port: number;
      username: string;
      password: string;
      country: string;
      city: string;
      expiresAt: string;
    }>;
    newBalance: string;
  }>>('/proxy/static/purchase', data);
}

/**
 * 购买静态IP (原有版本 - 985Proxy API)
 * 修复: /proxy/static/buy → /orders/buy
 */
export function buyStaticIP(data: {
  zone: string;
  static_proxy_type: 'shared' | 'premium';
  time_period: number;
  purpose_web?: string;
  promo_code?: string;
  pay_type: 'balance' | 'gift';
  buy_data: BuyDataItem[];
}) {
  return request.post<ApiResponse<any>>('/orders/buy', data);
}

/**
 * 续期静态IP
 * 修复: /proxy/static/renew → /orders/renew
 */
export function renewStaticIP(data: {
  zone: string;
  time_period: number;
  pay_type: 'balance' | 'gift';
  renew_ip_list: string[];
}) {
  return request.post<ApiResponse<any>>('/orders/renew', data);
}

/**
 * 计算价格
 */
export function calculatePrice(data: {
  action: 'buy' | 'renew';
  time_period: number;
  static_proxy_type?: 'shared' | 'premium';
  buy_data?: BuyDataItem[];
  renew_ip_list?: string[];
  promo_code?: string;
}) {
  return request.post<ApiResponse<PriceCalculation>>('/proxy/static/calculate', data);
}

/**
 * 更新IP备注
 * 修复: PUT /proxy/static/:id/note → PATCH /proxy/static/:id/remark, note→remark
 */
export function updateIPNote(id: number, remark: string) {
  return request.patch<ApiResponse<void>>(`/proxy/static/${id}/remark`, { remark });
}

/**
 * 设置自动续费
 * 修复: PUT → PATCH
 */
export function setAutoRenew(id: number, data: {
  auto_renew: boolean;
  renew_days?: number;
  advance_days?: number;
}) {
  return request.patch<ApiResponse<void>>(`/proxy/static/${id}/auto-renew`, data);
}

/**
 * 释放IP
 */
export function releaseIP(id: number) {
  return request.delete<ApiResponse<void>>(`/proxy/static/${id}`);
}

// ==================== 动态住宅代理 ====================

/**
 * 获取地区列表
 * 修复: /proxy/rotating/regions → /proxy/rotating/cities
 */
export function getProxyRegions() {
  return request.get<ApiResponse<ProxyRegion[]>>('/proxy/rotating/cities');
}

/**
 * 提取代理IP
 */
export function extractProxy(data: {
  zone: string;
  num: number;
  country?: string;
  state?: string;
  city?: string;
  format?: number;
  result?: number;
}) {
  return request.post<ApiResponse<ExtractedProxies>>('/proxy/rotating/extract', data);
}

/**
 * 获取通道列表
 */
export function getProxyChannels(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return request.get<ApiResponse<PaginatedResponse<ProxyChannel>>>('/proxy/rotating/channels', { params });
}

/**
 * 创建通道
 */
export function createChannel(data: {
  channel_name: string;
  zone: string;
  country_code?: string;
  traffic_limit: number;
  price_per_gb: number;
}) {
  return request.post<ApiResponse<ProxyChannel>>('/proxy/rotating/channels', data);
}







  state?: string;
  city?: string;
  format?: number;
  result?: number;
}) {
  return request.post<ApiResponse<ExtractedProxies>>('/proxy/rotating/extract', data);
}

/**
 * 获取通道列表
 */
export function getProxyChannels(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return request.get<ApiResponse<PaginatedResponse<ProxyChannel>>>('/proxy/rotating/channels', { params });
}

/**
 * 创建通道
 */
export function createChannel(data: {
  channel_name: string;
  zone: string;
  country_code?: string;
  traffic_limit: number;
  price_per_gb: number;
}) {
  return request.post<ApiResponse<ProxyChannel>>('/proxy/rotating/channels', data);
}









  state?: string;
  city?: string;
  format?: number;
  result?: number;
}) {
  return request.post<ApiResponse<ExtractedProxies>>('/proxy/rotating/extract', data);
}

/**
 * 获取通道列表
 */
export function getProxyChannels(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return request.get<ApiResponse<PaginatedResponse<ProxyChannel>>>('/proxy/rotating/channels', { params });
}

/**
 * 创建通道
 */
export function createChannel(data: {
  channel_name: string;
  zone: string;
  country_code?: string;
  traffic_limit: number;
  price_per_gb: number;
}) {
  return request.post<ApiResponse<ProxyChannel>>('/proxy/rotating/channels', data);
}







  state?: string;
  city?: string;
  format?: number;
  result?: number;
}) {
  return request.post<ApiResponse<ExtractedProxies>>('/proxy/rotating/extract', data);
}

/**
 * 获取通道列表
 */
export function getProxyChannels(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return request.get<ApiResponse<PaginatedResponse<ProxyChannel>>>('/proxy/rotating/channels', { params });
}

/**
 * 创建通道
 */
export function createChannel(data: {
  channel_name: string;
  zone: string;
  country_code?: string;
  traffic_limit: number;
  price_per_gb: number;
}) {
  return request.post<ApiResponse<ProxyChannel>>('/proxy/rotating/channels', data);
}









  state?: string;
  city?: string;
  format?: number;
  result?: number;
}) {
  return request.post<ApiResponse<ExtractedProxies>>('/proxy/rotating/extract', data);
}

/**
 * 获取通道列表
 */
export function getProxyChannels(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return request.get<ApiResponse<PaginatedResponse<ProxyChannel>>>('/proxy/rotating/channels', { params });
}

/**
 * 创建通道
 */
export function createChannel(data: {
  channel_name: string;
  zone: string;
  country_code?: string;
  traffic_limit: number;
  price_per_gb: number;
}) {
  return request.post<ApiResponse<ProxyChannel>>('/proxy/rotating/channels', data);
}







  state?: string;
  city?: string;
  format?: number;
  result?: number;
}) {
  return request.post<ApiResponse<ExtractedProxies>>('/proxy/rotating/extract', data);
}

/**
 * 获取通道列表
 */
export function getProxyChannels(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return request.get<ApiResponse<PaginatedResponse<ProxyChannel>>>('/proxy/rotating/channels', { params });
}

/**
 * 创建通道
 */
export function createChannel(data: {
  channel_name: string;
  zone: string;
  country_code?: string;
  traffic_limit: number;
  price_per_gb: number;
}) {
  return request.post<ApiResponse<ProxyChannel>>('/proxy/rotating/channels', data);
}








