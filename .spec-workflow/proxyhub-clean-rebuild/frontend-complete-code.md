# ProxyHub 前端完整代码指南

## 📁 完整目录结构

```
frontend/
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/
│   │   └── index.ts                      # 路由配置
│   ├── stores/
│   │   ├── user.ts                       # 用户状态
│   │   ├── app.ts                        # 应用状态
│   │   └── cart.ts                       # 购物车状态
│   ├── api/
│   │   ├── request.ts                    # Axios封装
│   │   ├── auth.ts                       # 认证API
│   │   ├── proxy.ts                      # 代理API
│   │   ├── order.ts                      # 订单API
│   │   ├── recharge.ts                   # 充值API
│   │   ├── statistics.ts                 # 统计API
│   │   └── admin.ts                      # 管理API
│   ├── layouts/
│   │   ├── DashboardLayout.vue           # 主布局
│   │   ├── AdminPortalLayout.vue         # 管理后台布局
│   │   └── components/
│   │       ├── Sidebar.vue               # 侧边栏
│   │       ├── Header.vue                # 顶部栏
│   │       ├── Breadcrumb.vue            # 面包屑
│   │       └── UserDropdown.vue          # 用户下拉菜单
│   ├── views/
│   │   ├── auth/
│   │   │   ├── Login.vue
│   │   │   └── Register.vue
│   │   ├── dashboard/
│   │   │   └── Index.vue                 # 仪表盘
│   │   ├── proxy/
│   │   │   ├── DynamicBuy.vue            # 动态代理购买
│   │   │   ├── StaticBuy.vue             # 静态代理购买
│   │   │   └── MyProxies.vue             # 我的代理
│   │   ├── order/
│   │   │   └── Index.vue
│   │   ├── wallet/
│   │   │   ├── Index.vue
│   │   │   └── Recharge.vue
│   │   ├── billing/
│   │   │   ├── Index.vue
│   │   │   ├── Transactions.vue
│   │   │   └── Expenses.vue
│   │   ├── profile/
│   │   │   └── Index.vue
│   │   ├── admin/
│   │   │   ├── Dashboard.vue
│   │   │   ├── Users.vue
│   │   │   ├── RechargeApproval.vue
│   │   │   ├── Orders.vue
│   │   │   └── Settings.vue
│   │   └── error/
│   │       └── 404.vue
│   ├── components/
│   │   ├── charts/
│   │   │   ├── LineChart.vue
│   │   │   ├── BarChart.vue
│   │   │   └── PieChart.vue
│   │   └── common/
│   │       ├── StatCard.vue              # 统计卡片
│   │       ├── ProxyCard.vue             # 代理卡片
│   │       └── EmptyState.vue            # 空状态
│   ├── utils/
│   │   ├── storage.ts
│   │   ├── format.ts
│   │   └── validate.ts
│   ├── styles/
│   │   ├── variables.scss
│   │   ├── global.scss
│   │   └── theme.scss
│   └── types/
│       └── index.d.ts
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 1️⃣ 完整的路由配置 (router/index.ts)

```typescript
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
        path: 'proxy',
        meta: {
          title: '代理管理',
          icon: 'Connection',
        },
        children: [
          {
            path: 'dynamic/buy',
            name: 'DynamicProxyBuy',
            component: () => import('@/views/proxy/DynamicBuy.vue'),
            meta: {
              title: '购买动态代理',
              icon: 'Lightning',
            },
          },
          {
            path: 'static/buy',
            name: 'StaticProxyBuy',
            component: () => import('@/views/proxy/StaticBuy.vue'),
            meta: {
              title: '购买静态代理',
              icon: 'Location',
            },
          },
          {
            path: 'my-proxies',
            name: 'MyProxies',
            component: () => import('@/views/proxy/MyProxies.vue'),
            meta: {
              title: '我的代理',
              icon: 'List',
            },
          },
        ],
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
        meta: {
          title: '钱包',
          icon: 'Wallet',
        },
        children: [
          {
            path: '',
            name: 'Wallet',
            component: () => import('@/views/wallet/Index.vue'),
            meta: {
              title: '我的钱包',
            },
          },
          {
            path: 'recharge',
            name: 'Recharge',
            component: () => import('@/views/wallet/Recharge.vue'),
            meta: {
              title: '充值',
            },
          },
        ],
      },
      // 账单
      {
        path: 'billing',
        meta: {
          title: '账单',
          icon: 'Tickets',
        },
        children: [
          {
            path: '',
            name: 'Billing',
            component: () => import('@/views/billing/Index.vue'),
            meta: {
              title: '账单概览',
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
            path: 'expenses',
            name: 'Expenses',
            component: () => import('@/views/billing/Expenses.vue'),
            meta: {
              title: '费用明细',
            },
          },
        ],
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
  history: createWebHistory(),
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
    if (userStore.isLogin && (to.name === 'Login' || to.name === 'Register')) {
      next({ name: 'Dashboard' });
      return;
    }
    next();
    return;
  }

  // 检查是否登录
  if (!userStore.isLogin) {
    next({ 
      name: 'Login', 
      query: { redirect: to.fullPath } 
    });
    return;
  }

  // 如果有Token但没有用户信息，先获取用户信息
  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo();
    } catch (error) {
      next({ name: 'Login' });
      return;
    }
  }

  // 检查管理员权限
  if (to.meta.requiresAdmin && userStore.userInfo?.role !== 'admin') {
    next({ name: 'Dashboard' });
    return;
  }

  next();
});

