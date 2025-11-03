const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function checkPassword() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    database: process.env.DATABASE_NAME || 'proxyhub',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres123',
  });

  try {
    await client.connect();
    
    // 查询用户
    const result = await client.query(
      'SELECT id, email, password, role, status FROM users WHERE email = $1',
      ['user@example.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ 用户不存在！');
      return;
    }
    
    const user = result.rows[0];
    console.log('\n📋 用户信息：');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Status:', user.status);
    console.log('Password Hash (前30字符):', user.password.substring(0, 30) + '...');
    console.log('Password Hash (完整):', user.password);
    
    // 测试密码验证
    console.log('\n🔐 测试密码验证：');
    const testPassword = '123456';
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    console.log(`密码 "${testPassword}" 验证结果:`, isValid ? '✅ 正确' : '❌ 错误');
    
    // 重新生成正确的哈希
    console.log('\n🔄 生成新的密码哈希：');
    const newHash = await bcrypt.hash('123456', 10);
    console.log('新哈希:', newHash);
    
    // 测试新哈希
    const newHashValid = await bcrypt.compare('123456', newHash);
    console.log('新哈希验证:', newHashValid ? '✅ 正确' : '❌ 错误');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkPassword();

