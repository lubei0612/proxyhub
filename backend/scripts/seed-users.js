const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seedUsers() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    database: process.env.DATABASE_NAME || 'proxyhub',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres123',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../src/database/seed-users-only.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // 执行SQL
    await client.query(sql);
    console.log('✅ Users seeded successfully!');

    // 查询用户验证
    const result = await client.query('SELECT id, email, role, balance, status FROM users ORDER BY id');
    console.log('\n📋 插入的用户：');
    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedUsers();