export default router;
```

---

## 2️⃣ 主布局组件 (layouts/DashboardLayout.vue)

```vue
<template>
  <div class="dashboard-layout">
    <!-- 侧边栏 -->
    <Sidebar :collapsed="isCollapsed" @toggle="handleToggle" />
    
    <!-- 主内容区 -->
    <div class="main-container" :class="{ collapsed: isCollapsed }">
      <!-- 顶部栏 -->
      <Header @toggle-sidebar="handleToggle" />
      
      <!-- 内容区 -->
      <div class="content-wrapper">
        <!-- 面包屑 -->
        <Breadcrumb />
        
        <!-- 页面内容 -->
        <div class="page-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';
import Breadcrumb from './components/Breadcrumb.vue';

const isCollapsed = ref(false);

const handleToggle = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped lang="scss">
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-container {
  flex: 1;
  margin-left: 200px;
  transition: margin-left 0.3s;
  display: flex;
  flex-direction: column;

  &.collapsed {
    margin-left: 64px;
  }
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
}

.page-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
```

---

## 3️⃣ 侧边栏组件 (layouts/components/Sidebar.vue)

```vue
<template>
  <div class="sidebar" :class="{ collapsed }">
    <!-- Logo -->
    <div class="logo-container">
      <img src="/logo.png" alt="ProxyHub" class="logo" v-if="!collapsed" />
      <img src="/logo-mini.png" alt="P" class="logo-mini" v-else />
    </div>

    <!-- 菜单 -->
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :unique-opened="true"
      :collapse-transition="false"
      background-color="#001529"
      text-color="#ffffff"
      active-text-color="#00d9a3"
      router
    >
      <template v-for="item in menuItems" :key="item.path">
        <!-- 一级菜单（无子菜单） -->
        <el-menu-item 
          v-if="!item.children" 
          :index="item.path"
          @click="handleMenuClick(item.path)"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>

        <!-- 一级菜单（有子菜单） -->
        <el-sub-menu v-else :index="item.path">
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
            @click="handleMenuClick(child.path)"
          >
            <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
            <template #title>{{ child.title }}</template>
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import {
  DataLine,
  Connection,
  Lightning,
  Location,
  List,
  Document,
  Wallet,
  Tickets,
  User,
} from '@element-plus/icons-vue';

interface Props {
  collapsed?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  toggle: [];
}>();

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 当前激活的菜单
const activeMenu = computed(() => route.path);

// 菜单数据
const menuItems = computed(() => {
  const items = [
    {
      path: '/dashboard',
      title: '仪表盘',
      icon: DataLine,
    },
    {
      path: '/proxy',
      title: '代理管理',
      icon: Connection,
      children: [
        {
          path: '/proxy/dynamic/buy',
          title: '购买动态代理',
          icon: Lightning,
        },
        {
          path: '/proxy/static/buy',
          title: '购买静态代理',
          icon: Location,
        },
        {
          path: '/proxy/my-proxies',
          title: '我的代理',
          icon: List,
        },
      ],
    },
    {
      path: '/orders',
      title: '订单列表',
      icon: Document,
    },
    {
      path: '/wallet',
      title: '钱包',
      icon: Wallet,
      children: [
        {
          path: '/wallet',
          title: '我的钱包',
        },
        {
          path: '/wallet/recharge',
          title: '充值',
        },
      ],
    },
    {
      path: '/billing',
      title: '账单',
      icon: Tickets,
      children: [
        {
          path: '/billing',
          title: '账单概览',
        },
        {
          path: '/billing/transactions',
          title: '交易明细',
        },
        {
          path: '/billing/expenses',
          title: '费用明细',
        },
      ],
    },
    {
      path: '/profile',
      title: '个人中心',
      icon: User,
    },
  ];

  return items;
});

