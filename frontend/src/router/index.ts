import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/user';

const routes: RouteRecordRaw[] = [
  // ============================================================
  // 公开路由（无需登录）
  // ============================================================
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { 
      title: '登录',
      public: true 
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
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
      // 动态住宅代理
      {
        path: 'proxy/dynamic',
        meta: {
          title: '动态住宅',
          icon: 'Lightning',
        },
        children: [
          {
            path: 'buy',
            name: 'DynamicProxyBuy',
            component: () => import('@/views/proxy/DynamicBuy.vue'),
            meta: {
              title: '动态住宅选购',
            },
          },
          {
            path: 'manage',
            name: 'DynamicProxyManage',
            component: () => import('@/views/proxy/DynamicManage.vue'),
            meta: {
              title: '动态住宅管理',
            },
          },
        ],
      },
      // 静态住宅代理
      {
        path: 'proxy/static',
        meta: {
          title: '静态住宅',
          icon: 'House',
        },
        children: [
          {
            path: 'buy',
            name: 'StaticProxyBuy',
            component: () => import('@/views/proxy/StaticBuy.vue'),
            meta: {
              title: '静态住宅选购',
            },
          },
          {
            path: 'manage',
            name: 'StaticProxyManage',
            component: () => import('@/views/proxy/StaticManage.vue'),
            meta: {
              title: '静态住宅管理',
            },
          },
        ],
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
      // 订单管理
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/order/Index.vue'),
        meta: {
          title: '订单列表',
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
      // 账单明细
      {
        path: 'billing',
        meta: {
          title: '账单明细',
          icon: 'Tickets',
        },
        children: [
          {
            path: 'orders',
            name: 'BillingOrders',
            component: () => import('@/views/billing/Orders.vue'),
            meta: {
              title: '订单管理',
            },
          },
          {
            path: 'transactions',
            name: 'Transactions',
            component: () => import('@/views/billing/Transactions.vue'),
            meta: {
              title: '交易明细',
            },
          },
          {
            path: 'settlement',
            name: 'Settlement',
            component: () => import('@/views/billing/Settlement.vue'),
            meta: {
              title: '结算记录',
            },
          },
          {
            path: 'recharge-orders',
            name: 'RechargeOrders',
            component: () => import('@/views/billing/RechargeOrders.vue'),
            meta: {
              title: '充值订单',
            },
          },
        ],
      },
      // 我的账户
      {
        path: 'account',
        meta: {
          title: '我的账户',
          icon: 'User',
        },
        children: [
          {
            path: 'center',
            name: 'AccountCenter',
            component: () => import('@/views/account/Center.vue'),
            meta: {
              title: '账户中心',
            },
          },
          {
            path: 'event-log',
            name: 'EventLog',
            component: () => import('@/views/account/EventLog.vue'),
            meta: {
              title: '事件日志',
            },
          },
          {
            path: 'profile',
            name: 'Profile',
            component: () => import('@/views/profile/Index.vue'),
            meta: {
              title: '个人中心',
            },
          },
          {
            path: 'my-proxies',
            name: 'MyProxies',
            component: () => import('@/views/proxy/MyProxies.vue'),
            meta: {
              title: '我的代理',
            },
          },
        ],
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
        },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
        meta: {
          title: '用户管理',
          icon: 'UserFilled',
        },
      },
      {
        path: 'recharges',
        name: 'AdminRecharges',
        component: () => import('@/views/admin/RechargeApproval.vue'),
        meta: {
          title: '充值审核',
          icon: 'Money',
        },
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/Orders.vue'),
        meta: {
          title: '订单管理',
          icon: 'Document',
        },
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/Settings.vue'),
        meta: {
          title: '系统设置',
          icon: 'Setting',
        },
      },
      {
        path: 'price-overrides',
        name: 'AdminPriceOverrides',
        component: () => import('@/views/admin/PriceOverrides.vue'),
        meta: {
          title: '价格覆盖管理',
          icon: 'Money',
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

  // 公开路由直接通过
  if (to.meta.public) {
    // 如果已登录访问登录页，跳转到首页
    if (userStore.isLoggedIn && (to.name === 'Login' || to.name === 'Register')) {
      next({ name: 'Dashboard' });
      return;
    }
    next();
    return;
  }

  // 检查是否登录
  if (!userStore.isLoggedIn) {
    next({ 
      name: 'Login', 
      query: { redirect: to.fullPath } 
    });
    return;
  }

  // 检查管理员权限
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next({ name: 'Dashboard' });
    return;
  }

  next();
});

export default router;
