import request from '../request';

/**
 * 计算价格（会自动应用当前用户的价格覆盖）
 */
export function calculatePrice(data: {
  productType: string;
  buyData: Array<{
    country_code: string;
    city_name?: string;
    count: number;
  }>;
  timePeriod: number;
}) {
  return request({
    url: '/price/calculate',
    method: 'post',
    data,
  });
}

/**
 * 获取实时价格（985Proxy API）
 */
export function getRealtimePrice(data: {
  productType: string;
  locations: Array<{
    country: string;
    city?: string;
    quantity: number;
  }>;
  duration: number;
}) {
  return request({
    url: '/price/realtime',
    method: 'post',
    data,
  });
}


