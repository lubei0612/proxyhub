import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import dataSource from '../../config/database.config';
import { User } from '../../modules/user/entities/user.entity';
import { SystemSettings } from '../../modules/admin/entities/system-settings.entity';
import { PriceConfig } from '../../modules/pricing/entities/price-config.entity';
import { ExchangeRate } from '../../modules/pricing/entities/exchange-rate.entity';
import { PriceOverride } from '../../modules/pricing/entities/price-override.entity';
import { StaticProxy } from '../../modules/proxy/static/entities/static-proxy.entity';
import { Order } from '../../modules/order/entities/order.entity';
import { Recharge } from '../../modules/billing/entities/recharge.entity';
import { Transaction } from '../../modules/billing/entities/transaction.entity';

async function runSeed() {
  try {
    // 初始化数据源
    await dataSource.initialize();
    console.log('✅ 数据源已连接');

    const userRepository = dataSource.getRepository(User);
    const settingsRepository = dataSource.getRepository(SystemSettings);
    const priceConfigRepository = dataSource.getRepository(PriceConfig);
    const exchangeRateRepository = dataSource.getRepository(ExchangeRate);
    const priceOverrideRepository = dataSource.getRepository(PriceOverride);
    const staticProxyRepository = dataSource.getRepository(StaticProxy);
    const orderRepository = dataSource.getRepository(Order);
    const rechargeRepository = dataSource.getRepository(Recharge);
    const transactionRepository = dataSource.getRepository(Transaction);

    // 创建管理员用户
    const adminExists = await userRepository.findOne({
      where: { email: 'admin@example.com' },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = userRepository.create({
        email: 'admin@example.com',
        password: hashedPassword,
        nickname: '系统管理员',
        role: 'admin',
        balance: 10000, // 赠送10000美元测试余额
        gift_balance: 0,
        status: 'active',
      });
      await userRepository.save(admin);
      console.log('✅ 管理员用户创建成功：admin@example.com / admin123（余额：$10000）');
    } else {
      console.log('ℹ️  管理员用户已存在');
    }

    // 创建测试用户
    const testUserExists = await userRepository.findOne({
      where: { email: 'user@example.com' },
    });

    if (!testUserExists) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const testUser = userRepository.create({
        email: 'user@example.com',
        password: hashedPassword,
        nickname: '测试用户',
        role: 'user',
        balance: 1000, // 赠送1000美元测试余额
        gift_balance: 0,
        status: 'active',
      });
      await userRepository.save(testUser);
      console.log('✅ 测试用户创建成功：user@example.com / password123（余额：$1000）');
    } else {
      console.log('ℹ️  测试用户已存在');
    }

    // 创建系统设置
    const settings = [
      {
        key: 'usd_to_cny_rate',
        value: '7.2',
        description: 'USD到CNY汇率',
      },
      {
        key: 'min_recharge_amount',
        value: '1',
        description: '最小充值金额(USD)',
      },
      {
        key: 'max_recharge_amount',
        value: '10000',
        description: '最大充值金额(USD)',
      },
      {
        key: 'telegram_link',
        value: 'https://t.me/lubei12',
        description: 'Telegram客服链接',
      },
      {
        key: 'system_name',
        value: 'ProxyHub',
        description: '系统名称',
      },
    ];

    for (const setting of settings) {
      const exists = await settingsRepository.findOne({
        where: { key: setting.key },
      });
      if (!exists) {
        await settingsRepository.save(settingsRepository.create(setting));
        console.log(`✅ 系统设置已创建：${setting.key}`);
      }
    }

    // 创建价格配置
    const priceConfigs = [
      {
        productType: 'static_shared',
        basePrice: 5.0,
        isActive: true,
      },
      {
        productType: 'static_premium',
        basePrice: 8.0,
        isActive: true,
      },
    ];

    for (const config of priceConfigs) {
      const exists = await priceConfigRepository.findOne({
        where: { productType: config.productType },
      });
      if (!exists) {
        await priceConfigRepository.save(priceConfigRepository.create(config));
        console.log(`✅ 价格配置已创建：${config.productType} - $${config.basePrice}/月`);
      }
    }

    // 创建汇率配置
    const exchangeRateExists = await exchangeRateRepository.findOne({
      where: { fromCurrency: 'USD', toCurrency: 'CNY' },
    });

    if (!exchangeRateExists) {
      await exchangeRateRepository.save(
        exchangeRateRepository.create({
          fromCurrency: 'USD',
          toCurrency: 'CNY',
          rate: 7.25,
        }),
      );
      console.log('✅ 汇率配置已创建：1 USD = 7.25 CNY');
    }

    // ============================================================
    // 扩展测试数据
    // ============================================================

    console.log('\n📦 开始创建扩展测试数据...\n');

    // 1. 创建更多测试用户
    const testUsers = [
      {
        email: 'alice@test.com',
        password: 'password123',
        nickname: 'Alice',
        balance: 500,
      },
      {
        email: 'bob@test.com',
        password: 'password123',
        nickname: 'Bob',
        balance: 2000,
      },
      {
        email: 'charlie@test.com',
        password: 'password123',
        nickname: 'Charlie',
        balance: 100,
      },
    ];

    for (const userData of testUsers) {
      const exists = await userRepository.findOne({
        where: { email: userData.email },
      });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await userRepository.save(
          userRepository.create({
            ...userData,
            password: hashedPassword,
            role: 'user',
            gift_balance: 0,
            status: 'active',
          }),
        );
        console.log(`✅ 测试用户创建：${userData.email} (余额：$${userData.balance})`);
      }
    }

    // 2. 创建价格覆盖（特定国家）
    const priceConfig = await priceConfigRepository.findOne({
      where: { productType: 'static_premium' },
    });

    if (priceConfig) {
      const priceOverrides = [
        { countryCode: 'JP', cityName: null, overridePrice: 10.0 }, // 日本$10
        { countryCode: 'KR', cityName: null, overridePrice: 10.0 }, // 韩国$10
        { countryCode: 'SG', cityName: 'Singapore', overridePrice: 12.0 }, // 新加坡$12
      ];

      for (const override of priceOverrides) {
        const exists = await priceOverrideRepository.findOne({
          where: {
            priceConfigId: priceConfig.id,
            countryCode: override.countryCode,
            cityName: override.cityName,
          },
        });
        if (!exists) {
          await priceOverrideRepository.save(
            priceOverrideRepository.create({
              priceConfigId: priceConfig.id,
              ...override,
              isActive: true,
            }),
          );
          const location = override.cityName
            ? `${override.countryCode}/${override.cityName}`
            : override.countryCode;
          console.log(`✅ 价格覆盖创建：${location} - $${override.overridePrice}/月`);
        }
      }
    }

    // 3. 获取测试用户
    const testUser = await userRepository.findOne({
      where: { email: 'user@example.com' },
    });

    if (testUser) {
      // 4. 创建静态代理IP
      const staticProxies = [
        {
          userId: testUser.id,
          channelName: 'default',
          ip: '192.168.1.100',
          port: 8080,
          username: 'proxy_user1',
          password: 'proxy_pass1',
          country: 'US',
          countryCode: 'US',
          countryName: 'United States',
          cityName: 'Los Angeles',
          ipType: 'normal',
          status: 'active',
          expireTimeUtc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        },
        {
          userId: testUser.id,
          channelName: 'default',
          ip: '192.168.1.101',
          port: 8080,
          username: 'proxy_user2',
          password: 'proxy_pass2',
          country: 'JP',
          countryCode: 'JP',
          countryName: 'Japan',
          cityName: 'Tokyo',
          ipType: 'native',
          status: 'active',
          expireTimeUtc: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60天后
        },
        {
          userId: testUser.id,
          channelName: 'default',
          ip: '192.168.1.102',
          port: 8080,
          username: 'proxy_user3',
          password: 'proxy_pass3',
          country: 'GB',
          countryCode: 'GB',
          countryName: 'United Kingdom',
          cityName: 'London',
          ipType: 'normal',
          status: 'active',
          expireTimeUtc: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15天后
        },
      ];

      for (const proxy of staticProxies) {
        const exists = await staticProxyRepository.findOne({
          where: { ip: proxy.ip },
        });
        if (!exists) {
          await staticProxyRepository.save(staticProxyRepository.create(proxy));
          console.log(`✅ 静态IP创建：${proxy.ip} (${proxy.country}/${proxy.cityName})`);
        }
      }

      // 5. 创建订单
      const orders = [
        {
          userId: testUser.id,
          orderNo: `ORD${Date.now()}001`,
          type: 'static',
          amount: 10.0,
          status: 'completed',
          remark: '购买普通静态IP × 2',
        },
        {
          userId: testUser.id,
          orderNo: `ORD${Date.now()}002`,
          type: 'static',
          amount: 16.0,
          status: 'completed',
          remark: '购买原生静态IP × 1',
        },
      ];

      for (const order of orders) {
        const exists = await orderRepository.findOne({
          where: { orderNo: order.orderNo },
        });
        if (!exists) {
          await orderRepository.save(orderRepository.create(order));
          console.log(`✅ 订单创建：${order.orderNo} - $${order.amount}`);
        }
      }

      // 6. 创建充值订单
      const recharges = [
        {
          userId: testUser.id,
          orderNo: `RO${Date.now()}001`,
          amount: 100.0,
          paymentMethod: 'wechat',
          status: 'approved',
          remark: '微信支付',
        },
        {
          userId: testUser.id,
          orderNo: `RO${Date.now()}002`,
          amount: 500.0,
          paymentMethod: 'usdt',
          status: 'pending',
          remark: 'USDT地址：TXyzAbC123...',
        },
        {
          userId: testUser.id,
          orderNo: `RO${Date.now()}003`,
          amount: 50.0,
          paymentMethod: 'alipay',
          status: 'rejected',
          remark: '支付宝转账',
          rejectReason: '转账凭证不清晰',
        },
      ];

      for (const recharge of recharges) {
        const exists = await rechargeRepository.findOne({
          where: { orderNo: recharge.orderNo },
        });
        if (!exists) {
          await rechargeRepository.save(rechargeRepository.create(recharge));
          console.log(`✅ 充值订单创建：${recharge.orderNo} - $${recharge.amount} (${recharge.status})`);
        }
      }

      // 7. 创建交易记录
      const transactions = [
        {
          userId: testUser.id,
          transactionNo: `TXN${Date.now()}001`,
          type: 'recharge',
          amount: 100.0,
          balanceBefore: 900.0,
          balanceAfter: 1000.0,
          remark: '充值：微信支付',
        },
        {
          userId: testUser.id,
          transactionNo: `TXN${Date.now()}002`,
          type: 'purchase',
          amount: -10.0,
          balanceBefore: 1000.0,
          balanceAfter: 990.0,
          remark: '购买静态IP：2个普通IP',
        },
      ];

      for (const transaction of transactions) {
        await transactionRepository.save(transactionRepository.create(transaction));
      }
      console.log(`✅ 交易记录创建：${transactions.length}条`);
    }

    console.log('\n🎉 种子数据初始化完成！');
    console.log('\n📝 登录信息：');
    console.log('管理员：admin@example.com / admin123（余额：$10000）');
    console.log('普通用户：user@example.com / password123（余额：$1000）');
    console.log('测试用户1：alice@test.com / password123（余额：$500）');
    console.log('测试用户2：bob@test.com / password123（余额：$2000）');
    console.log('测试用户3：charlie@test.com / password123（余额：$100）');
    console.log('\n📊 测试数据汇总：');
    console.log(`- 用户：5个`);
    console.log(`- 静态IP：3个`);
    console.log(`- 订单：2个`);
    console.log(`- 充值订单：3个（待审核1个、已批准1个、已拒绝1个）`);
    console.log(`- 交易记录：2条`);
    console.log(`- 价格覆盖：3个（日本、韩国、新加坡）\n`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ 种子数据初始化失败：', error);
    process.exit(1);
  }
}

runSeed();

