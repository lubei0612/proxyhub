# 🎨 ProxyHub 前端代码参考

## 📋 概述

本文档详细说明ProxyHub前端的**所有关键实现**，包括路由配置、API调用、状态管理、以及核心组件。

使用此参考，AI可以精确复刻整个前端系统。

---

## 🗺️ 路由配置

### Router Index (`router/index.ts`)

**位置**: `frontend/src/router/index.ts`

**完整路由结构**:

```typescript
const routes: RouteRecordRaw[] = [
  // 1. 公开路由（不需要登录）
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { requiresAuth: false }
  },

  // 2. 用户仪表盘（需要登录）
  {
    path: '/',
    component: DashboardLayout,  // 布局组件
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: 'dashboard.title' }
      },
      // 静态代理
      {
        path: 'proxy/static/buy',
        name: 'StaticBuy',
        component: () => import('@/views/proxy/StaticBuy.vue'),
        meta: { title: 'proxy.staticBuy' }
      },
      {
        path: 'proxy/static/manage',
        name: 'StaticManage',
        component: () => import('@/views/proxy/StaticManage.vue'),
        meta: { title: 'proxy.staticManage' }
      },
      // 动态代理
      {
        path: 'proxy/dynamic/buy',
        name: 'DynamicBuy',
        component: () => import('@/views/proxy/DynamicBuy.vue'),
        meta: { title: 'proxy.dynamicBuy' }
      },
      {
        path: 'proxy/dynamic/manage',
        name: 'DynamicManage',
        component: () => import('@/views/proxy/DynamicManage.vue'),
        meta: { title: 'proxy.dynamicManage' }
      },
      // 充值
      {
        path: 'wallet/recharge',
        name: 'WalletRecharge',
        component: () => import('@/views/wallet/Recharge.vue'),
        meta: { title: 'wallet.recharge' }
      },
      // 订单与计费
      {
        path: 'billing/orders',
        name: 'BillingOrders',
        component: () => import('@/views/billing/Orders.vue'),
        meta: { title: 'billing.orders' }
      },
      {
        path: 'billing/transactions',
        name: 'BillingTransactions',
        component: () => import('@/views/billing/Transactions.vue'),
        meta: { title: 'billing.transactions' }
      },
      // 账户中心
      {
        path: 'account/center',
        name: 'AccountCenter',
        component: () => import('@/views/account/Center.vue'),
        meta: { title: 'account.center' }
      },
    ]
  },

  // 3. 管理后台（需要admin角色）
  {
    path: '/admin-portal/login',
    name: 'AdminPortalLogin',
    component: () => import('@/views/admin-portal/AdminPortalLogin.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin-portal',
    component: () => import('@/layouts/AdminPortalLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    redirect: '/admin-portal/users',
    children: [
      {
        path: 'users',
        name: 'AdminPortalUsers',
        component: () => import('@/views/admin-portal/Users.vue'),
        meta: { title: 'admin.users', requiresAdmin: true }
      },
      {
        path: 'recharges',
        name: 'AdminPortalRecharges',
        component: () => import('@/views/admin-portal/RechargeApproval.vue'),
        meta: { title: 'admin.recharges', requiresAdmin: true }
      },
      {
        path: 'orders',
        name: 'AdminPortalOrders',
        component: () => import('@/views/admin-portal/Orders.vue'),
        meta: { title: 'admin.orders', requiresAdmin: true }
      },
      {
        path: 'ips',
        name: 'AdminPortalIPs',
        component: () => import('@/views/admin-portal/IPManagement.vue'),
        meta: { title: 'admin.ips', requiresAdmin: true }
      },
      {
        path: 'statistics',
        name: 'AdminPortalStatistics',
        component: () => import('@/views/admin-portal/Statistics.vue'),
        meta: { title: 'admin.statistics', requiresAdmin: true }
      },
      {
        path: 'settings',
        name: 'AdminPortalSettings',
        component: () => import('@/views/admin-portal/Settings.vue'),
        meta: { title: 'admin.settings', requiresAdmin: true }
      }
    ]
  },

  // 4. 404重定向
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]
```

