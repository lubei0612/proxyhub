import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/user';

const routes: RouteRecordRaw[] = [
  // ============================================================
  // 公开路由（无需登录）
  // ============================================================
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Auth.vue'),
    meta: { 
      title: '登录',
      public: true 
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Auth.vue'),
    meta: { 
      title: '注册',
      public: true 
    },
  },

  // ============================================================
  // 用户端主路由（需要登录）
  // ============================================================
  {
    path: '/',
    component: () => import('@/layouts/DashboardLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: {
          title: '仪表盘',
          icon: 'DataLine',
        },
      },
      // 动态住宅代理（直接路由，无嵌套）
      {
        path: 'proxy/dynamic/buy',
        name: 'DynamicProxyBuy',
        component: () => import('@/views/proxy/DynamicBuy.vue'),
        meta: {
          title: '动态住宅选购',
          icon: 'Lightning',
          group: 'dynamic-proxy',
        },
      },
      {
        path: 'proxy/dynamic/manage',
        name: 'DynamicProxyManage',
        component: () => import('@/views/proxy/DynamicManage.vue'),
        meta: {
          title: '动态住宅管理',
          icon: 'Lightning',
          group: 'dynamic-proxy',
        },
      },
      {
        path: 'proxy/dynamic/channels',
        name: 'DynamicChannels',
        component: () => import('@/views/proxy/DynamicChannels.vue'),
        meta: {
          title: '动态通道管理',
          icon: 'Lightning',
          group: 'dynamic-proxy',
        },
      },
      // 静态住宅代理（直接路由，无嵌套）
      {
        path: 'proxy/static/buy',
        name: 'StaticProxyBuy',
        component: () => import('@/views/proxy/StaticBuy.vue'),
        meta: {
          title: '静态住宅选购',
          icon: 'House',
          group: 'static-proxy',
        },
      },
      {
        path: 'proxy/static/manage',
        name: 'StaticProxyManage',
        component: () => import('@/views/proxy/StaticManage.vue'),
        meta: {
          title: '静态住宅管理',
          icon: 'House',
          group: 'static-proxy',
        },
      },
      // 移动代理（占位）
      {
        path: 'proxy/mobile',
        name: 'MobileProxy',
        component: () => import('@/views/proxy/MobilePlaceholder.vue'),
        meta: {
          title: '移动代理',
          icon: 'Cellphone',
        },
      },
      // IP购买订单
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/order/Index.vue'),
        meta: {
          title: 'IP购买订单',
          icon: 'Document',
        },
      },
      // 钱包充值
      {
        path: 'wallet/recharge',
        name: 'Recharge',
        component: () => import('@/views/wallet/Recharge.vue'),
        meta: {
          title: '钱包充值',
          icon: 'Wallet',
        },
      },
      // 账单明细（直接路由，无嵌套）
      {
        path: 'billing/orders',
        name: 'BillingOrders',
        component: () => import('@/views/billing/Orders.vue'),
        meta: {
          title: '充值订单',
          icon: 'Tickets',
          group: 'billing',
        },
      },
      {
        path: 'billing/transactions',
        name: 'Transactions',
        component: () => import('@/views/billing/Transactions.vue'),
        meta: {
          title: '交易明细',
          icon: 'Tickets',
          group: 'billing',
        },
      },
      {
        path: 'billing/expenses',
        name: 'Expenses',
        component: () => import('@/views/billing/Expenses.vue'),
        meta: {
          title: '消费记录',
          icon: 'Tickets',
          group: 'billing',
        },
      },
      {
        path: 'billing/settlement',
        name: 'Settlement',
        component: () => import('@/views/billing/Settlement.vue'),
        meta: {
          title: '结算记录',
          icon: 'Tickets',
          group: 'billing',
        },
      },
      // 路由别名：支持复数形式访问
      {
        path: 'billing/settlements',
        redirect: '/billing/settlement',
      },
      {
        path: 'billing/recharge-orders',
        name: 'RechargeOrders',
        component: () => import('@/views/billing/RechargeOrders.vue'),
        meta: {
          title: '充值订单',
          icon: 'Tickets',
          group: 'billing',
        },
      },
      // 我的账户（直接路由，无嵌套）
      {
        path: 'account/center',
        name: 'AccountCenter',
        component: () => import('@/views/account/Center.vue'),
        meta: {
          title: '账户中心',
          icon: 'User',
          group: 'account',
        },
      },
      {
        path: 'account/event-log',
        name: 'EventLog',
        component: () => import('@/views/account/EventLog.vue'),
        meta: {
          title: '事件日志',
          icon: 'User',
          group: 'account',
        },
      },
      {
        path: 'account/profile',
        name: 'Profile',
        component: () => import('@/views/profile/Index.vue'),
        meta: {
          title: '个人中心',
          icon: 'User',
          group: 'account',
        },
      },
      {
        path: 'account/my-proxies',
        name: 'MyProxies',
        component: () => import('@/views/proxy/MyProxies.vue'),
        meta: {
          title: '我的代理',
          icon: 'User',
          group: 'account',
        },
      },
      // 通知管理
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/notifications/Index.vue'),
        meta: {
          title: '通知管理',
          icon: 'Bell',
        },
      },
    ],
  },

  // ============================================================
  // 管理后台路由（需要管理员权限）
  // ============================================================
  {
    path: '/admin',
    component: () => import('@/layouts/AdminPortalLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { 
      requiresAuth: true,
      requiresAdmin: true 
    },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: {
          title: '管理仪表盘',
          icon: 'DataLine',
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
        meta: {
          title: '用户管理',
          icon: 'UserFilled',
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: 'recharges',
        name: 'AdminRecharges',
        component: () => import('@/views/admin/RechargeApproval.vue'),
        meta: {
          title: '充值审核',
          icon: 'Money',
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/Orders.vue'),
        meta: {
          title: '订单管理',
          icon: 'Document',
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/Settings.vue'),
        meta: {
          title: '系统设置',
          icon: 'Setting',
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: 'price-overrides',
        name: 'AdminPriceOverrides',
        component: () => import('@/views/admin/PriceOverrides.vue'),
        meta: {
          title: '价格覆盖管理',
          icon: 'Money',
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
    ],
  },

  // ============================================================
  // 404页面
  // ============================================================
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { 
      title: '页面不存在',
      public: true 
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// ============================================================
// 全局路由守卫
// ============================================================
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - ProxyHub` : 'ProxyHub';

  // 清理旧的userInfo key，统一使用user
  if (localStorage.getItem('userInfo')) {
    const oldUserInfo = localStorage.getItem('userInfo');
    localStorage.setItem('user', oldUserInfo!);
    localStorage.removeItem('userInfo');
  }

  // 直接从localStorage检查登录状态
  const token = localStorage.getItem('token');
  const userInfoStr = localStorage.getItem('user');
  let user = null;
  
  try {
    user = userInfoStr ? JSON.parse(userInfoStr) : null;
  } catch (e) {
    console.error('[Router Guard] Failed to parse user info:', e);
    // 清理损坏的数据
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  // Navigation guard check

  // 公开路由直接通过
  if (to.meta.public) {
    // 如果已登录访问登录页，跳转到首页
    if (token && user) {
      // 根据用户角色跳转
      if (user.role === 'admin') {
        next({ name: 'AdminDashboard' });
      } else {
        next({ name: 'Dashboard' });
      }
      return;
    }
    next();
    return;
  }

  // 检查是否登录
  if (!token || !user) {
    next({ 
      name: 'Login', 
      query: { redirect: to.fullPath } 
    });
    return;
  }

  // 检查管理员权限
  if (to.meta.requiresAdmin) {
    if (user.role !== 'admin') {
      // 动态导入ElMessage以避免循环依赖
      import('element-plus').then(({ ElMessage }) => {
        ElMessage.error('需要管理员权限才能访问此页面');
      });
      
      next({ name: 'Dashboard' });
      return;
    }
  }

  next();
});

export default router;
