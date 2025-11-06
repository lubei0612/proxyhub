import request from '../request';

/**
 * 流量管理API客户端
 */

export interface RecordTrafficRequest {
  proxyId?: number;
  proxyType: string;
  requests: number;
  successRequests: number;
  uploadTraffic: number;
  downloadTraffic: number;
  httpRequests?: number;
  httpsRequests?: number;
  websocketRequests?: number;
  otherRequests?: number;
  remark?: string;
}

/**
 * 记录流量使用
 */
export function recordTraffic(data: RecordTrafficRequest) {
  return request({
    url: '/traffic/record',
    method: 'post',
    data,
  });
}

/**
 * 获取用户总流量统计
 */
export function getUserTrafficStats() {
  return request({
    url: '/traffic/stats',
    method: 'get',
  });
}

export interface QueryTrafficRequest {
  startDate?: string;
  endDate?: string;
  proxyType?: string;
  proxyId?: number;
}

/**
 * 查询流量记录
 */
export function queryTraffic(params: QueryTrafficRequest) {
  return request({
    url: '/traffic/query',
    method: 'get',
    params,
  });
}

