<template>
  <el-container class="admin-portal-layout">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h2>管理后台</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="sidebar-menu"
        background-color="#001529"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/admin-portal/users">
          <el-icon><UserFilled /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin-portal/recharges">
          <el-icon><Money /></el-icon>
          <span>充值审核</span>
        </el-menu-item>

        <el-menu-item index="/admin-portal/orders">
          <el-icon><ShoppingCart /></el-icon>
          <span>订单管理</span>
        </el-menu-item>

        <el-menu-item index="/admin-portal/ips">
          <el-icon><Connection /></el-icon>
          <span>IP管理</span>
        </el-menu-item>

        <el-menu-item index="/admin-portal/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据统计</span>
        </el-menu-item>

        <el-menu-item index="/admin-portal/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span class="title">ProxyHub 管理系统</span>
        </div>
        <div class="header-right">
          <el-button text @click="backToUserPortal">
            <el-icon><Back /></el-icon>
            返回用户端
          </el-button>
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              管理员
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
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
import {
  UserFilled,
  Money,
  ShoppingCart,
  Connection,
  DataAnalysis,
  Setting,
  Back,
  ArrowDown,
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);

const backToUserPortal = () => {
  router.push('/dashboard');
};

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.userLogout();
    router.push('/admin-portal/login');
  }
};
</script>

<style scoped lang="scss">
.admin-portal-layout {
  height: 100vh;
}

.sidebar {
  background-color: #001529;
  color: #fff;
  overflow-y: auto;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #002140;

    h2 {
      color: #fff;
      font-size: 18px;
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
    .title {
      font-size: 18px;
      font-weight: bold;
      color: #303133;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;

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