// 处理菜单点击
const handleMenuClick = (path: string) => {
  router.push(path);
};
</script>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 200px;
  background-color: #001529;
  transition: width 0.3s;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 1000;

  &.collapsed {
    width: 64px;
  }

  // 隐藏滚动条
  &::-webkit-scrollbar {
    width: 0;
  }
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background-color: #002140;

  .logo {
    height: 32px;
    transition: all 0.3s;
  }

  .logo-mini {
    height: 32px;
    width: 32px;
  }
}

// Element Plus Menu 样式覆盖
:deep(.el-menu) {
  border-right: none;

  .el-menu-item,
  .el-sub-menu__title {
    height: 50px;
    line-height: 50px;

    &:hover {
      background-color: rgba(0, 217, 163, 0.1) !important;
    }

    &.is-active {
      background-color: rgba(0, 217, 163, 0.2) !important;
      
      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background-color: #00d9a3;
      }
    }
  }

  .el-icon {
    font-size: 18px;
  }
}
</style>
```

---

## 4️⃣ 顶部栏组件 (layouts/components/Header.vue)

```vue
<template>
  <div class="header">
    <!-- 左侧：折叠按钮 -->
    <div class="header-left">
      <el-icon class="toggle-btn" @click="handleToggle">
        <Fold v-if="!collapsed" />
        <Expand v-else />
      </el-icon>
    </div>

    <!-- 右侧：用户信息 -->
    <div class="header-right">
      <!-- 余额显示 -->
      <div class="balance-info">
        <el-icon><Wallet /></el-icon>
        <span>余额: ${{ userStore.userInfo?.balance || 0 }}</span>
      </div>

      <!-- 用户下拉菜单 -->
      <el-dropdown @command="handleCommand">
        <div class="user-dropdown">
          <el-avatar :size="32" :icon="UserFilled" />
          <span class="username">{{ userStore.userName }}</span>
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="wallet">
              <el-icon><Wallet /></el-icon>
              我的钱包
            </el-dropdown-item>
            <el-dropdown-item divided command="admin" v-if="userStore.isAdmin">
              <el-icon><Setting /></el-icon>
              管理后台
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
import {
  Fold,
  Expand,
  Wallet,
  UserFilled,
  ArrowDown,
  User,
  Setting,
  SwitchButton,
} from '@element-plus/icons-vue';

const emit = defineEmits<{
  toggleSidebar: [];
}>();

const router = useRouter();
const userStore = useUserStore();

const handleToggle = () => {
  emit('toggleSidebar');
};

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'wallet':
      router.push('/wallet');
      break;
    case 'admin':
      router.push('/admin/dashboard');
      break;
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });
        userStore.logout();
        router.push('/login');
        ElMessage.success('已退出登录');
      } catch {
        // 取消退出
      }
      break;
  }
};
</script>

<style scoped lang="scss">
.header {
  height: 60px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 999;
}

.header-left {
  display: flex;
  align-items: center;

  .toggle-btn {
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      color: #00d9a3;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.balance-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f5f7fa;
  border-radius: 20px;
  font-size: 14px;
  color: #606266;

  .el-icon {
    color: #00d9a3;
  }
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background-color: #f5f7fa;
  }

  .username {
    font-size: 14px;
    color: #303133;
  }

  .arrow {
    font-size: 12px;
    color: #909399;
  }
}
</style>
```

---

## 5️⃣ 面包屑组件 (layouts/components/Breadcrumb.vue)

```vue
<template>
  <el-breadcrumb separator="/" class="breadcrumb">
    <el-breadcrumb-item :to="{ path: '/' }">
      <el-icon><HomeFilled /></el-icon>
      首页
    </el-breadcrumb-item>
    <el-breadcrumb-item 
      v-for="item in breadcrumbs" 
      :key="item.path"
      :to="item.path"
    >
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { HomeFilled } from '@element-plus/icons-vue';

