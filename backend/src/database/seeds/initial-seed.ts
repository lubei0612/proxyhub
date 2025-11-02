import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import dataSource from '../../config/database.config';
import { User } from '../../modules/user/entities/user.entity';
import { SystemSettings } from '../../modules/admin/entities/system-settings.entity';

async function runSeed() {
  try {
    // 初始化数据源
    await dataSource.initialize();
    console.log('✅ 数据源已连接');

    const userRepository = dataSource.getRepository(User);
    const settingsRepository = dataSource.getRepository(SystemSettings);

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

    console.log('\n🎉 种子数据初始化完成！');
    console.log('\n📝 登录信息：');
    console.log('管理员：admin@example.com / admin123（余额：$10000）');
    console.log('普通用户：user@example.com / password123（余额：$1000）\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ 种子数据初始化失败：', error);
    process.exit(1);
  }
}

runSeed();

