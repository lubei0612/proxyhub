#!/usr/bin/env node
/**
 * 生产环境数据库初始化脚本
 * 自动创建表结构和初始数据
 */

const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

// 数据库配置（从环境变量读取）
const config = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'postgres',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres123',
  database: process.env.DATABASE_NAME || 'proxyhub',
  entities: ['dist/**/*.entity.js'],
  synchronize: true, // 自动创建表
  logging: false,
};

console.log('🔍 数据库配置:', {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.username,
});

const AppDataSource = new DataSource(config);

async function initDatabase() {
  try {
    console.log('\n==========================================');
    console.log('🚀 ProxyHub 数据库初始化');
    console.log('==========================================\n');

    console.log('📡 正在连接数据库...');
    await AppDataSource.initialize();
    console.log('✅ 数据库连接成功\n');
    console.log('📋 正在创建初始数据...\n');

    // 1. 创建管理员
    const userRepo = AppDataSource.getRepository('User');
    let adminCreated = false;
    
    const adminExists = await userRepo.findOne({
      where: { email: 'admin@example.com' },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await userRepo.save({
        email: 'admin@example.com',
        password: hashedPassword,
        nickname: '系统管理员',
        role: 'admin',
        balance: '10000.00',
        gift_balance: '0.00',
        status: 'active',
      });
      console.log('✅ 管理员账号: admin@example.com / admin123 (余额: $10,000)');
      adminCreated = true;
    } else {
      console.log('ℹ️  管理员账号已存在');
    }

    // 🚫 已移除测试用户自动创建
    // 生产环境仅保留管理员账号，其他用户通过注册或管理后台创建

    // 3. 创建价格配置
    const priceConfigRepo = AppDataSource.getRepository('PriceConfig');
    const priceConfigs = [
      {
        productType: 'dynamic-residential',
        productName: '动态住宅代理',
        billingType: 'traffic',
        basePrice: '7.00',
        currency: 'USD',
        unit: 'GB',
        isActive: true,
      },
      {
        productType: 'static-residential',
        productName: '静态住宅IP（普通）',
        billingType: 'quantity',
        basePrice: '5.00',
        currency: 'USD',
        unit: 'IP/月',
        isActive: true,
      },
      {
        productType: 'static-residential-native',
        productName: '静态住宅IP（原生）',
        billingType: 'quantity',
        basePrice: '8.00',
        currency: 'USD',
        unit: 'IP/月',
        isActive: true,
      },
    ];

    let pricesCreated = 0;
    for (const config of priceConfigs) {
      const exists = await priceConfigRepo.findOne({ where: { productType: config.productType } });
      if (!exists) {
        await priceConfigRepo.save(config);
        console.log(`✅ 价格配置: ${config.productName} - $${config.basePrice}/${config.unit}`);
        pricesCreated++;
      }
    }
    if (pricesCreated === 0) {
      console.log('ℹ️  价格配置已存在');
    }

    // 4. 创建汇率配置
    const exchangeRateRepo = AppDataSource.getRepository('ExchangeRate');
    const rateExists = await exchangeRateRepo.findOne({
      where: { fromCurrency: 'USD', toCurrency: 'CNY' },
    });

    if (!rateExists) {
      await exchangeRateRepo.save({
        fromCurrency: 'USD',
        toCurrency: 'CNY',
        rate: '7.20',
        isActive: true,
      });
      console.log('✅ 汇率配置: 1 USD = 7.20 CNY');
    } else {
      console.log('ℹ️  汇率配置已存在');
    }

    // 5. 创建系统设置
    const settingsRepo = AppDataSource.getRepository('SystemSettings');
    const defaultSettings = [
      { key: 'site_name', value: 'ProxyHub', category: 'general' },
      { key: 'telegram1', value: '@proxyhub_support', category: 'contact' },
      { key: 'telegram1_link', value: 'https://t.me/proxyhub_support', category: 'contact' },
      { key: 'min_recharge_amount', value: '10', category: 'payment' },
      { key: 'max_recharge_amount', value: '10000', category: 'payment' },
    ];

    let settingsCreated = 0;
    for (const setting of defaultSettings) {
      const exists = await settingsRepo.findOne({ where: { key: setting.key } });
      if (!exists) {
        await settingsRepo.save(setting);
        settingsCreated++;
      }
    }
    if (settingsCreated > 0) {
      console.log(`✅ 系统设置: ${settingsCreated} 项配置已创建`);
    } else {
      console.log('ℹ️  系统设置已存在');
    }

    console.log('\n==========================================');
    console.log('🎉 数据库初始化完成！');
    console.log('==========================================\n');
    
    if (adminCreated || usersCreated > 0) {
      console.log('📋 登录凭证：\n');
      if (adminCreated) {
        console.log('管理员: admin@example.com / admin123 ($10,000)');
      }
      if (usersCreated > 0) {
        console.log('测试用户:');
        console.log('  • user@example.com / password123 ($1,000)');
        console.log('  • alice@test.com / password123 ($500)');
        console.log('  • bob@test.com / password123 ($500)');
      }
      console.log('\n==========================================\n');
    }

    await AppDataSource.destroy();
    return true;
  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 提示: 无法连接到数据库，请确保数据库服务已启动');
    } else if (error.code === 'ENOTFOUND') {
      console.error('💡 提示: 无法解析数据库主机名，请检查 DATABASE_HOST 环境变量');
    }
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ 初始化脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 初始化脚本执行失败');
      process.exit(1);
    });
}

module.exports = initDatabase;

