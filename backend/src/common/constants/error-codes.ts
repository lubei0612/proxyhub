/**
 * API错误码枚举
 * 格式: XXXYY
 * XXX: 模块代码
 * YY: 具体错误
 */

export enum ErrorCode {
  // ==================== 通用错误 (100XX) ====================
  INTERNAL_SERVER_ERROR = 10001, // 服务器内部错误
  INVALID_REQUEST = 10002, // 无效请求
  UNAUTHORIZED = 10003, // 未授权
  FORBIDDEN = 10004, // 禁止访问
  NOT_FOUND = 10005, // 资源不存在
  VALIDATION_ERROR = 10006, // 参数验证失败
  RATE_LIMIT_EXCEEDED = 10007, // 请求频率超限

  // ==================== 认证错误 (200XX) ====================
  AUTH_INVALID_CREDENTIALS = 20001, // 用户名或密码错误
  AUTH_USER_NOT_FOUND = 20002, // 用户不存在
  AUTH_USER_DISABLED = 20003, // 用户已被禁用
  AUTH_TOKEN_EXPIRED = 20004, // Token已过期
  AUTH_TOKEN_INVALID = 20005, // Token无效
  AUTH_EMAIL_ALREADY_EXISTS = 20006, // 邮箱已存在
  AUTH_PASSWORD_TOO_WEAK = 20007, // 密码强度不足
  AUTH_LOGIN_FAILED = 20008, // 登录失败

  // ==================== 用户错误 (300XX) ====================
  USER_NOT_FOUND = 30001, // 用户不存在
  USER_ALREADY_EXISTS = 30002, // 用户已存在
  USER_UPDATE_FAILED = 30003, // 用户更新失败
  USER_INSUFFICIENT_BALANCE = 30004, // 余额不足
  USER_INSUFFICIENT_PERMISSIONS = 30005, // 权限不足

  // ==================== 代理IP错误 (400XX) ====================
  PROXY_NOT_FOUND = 40001, // 代理IP不存在
  PROXY_ALREADY_ALLOCATED = 40002, // 代理IP已分配
  PROXY_PURCHASE_FAILED = 40003, // 代理IP购买失败
  PROXY_INSUFFICIENT_INVENTORY = 40004, // 库存不足
  PROXY_EXPIRED = 40005, // 代理IP已过期
  PROXY_RENEWAL_FAILED = 40006, // 续费失败
  PROXY_INVALID_TYPE = 40007, // 无效的代理类型

  // ==================== 订单错误 (500XX) ====================
  ORDER_NOT_FOUND = 50001, // 订单不存在
  ORDER_ALREADY_PROCESSED = 50002, // 订单已处理
  ORDER_CREATION_FAILED = 50003, // 订单创建失败
  ORDER_PAYMENT_FAILED = 50004, // 支付失败
  ORDER_CANCEL_FAILED = 50005, // 取消订单失败
  ORDER_INVALID_STATUS = 50006, // 无效的订单状态

  // ==================== 充值错误 (600XX) ====================
  RECHARGE_NOT_FOUND = 60001, // 充值记录不存在
  RECHARGE_ALREADY_PROCESSED = 60002, // 充值记录已处理
  RECHARGE_INVALID_AMOUNT = 60003, // 无效的充值金额
  RECHARGE_APPROVAL_FAILED = 60004, // 充值审核失败
  RECHARGE_INVALID_METHOD = 60005, // 无效的支付方式

  // ==================== 交易错误 (700XX) ====================
  TRANSACTION_NOT_FOUND = 70001, // 交易记录不存在
  TRANSACTION_CREATION_FAILED = 70002, // 交易创建失败
  TRANSACTION_ROLLBACK_FAILED = 70003, // 交易回滚失败

  // ==================== 第三方API错误 (800XX) ====================
  EXTERNAL_API_ERROR = 80001, // 外部API错误
  EXTERNAL_API_TIMEOUT = 80002, // 外部API超时
  EXTERNAL_API_RATE_LIMIT = 80003, // 外部API请求限制
  PROXY_985_API_ERROR = 80004, // 985Proxy API错误
}

