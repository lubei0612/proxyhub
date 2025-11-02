import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/user';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { title: '注册', requiresAuth: false },
  },
  
  // 仪表盘
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { title: '仪表盘', requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('@/views/dashboard/Index.vue'),
      },
    ],
  },

  // 动态代理
  {
    path: '/proxy/dynamic',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'manage',
        name: 'DynamicProxyManage',
        component: () => import('@/views/proxy/DynamicManage.vue'),
        meta: { title: '动态住宅管理' },
      },
      {
        path: 'buy',
        name: 'DynamicProxyBuy',
        component: () => import('@/views/proxy/DynamicBuy.vue'),
        meta: { title: '动态住宅选购' },
      },
    ],
  },

  // 静态代理
  {
    path: '/proxy/static',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'manage',
        name: 'StaticProxyManage',
        component: () => import('@/views/proxy/StaticManage.vue'),
        meta: { title: '静态住宅管理' },
      },
      {
        path: 'buy',
        name: 'StaticProxyBuy',
        component: () => import('@/views/proxy/StaticBuy.vue'),
        meta: { title: '静态住宅选购' },
      },
    ],
  },

  // 移动代理
  {
    path: '/proxy/mobile',
    name: 'MobileProxy',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { title: '移动代理', requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('@/views/proxy/MobilePlaceholder.vue'),
      },
    ],
  },

  // 钱包充值
  {
    path: '/wallet',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'recharge',
        name: 'WalletRecharge',
        component: () => import('@/views/wallet/Recharge.vue'),
        meta: { title: '钱包充值' },
      },
    ],
  },

  // 账单明细
  {
    path: '/billing',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'orders',
        name: 'BillingOrders',
        component: () => import('@/views/billing/Orders.vue'),
        meta: { title: '订单管理' },
      },
      {
        path: 'transactions',
        name: 'BillingTransactions',
        component: () => import('@/views/billing/Transactions.vue'),
        meta: { title: '交易明细' },
      },
      {
        path: 'settlement',
        name: 'BillingSettlement',
        component: () => import('@/views/billing/Settlement.vue'),
        meta: { title: '结算记录' },
      },
      {
        path: 'recharge-orders',
        name: 'RechargeOrders',
        component: () => import('@/views/billing/RechargeOrders.vue'),
        meta: { title: '充值订单' },
      },
    ],
  },

  // 我的账户
  {
    path: '/account',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'center',
        name: 'AccountCenter',
        component: () => import('@/views/account/Center.vue'),
        meta: { title: '账户中心' },
      },
      {
        path: 'event-log',
        name: 'EventLog',
        component: () => import('@/views/account/EventLog.vue'),
        meta: { title: '事件日志' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/account/Profile.vue'),
        meta: { title: '个人中心' },
      },
      {
        path: 'my-proxies',
        name: 'MyProxies',
        component: () => import('@/views/account/MyProxies.vue'),
        meta: { title: '我的代理' },
      },
    ],
  },

  // 通知管理
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { title: '通知管理', requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('@/views/notifications/Index.vue'),
      },
    ],
  },

  // 管理后台 - 独立访问入口
  {
    path: '/admin-portal/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin-portal/AdminPortalLogin.vue'),
    meta: { title: '管理员登录', requiresAuth: false },
  },
  // 注意：管理后台的其他页面路由需要从原项目获取后添加
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isLoggedIn = userStore.isLoggedIn;

  // 如果路由需要认证
  if (to.meta.requiresAuth && !isLoggedIn) {
    // 未登录，跳转到登录页
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && isLoggedIn) {
    // 已登录用户访问登录/注册页，跳转到仪表盘
    next('/dashboard');
  } else {
    next();
  }
});

export default router;

