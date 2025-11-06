import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// 加载环境变量
config({ path: path.join(__dirname, '../.env') });

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'proxyhub',
  driver: require('mysql2'),
});

async function cleanMockData() {
  try {
    await AppDataSource.initialize();
    console.log('✅ 数据库连接成功');

    // 1. 查看当前所有IP
    const allIPs = await AppDataSource.query(`
      SELECT id, ip, channelName, remark, createdAt 
      FROM static_proxies 
      ORDER BY id DESC
    `);
    console.log(`\n📊 当前总共有 ${allIPs.length} 个IP:\n`);
    allIPs.forEach((ip: any) => {
      console.log(`ID: ${ip.id}, IP: ${ip.ip}, 通道: ${ip.channelName}, 备注: ${ip.remark}, 创建时间: ${ip.createdAt}`);
    });

    // 2. 识别mock数据 (备注包含[MOCK]或通道是"默认通道"的)
    const mockIPs = await AppDataSource.query(`
      SELECT id, ip, channelName, remark 
      FROM static_proxies 
      WHERE remark LIKE '%[MOCK]%' 
         OR channelName = '默认通道'
      ORDER BY id DESC
    `);
    
    console.log(`\n🗑️  识别到 ${mockIPs.length} 个mock数据:\n`);
    mockIPs.forEach((ip: any) => {
      console.log(`ID: ${ip.id}, IP: ${ip.ip}, 通道: ${ip.channelName}, 备注: ${ip.remark}`);
    });

    if (mockIPs.length === 0) {
      console.log('\n✅ 没有发现mock数据！');
      await AppDataSource.destroy();
      return;
    }

    // 3. 删除mock数据
    console.log('\n⚠️  准备删除mock数据...');
    
    const result = await AppDataSource.query(`
      DELETE FROM static_proxies 
      WHERE remark LIKE '%[MOCK]%' 
         OR channelName = '默认通道'
    `);
    
    console.log(`✅ 已删除 ${result.affectedRows} 条mock数据`);

    // 4. 查看剩余的真实数据
    const realIPs = await AppDataSource.query(`
      SELECT id, ip, channelName, remark, createdAt 
      FROM static_proxies 
      ORDER BY id DESC
    `);
    
    console.log(`\n✅ 剩余 ${realIPs.length} 个真实IP:\n`);
    realIPs.forEach((ip: any) => {
      console.log(`ID: ${ip.id}, IP: ${ip.ip}, 通道: ${ip.channelName}, 备注: ${ip.remark}, 创建时间: ${ip.createdAt}`);
    });

    await AppDataSource.destroy();
    console.log('\n✅ 清理完成！');
    
  } catch (error) {
    console.error('❌ 清理失败:', error);
    process.exit(1);
  }
}

cleanMockData();