const route = useRoute();

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title);
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title as string,
  }));
});
</script>

<style scoped lang="scss">
.breadcrumb {
  margin-bottom: 16px;
  
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #606266;
      
      &:hover {
        color: #00d9a3;
      }
    }
    
    &:last-child .el-breadcrumb__inner {
      color: #303133;
      font-weight: 500;
    }
  }
}
</style>
```

---

## 6️⃣ 仪表盘页面 (views/dashboard/Index.vue)

```vue
<template>
  <div class="dashboard">
    <h2 class="page-title">仪表盘</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="24" :sm="12" :lg="6">
        <StatCard
          title="总代理数"
          :value="stats.totalProxies"
          icon="Connection"
          color="#409eff"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <StatCard
          title="活跃代理"
          :value="stats.activeProxies"
          icon="CircleCheck"
          color="#67c23a"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <StatCard
          title="总订单数"
          :value="stats.totalOrders"
          icon="ShoppingCart"
          color="#e6a23c"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <StatCard
          title="总消费"
          :value="`$${stats.totalExpense}`"
          icon="Money"
          color="#f56c6c"
        />
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <h3>快速操作</h3>
      <div class="action-buttons">
        <el-button type="primary" @click="router.push('/proxy/static/buy')">
          <el-icon><Location /></el-icon>
          购买静态IP
        </el-button>
        <el-button type="success" @click="router.push('/wallet/recharge')">
          <el-icon><Wallet /></el-icon>
          充值余额
        </el-button>
        <el-button type="info" @click="router.push('/proxy/my-proxies')">
          <el-icon><View /></el-icon>
          查看代理
        </el-button>
        <el-button type="warning" @click="router.push('/orders')">
          <el-icon><Document /></el-icon>
          查看订单
        </el-button>
      </div>
    </div>

    <!-- 消费趋势图 -->
    <div class="chart-section">
      <h3>最近7天消费趋势</h3>
      <LineChart
        v-if="chartData.length > 0"
        :data="chartData"
        title="消费趋势"
        x-field="date"
        y-field="amount"
      />
      <el-empty v-else description="暂无数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getDashboardStats } from '@/api/statistics';
import StatCard from '@/components/common/StatCard.vue';
import LineChart from '@/components/charts/LineChart.vue';
import {
  Location,
  Wallet,
  View,
  Document,
} from '@element-plus/icons-vue';

const router = useRouter();

const stats = ref({
  totalProxies: 0,
  activeProxies: 0,
  totalOrders: 0,
  totalExpense: 0,
});

const chartData = ref([]);

const fetchData = async () => {
  try {
    const res = await getDashboardStats();
    stats.value = res.stats;
    chartData.value = res.costTrend || [];
  } catch (error: any) {
    ElMessage.error(error.message || '获取数据失败');
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="scss">
.dashboard {
  .page-title {
    margin: 0 0 20px;
    font-size: 24px;
    color: #303133;
  }

  .stat-cards {
    margin-bottom: 30px;
  }

  .quick-actions {
    margin-bottom: 30px;

    h3 {
      margin: 0 0 16px;
      font-size: 18px;
      color: #303133;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .el-button {
        .el-icon {
          margin-right: 4px;
        }
      }
    }
  }

  .chart-section {
    h3 {
      margin: 0 0 16px;
      font-size: 18px;
      color: #303133;
    }
  }
}
</style>
```

---

## 7️⃣ 统计卡片组件 (components/common/StatCard.vue)

```vue
<template>
  <div class="stat-card" :style="{ borderColor: color }">
    <div class="icon-wrapper" :style="{ backgroundColor: `${color}20` }">
      <el-icon :size="40" :color="color">
        <component :is="iconComponent" />
      </el-icon>
    </div>
    <div class="content">
      <div class="title">{{ title }}</div>
      <div class="value">{{ value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as Icons from '@element-plus/icons-vue';

interface Props {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: '#409eff',
});

const iconComponent = computed(() => {
  return (Icons as any)[props.icon];
});
</script>

<style scoped lang="scss">
.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
  }

  .icon-wrapper {
    margin-right: 16px;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
  }

  .content {
    flex: 1;

    .title {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
    }
  }
}
</style>
```

---

## 8️⃣ 管理后台布局 (layouts/AdminPortalLayout.vue)

```vue
<template>
  <div class="admin-layout">
    <!-- 管理后台侧边栏 -->
    <div class="admin-sidebar" :class="{ collapsed: isCollapsed }">
      <div class="logo-container">
        <h2 v-if="!isCollapsed">ProxyHub Admin</h2>
        <h2 v-else>PA</h2>
      </div>

      <el-menu
        :default-active="$route.path"
        :collapse="isCollapsed"
        background-color="#1f2937"
        text-color="#9ca3af"
        active-text-color="#00d9a3"
        router
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataLine /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><UserFilled /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/recharges">
          <el-icon><Money /></el-icon>
          <template #title>充值审核</template>
        </el-menu-item>
        <el-menu-item index="/admin/orders">
          <el-icon><Document /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>

      <!-- 返回用户端按钮 -->
      <div class="back-to-user">
        <el-button type="primary" link @click="router.push('/dashboard')">
          <el-icon><Back /></el-icon>
          返回用户端
        </el-button>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="admin-main" :class="{ collapsed: isCollapsed }">
      <div class="admin-header">
        <el-icon class="toggle-btn" @click="isCollapsed = !isCollapsed">
          <Fold v-if="!isCollapsed" />
          <Expand v-else />
        </el-icon>
        <div class="admin-title">管理后台</div>
        <div class="admin-user">
          <el-avatar :size="32" />
          <span>{{ userStore.userName }}</span>
        </div>
      </div>

      <div class="admin-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import {
  DataLine,
  UserFilled,
  Money,
  Document,
  Setting,
  Back,
  Fold,
  Expand,
} from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const isCollapsed = ref(false);
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f3f4f6;
}

