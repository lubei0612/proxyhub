/**
 * ProxyHub API 测试脚本
 * 用于验证后端API是否正常工作
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';

// 测试账号
const TEST_USER = {
  email: 'test@test.com',
  password: 'test123456'
};

const ADMIN_USER = {
  email: 'admin@proxy.com',
  password: 'admin123456'
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testLogin(user, role = 'user') {
  try {
    log(`\n📝 测试${role === 'admin' ? '管理员' : '用户'}登录: ${user.email}`, 'cyan');
    
    const response = await axios.post(`${API_BASE}/auth/login`, user);
    
    if (response.data && response.data.access_token) {
      log(`✅ 登录成功！`, 'green');
      log(`   Token: ${response.data.access_token.substring(0, 50)}...`, 'yellow');
      log(`   用户信息: ${JSON.stringify(response.data.user, null, 2)}`, 'yellow');
      return response.data.access_token;
    } else {
      log(`❌ 登录失败：未返回token`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ 登录失败：${error.response?.data?.message || error.message}`, 'red');
    return null;
  }
}

async function testDashboard(token) {
  try {
    log(`\n📊 测试仪表盘API`, 'cyan');
    
    const response = await axios.get(`${API_BASE}/dashboard/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data) {
      log(`✅ 仪表盘数据获取成功！`, 'green');
      log(`   数据: ${JSON.stringify(response.data, null, 2)}`, 'yellow');
      return true;
    }
  } catch (error) {
    log(`❌ 仪表盘获取失败：${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function testUserInfo(token) {
  try {
    log(`\n👤 测试用户信息API`, 'cyan');
    
    const response = await axios.get(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data) {
      log(`✅ 用户信息获取成功！`, 'green');
      log(`   用户: ${JSON.stringify(response.data, null, 2)}`, 'yellow');
      return true;
    }
  } catch (error) {
    log(`❌ 用户信息获取失败：${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n==============================================', 'cyan');
  log('  ProxyHub API 测试开始', 'cyan');
  log('==============================================', 'cyan');
  
  // 测试普通用户登录
  const userToken = await testLogin(TEST_USER, 'user');
  if (userToken) {
    await testUserInfo(userToken);
    await testDashboard(userToken);
  }
  
  // 测试管理员登录
  const adminToken = await testLogin(ADMIN_USER, 'admin');
  if (adminToken) {
    await testUserInfo(adminToken);
    await testDashboard(adminToken);
  }
  
  log('\n==============================================', 'cyan');
  log('  测试完成', 'cyan');
  log('==============================================\n', 'cyan');
}

// 运行测试
runTests().catch(error => {
  log(`\n❌ 测试失败：${error.message}`, 'red');
  process.exit(1);
});

