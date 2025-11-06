import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class Proxy985Service {
  private readonly logger = new Logger(Proxy985Service.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseURL: string;

  constructor() {
    // 从环境变量获取API Key和Base URL
    this.apiKey = process.env.PROXY_985_API_KEY || 'ne_hj06qomI-bmVfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw==';
    this.baseURL = process.env.PROXY_985_BASE_URL || 'https://open-api.985proxy.com';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器：添加apikey到query参数
    this.client.interceptors.request.use(
      (config) => {
        // 添加apikey到query参数
        config.params = {
          ...config.params,
          apikey: this.apiKey,
        };
        return config;
      },
      (error) => {
        this.logger.error(`[985Proxy Request Error] ${error.message}`);
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        // 985Proxy API返回格式：{ code, msg, data }
        // code=0表示成功
        if (response.data && response.data.code !== 0) {
          throw new HttpException(
            response.data.msg || '985Proxy API请求失败',
            HttpStatus.BAD_REQUEST,
          );
        }
        return response;
      },
      (error) => {
        this.logger.error(`[985Proxy API Error] ${error.message}`);
        throw new HttpException(
          error.response?.data?.msg || '985Proxy API请求失败',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      },
    );
  }

  // ============================================================
  // 动态住宅代理 (Dynamic Residential Proxy)
  // ============================================================

  /**
   * 获取动态代理地区列表
   * GET /res_rotating/city_list
   */
  async getDynamicCityList() {
    this.logger.log('[985Proxy] Getting dynamic proxy city list');

    try {
      const response = await this.client.get('/res_rotating/city_list');
      return response.data;
    } catch (error) {
      this.logger.error(`[985Proxy] Failed to get city list: ${error.message}`);
      throw error;
    }
  }

  /**
   * 提取动态代理
   * GET /res_rotating/extract
   * @param params 提取参数
   * @param params.zone 通道标识
   * @param params.num 提取数量
   * @param params.area 国家代码（可选）
   * @param params.state 州/省代码（可选）
   * @param params.city 城市代码（可选）
   * @param params.life 代理时效（可选，max: 120）
   * @param params.result 响应格式（可选，1:TXT 2:JSON）
   * @param params.format 代理格式（可选，1/2/3）
   * @param params.lb 分隔符（可选，1/2/3/4）
   */
  async extractDynamicProxy(params: {
    zone: string;
    num: string | number;
    area?: string;
    state?: string;
    city?: string;
    life?: number;
    result?: number;
    format?: number;
    lb?: number;
  }) {
    this.logger.log(`[985Proxy] Extracting dynamic proxy: ${JSON.stringify(params)}`);

    try {
      const response = await this.client.get('/res_rotating/extract', {
        params,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`[985Proxy] Failed to extract proxy: ${error.message}`);
      throw error;
    }
  }

  // ============================================================
  // 静态住宅代理 (Static Residential Proxy)
  // ============================================================

  /**
   * 获取静态代理IP库存列表
   * GET /res_static/inventory
   * @param params 查询参数
   * @param params.static_proxy_type 代理类型（shared: 普通IP, premium: 原生IP）
   * @param params.purpose_web 业务场景（可选）
   * @returns 返回各国家/城市的库存数量和价格
   */
  async getInventory(params: {
    static_proxy_type: 'shared' | 'premium';
    purpose_web?: string;
  }) {
    this.logger.log(`[985Proxy] Getting inventory: ${JSON.stringify(params)}`);

    try {
      const response = await this.client.get('/res_static/inventory', {
        params,
      });
      this.logger.log(`[985Proxy] Inventory fetched: ${response.data.data?.length || 0} locations`);
      return response.data;
    } catch (error) {
      this.logger.error(`[985Proxy] Failed to get inventory: ${error.message}`);
      throw error;
    }
  }

  /**
   * 计算静态代理购买或续费价格
   * POST /res_static/calculate
   * @param data 计算数据
   * @param data.action 计算类型（buy: 购买, renew: 续费）
   * @param data.time_period 时长（天，必须是30的倍数）
   * @param data.static_proxy_type 代理类型（action=buy时必填）
   * @param data.buy_data 购买明细（action=buy时必填）
   * @param data.zone 通道标识（action=renew时必填）
   * @param data.renew_ip_list IP列表（action=renew时必填）
   * @param data.promo_code 优惠码（可选）
   * @param data.purpose_web 业务场景（可选）
   * @returns 返回总价、优惠价和实付价
   */
  async calculatePrice(data: {
    action: 'buy' | 'renew';
    time_period: number;
    static_proxy_type?: 'shared' | 'premium';
    buy_data?: Array<{
      country_code: string;
      city_name: string;
      count: string | number;
    }>;
    zone?: string;
    renew_ip_list?: string[];
    promo_code?: string;
    purpose_web?: string;
  }) {
    this.logger.log(`[985Proxy] Calculating price: ${JSON.stringify(data)}`);

    try {
      const response = await this.client.post('/res_static/calculate', data);
      this.logger.log(`[985Proxy] Price calculated: ${response.data.data?.pay_price || 'N/A'}`);
      return response.data;
    } catch (error) {
      this.logger.error(`[985Proxy] Failed to calculate price: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取静态代理IP列表
   * GET /res_static/ip_list
   * @param params 查询参数
   * @param params.zone 通道标识
   * @param params.static_proxy_type 代理类型（all/shared/premium）
   * @param params.purpose_web 业务场景（可选）
   * @param params.page 页码（可选，默认1）
   * @param params.limit 单页数量（可选，默认15）
   * @param params.ips 筛选IPs（可选）
   * @param params.is_expired 过期状态（可选，1:全部 2:未过期 3:已过期）
   * @param params.is_release 释放状态（可选，1:全部 2:未释放 3:已释放）
   */
  async getStaticProxyList(params: {
    zone: string;
    static_proxy_type: 'all' | 'shared' | 'premium';
    purpose_web?: string;
    page?: number;
    limit?: number;
    ips?: string[];
    is_expired?: number;
    is_release?: string;
  }) {
    this.logger.log(`[985Proxy] Getting static proxy list: ${JSON.stringify(params)}`);

    try {
      const response = await this.client.get('/res_static/ip_list', {
        params,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`[985Proxy] Failed to get static proxy list: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取IP列表（简洁别名）
   * Alias for getStaticProxyList
   */
  async getIPList(params: {
    zone: string;
    static_proxy_type: 'all' | 'shared' | 'premium';
    purpose_web?: string;
    page?: number;
    limit?: number;
    ips?: string[];
    is_expired?: number;
    is_release?: string;
  }) {
    return this.getStaticProxyList(params);
  }

  /**
   * 获取静态代理IP详情
   * GET /res_static/ip_detail
   * @param id 代理ID
   */
  async getStaticProxyDetail(id: string | number) {
    this.logger.log(`[985Proxy] Getting static proxy detail: ${id}`);

    try {
      const response = await this.client.get('/res_static/ip_detail', {
        params: { id },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`[985Proxy] Failed to get static proxy detail: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取IP详情（简洁别名）
   * Alias for getStaticProxyDetail
   */
  async getIPDetail(id: string | number) {
    return this.getStaticProxyDetail(id);
  }

  /**
   * 购买静态代理IP
   * POST /res_static/buy
   * @param data 购买数据
   * @param data.zone 通道标识
   * @param data.time_period 购买时长（天，必须是30的倍数）
   * @param data.static_proxy_type 代理类型（shared/premium）
   * @param data.buy_data 购买明细数组
   * @param data.pay_type 支付方式（balance/gift，默认balance）
   * @param data.promo_code 优惠码（可选）
   * @param data.purpose_web 业务场景（可选）
   */
  async buyStaticProxy(data: {
    zone: string;
    time_period: number;
    static_proxy_type: 'shared' | 'premium';
    buy_data: Array<{
      country_code: string;
      city_name?: string;
      count: number;
    }>;
    pay_type?: string;
    promo_code?: string;
    purpose_web?: string;
  }) {
    this.logger.log(`[985Proxy] Buying static proxies: ${JSON.stringify(data)}`);

    try {
      const response = await this.client.post('/res_static/buy', data);
      return response.data;
    } catch (error) {
      this.logger.error(`[985Proxy] Failed to buy static proxies: ${error.message}`);
      throw error;
    }
  }

  /**
   * 续费静态代理IP
   * POST /res_static/renew
   * @param data 续费数据
   * @param data.zone 通道标识
   * @param data.time_period 续费时长（天，必须是30的倍数）
   * @param data.renew_ip_list IP列表（字符串数组）
   * @param data.pay_type 支付方式（balance/gift，默认balance）
   * @param data.promo_code 优惠码（可选）
   */
  async renewStaticProxy(data: {
    zone: string;
    time_period: number;
    renew_ip_list: string[];
    pay_type?: string;
    promo_code?: string;
  }) {
    // 增强日志记录 - 详细输出所有参数
    this.logger.log('========================================');
    this.logger.log('[985Proxy] Renew Request Details:');
    this.logger.log(`  Zone: ${data.zone}`);
    this.logger.log(`  Time Period: ${data.time_period} days`);
    this.logger.log(`  IP List: ${JSON.stringify(data.renew_ip_list, null, 2)}`);
    this.logger.log(`  Pay Type: ${data.pay_type || 'balance'}`);
    this.logger.log(`  Promo Code: ${data.promo_code || 'none'}`);
    this.logger.log(`  Full Request Body: ${JSON.stringify(data, null, 2)}`);
    this.logger.log('========================================');

    try {
      const response = await this.client.post('/res_static/renew', data);
      
      this.logger.log('========================================');
      this.logger.log('[985Proxy] Renew Response Success:');
      this.logger.log(`  Status: ${response.status}`);
      this.logger.log(`  Data: ${JSON.stringify(response.data, null, 2)}`);
      this.logger.log('========================================');
      
      return response.data;
    } catch (error) {
      this.logger.error('========================================');
      this.logger.error('[985Proxy] Renew Request Failed:');
      this.logger.error(`  Error Message: ${error.message}`);
      this.logger.error(`  Response Status: ${error.response?.status}`);
      this.logger.error(`  Response Data: ${JSON.stringify(error.response?.data, null, 2)}`);
      this.logger.error(`  Request Config: ${JSON.stringify(error.config?.data, null, 2)}`);
      this.logger.error('========================================');
      throw error;
    }
  }

  /**
   * 续费IP（简洁别名）
   * Alias for renewStaticProxy
   */
  async renewIP(data: {
    zone: string;
    time_period: number;
    renew_ip_list: string[];
    pay_type?: string;
    promo_code?: string;
  }) {
    return this.renewStaticProxy(data);
  }

  /**
   * 获取订单结果
   * POST /res_static/order_result
   * @param data 查询数据
   * @param data.order_no 订单号
   * @returns 返回订单状态（status）和详细信息（info），包括IP列表
   */
  async getOrderResult(data: { order_no: string }) {
    this.logger.log(`[985Proxy] Getting order result: ${data.order_no}`);

    try {
      const response = await this.client.post('/res_static/order_result', data);
      this.logger.log(`[985Proxy] Order status: ${response.data.data?.status || 'N/A'}`);
      return response.data;
    } catch (error) {
      this.logger.error(`[985Proxy] Failed to get order result: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取业务通道列表
   * GET /res_static/business_list
   * @returns 返回用户可用的所有Zone列表（通道标识数组）
   */
  async getBusinessList() {
    this.logger.log('[985Proxy] Getting business list (zones)');

    try {
      const response = await this.client.get('/res_static/business_list');
      this.logger.log(`[985Proxy] Business list retrieved: ${response.data.data?.length || 0} zones`);
      return response.data;
    } catch (error) {
      this.logger.error(`[985Proxy] Failed to get business list: ${error.message}`);
      throw error;
    }
  }

  /**
   * 释放静态代理IP
   * POST /res_static/release_ip
   * @param data 释放数据
   * @param data.zone 通道标识
   * @param data.ip_ids 代理ID数组
   */
  async releaseStaticProxy(data: { zone: string; ip_ids: number[] }) {
    this.logger.log(`[985Proxy] Releasing static proxies: ${JSON.stringify(data)}`);

    try {
      const response = await this.client.post('/res_static/release_ip', data);
      return response.data;
    } catch (error) {
      this.logger.error(`[985Proxy] Failed to release static proxies: ${error.message}`);
      throw error;
    }
  }

  // ============================================================
  // 数据中心代理 (Data Center Proxy)
  // ============================================================

  /**
   * 获取数据中心代理地区列表
   * GET /dc/city_list
   */
  async getDCCityList() {
    this.logger.log('[985Proxy] Getting DC proxy city list');

    try {
      const response = await this.client.get('/dc/city_list');
      return response.data;
    } catch (error) {
      this.logger.error(`[985Proxy] Failed to get DC city list: ${error.message}`);
      throw error;
    }
  }

  /**
   * 提取数据中心代理
   * GET /dc/extract
   */
  async extractDCProxy(params: {
    zone: string;
    num: string | number;
    area?: string;
    state?: string;
    city?: string;
    life?: number;
    result?: number;
    format?: number;
    lb?: number;
  }) {
    this.logger.log(`[985Proxy] Extracting DC proxy: ${JSON.stringify(params)}`);

    try {
      const response = await this.client.get('/dc/extract', {
        params,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`[985Proxy] Failed to extract DC proxy: ${error.message}`);
      throw error;
    }
  }

  // ============================================================
  // 账户与余额 (Account & Balance)
  // ============================================================

  /**
   * 获取账户余额
   * GET /account/balance
   */
  async getAccountBalance() {
    this.logger.log('[985Proxy] Getting account balance');

    try {
      const response = await this.client.get('/account/balance');
      return response.data;
    } catch (error) {
      this.logger.error(`[985Proxy] Failed to get account balance: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取账户套餐信息
   * GET /account/package
   */
  async getAccountPackage() {
    this.logger.log('[985Proxy] Getting account package');

    try {
      const response = await this.client.get('/account/package');
      return response.data;
    } catch (error) {
      this.logger.error(`[985Proxy] Failed to get account package: ${error.message}`);
      throw error;
    }
  }

  // ============================================================
  // 辅助方法 (Helper Methods)
  // ============================================================

  /**
   * 检查API是否可用
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getAccountBalance();
      this.logger.log('[985Proxy] Health check passed');
      return true;
    } catch (error) {
      this.logger.error(`[985Proxy] Health check failed: ${error.message}`);
      return false;
    }
  }
}
