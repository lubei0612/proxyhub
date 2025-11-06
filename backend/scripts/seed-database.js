const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

// 数据库配置
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'proxyhub',
  entities: ['dist/**/*.entity.js'],
  synchronize: true, // 自动创建表结构
  logging: false,
});

async function seed() {
  try {
    console.log('==========================================');
    console.log('🚀 开始初始化数据库...');
    console.log('==========================================\n');

    await AppDataSource.initialize();
    console.log('✅ 数据库连接成功\n');

    // 创建管理员用户
    const userRepository = AppDataSource.getRepository('User');
    
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
        balance: '10000.00',
        gift_balance: '0.00',
        status: 'active',
      });
      await userRepository.save(admin);
      console.log('✅ 管理员账号创建成功');
      console.log('   邮箱: admin@example.com');
      console.log('   密码: admin123');
      console.log('   余额: $10,000.00\n');
    } else {
      console.log('ℹ️  管理员账号已存在\n');
    }

    // 创建测试用户
    const testUsers = [
      { email: 'user@example.com', password: 'password123', nickname: '测试用户', balance: '1000.00' },
      { email: 'alice@test.com', password: 'password123', nickname: 'Alice', balance: '500.00' },
      { email: 'bob@test.com', password: 'password123', nickname: 'Bob', balance: '500.00' },
    ];

    for (const userData of testUsers) {
      const exists = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (!exists) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = userRepository.create({
          email: userData.email,
          password: hashedPassword,
          nickname: userData.nickname,
          role: 'user',
          balance: userData.balance,
          gift_balance: '0.00',
          status: 'active',
        });
        await userRepository.save(user);
        console.log(`✅ 测试用户创建: ${userData.email} (余额: $${userData.balance})`);
      }
    }

    // 创建价格配置
    const priceConfigRepository = AppDataSource.getRepository('PriceConfig');
    
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

    for (const configData of priceConfigs) {
      const exists = await priceConfigRepository.findOne({
        where: { productType: configData.productType },
      });

      if (!exists) {
        const config = priceConfigRepository.create(configData);
        await priceConfigRepository.save(config);
        console.log(`✅ 价格配置创建: ${configData.productName} - $${configData.basePrice}/${configData.unit}`);
      }
    }

    // 创建汇率配置
    const exchangeRateRepository = AppDataSource.getRepository('ExchangeRate');
    
    const rateExists = await exchangeRateRepository.findOne({
      where: { fromCurrency: 'USD', toCurrency: 'CNY' },
    });

    if (!rateExists) {
      const rate = exchangeRateRepository.create({
        fromCurrency: 'USD',
        toCurrency: 'CNY',
        rate: '7.20',
        isActive: true,
      });
      await exchangeRateRepository.save(rate);
      console.log('✅ 汇率配置创建: 1 USD = 7.20 CNY');
    }

    // 创建系统设置
    const settingsRepository = AppDataSource.getRepository('SystemSettings');
    
    const defaultSettings = [
      { key: 'site_name', value: 'ProxyHub', category: 'general' },
      { key: 'telegram1', value: '@proxyhub_support', category: 'contact' },
      { key: 'telegram1_link', value: 'https://t.me/proxyhub_support', category: 'contact' },
      { key: 'min_recharge_amount', value: '10', category: 'payment' },
      { key: 'max_recharge_amount', value: '10000', category: 'payment' },
    ];

    for (const setting of defaultSettings) {
      const exists = await settingsRepository.findOne({
        where: { key: setting.key },
      });

      if (!exists) {
        const newSetting = settingsRepository.create(setting);
        await settingsRepository.save(newSetting);
        console.log(`✅ 系统设置创建: ${setting.key} = ${setting.value}`);
      }
    }

    console.log('\n==========================================');
    console.log('🎉 数据库初始化完成！');
    console.log('==========================================\n');
    console.log('📋 测试账号列表：');
    console.log('1. 管理员: admin@example.com / admin123');
    console.log('2. 用户1: user@example.com / password123');
    console.log('3. 用户2: alice@test.com / password123');
    console.log('4. 用户3: bob@test.com / password123');
    console.log('==========================================\n');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seed();
