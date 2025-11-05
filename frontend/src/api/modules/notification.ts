import request from '@/api/request';

// 通知相关接口

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string;
  data: any;
  read: boolean;
  sentEmail: boolean;
  sentTelegram: boolean;
  sentInApp: boolean;
  createdAt: string;
  readAt: string;
}

export interface NotificationSetting {
  id: number;
  userId: number;
  emailEnabled: boolean;
  emailOnOrder: boolean;
  emailOnRecharge: boolean;
  emailOnExpiring: boolean;
  emailOnBalanceLow: boolean;
  inAppEnabled: boolean;
  inAppOnOrder: boolean;
  inAppOnRecharge: boolean;
  inAppOnExpiring: boolean;
  inAppOnBalanceLow: boolean;
  telegramEnabled: boolean;
  telegramChatId: string;
  telegramUsername: string;
}

export interface NotificationFilters {
  type?: string;
  read?: boolean;
  page?: number;
  limit?: number;
}

export interface UpdateSettingsDto {
  emailEnabled?: boolean;
  emailOnOrder?: boolean;
  emailOnRecharge?: boolean;
  emailOnExpiring?: boolean;
  emailOnBalanceLow?: boolean;
  inAppEnabled?: boolean;
  inAppOnOrder?: boolean;
  inAppOnRecharge?: boolean;
  inAppOnExpiring?: boolean;
  inAppOnBalanceLow?: boolean;
  telegramEnabled?: boolean;
}

// 获取通知列表
export function getNotifications(params?: NotificationFilters) {
  return request.get('/notifications', { params });
}

// 获取未读数量
export function getUnreadCount() {
  return request.get('/notifications/unread-count');
}

// 获取通知设置
export function getSettings() {
  return request.get<NotificationSetting>('/notifications/settings');
}

// 更新通知设置
export function updateSettings(data: UpdateSettingsDto) {
  return request.put('/notifications/settings', data);
}

// 标记单个通知为已读
export function markAsRead(id: number) {
  return request.patch(`/notifications/${id}/read`);
}

// 全部标记为已读
export function markAllAsRead() {
  return request.patch('/notifications/read-all');
}

// 删除通知
export function deleteNotification(id: number) {
  return request.delete(`/notifications/${id}`);
}

// 生成Telegram绑定码
export function generateBindCode() {
  return request.post('/notifications/telegram/bind-code');
}

// 解绑Telegram
export function unbindTelegram() {
  return request.delete('/notifications/telegram/unbind');
}


