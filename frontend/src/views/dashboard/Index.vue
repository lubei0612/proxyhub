<template>
  <div class="dashboard-container">
    <h1>仪表盘</h1>

    <!-- 概览卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff">
              <el-icon :size="30"><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.proxies?.total || 0 }}</div>
              <div class="stat-label">总代理数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a">
              <el-icon :size="30"><CircleCheckFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.proxies?.active || 0 }}</div>
              <div class="stat-label">活跃代理</div>
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
              <div class="stat-value">{{ overview.orders?.total || 0 }}</div>
              <div class="stat-label">总订单数</div>
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
              <div class="stat-value">${{ overview.spending?.total || 0 }}</div>
              <div class="stat-label">总消费</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>快速操作</span>
            </div>
          </template>
          <div class="action-buttons">
            <el-button type="primary" @click="$router.push('/proxy/static/buy')">
              <el-icon><Plus /></el-icon>
              购买静态IP
            </el-button>
            <el-button type="success" @click="$router.push('/wallet/recharge')">
              <el-icon><Wallet /></el-icon>
              充值余额
            </el-button>
            <el-button type="info" @click="$router.push('/proxy/static/manage')">
              <el-icon><List /></el-icon>
              管理代理
            </el-button>
            <el-button type="warning" @click="$router.push('/billing/orders')">
              <el-icon><Document /></el-icon>
              查看订单
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 消费趋势图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近7天消费趋势</span>
            </div>
          </template>
          <div class="chart-container" v-if="spendingTrend.length > 0">
            <div class="simple-chart">
              <div
                v-for="(item, index) in spendingTrend"
                :key="index"
                class="chart-bar"
              >
                <div
                  class="bar"
                  :style="{ height: getBarHeight(item.amount) + '%' }"
                ></div>
                <div class="bar-label">
                  <div class="amount">${{ item.amount }}</div>
                  <div class="date">{{ formatDate(item.date) }}</div>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无数据" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getDashboardOverview, getSpendingTrend } from '@/api/modules/dashboard';
import {
  Connection,
  CircleCheckFilled,
  ShoppingCart,
  Money,
  Plus,
  Wallet,
  List,
  Document,
} from '@element-plus/icons-vue';

const overview = ref<any>({});
const spendingTrend = ref<any[]>([]);

const loadOverview = async () => {
  try {
    const res = await getDashboardOverview();
    if (res.data) {
      overview.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load overview:', error);
  }
};

const loadSpendingTrend = async () => {
  try {
    const res = await getSpendingTrend();
    if (res.data) {
      spendingTrend.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load spending trend:', error);
  }
};

const getBarHeight = (amount: string) => {
  const maxAmount = Math.max(...spendingTrend.value.map((item) => parseFloat(item.amount)));
  return maxAmount > 0 ? (parseFloat(amount) / maxAmount) * 100 : 0;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

onMounted(() => {
  loadOverview();
  loadSpendingTrend();
});
</script>

<style scoped lang="scss">
.dashboard-container {
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
        }
      }
    }
  }

  .quick-actions {
    margin-bottom: 20px;

    .action-buttons {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }
  }

  .chart-row {
    margin-bottom: 20px;
  }

  .chart-container {
    padding: 20px 0;
  }

  .simple-chart {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 200px;
    gap: 10px;

    .chart-bar {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;

      .bar {
        width: 100%;
        background: linear-gradient(to top, #409eff, #66b1ff);
        border-radius: 4px 4px 0 0;
        min-height: 5px;
        transition: height 0.3s;
      }

      .bar-label {
        margin-top: 10px;
        text-align: center;

        .amount {
          font-size: 14px;
          font-weight: bold;
          color: #303133;
        }

        .date {
          font-size: 12px;
          color: #909399;
          margin-top: 5px;
        }
      }
    }
  }
}
</style>