/**
 * 错误码消息映射
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // 通用错误
  [ErrorCode.INTERNAL_SERVER_ERROR]: '服务器内部错误，请稍后重试',
  [ErrorCode.INVALID_REQUEST]: '无效的请求参数',
  [ErrorCode.UNAUTHORIZED]: '未授权，请先登录',
  [ErrorCode.FORBIDDEN]: '您没有权限访问此资源',
  [ErrorCode.NOT_FOUND]: '请求的资源不存在',
  [ErrorCode.VALIDATION_ERROR]: '参数验证失败',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: '请求过于频繁，请稍后重试',

  // 认证错误
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: '用户名或密码错误',
  [ErrorCode.AUTH_USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.AUTH_USER_DISABLED]: '用户已被禁用，请联系管理员',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ErrorCode.AUTH_TOKEN_INVALID]: '无效的登录凭证',
  [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: '该邮箱已被注册',
  [ErrorCode.AUTH_PASSWORD_TOO_WEAK]: '密码强度不足（至少8位，包含字母和数字）',
  [ErrorCode.AUTH_LOGIN_FAILED]: '登录失败，请检查账号密码',

  // 用户错误
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.USER_ALREADY_EXISTS]: '用户已存在',
  [ErrorCode.USER_UPDATE_FAILED]: '用户信息更新失败',
  [ErrorCode.USER_INSUFFICIENT_BALANCE]: '账户余额不足',
  [ErrorCode.USER_INSUFFICIENT_PERMISSIONS]: '权限不足',

  // 代理IP错误
  [ErrorCode.PROXY_NOT_FOUND]: '代理IP不存在',
  [ErrorCode.PROXY_ALREADY_ALLOCATED]: '代理IP已被分配',
  [ErrorCode.PROXY_PURCHASE_FAILED]: '代理IP购买失败',
  [ErrorCode.PROXY_INSUFFICIENT_INVENTORY]: '库存不足，请选择其他地区或稍后再试',
  [ErrorCode.PROXY_EXPIRED]: '代理IP已过期',
  [ErrorCode.PROXY_RENEWAL_FAILED]: '续费失败',
  [ErrorCode.PROXY_INVALID_TYPE]: '无效的代理类型',

  // 订单错误
  [ErrorCode.ORDER_NOT_FOUND]: '订单不存在',
  [ErrorCode.ORDER_ALREADY_PROCESSED]: '订单已处理',
  [ErrorCode.ORDER_CREATION_FAILED]: '订单创建失败',
  [ErrorCode.ORDER_PAYMENT_FAILED]: '支付失败',
  [ErrorCode.ORDER_CANCEL_FAILED]: '取消订单失败',
  [ErrorCode.ORDER_INVALID_STATUS]: '无效的订单状态',

  // 充值错误
  [ErrorCode.RECHARGE_NOT_FOUND]: '充值记录不存在',
  [ErrorCode.RECHARGE_ALREADY_PROCESSED]: '该充值记录已被处理',
  [ErrorCode.RECHARGE_INVALID_AMOUNT]: '无效的充值金额',
  [ErrorCode.RECHARGE_APPROVAL_FAILED]: '充值审核失败',
  [ErrorCode.RECHARGE_INVALID_METHOD]: '无效的支付方式',

  // 交易错误
  [ErrorCode.TRANSACTION_NOT_FOUND]: '交易记录不存在',
  [ErrorCode.TRANSACTION_CREATION_FAILED]: '交易创建失败',
  [ErrorCode.TRANSACTION_ROLLBACK_FAILED]: '交易回滚失败',

  // 第三方API错误
  [ErrorCode.EXTERNAL_API_ERROR]: '第三方服务暂时不可用，请稍后重试',
  [ErrorCode.EXTERNAL_API_TIMEOUT]: '第三方服务响应超时',
  [ErrorCode.EXTERNAL_API_RATE_LIMIT]: '第三方服务请求过于频繁',
  [ErrorCode.PROXY_985_API_ERROR]: '985Proxy服务暂时不可用',
};

/**
 * HTTP状态码映射
 */
export const ErrorHttpStatus: Record<ErrorCode, number> = {
  // 通用错误
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.INVALID_REQUEST]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,

  // 认证错误
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 401,
  [ErrorCode.AUTH_USER_NOT_FOUND]: 401,
  [ErrorCode.AUTH_USER_DISABLED]: 403,
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 401,
  [ErrorCode.AUTH_TOKEN_INVALID]: 401,
  [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: 409,
  [ErrorCode.AUTH_PASSWORD_TOO_WEAK]: 400,
  [ErrorCode.AUTH_LOGIN_FAILED]: 401,

  // 用户错误
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.USER_ALREADY_EXISTS]: 409,
  [ErrorCode.USER_UPDATE_FAILED]: 500,
  [ErrorCode.USER_INSUFFICIENT_BALANCE]: 400,
  [ErrorCode.USER_INSUFFICIENT_PERMISSIONS]: 403,

  // 代理IP错误
  [ErrorCode.PROXY_NOT_FOUND]: 404,
  [ErrorCode.PROXY_ALREADY_ALLOCATED]: 409,
  [ErrorCode.PROXY_PURCHASE_FAILED]: 500,
  [ErrorCode.PROXY_INSUFFICIENT_INVENTORY]: 400,
  [ErrorCode.PROXY_EXPIRED]: 410,
  [ErrorCode.PROXY_RENEWAL_FAILED]: 500,
  [ErrorCode.PROXY_INVALID_TYPE]: 400,

  // 订单错误
  [ErrorCode.ORDER_NOT_FOUND]: 404,
  [ErrorCode.ORDER_ALREADY_PROCESSED]: 409,
  [ErrorCode.ORDER_CREATION_FAILED]: 500,
  [ErrorCode.ORDER_PAYMENT_FAILED]: 402,
  [ErrorCode.ORDER_CANCEL_FAILED]: 500,
  [ErrorCode.ORDER_INVALID_STATUS]: 400,

  // 充值错误
  [ErrorCode.RECHARGE_NOT_FOUND]: 404,
  [ErrorCode.RECHARGE_ALREADY_PROCESSED]: 409,
  [ErrorCode.RECHARGE_INVALID_AMOUNT]: 400,
  [ErrorCode.RECHARGE_APPROVAL_FAILED]: 500,
  [ErrorCode.RECHARGE_INVALID_METHOD]: 400,

  // 交易错误
  [ErrorCode.TRANSACTION_NOT_FOUND]: 404,
  [ErrorCode.TRANSACTION_CREATION_FAILED]: 500,
  [ErrorCode.TRANSACTION_ROLLBACK_FAILED]: 500,

  // 第三方API错误
  [ErrorCode.EXTERNAL_API_ERROR]: 502,
  [ErrorCode.EXTERNAL_API_TIMEOUT]: 504,
  [ErrorCode.EXTERNAL_API_RATE_LIMIT]: 429,
  [ErrorCode.PROXY_985_API_ERROR]: 502,
};

