<template>
  <el-container class="dashboard-layout">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h2>ProxyHub</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        
        <el-sub-menu index="proxy">
          <template #title>
            <el-icon><Connection /></el-icon>
            <span>代理管理</span>
          </template>
          <el-menu-item index="/proxy/static/buy">购买静态IP</el-menu-item>
          <el-menu-item index="/proxy/static/manage">管理静态IP</el-menu-item>
          <el-menu-item index="/proxy/mobile">移动代理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="billing">
          <template #title>
            <el-icon><Wallet /></el-icon>
            <span>计费</span>
          </template>
          <el-menu-item index="/wallet/recharge">充值</el-menu-item>
          <el-menu-item index="/billing/orders">订单记录</el-menu-item>
          <el-menu-item index="/billing/transactions">交易记录</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/account/center">
          <el-icon><User /></el-icon>
          <span>账户中心</span>
        </el-menu-item>

        <el-menu-item v-if="isAdmin" index="/admin-portal/users">
          <el-icon><Setting /></el-icon>
          <span>管理后台</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span class="welcome">欢迎回来！</span>
        </div>
        <div class="header-right">
          <span class="balance">余额: ${{ userBalance }}</span>
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              {{ userEmail }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
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
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { HomeFilled, Connection, Wallet, User, Setting, ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);
const isAdmin = computed(() => userStore.isAdmin);
const userEmail = computed(() => userStore.user?.email || '');
const userBalance = computed(() => userStore.user?.balance || 0);

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.userLogout();
    router.push('/login');
  } else if (command === 'profile') {
    router.push('/account/center');
  }
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

