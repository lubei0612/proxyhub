import request from '@/api/request';

// 通道管理相关接口

export interface DynamicChannel {
  id: number;
  channelName: string;
  pricePerGb: number;
  concurrentLimit: number;
  status: string;
  totalTraffic: number;
  totalCost: number;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelFilters {
  channelName?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ChannelStatistics {
  totalChannels: number;
  totalTraffic: number;
  totalCost: number;
}

export interface CreateChannelDto {
  channelName: string;
  pricePerGb: number;
  concurrentLimit: number;
  status: string;
  remark?: string;
}

export interface UpdateChannelDto {
  channelName?: string;
  pricePerGb?: number;
  concurrentLimit?: number;
  status?: string;
  remark?: string;
}

// 获取通道列表
export function getChannels(params?: ChannelFilters) {
  return request.get('/proxy/dynamic/channels', { params });
}

// 创建通道
export function createChannel(data: CreateChannelDto) {
  return request.post('/proxy/dynamic/channels', data);
}

// 更新通道
export function updateChannel(id: number, data: UpdateChannelDto) {
  return request.put(`/proxy/dynamic/channels/${id}`, data);
}

// 删除通道
export function deleteChannel(id: number) {
  return request.delete(`/proxy/dynamic/channels/${id}`);
}

// 切换通道状态
export function toggleChannelStatus(id: number) {
  return request.patch(`/proxy/dynamic/channels/${id}/toggle`);
}

// 获取统计数据
export function getChannelStatistics() {
  return request.get<ChannelStatistics>('/proxy/dynamic/statistics');
}

// 获取流量使用记录
export function getUsageHistory(params?: any) {
  return request.get('/proxy/dynamic/usage', { params });
}

// 获取流量统计
export function getUsageStatistics(params?: { startDate?: string; endDate?: string }) {
  return request.get('/proxy/dynamic/usage/statistics', { params });
}


