const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function updatePasswords() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    database: process.env.DATABASE_NAME || 'proxyhub',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres123',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // 定义用户密码
    const users = [
      { email: 'user@example.com', password: '123456' },
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'test@example.com', password: 'test123' },
    ];
    
    // 更新每个用户的密码
    for (const userData of users) {
      const hash = await bcrypt.hash(userData.password, 10);
      
      await client.query(
        'UPDATE users SET password = $1, updated_at = now() WHERE email = $2',
        [hash, userData.email]
      );
      
      console.log(`✅ 更新 ${userData.email} / ${userData.password}`);
      console.log(`   Hash: ${hash.substring(0, 40)}...`);
      
      // 验证更新
      const isValid = await bcrypt.compare(userData.password, hash);
      console.log(`   验证: ${isValid ? '✅ 正确' : '❌ 错误'}\n`);
    }
    
    console.log('🎉 所有用户密码更新完成！');
    
    // 显示更新后的用户列表
    const result = await client.query(
      'SELECT id, email, role, status FROM users ORDER BY id'
    );
    console.log('\n📋 用户列表：');
    console.table(result.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

updatePasswords();

