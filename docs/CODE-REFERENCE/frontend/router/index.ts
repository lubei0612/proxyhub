import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const routes: RouteRecordRaw[] = [
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
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: 'dashboard.title' }
      },
      {
        path: 'proxy/dynamic/manage',
        name: 'DynamicManage',
        component: () => import('@/views/proxy/DynamicManage.vue'),
        meta: { title: 'proxy.dynamicManage' }
      },
      {
        path: 'proxy/dynamic/buy',
        name: 'DynamicBuy',
        component: () => import('@/views/proxy/DynamicBuy.vue'),
        meta: { title: 'proxy.dynamicBuy' }
      },
      {
        path: 'proxy/static/manage',
        name: 'StaticManage',
        component: () => import('@/views/proxy/StaticManage.vue'),
        meta: { title: 'proxy.staticManage' }
      },
      {
        path: 'proxy/static/buy',
        name: 'StaticBuy',
        component: () => import('@/views/proxy/StaticBuy.vue'),
        meta: { title: 'proxy.staticBuy' }
      },
      {
        path: 'proxy/mobile',
        name: 'MobileProxy',
        component: () => import('@/views/proxy/MobilePlaceholder.vue'),
        meta: { title: 'proxy.mobile' }
      },
      {
        path: 'wallet/recharge',
        name: 'WalletRecharge',
        component: () => import('@/views/wallet/Recharge.vue'),
        meta: { title: 'wallet.recharge' }
      },
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
      {
        path: 'billing/settlement',
        name: 'BillingSettlement',
        component: () => import('@/views/billing/Settlements.vue'),
        meta: { title: 'billing.settlement' }
      },
      {
        path: 'billing/recharges',
        name: 'BillingRecharges',
        component: () => import('@/views/billing/Recharges.vue'),
        meta: { title: 'billing.recharges' }
      },
      {
        path: 'account/center',
        name: 'AccountCenter',
        component: () => import('@/views/account/Center.vue'),
        meta: { title: 'account.center' }
      },
      {
        path: 'account/events',
        name: 'AccountEvents',
        component: () => import('@/views/account/Events.vue'),
        meta: { title: 'account.events' }
      },
      {
        path: 'account/profile',
        name: 'AccountProfile',
        component: () => import('@/views/account/Profile.vue'),
        meta: { title: 'account.profile' }
      },
      {
        path: 'account/proxies',
        name: 'AccountProxies',
        component: () => import('@/views/account/Proxies.vue'),
        meta: { title: 'account.proxies' }
      },
      {
        path: 'settings/notifications',
        name: 'SettingsNotifications',
        component: () => import('@/views/proxy/MobilePlaceholder.vue'),
        meta: { title: 'settings.notifications' }
      },
      {
        path: 'agent',
        name: 'Agent',
        component: () => import('@/views/proxy/MobilePlaceholder.vue'),
        meta: { title: 'agent.dashboard' }
      },
    ]
  },
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
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard
router.beforeEach((to, from, next) => {
  // Debug info in development mode
  if (import.meta.env.DEV) {
    console.log('[Router Debug]', {
      to: to.path,
      from: from.path,
      isAdmin: to.meta.requiresAdmin,
      matched: to.matched.map(r => r.path)
    })
  }
  
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  // Admin portal login page
  if (to.path === '/admin-portal/login') {
    // If already logged in and is admin, redirect to admin portal
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user?.role === 'admin') {
          console.log('[Router] Admin already logged in, redirecting to /admin-portal/users')
          next('/admin-portal/users')
          return
        }
      } catch (e) {
        console.error('[Router] Failed to parse user data:', e)
      }
    }
    next()
    return
  }
  
  // Admin portal pages
  if (to.path.startsWith('/admin-portal') && to.path !== '/admin-portal/login') {
    console.log('[Admin Portal Navigation]', {
      from: from.path,
      to: to.path,
      name: to.name,
      layout: 'AdminPortalLayout'
    })
    
    // Not logged in, redirect to admin login
    if (!token) {
      console.log('[Router] Not logged in, redirecting to /admin-portal/login')
      next('/admin-portal/login')
      return
    }
    
    // Not admin, no access
    try {
      const user = userStr ? JSON.parse(userStr) : null
      if (user?.role !== 'admin') {
        console.log('[Router] Not admin, redirecting to /')
        next('/')
        return
      }
    } catch (e) {
      console.error('[Router] Failed to parse user data:', e)
      next('/admin-portal/login')
      return
    }
    
    next()
    return
  }
  
  // General route handling
  if (to.meta.requiresAuth !== false) {
    if (!token) {
      next('/login')
      return
    }
    
    // Check admin permissions
    if (to.meta.requiresAdmin) {
      try {
        const user = userStr ? JSON.parse(userStr) : null
        if (user?.role !== 'admin') {
          next('/dashboard')
          return
        }
      } catch (e) {
        next('/login')
        return
      }
    }
  } else {
    // If already logged in, redirect to dashboard when accessing login/register pages
    if (token && (to.path === '/login' || to.path === '/register')) {
      next('/dashboard')
      return
    }
  }
  
  next()
})

export default router


