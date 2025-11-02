import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import dataSource from '../../config/database.config';
import { User } from '../../modules/user/entities/user.entity';
import { StaticProxy } from '../../modules/proxy/static/entities/static-proxy.entity';
import { Order } from '../../modules/order/entities/order.entity';
import { Recharge } from '../../modules/billing/entities/recharge.entity';
import { Transaction } from '../../modules/billing/entities/transaction.entity';

/**
 * 扩展测试数据脚本
 * 用于本地验收，添加更多测试数据
 * 
 * 运行方式：npm run seed:extended
 */
async function runExtendedSeed() {
  try {
    await dataSource.initialize();
    console.log('✅ 数据源已连接');

    const userRepository = dataSource.getRepository(User);
    const staticProxyRepository = dataSource.getRepository(StaticProxy);
    const orderRepository = dataSource.getRepository(Order);
    const rechargeRepository = dataSource.getRepository(Recharge);
    const transactionRepository = dataSource.getRepository(Transaction);

    // 获取测试用户
    const testUser = await userRepository.findOne({ where: { email: 'user@example.com' } });
    if (!testUser) {
      console.error('❌ 测试用户不存在，请先运行基础种子数据脚本：npm run seed');
      process.exit(1);
    }

    console.log('\n📦 开始创建扩展测试数据...\n');

    // 1. 创建更多静态代理IP（20个）
    const countries = [
      { code: 'US', name: 'United States', cities: ['Los Angeles', 'New York', 'Chicago', 'Houston'] },
      { code: 'GB', name: 'United Kingdom', cities: ['London', 'Manchester', 'Birmingham'] },
      { code: 'DE', name: 'Germany', cities: ['Berlin', 'Munich', 'Frankfurt'] },
      { code: 'FR', name: 'France', cities: ['Paris', 'Lyon', 'Marseille'] },
      { code: 'JP', name: 'Japan', cities: ['Tokyo', 'Osaka', 'Nagoya'] },
      { code: 'KR', name: 'Korea', cities: ['Seoul', 'Busan', 'Incheon'] },
      { code: 'SG', name: 'Singapore', cities: ['Singapore'] },
      { code: 'CA', name: 'Canada', cities: ['Toronto', 'Vancouver'] },
    ];

    let proxyCount = 0;
    for (const country of countries) {
      for (const city of country.cities) {
        const proxy = {
          userId: testUser.id,
          channelName: 'default',
          ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          port: 10000 + Math.floor(Math.random() * 50000),
          username: `user_${Date.now()}_${proxyCount}`,
          password: Math.random().toString(36).substring(2, 15),
          country: country.code,
          countryCode: country.code,
          countryName: country.name,
          cityName: city,
          ipType: Math.random() > 0.5 ? 'native' : 'normal',
          status: Math.random() > 0.1 ? 'active' : 'expired',
          expireTimeUtc: new Date(Date.now() + (15 + Math.floor(Math.random() * 60)) * 24 * 60 * 60 * 1000),
        };

        const exists = await staticProxyRepository.findOne({ where: { ip: proxy.ip } });
        if (!exists) {
          await staticProxyRepository.save(staticProxyRepository.create(proxy));
          proxyCount++;
        }
      }
    }
    console.log(`✅ 静态IP创建完成：${proxyCount}个`);

    // 2. 创建更多订单（10个）
    const orderTypes = ['static', 'dynamic', 'mobile'];
    const orderStatuses = ['completed', 'pending', 'processing', 'failed', 'cancelled'];
    
    for (let i = 0; i < 10; i++) {
      const order = {
        userId: testUser.id,
        orderNo: `ORD${Date.now()}${String(i).padStart(3, '0')}`,
        type: orderTypes[Math.floor(Math.random() * orderTypes.length)],
        amount: 5 + Math.floor(Math.random() * 100),
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        remark: `测试订单 #${i + 1}`,
      };

      const exists = await orderRepository.findOne({ where: { orderNo: order.orderNo } });
      if (!exists) {
        await orderRepository.save(orderRepository.create(order));
      }
    }
    console.log('✅ 订单创建完成：10个');

    // 3. 创建更多充值订单（15个）
    const paymentMethods = ['wechat', 'alipay', 'usdt', 'usd'];
    const rechargeStatuses = ['pending', 'approved', 'rejected'];
    
    for (let i = 0; i < 15; i++) {
      const recharge = {
        userId: testUser.id,
        orderNo: `RO${Date.now()}${String(i).padStart(3, '0')}`,
        amount: 10 + Math.floor(Math.random() * 500),
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        status: rechargeStatuses[Math.floor(Math.random() * rechargeStatuses.length)],
        remark: `测试充值订单 #${i + 1}`,
        rejectReason: Math.random() > 0.7 ? '凭证不清晰' : undefined,
      };

      const exists = await rechargeRepository.findOne({ where: { orderNo: recharge.orderNo } });
      if (!exists) {
        await rechargeRepository.save(rechargeRepository.create(recharge));
      }
    }
    console.log('✅ 充值订单创建完成：15个');

    // 4. 创建更多交易记录（30条）
    const transactionTypes = ['recharge', 'purchase', 'refund'];
    
    for (let i = 0; i < 30; i++) {
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const amount = type === 'refund' ? -(5 + Math.floor(Math.random() * 50)) : (5 + Math.floor(Math.random() * 100));
      const balanceBefore = 500 + Math.floor(Math.random() * 1000);
      
      const transaction = {
        userId: testUser.id,
        transactionNo: `TXN${Date.now()}${String(i).padStart(3, '0')}`,
        type,
        amount,
        balanceBefore,
        balanceAfter: balanceBefore + amount,
        remark: `测试交易 #${i + 1} - ${type}`,
      };

      await transactionRepository.save(transactionRepository.create(transaction));
    }
    console.log('✅ 交易记录创建完成：30条');

    console.log('\n🎉 扩展测试数据创建完成！');
    console.log('\n📊 测试数据汇总：');
    console.log(`- 静态IP：${proxyCount}个（不同国家和城市）`);
    console.log('- 订单：10个（不同状态）');
    console.log('- 充值订单：15个（不同状态和支付方式）');
    console.log('- 交易记录：30条（充值、购买、退款）');
    console.log('\n💡 提示：这些数据用于本地验收测试，腾讯云部署前请删除。\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ 扩展种子数据初始化失败：', error);
    process.exit(1);
  }
}

runExtendedSeed();

