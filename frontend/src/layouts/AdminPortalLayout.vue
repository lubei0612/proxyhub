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
        @select="handleMenuSelect"
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
        <el-menu-item index="/admin/price-overrides">
          <el-icon><Money /></el-icon>
          <template #title>价格覆盖管理</template>
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
        
        <!-- ✅ Task 2.3: 待处理事项徽章 -->
        <el-badge :value="pendingTasks.total" :hidden="pendingTasks.total === 0" class="pending-badge">
          <el-button type="info" size="small" @click="showPendingDetails = !showPendingDetails">
            <el-icon><Bell /></el-icon>
            待处理事项
          </el-button>
        </el-badge>

        <div class="admin-user">
          <LanguageSwitcher />
          <el-avatar :size="32" />
          <span>{{ userStore.user?.email }}</span>
        </div>
      </div>

      <!-- 待处理事项详情弹窗 -->
      <el-dialog v-model="showPendingDetails" title="待处理事项" width="500px">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="待审核充值">
            <el-tag type="warning">{{ pendingTasks.pendingRecharges }}</el-tag>
            <el-button type="text" size="small" @click="router.push('/admin/recharges')">
              查看
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label="异常订单">
            <el-tag type="danger">{{ pendingTasks.abnormalOrders }}</el-tag>
            <el-button type="text" size="small" @click="router.push('/admin/orders')">
              查看
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label="系统通知">
            <el-tag type="info">{{ pendingTasks.systemNotifications }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>

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
import { useAdminPendingTasks } from '@/composables/useAdminPendingTasks';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import {
  DataLine,
  UserFilled,
  Money,
  Document,
  Setting,
  Back,
  Fold,
  Expand,
  Bell,
} from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const isCollapsed = ref(false);
const showPendingDetails = ref(false);

// ✅ Task 2.3: 使用待处理事项composable
const { pendingTasks } = useAdminPendingTasks();

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  router.push(index);
};
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
  max-height: 100vh;
  background: #f3f4f6;
  overflow: hidden;
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
  overflow-y: auto;

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

  .pending-badge {
    margin-right: 20px;
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
  overflow-x: hidden;
  height: 0; // 关键：配合flex布局，确保overflow生效
}
</style>