### 路由守卫 (Route Guards)

**关键逻辑**:

```typescript
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')

  // 1. 管理后台登录页
  if (to.path === '/admin-portal/login') {
    if (token && userStr) {
      const user = JSON.parse(userStr)
      if (user?.role === 'admin') {
        next('/admin-portal/users')  // 已登录admin，跳转管理后台
        return
      }
    }
    next()  // 允许访问登录页
    return
  }

  // 2. 管理后台页面（需要admin权限）
  if (to.path.startsWith('/admin-portal')) {
    if (!token) {
      next('/admin-portal/login')  // 未登录，跳转登录页
      return
    }

    const user = userStr ? JSON.parse(userStr) : null
    if (user?.role !== 'admin') {
      next('/')  // 不是admin，跳转用户首页
      return
    }

    next()  // 允许访问
    return
  }

  // 3. 普通页面权限检查
  if (to.meta.requiresAuth !== false) {
    if (!token) {
      next('/login')  // 未登录，跳转登录页
      return
    }
  } else {
    // 如果已登录，访问login/register时跳转到dashboard
    if (token && (to.path === '/login' || to.path === '/register')) {
      next('/dashboard')
      return
    }
  }

  next()  // 允许访问
})
```

**关键要点**:
- ✅ 未登录用户只能访问 `/login` 和 `/register`
- ✅ 已登录用户不能访问登录/注册页，会自动跳转到 `/dashboard`
- ✅ Admin角色才能访问 `/admin-portal/*`
- ✅ 非Admin访问管理后台会被拦截

---

## 🌐 API调用配置

### Axios请求配置 (`api/request.ts`)

**位置**: `frontend/src/api/request.ts`

**完整配置**:

```typescript
import axios, { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 创建axios实例
const request = axios.create({
  baseURL: '/api/v1',  // 所有API的基础路径
  timeout: 30000,      // 30秒超时
})

// ========== 请求拦截器 ==========
request.interceptors.request.use(
  (config) => {
    // 自动添加JWT Token
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ========== 响应拦截器 ==========
request.interceptors.response.use(
  (response) => {
    // 直接返回data，简化调用
    return response.data
  },
  (error: AxiosError<any>) => {
    if (error.response) {
      const { status, data } = error.response
      const errorMessage = data?.message || data?.msg || data?.error

      switch (status) {
        case 401:  // 未授权
          ElMessage.error(errorMessage || '未登录或登录已过期')
          // 清除登录状态
          const userStore = useUserStore()
          userStore.logout()
          // 跳转到登录页
          if (router.currentRoute.value.path !== '/login') {
            router.push('/login')
          }
          break

        case 403:  // 无权限
          ElMessage.error(errorMessage || '没有权限访问')
          break

        case 404:  // 资源不存在
          ElMessage.error(errorMessage || '请求的资源不存在')
          break

        case 500:  // 服务器错误
          ElMessage.error(errorMessage || '服务器错误，请稍后重试')
          break

        default:
          ElMessage.error(errorMessage || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查您的网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

export default request
```

**关键技术点**:
1. **自动添加Token**: 从Pinia store中读取token，自动添加到请求头
2. **统一错误处理**: 401自动跳转登录页
3. **自动提取data**: 响应拦截器直接返回 `response.data`
4. **友好错误提示**: 使用Element Plus的 `ElMessage` 显示错误

---

### API模块 - Auth (`api/auth.ts`)

**位置**: `frontend/src/api/auth.ts`

```typescript
import request from './request'

export const authApi = {
  // 登录
  login: (email: string, password: string) => {
    return request.post('/auth/login', { email, password })
  },

  // 注册
  register: (email: string, password: string, referralCode?: string) => {
    return request.post('/auth/register', { email, password, referralCode })
  },

  // 登出
  logout: () => {
    return request.post('/auth/logout')
  },

  // 获取用户信息
  getProfile: () => {
    return request.get('/users/profile')
  },
}
```

