import request from '../request';

// IP池项目接口
export interface IpPoolItem {
  country: string;
  countryName: string;
  city: string;
  ipType: 'shared' | 'premium';
  ipTypeName: string;
  stock: number;
  continent: string;
  defaultPrice: number;
  overridePrice: number | null;
  overrideId: number | null;
  priceConfigId: number | null;
}

// IP池响应接口
export interface IpPoolResponse {
  data: IpPoolItem[];
  total: number;
  statistics: {
    totalRegions: number;
    overridedCount: number;
    notOverridedCount: number;
  };
}

// 批量更新请求接口
export interface BatchUpdateItem {
  country: string;
  city: string;
  ipType: string;
  overridePrice: number | null;
}

/**
 * 获取IP池列表（用于价格覆盖管理）
 */
export const getIpPool = () => {
  return request<IpPoolResponse>({
    url: '/price/ip-pool',
    method: 'GET',
  });
};

/**
 * 批量更新价格覆盖
 */
export const batchUpdatePriceOverrides = (updates: BatchUpdateItem[]) => {
  return request({
    url: '/price/overrides/batch',
    method: 'POST',
    data: { updates },
  });
};

/**
 * 获取价格配置列表
 */
export const getPriceConfigs = () => {
  return request({
    url: '/price/configs',
    method: 'GET',
  });
};

/**
 * 更新价格配置
 */
export const updatePriceConfig = (id: number, data: { basePrice?: number; isActive?: boolean }) => {
  return request({
    url: `/price/configs/${id}`,
    method: 'PUT',
    data,
  });
};

/**
 * 获取价格覆盖列表
 */
export const getPriceOverrides = (productType?: string) => {
  return request({
    url: '/price/overrides',
    method: 'GET',
    params: { productType },
  });
};

/**
 * 创建价格覆盖
 */
export const createPriceOverride = (data: {
  productType: string;
  countryCode: string;
  cityName?: string;
  overridePrice: number;
  isActive?: boolean;
}) => {
  return request({
    url: '/price/overrides',
    method: 'POST',
    data,
  });
};

/**
 * 更新价格覆盖
 */
export const updatePriceOverride = (id: number, data: { overridePrice?: number; isActive?: boolean }) => {
  return request({
    url: `/price/overrides/${id}`,
    method: 'PUT',
    data,
  });
};

/**
 * 删除价格覆盖
 */
export const deletePriceOverride = (id: number) => {
  return request({
    url: `/price/overrides/${id}`,
    method: 'DELETE',
  });
};

/**
 * 计算价格（批量）
 * 用于用户端获取实际价格（包含价格覆盖）
 */
export const calculatePrice = (data: {
  items: Array<{
    country: string;
    city: string;
    ipType: string;
    quantity: number;
    duration: number;
  }>;
}) => {
  return request({
    url: '/price/calculate',
    method: 'POST',
    data,
  });
};

