/**
 * 初始化价格配置表
 * 用于支持价格覆盖管理功能
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres123',
  database: 'proxyhub',
});

async function initPriceConfig() {
  try {
    console.log('📦 连接数据库...');
    await client.connect();
    console.log('✅ 数据库连接成功\n');

    // 1. 检查是否已存在配置
    console.log('🔍 检查现有价格配置...');
    const checkResult = await client.query(
      `SELECT * FROM price_configs WHERE product_type IN ('static-residential', 'static-residential-native')`
    );
    
    if (checkResult.rows.length >= 2) {
      console.log('ℹ️  价格配置已存在:');
      console.table(checkResult.rows);
      console.log('\n✅ 无需初始化');
      return;
    }

    console.log('⚠️  部分或全部价格配置缺失，开始初始化...\n');

    // 2. 插入缺失的配置
    console.log('📝 插入默认价格配置...');
    const insertedRows = [];
    
    // 检查并插入 static-residential
    const existingShared = checkResult.rows.find(r => r.product_type === 'static-residential');
    if (!existingShared) {
      const result = await client.query(`
        INSERT INTO price_configs 
          (product_type, base_price, is_active, created_at, updated_at)
        VALUES 
          ('static-residential', 5.00, true, NOW(), NOW())
        RETURNING *
      `);
      insertedRows.push(...result.rows);
    }
    
    // 检查并插入 static-residential-native
    const existingNative = checkResult.rows.find(r => r.product_type === 'static-residential-native');
    if (!existingNative) {
      const result = await client.query(`
        INSERT INTO price_configs 
          (product_type, base_price, is_active, created_at, updated_at)
        VALUES 
          ('static-residential-native', 10.00, true, NOW(), NOW())
        RETURNING *
      `);
      insertedRows.push(...result.rows);
    }

    console.log('✅ 价格配置初始化成功:');
    console.table(insertedRows);

    // 3. 验证结果
    console.log('\n🔍 验证插入结果...');
    const verifyResult = await client.query(
      `SELECT * FROM price_configs WHERE product_type IN ('static-residential', 'static-residential-native') ORDER BY product_type`
    );

    if (verifyResult.rows.length === 2) {
      console.log('✅ 验证成功！所有配置已生效:');
      console.table(verifyResult.rows);
    } else {
      console.error('❌ 验证失败！配置数量不正确:', verifyResult.rows.length);
    }

  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 提示: 请确保PostgreSQL服务正在运行');
      console.error('   - Windows: 检查服务管理器中的PostgreSQL服务');
      console.error('   - Docker: 确保docker-compose up -d已运行');
    } else if (error.code === '42P01') {
      console.error('\n💡 提示: price_configs表不存在，请先运行数据库迁移');
      console.error('   - 运行: npm run migration:run');
    } else if (error.code === '28P01') {
      console.error('\n💡 提示: 数据库认证失败，请检查用户名和密码');
    }
    
    throw error;
  } finally {
    await client.end();
    console.log('\n📦 数据库连接已关闭');
  }
}

// 执行初始化
initPriceConfig()
  .then(() => {
    console.log('\n🎉 完成！现在可以重新测试价格覆盖管理功能');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 初始化脚本执行失败');
    process.exit(1);
  });