**使用示例**:
```typescript
// 在组件中调用
import { authApi } from '@/api/auth'

const login = async () => {
  try {
    const res = await authApi.login(email.value, password.value)
    // res 已经是解包后的数据，不需要 res.data
    console.log(res.access_token, res.user)
  } catch (error) {
    // 错误已经在拦截器中处理，这里可以不用管
  }
}
```

---

### API模块 - Proxy (`api/proxy.ts`)

**位置**: `frontend/src/api/proxy.ts`

**关键方法**:

```typescript
import request from './request'

/**
 * 获取IP库存
 */
export function getIPInventory(params?: {
  static_proxy_type?: 'shared' | 'premium';
  purpose_web?: string;
}) {
  return request.get('/proxy/static/inventory', { params })
}

/**
 * 获取我的静态IP列表
 */
export function getMyStaticIPs(params?: {
  page?: number;
  limit?: number;
  zone?: string;
  country?: string;
  city?: string;
}) {
  return request.get('/proxy/static/my-proxies', { params })
}

/**
 * 购买静态IP（新版本 - 本地库存）
 */
export function purchaseStaticProxy(data: {
  channelName: string;
  scenario?: string;
  ipType: 'normal' | 'native';
  duration: number;
  items: Array<{
    country: string;
    city: string;
    quantity: number;
  }>;
}) {
  return request.post('/proxy/static/purchase', data)
}

/**
 * 更新IP备注
 */
export function updateIPNote(id: number, remark: string) {
  return request.patch(`/proxy/static/${id}/remark`, { remark })
}

/**
 * 切换自动续费
 */
export function setAutoRenew(id: number, data: {
  auto_renew: boolean;
}) {
  return request.patch(`/proxy/static/${id}/auto-renew`, data)
}
```

---

## 🗂️ 状态管理 (Pinia)

### User Store (`stores/user.ts`)

**位置**: `frontend/src/stores/user.ts`

**完整实现**:

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { User } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // ========== State ==========
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  // ========== Getters ==========
  const isLoggedIn = computed(() => !!token.value)

  // ========== Actions ==========
  
  // 设置Token
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 设置用户信息
  const setUser = (newUser: User) => {
    // 确保balance是数字
    if (newUser && typeof newUser.balance !== 'number') {
      newUser.balance = Number(newUser.balance) || 0
    }
    user.value = newUser
    // 保存到localStorage（路由守卫需要）
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  // 登录
  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    setToken(res.access_token)
    setUser(res.user)
    return res
  }

  // 注册
  const register = async (email: string, password: string, referralCode?: string) => {
    const res = await authApi.register(email, password, referralCode)
    setToken(res.access_token)
    setUser(res.user)
    return res
  }

  // 登出
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 验证登录状态
  const checkAuth = async () => {
    if (!token.value) {
      return false
    }

    try {
      const res = await authApi.getProfile()
      setUser(res)
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  // 刷新用户信息
  const fetchUserInfo = async () => {
    if (!token.value) {
      return
    }

    try {
      const res = await authApi.getProfile()
      setUser(res)
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    }
  }

  // 更新余额
  const updateBalance = (amount: number) => {
    if (user.value) {
      user.value.balance = Number(user.value.balance) + amount
    }
  }

  return {
    // State
    token,
    user,
    // Getters
    isLoggedIn,
    // Actions
    login,
    register,
    logout,
    checkAuth,
    fetchUserInfo,
    updateBalance,
    setUser,
  }
})
```

**关键要点**:
- ✅ Token和User同时存储在Pinia和localStorage
- ✅ localStorage中的user供路由守卫使用
- ✅ balance字段强制转换为number类型
- ✅ 提供 `checkAuth()` 方法验证登录状态
- ✅ 提供 `fetchUserInfo()` 刷新用户信息
- ✅ 提供 `updateBalance()` 更新余额

**使用示例**:
```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 获取用户信息
console.log(userStore.user?.email)
console.log(userStore.user?.balance)

