<template>
  <div class="admin-dashboard-container">
    <h1>管理员仪表盘</h1>

    <!-- 统计概览 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <el-icon :size="40"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalUsers }}</div>
              <div class="stat-label">总用户数</div>
              <div class="stat-growth">
                <el-icon color="#67c23a"><CaretTop /></el-icon>
                <span>+{{ stats.newUsersToday }} 今日新增</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <el-icon :size="40"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">${{ stats.totalRevenue.toFixed(0) }}</div>
              <div class="stat-label">总收入</div>
              <div class="stat-growth">
                <el-icon color="#67c23a"><CaretTop /></el-icon>
                <span>+${{ stats.todayRevenue.toFixed(0) }} 今日</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <el-icon :size="40"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalOrders }}</div>
              <div class="stat-label">总订单数</div>
              <div class="stat-growth">
                <el-icon color="#67c23a"><CaretTop /></el-icon>
                <span>+{{ stats.todayOrders }} 今日</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <el-icon :size="40"><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalProxies }}</div>
              <div class="stat-label">代理IP总数</div>
              <div class="stat-growth">
                <el-icon color="#67c23a"><CaretTop /></el-icon>
                <span>+{{ stats.todayProxies }} 今日</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 收入趋势图 -->
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>收入趋势（最近7天）</span>
              <el-radio-group v-model="revenueChartPeriod" size="small">
                <el-radio-button label="7天" />
                <el-radio-button label="30天" />
                <el-radio-button label="90天" />
              </el-radio-group>
            </div>
          </template>
          <v-chart :option="revenueChartOption" style="height: 350px" />
        </el-card>
      </el-col>

      <!-- 用户增长图 -->
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户增长</span>
            </div>
          </template>
          <v-chart :option="userChartOption" style="height: 350px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 待处理事项和最近订单 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 待处理事项 -->
      <el-col :span="12">
        <el-card shadow="hover" class="pending-card">
          <template #header>
            <div class="card-header">
              <span>待处理事项</span>
              <el-tag type="warning">{{ pendingItems.length }}</el-tag>
            </div>
          </template>

          <div class="pending-list">
            <div
              v-for="item in pendingItems"
              :key="item.id"
              class="pending-item"
              @click="handlePendingItem(item)"
            >
              <div class="item-icon">
                <el-icon :size="24" :color="item.color">
                  <component :is="item.icon" />
                </el-icon>
              </div>
              <div class="item-info">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-desc">{{ item.description }}</div>
              </div>
              <div class="item-badge">
                <el-badge :value="item.count" :type="item.badgeType" />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 最近订单 -->
      <el-col :span="12">
        <el-card shadow="hover" class="orders-card">
          <template #header>
            <div class="card-header">
              <span>最近订单</span>
              <el-button type="primary" size="small" @click="$router.push('/admin/orders')">
                查看全部
              </el-button>
            </div>
          </template>

          <el-table :data="recentOrders" style="width: 100%">
            <el-table-column label="订单号" width="130">
              <template #default="{ row }">
                <el-text size="small">{{ row.orderNo }}</el-text>
              </template>
            </el-table-column>

            <el-table-column label="用户" width="150">
              <template #default="{ row }">
                <el-text size="small" type="primary">{{ row.userEmail }}</el-text>
              </template>
            </el-table-column>

            <el-table-column label="金额" width="100">
              <template #default="{ row }">
                <el-text size="small" type="success">${{ row.amount.toFixed(2) }}</el-text>
              </template>
            </el-table-column>

            <el-table-column label="时间" width="100">
              <template #default="{ row }">
                <el-text size="small">{{ formatTime(row.createdAt) }}</el-text>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import VChart from 'vue-echarts';
import { getAdminStatistics, getPendingItems, getRecentOrders } from '@/api/modules/admin';
import { formatRelativeTime } from '@/utils/datetime';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import { PieChart } from 'echarts/charts';
import {
  User,
  Money,
  Box,
  Connection,
  CaretTop,
  DocumentChecked,
  Warning,
  Bell,
} from '@element-plus/icons-vue';
import dayjs from 'dayjs';

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

