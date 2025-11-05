/**
 * 验证价格配置是否正确初始化
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres123',
  database: 'proxyhub',
});

async function verifyPriceConfig() {
  try {
    console.log('📦 连接数据库...');
    await client.connect();
    console.log('✅ 数据库连接成功\n');

    // 查询所有价格配置
    console.log('🔍 查询价格配置...');
    const result = await client.query(`
      SELECT 
        id,
        product_type,
        base_price,
        is_active,
        created_at
      FROM price_configs
      ORDER BY product_type
    `);

    console.log(`\n📊 找到 ${result.rows.length} 个价格配置:\n`);
    console.table(result.rows);

    // 验证必需的配置
    const requiredConfigs = [
      'static-residential',
      'static-residential-native'
    ];

    console.log('\n✅ 配置验证结果:');
    let allValid = true;

    for (const configType of requiredConfigs) {
      const config = result.rows.find(r => r.product_type === configType);
      if (config) {
        console.log(`  ✅ ${configType}: $${config.base_price}`);
      } else {
        console.log(`  ❌ ${configType}: 缺失`);
        allValid = false;
      }
    }

    // 查询价格覆盖
    console.log('\n🔍 查询价格覆盖...');
    const overridesResult = await client.query(`
      SELECT 
        po.id,
        pc.product_type,
        po.country_code,
        po.city_name,
        po.override_price,
        po.is_active
      FROM price_overrides po
      JOIN price_configs pc ON po.price_config_id = pc.id
      WHERE po.is_active = true
      ORDER BY pc.product_type, po.country_code
    `);

    console.log(`\n📊 找到 ${overridesResult.rows.length} 个价格覆盖:\n`);
    if (overridesResult.rows.length > 0) {
      console.table(overridesResult.rows);
    } else {
      console.log('  ℹ️  暂无价格覆盖');
    }

    console.log('\n' + '='.repeat(50));
    if (allValid) {
      console.log('✅ 所有配置验证通过！');
      console.log('\n📌 下一步:');
      console.log('   1. 启动前端服务: cd frontend && npm run dev');
      console.log('   2. 访问: http://localhost:8080/proxy/static/buy');
      console.log('   3. 切换到"原生"IP类型');
      console.log('   4. 验证所有地区显示 $10/月');
    } else {
      console.log('❌ 配置验证失败！请检查缺失的配置。');
    }
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ 验证失败:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 提示: 请确保PostgreSQL服务正在运行');
    } else if (error.code === '42P01') {
      console.error('\n💡 提示: price_configs表不存在，请先运行数据库迁移');
    }
    
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n📦 数据库连接已关闭\n');
  }
}

verifyPriceConfig();