// 判断是否登录
if (userStore.isLoggedIn) {
  console.log('已登录')
}

// 登录
await userStore.login('user@example.com', 'password')

// 登出
userStore.logout()
</script>
```

---

## 🎨 UI组件参考

### 关键组件

#### 1. FlagIcon.vue - 国旗图标组件

**位置**: `frontend/src/components/common/FlagIcon.vue`

**用途**: 显示国家国旗图标

**Props**:
```typescript
interface Props {
  countryCode: string  // 国家代码 (如 'US', 'UK')
  size?: string        // 尺寸 ('small' | 'medium' | 'large')
}
```

**使用示例**:
```vue
<FlagIcon country-code="US" size="medium" />
```

**实现**: 使用 `country-flag-icons` 库

#### 2. DashboardLayout.vue - 用户仪表盘布局

**位置**: `frontend/src/layouts/DashboardLayout.vue`

**结构**:
- 顶部导航栏 (Navbar)
- 左侧菜单栏 (Sidebar)
- 主内容区域 (Main Content)

#### 3. AdminPortalLayout.vue - 管理后台布局

**位置**: `frontend/src/layouts/AdminPortalLayout.vue`

**结构**:
- 顶部导航栏
- 左侧菜单栏 (管理功能)
- 主内容区域

---

## 🎨 核心页面参考

### StaticBuy.vue - 静态IP购买页

**位置**: `frontend/src/views/proxy/StaticBuy.vue`

**关键功能**:
1. 显示可用国家/城市库存
2. 选择国家/城市和数量
3. 配置通道名称、使用场景、IP类型、购买时长
4. 计算总价
5. 提交购买订单

**关键数据结构**:
```typescript
interface PurchaseForm {
  channelName: string      // 通道名称
  scenario: string         // 使用场景
  ipType: 'normal' | 'native'  // IP类型
  duration: number         // 购买时长（天）
  items: Array<{
    country: string        // 国家代码
    city: string           // 城市名称
    quantity: number       // 数量
  }>
}
```

**关键方法**:
```typescript
// 获取库存
const fetchInventory = async () => {
  const res = await getIPInventory({
    static_proxy_type: 'shared'
  })
  inventoryList.value = res.data
}

// 提交购买
const handlePurchase = async () => {
  const res = await purchaseStaticProxy(purchaseForm)
  ElMessage.success(res.message)
  // 刷新用户余额
  await userStore.fetchUserInfo()
}
```

### StaticManage.vue - 静态IP管理页

**位置**: `frontend/src/views/proxy/StaticManage.vue`

**关键功能**:
1. 列表显示已购买的静态IP
2. 搜索/筛选 (按国家、城市、状态)
3. 显示IP详情 (IP/端口/用户名/密码/过期时间)
4. 复制IP信息
5. 更新备注
6. 切换自动续费
7. 批量续费

**关键数据结构**:
```typescript
interface StaticProxy {
  id: string
  ip: string
  port: number
  username: string
  password: string
  countryCode: string
  cityName: string
  expireTimeUtc: string
  status: 'active' | 'expired' | 'released'
  auto_renew: boolean
  remark: string
}
```

**关键方法**:
```typescript
// 获取IP列表
const fetchProxyList = async () => {
  const res = await getMyStaticIPs({
    page: page.value,
    limit: limit.value,
    country: filters.country,
    city: filters.city,
  })
  proxyList.value = res.data.data
  total.value = res.data.total
}

// 更新备注
const handleUpdateNote = async (id: string, remark: string) => {
  await updateIPNote(id, remark)
  ElMessage.success('备注更新成功')
}

