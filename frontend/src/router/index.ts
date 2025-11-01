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
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/Index.vue'),
    meta: { title: '仪表盘', requiresAuth: true },
  },
  // TODO: 其他路由将在后续任务中添加
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

