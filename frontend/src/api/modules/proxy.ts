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
 * 获取库存信息
 */
export function getInventory() {
  return request({
    url: '/proxy/static/inventory',
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