// 切换自动续费
const handleToggleAutoRenew = async (id: string, autoRenew: boolean) => {
  await setAutoRenew(id, { auto_renew: autoRenew })
  ElMessage.success('设置成功')
}
```

---

## 🎨 样式系统

### SCSS变量

**位置**: `frontend/src/styles/variables.scss`

**关键变量**:
```scss
// 主题色
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$error-color: #f5222d;

// 文字颜色
$text-color-primary: rgba(0, 0, 0, 0.85);
$text-color-secondary: rgba(0, 0, 0, 0.65);
$text-color-disabled: rgba(0, 0, 0, 0.25);

// 边框颜色
$border-color-base: #d9d9d9;
$border-radius-base: 4px;

// 间距
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
```

### 全局样式

**位置**: `frontend/src/styles/global.scss`

**关键样式**:
```scss
// 滚动条样式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

// 通用布局
.page-container {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.content-card {
  background-color: #fff;
  border-radius: 4px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
```

---

## 🌐 国际化 (i18n)

### 配置

**位置**: `frontend/src/i18n/index.ts`

```typescript
import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

export default i18n
```

### 语言包示例

**位置**: `frontend/src/i18n/locales/zh-CN.ts`

```typescript
export default {
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    search: '搜索',
    reset: '重置',
  },
  auth: {
    login: '登录',
    register: '注册',
    email: '邮箱',
    password: '密码',
  },
  proxy: {
    staticBuy: '购买静态IP',
    staticManage: '静态IP管理',
    dynamicBuy: '购买动态IP',
    dynamicManage: '动态IP管理',
  },
  // ... 更多翻译
}
```

---

## ✅ 关键开发规范

### 1. 组件命名

- **页面组件**: PascalCase (如 `StaticBuy.vue`)
- **通用组件**: PascalCase (如 `FlagIcon.vue`)
- **布局组件**: PascalCase + Layout (如 `DashboardLayout.vue`)

### 2. API调用

```typescript
// ✅ 推荐：使用async/await + try/catch
const fetchData = async () => {
  try {
    loading.value = true
    const res = await getIPInventory()
    data.value = res.data
  } catch (error) {
    // 错误已在拦截器处理，这里可选
    console.error('Failed to fetch:', error)
  } finally {
    loading.value = false
  }
}
```

### 3. 响应式数据

```typescript
// ✅ 推荐：使用ref和reactive
import { ref, reactive } from 'vue'

const count = ref(0)
const user = reactive({
  name: '',
  email: ''
})
```

### 4. TypeScript类型

```typescript
// ✅ 推荐：定义清晰的类型
interface User {
  id: string
  email: string
  role: 'user' | 'agent' | 'admin'
  balance: number
}

// 使用类型
const user = ref<User | null>(null)
```

### 5. Element Plus组件

```vue
<template>
  <!-- ✅ 推荐：使用Element Plus组件 -->
  <el-button type="primary" @click="handleClick">
    点击我
  </el-button>

  <el-table :data="tableData">
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="email" label="邮箱" />
  </el-table>
</template>
```

---

## 🎯 复刻要点总结

### 必须遵循的关键点：

1. **路由配置**
   - 使用路由守卫保护需要登录的页面
   - 区分普通用户和管理员路由
   - 已登录用户访问登录页自动跳转

2. **API调用**
   - 使用Axios拦截器自动添加Token
   - 统一错误处理和提示
   - 401自动登出并跳转登录页

3. **状态管理**
   - 使用Pinia管理全局状态
   - Token和User同时存储在Pinia和localStorage
   - 提供便捷的登录/登出/刷新方法

4. **UI组件**
   - 使用Element Plus组件库
   - 统一的样式变量和全局样式
   - 响应式设计

5. **代码质量**
   - 使用TypeScript定义类型
   - 使用Composition API (setup)
   - 组件拆分合理

---

**下一步**: 查看 `REPLICATION_PROMPTS.md` 获取完整的分步实施指南

**UI参考**: 查看 `../UI-REFERENCE/` 目录了解UI设计规范

