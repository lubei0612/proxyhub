#!/usr/bin/env node

/**
 * 环境变量配置检查脚本
 * 检查必需的环境变量是否已正确配置
 */

require('dotenv').config();

const REQUIRED_VARS = {
  // 数据库配置
  DATABASE_HOST: { required: true, description: 'PostgreSQL 主机地址' },
  DATABASE_PORT: { required: true, description: 'PostgreSQL 端口' },
  DATABASE_USER: { required: true, description: 'PostgreSQL 用户名' },
  DATABASE_PASSWORD: { required: true, description: 'PostgreSQL 密码' },
  DATABASE_NAME: { required: true, description: 'PostgreSQL 数据库名' },
  
  // Redis配置
  REDIS_HOST: { required: true, description: 'Redis 主机地址' },
  REDIS_PORT: { required: true, description: 'Redis 端口' },
  
  // JWT配置
  JWT_SECRET: { required: true, description: 'JWT 密钥', sensitive: true },
  
  // 985Proxy配置
  PROXY_985_API_KEY: { required: true, description: '985Proxy API密钥', sensitive: true },
  PROXY_985_ZONE: { required: false, description: '985Proxy Zone' },
  PROXY_985_BASE_URL: { required: false, description: '985Proxy API基础URL' },
};

console.log('\n========================================');
console.log('  环境变量配置检查');
console.log('========================================\n');

let hasErrors = false;
let hasWarnings = false;

Object.entries(REQUIRED_VARS).forEach(([key, config]) => {
  const value = process.env[key];
  const status = value ? '✓' : '✗';
  const statusColor = value ? '\x1b[32m' : '\x1b[31m';
  const resetColor = '\x1b[0m';
  
  if (!value) {
    if (config.required) {
      hasErrors = true;
      console.log(`${statusColor}${status}${resetColor} ${key}: ${statusColor}缺失 [必需]${resetColor}`);
      console.log(`   说明: ${config.description}\n`);
    } else {
      hasWarnings = true;
      console.log(`\x1b[33m⚠\x1b[0m ${key}: 未设置 [可选]`);
      console.log(`   说明: ${config.description}\n`);
    }
  } else {
    const displayValue = config.sensitive ? '***' : value;
    console.log(`${statusColor}${status}${resetColor} ${key}: ${displayValue}`);
    console.log(`   说明: ${config.description}\n`);
  }
});

console.log('========================================');

if (hasErrors) {
  console.log('\x1b[31m✗ 发现配置错误！请检查并修复上述缺失的必需环境变量。\x1b[0m');
  console.log('\n修复方法：');
  console.log('1. 复制 env.example 到 .env');
  console.log('2. 编辑 .env 文件，填入正确的配置值');
  console.log('3. 重新运行此脚本验证\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('\x1b[33m⚠ 所有必需配置已就绪，但存在可选配置未设置。\x1b[0m\n');
  process.exit(0);
} else {
  console.log('\x1b[32m✓ 所有配置检查通过！\x1b[0m\n');
  process.exit(0);
}
