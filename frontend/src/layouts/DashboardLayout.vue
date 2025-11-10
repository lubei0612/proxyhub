<template>
  <el-container class="dashboard-layout">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h2>ProxyHub</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        @select="handleMenuSelect"
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <!-- 仪表盘 -->
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        
        <!-- 动态住宅 -->
        <el-sub-menu index="dynamic-proxy">
          <template #title>
            <el-icon><Connection /></el-icon>
            <span>动态住宅</span>
          </template>
          <el-menu-item index="/proxy/dynamic/manage">动态住宅管理</el-menu-item>
          <el-menu-item index="/proxy/dynamic/buy">动态住宅选购</el-menu-item>
        </el-sub-menu>

        <!-- 静态住宅（只保留管理和选购，不包含专线代理） -->
        <el-sub-menu index="static-proxy">
          <template #title>
            <el-icon><House /></el-icon>
            <span>静态住宅</span>
          </template>
          <el-menu-item index="/proxy/static/manage">静态住宅管理</el-menu-item>
          <el-menu-item index="/proxy/static/buy">静态住宅选购</el-menu-item>
        </el-sub-menu>

        <!-- 专线代理（独立菜单项） -->
        <el-menu-item index="/proxy/dedicated">
          <el-icon><Connection /></el-icon>
          <span>专线代理</span>
        </el-menu-item>

        <!-- 移动代理（未开发） -->
        <el-menu-item index="/proxy/mobile" disabled>
          <el-icon><Iphone /></el-icon>
          <span>移动代理</span>
          <el-tag size="small" type="info" style="margin-left: 10px">未开发</el-tag>
        </el-menu-item>

        <!-- 钱包充值 -->
        <el-menu-item index="/wallet/recharge">
          <el-icon><Wallet /></el-icon>
          <span>钱包充值</span>
        </el-menu-item>

        <!-- 账单明细 -->
        <el-sub-menu index="billing">
          <template #title>
            <el-icon><List /></el-icon>
            <span>账单明细</span>
          </template>
          <el-menu-item index="/billing/orders">订单管理</el-menu-item>
          <el-menu-item index="/billing/transactions">交易明细</el-menu-item>
          <el-menu-item index="/billing/settlement">结算记录</el-menu-item>
          <el-menu-item index="/billing/recharge-orders">充值订单</el-menu-item>
        </el-sub-menu>

        <!-- 我的账户 -->
        <el-sub-menu index="account">
          <template #title>
            <el-icon><User /></el-icon>
            <span>我的账户</span>
          </template>
          <el-menu-item index="/account/center">账户中心</el-menu-item>
          <el-menu-item index="/account/event-log">事件日志</el-menu-item>
          <el-menu-item index="/account/profile">个人中心</el-menu-item>
          <el-menu-item index="/account/my-proxies">我的代理</el-menu-item>
        </el-sub-menu>

                <!-- 通知管理 -->
                <el-menu-item index="/notifications">
                  <el-icon><Bell /></el-icon>
                  <span>通知管理</span>
                </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span class="welcome">欢迎回来，{{ userName }}！</span>
        </div>
        <div class="header-right">
          <span class="balance">余额: ${{ Number(userBalance).toFixed(2) }}</span>
          <LanguageSwitcher />
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              {{ userEmail }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item v-if="isAdmin" command="admin" divided>
                  <el-icon><Setting /></el-icon>
                  管理后台
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import { 
  DataAnalysis, 
  Connection, 
  House, 
  Iphone, 
  Wallet, 
  List, 
  User, 
  Bell, 
  Setting,
  ArrowDown 
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);
const isAdmin = computed(() => userStore.isAdmin);
const userEmail = computed(() => userStore.user?.email || '');
const userName = computed(() => userStore.user?.nickname || userStore.user?.email?.split('@')[0] || '用户');
const userBalance = computed(() => userStore.user?.balance || 0);

// 组件挂载时刷新用户信息（包括余额）
onMounted(() => {
  userStore.fetchUserInfo();
});

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await userStore.logout();
    router.push('/login');
  } else if (command === 'profile') {
    router.push('/account/profile');
  } else if (command === 'admin') {
    router.push('/admin/dashboard');
  }
};

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  router.push(index);
};
</script>

<style scoped lang="scss">
.dashboard-layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  color: #fff;
  overflow-y: auto;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2b3a4a;

    h2 {
      color: #fff;
      font-size: 20px;
      margin: 0;
    }
  }

  .sidebar-menu {
    border: none;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;

  .header-left {
    .welcome {
      font-size: 16px;
      color: #303133;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;

    .balance {
      font-size: 14px;
      font-weight: bold;
      color: #67c23a;
    }

    .user-dropdown {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>

