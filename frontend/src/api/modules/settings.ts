import request from '../request';

/**
 * 获取所有系统设置
 */
export function getSettings() {
  return request({
    url: '/settings',
    method: 'get',
  });
}

/**
 * 获取Telegram客服链接
 */
export function getTelegramLinks() {
  return request({
    url: '/settings/telegram',
    method: 'get',
  });
}

/**
 * 更新系统设置（管理员）
 */
export function updateSettings(settings: Record<string, string>) {
  return request({
    url: '/settings',
    method: 'put',
    data: settings,
  });
}


