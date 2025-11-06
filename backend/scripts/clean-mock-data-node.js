/**
 * ProxyHub Mock数据清理脚本 (Node.js版本)
 * 使用pg库连接PostgreSQL数据库并清理Mock数据
 */

const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'posteres123',
  database: 'proxyhub',
});

async function cleanMockData() {
  try {
    console.log('🔌 连接数据库...');
    await client.connect();
    console.log('✅ 数据库连接成功\n');

    // 删除所有非985Proxy的静态代理
    console.log('🗑️  删除非985Proxy静态代理...');
    const deleteProxiesResult = await client.query(`
      DELETE FROM static_proxies 
      WHERE remark LIKE '%[MOCK]%' 
         OR channel_name = '默认通道'
         OR channel_name != '985Proxy'
    `);
    console.log(`✅ 已删除 ${deleteProxiesResult.rowCount} 条静态代理记录\n`);

    // 删除所有非985Proxy的订单
    console.log('🗑️  删除非985Proxy订单...');
    const deleteOrdersResult = await client.query(`
      DELETE FROM orders 
      WHERE remark NOT LIKE '%985Proxy%'
         OR remark IS NULL
    `);
    console.log(`✅ 已删除 ${deleteOrdersResult.rowCount} 条订单记录\n`);

    // 删除所有非985Proxy的交易
    console.log('🗑️  删除非985Proxy交易...');
    const deleteTransactionsResult = await client.query(`
      DELETE FROM transactions 
      WHERE remark NOT LIKE '%985Proxy%'
         OR remark IS NULL
    `);
    console.log(`✅ 已删除 ${deleteTransactionsResult.rowCount} 条交易记录\n`);

    // 验证清理结果
    console.log('📊 验证清理结果：');
    
    const proxiesCount = await client.query('SELECT COUNT(*) FROM static_proxies');
    console.log(`   - static_proxies: ${proxiesCount.rows[0].count} 条记录剩余`);
    
    const ordersCount = await client.query('SELECT COUNT(*) FROM orders');
    console.log(`   - orders: ${ordersCount.rows[0].count} 条记录剩余`);
    
    const transactionsCount = await client.query('SELECT COUNT(*) FROM transactions');
    console.log(`   - transactions: ${transactionsCount.rows[0].count} 条记录剩余\n`);

    console.log('🎉 清理完成！');

  } catch (error) {
    console.error('❌ 清理Mock数据失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    await client.end();
    console.log('🔌 数据库连接已关闭');
  }
}

cleanMockData();

