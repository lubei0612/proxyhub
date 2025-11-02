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
      // 代理管理
      {
        path: 'proxy/dynamic/buy',
        name: 'DynamicProxyBuy',
        component: () => import('@/views/proxy/DynamicBuy.vue'),
        meta: {
          title: '购买动态代理',
          icon: 'Lightning',
        },
      },
      {
        path: 'proxy/static/buy',
        name: 'StaticProxyBuy',
        component: () => import('@/views/proxy/StaticBuy.vue'),
        meta: {
          title: '购买静态代理',
          icon: 'Location',
        },
      },
      {
        path: 'proxy/my-proxies',
        name: 'MyProxies',
        component: () => import('@/views/proxy/MyProxies.vue'),
        meta: {
          title: '我的代理',
          icon: 'List',
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
      // 钱包
      {
        path: 'wallet',
        name: 'Wallet',
        component: () => import('@/views/wallet/Index.vue'),
        meta: {
          title: '我的钱包',
          icon: 'Wallet',
        },
      },
      {
        path: 'wallet/recharge',
        name: 'Recharge',
        component: () => import('@/views/wallet/Recharge.vue'),
        meta: {
          title: '充值',
        },
      },
      // 账单
      {
        path: 'billing',
        name: 'Billing',
        component: () => import('@/views/billing/Index.vue'),
        meta: {
          title: '账单概览',
          icon: 'Tickets',
        },
      },
      {
        path: 'billing/transactions',
        name: 'Transactions',
        component: () => import('@/views/billing/Transactions.vue'),
        meta: {
          title: '交易明细',
        },
      },
      {
        path: 'billing/expenses',
        name: 'Expenses',
        component: () => import('@/views/billing/Expenses.vue'),
        meta: {
          title: '费用明细',
        },
      },
      // 个人中心
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/Index.vue'),
        meta: {
          title: '个人中心',
          icon: 'User',
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