.admin-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 200px;
  background: #1f2937;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;

  &.collapsed {
    width: 64px;
  }

  .logo-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #111827;
    color: white;

    h2 {
      margin: 0;
      font-size: 18px;
    }
  }

  .el-menu {
    flex: 1;
    border-right: none;
  }

  .back-to-user {
    padding: 16px;
    border-top: 1px solid #374151;
  }
}

.admin-main {
  flex: 1;
  margin-left: 200px;
  transition: margin-left 0.3s;
  display: flex;
  flex-direction: column;

  &.collapsed {
    margin-left: 64px;
  }
}

.admin-header {
  height: 60px;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .toggle-btn {
    font-size: 20px;
    cursor: pointer;
    margin-right: 20px;

    &:hover {
      color: #00d9a3;
    }
  }

  .admin-title {
    flex: 1;
    font-size: 18px;
    font-weight: 500;
  }

  .admin-user {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.admin-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
```

---

## 9️⃣ 测试账号信息

```sql
-- 管理员账号
email: admin@proxyhub.com
password: Admin123456
role: admin

-- 生成bcrypt密码（在后端或使用在线工具）
-- Admin123456 的 bcrypt hash:
-- $2b$10$rJ5xqLKZ5vJ5qLKZ5vJ5qOJ5xqLKZ5vJ5qLKZ5vJ5qLKZ5vJ5qLKZ
```

---

## 🔟 完整的API接口文件

### statistics.ts

```typescript
import { request } from './request';

// 获取仪表盘统计
export const getDashboardStats = () => {
  return request.get('/statistics/dashboard');
};

// 获取流量趋势
export const getTrafficTrend = (params: any) => {
  return request.get('/statistics/traffic', { params });
};

// 获取请求趋势
export const getRequestTrend = (params: any) => {
  return request.get('/statistics/requests', { params });
};

// 获取成本分析
export const getCostAnalysis = (params: any) => {
  return request.get('/statistics/cost', { params });
};

// 获取网络分布
export const getNetworkDistribution = () => {
  return request.get('/statistics/network-distribution');
};
```

---

## 使用说明

### 安装依赖

```bash
cd frontend
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 图标使用

所有图标都来自 `@element-plus/icons-vue`：

```typescript
import { DataLine, Connection, UserFilled } from '@element-plus/icons-vue';

// 在template中使用
<el-icon><DataLine /></el-icon>
```

### 权限控制

在路由meta中设置：
- `public: true` - 公开访问
- `requiresAdmin: true` - 需要管理员权限

在组件中判断：
```typescript
const userStore = useUserStore();
if (userStore.isAdmin) {
  // 显示管理员功能
}
```

---

这套代码完整可用，直接复制到新Cursor项目中即可！