const router = useRouter();

// 统计数据
const stats = ref({
  totalUsers: 0,
  newUsersToday: 0,
  totalRevenue: 0,
  todayRevenue: 0,
  totalOrders: 0,
  todayOrders: 0,
  totalProxies: 0,
  todayProxies: 0,
});

// 图表周期
const revenueChartPeriod = ref('7天');

// 收入趋势图配置
const revenueChartOption = ref({
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  yAxis: {
    type: 'value',
    name: '收入 (USD)',
  },
  series: [
    {
      name: '收入',
      type: 'line',
      data: [1200, 1500, 1800, 2200, 2000, 2400, 2580],
      smooth: true,
      itemStyle: {
        color: '#409eff',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
          ],
        },
      },
    },
  ],
});

// 用户增长图配置
const userChartOption = ref({
  tooltip: {
    trigger: 'item',
  },
  series: [
    {
      name: '用户类型',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      data: [
        { value: 680, name: '普通用户', itemStyle: { color: '#409eff' } },
        { value: 150, name: 'VIP用户', itemStyle: { color: '#67c23a' } },
        { value: 20, name: '管理员', itemStyle: { color: '#e6a23c' } },
      ],
    },
  ],
});

// 待处理事项
const pendingItems = ref([]);

// 最近订单
const recentOrders = ref([]);

const formatTime = (time: string) => {
  return formatRelativeTime(time);
};

const handlePendingItem = (item: any) => {
  router.push(item.action);
};

onMounted(async () => {
  // 加载统计数据
  try {
    const data = await getAdminStatistics();
    
    // 更新统计数据
    stats.value.totalUsers = data.users?.total || 0;
    stats.value.newUsersToday = 0; // 暂无今日新增用户API，需要后端添加
    stats.value.totalRevenue = parseFloat(data.revenue?.total || '0');
    stats.value.todayRevenue = parseFloat(data.revenue?.today || '0');
    stats.value.totalOrders = data.orders?.total || 0;
    stats.value.todayOrders = data.orders?.today || 0;
    stats.value.totalProxies = data.proxies?.total || 0;
    stats.value.todayProxies = 0; // 暂无今日新增代理API，需要后端添加
  } catch (error: any) {
    console.error('[AdminDashboard] 加载统计数据失败:', error);
  }

  // 加载待处理事项
  try {
    const response = await getPendingItems();
    // 需要将icon字符串转换为组件
    pendingItems.value = response.data.map((item: any) => ({
      ...item,
      icon: item.icon === 'DocumentChecked' ? DocumentChecked : 
            item.icon === 'Warning' ? Warning : Bell,
    }));
  } catch (error: any) {
    console.error('[AdminDashboard] 加载待处理事项失败:', error);
  }

  // 加载最近订单
  try {
    const response = await getRecentOrders(5);
    recentOrders.value = response.data;
  } catch (error: any) {
    console.error('[AdminDashboard] 加载最近订单失败:', error);
  }
});
</script>

<style scoped lang="scss">
.admin-dashboard-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 20px;

      .stat-icon {
        width: 80px;
        height: 80px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .stat-growth {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #67c23a;
        }
      }
    }
  }

  .chart-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      color: #303133;
    }
  }

  .pending-card {
    .pending-list {
      .pending-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        margin-bottom: 12px;
        background-color: #f5f7fa;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateX(5px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .item-icon {
          flex-shrink: 0;
        }

        .item-info {
          flex: 1;

          .item-title {
            font-size: 15px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 5px;
          }

          .item-desc {
            font-size: 13px;
            color: #909399;
          }
        }

        .item-badge {
          flex-shrink: 0;
        }
      }
    }
  }

  .orders-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      color: #303133;
    }
  }
}

:deep(.el-card) {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

:deep(.el-card__header) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  padding: 16px 20px;
}

:deep(.el-table) {
  color: #606266;

  th {
    background-color: #f5f7fa;
    color: #303133;
  }

  tr:hover > td {
    background-color: #f5f7fa;
  }
}
</style>
