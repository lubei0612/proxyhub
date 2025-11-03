import request from '../request';

/**
 * 获取当前用户个人信息
 */
export function getProfile() {
  return request({
    url: '/users/profile',
    method: 'get',
  });
}

/**
 * 更新个人信息
 */
export function updateProfile(data: { nickname?: string; email?: string }) {
  return request({
    url: '/users/profile',
    method: 'put',
    data,
  });
}

/**
 * 修改密码
 */
export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return request({
    url: '/users/change-password',
    method: 'post',
    data,
  });
}

/**
 * 生成API Key
 */
export function generateApiKey() {
  return request({
    url: '/users/api-key/generate',
    method: 'post',
  });
}

/**
 * 重置API Key
 */
export function resetApiKey() {
  return request({
    url: '/users/api-key/reset',
    method: 'post',
  });
}

