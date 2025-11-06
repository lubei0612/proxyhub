const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

// 数据库配置（匹配 docker-compose 的环境变量）
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'postgres',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres123',
  database: process.env.DATABASE_NAME || 'proxyhub',
  entities: ['dist/**/*.entity.js'],
  synchronize: true, // 自动创建表结构
  logging: false,
});

async function seed() {
  try {
    console.log('\n==========================================');
    console.log('🚀 ProxyHub 数据库初始化');
    console.log('==========================================\n');

    console.log('📡 正在连接数据库...');
    await AppDataSource.initialize();
    console.log('✅ 数据库连接成功\n');

    console.log('📋 正在创建初始数据...\n');

    // 1. 创建管理员用户
    const userRepo = AppDataSource.getRepository('User');
    
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
    } else {
      console.log('ℹ️  管理员账号已存在');
    }

    // 2. 创建测试用户
    const testUsers = [
      { email: 'user@example.com', password: 'password123', nickname: '测试用户', balance: '1000.00' },
      { email: 'alice@test.com', password: 'password123', nickname: 'Alice', balance: '500.00' },
      { email: 'bob@test.com', password: 'password123', nickname: 'Bob', balance: '500.00' },
    ];

    for (const userData of testUsers) {
      const exists = await userRepo.findOne({ where: { email: userData.email } });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await userRepo.save({
          email: userData.email,
          password: hashedPassword,
          nickname: userData.nickname,
          role: 'user',
          balance: userData.balance,
          gift_balance: '0.00',
          status: 'active',
        });
        console.log(`✅ 测试用户: ${userData.email} / password123 (余额: $${userData.balance})`);
      }
    }

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

    for (const config of priceConfigs) {
      const exists = await priceConfigRepo.findOne({ where: { productType: config.productType } });
      if (!exists) {
        await priceConfigRepo.save(config);
        console.log(`✅ 价格配置: ${config.productName} - $${config.basePrice}/${config.unit}`);
      }
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

    for (const setting of defaultSettings) {
      const exists = await settingsRepo.findOne({ where: { key: setting.key } });
      if (!exists) {
        await settingsRepo.save(setting);
        console.log(`✅ 系统设置: ${setting.key} = ${setting.value}`);
      }
    }

    console.log('\n==========================================');
    console.log('🎉 数据库初始化完成！');
    console.log('==========================================\n');
    console.log('📋 登录凭证：\n');
    console.log('管理员账号:');
    console.log('  邮箱: admin@example.com');
    console.log('  密码: admin123');
    console.log('  余额: $10,000.00\n');
    console.log('测试账号:');
    console.log('  1. user@example.com / password123 ($1,000)');
    console.log('  2. alice@test.com / password123 ($500)');
    console.log('  3. bob@test.com / password123 ($500)\n');
    console.log('==========================================\n');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seed();

