import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录' },
  },
  // TODO: 其他路由将在后续任务中添加
];

const router = createRouter({
  history: createWebHistory(import.meta.url),
  routes,
});

// 路由守卫 TODO: 稍后添加
// router.beforeEach((to, from, next) => {
//   // 认证检查逻辑
//   next();
// });

export default router;

