<template>
  <div class="admin-statistics-container">
    <h1>数据统计</h1>

    <!-- 概览卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff">
              <el-icon :size="30"><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.users?.total || 0 }}</div>
              <div class="stat-label">总用户数</div>
              <div class="stat-sub">活跃: {{ statistics.users?.active || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a">
              <el-icon :size="30"><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.proxies?.total || 0 }}</div>
              <div class="stat-label">总代理数</div>
              <div class="stat-sub">活跃: {{ statistics.proxies?.active || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6a23c">
              <el-icon :size="30"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.orders?.total || 0 }}</div>
              <div class="stat-label">总订单数</div>
              <div class="stat-sub">已完成: {{ statistics.orders?.completed || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f56c6c">
              <el-icon :size="30"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">${{ statistics.revenue?.total || 0 }}</div>
              <div class="stat-label">总收入</div>
              <div class="stat-sub">待审核充值: {{ statistics.recharges?.pending || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细信息 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="detail-card">
          <template #header>
            <div class="card-header">
              <span>系统概览</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="总用户数">
              {{ statistics.users?.total || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="活跃用户">
              {{ statistics.users?.active || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="总代理IP">
              {{ statistics.proxies?.total || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="活跃代理IP">
              {{ statistics.proxies?.active || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="总订单数">
              {{ statistics.orders?.total || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="已完成订单">
              {{ statistics.orders?.completed || 0 }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="detail-card">
          <template #header>
            <div class="card-header">
              <span>财务概览</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="总收入">
              <span style="color: #67c23a; font-weight: bold; font-size: 18px">
                ${{ statistics.revenue?.total || 0 }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="待审核充值">
              <span style="color: #e6a23c; font-weight: bold">
                {{ statistics.recharges?.pending || 0 }} 笔
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="平台费率">
              10%
            </el-descriptions-item>
            <el-descriptions-item label="代理商佣金率">
              5%
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/admin-portal/recharges')">
              处理充值申请
            </el-button>
            <el-button @click="$router.push('/admin-portal/users')">
              管理用户
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAdminStatistics } from '@/api/modules/admin';
import { UserFilled, Connection, ShoppingCart, Money } from '@element-plus/icons-vue';

const statistics = ref<any>({});

const loadStatistics = async () => {
  try {
    const res = await getAdminStatistics();
    if (res.data) {
      statistics.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load statistics:', error);
  }
};

onMounted(() => {
  loadStatistics();
});
</script>

<style scoped lang="scss">
.admin-statistics-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
  }

  .stats-row {
    margin-bottom: 20px;
  }

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 15px;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 3px;
        }

        .stat-sub {
          font-size: 12px;
          color: #606266;
        }
      }
    }
  }

  .detail-card {
    margin-bottom: 20px;

    .card-header {
      font-weight: bold;
      font-size: 16px;
    }

    .quick-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 10px;
    }
  }
}
</style>

