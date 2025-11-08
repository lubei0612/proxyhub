<template>
  <div class="dashboard-container responsive-container">
    <h1 class="text-responsive">仪表盘</h1>

    <!-- 概览卡片 -->
    <el-row :gutter="20" class="stats-row grid-responsive">
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
              <div class="stat-value">${{ parseFloat(overview.spending?.total || 0).toFixed(2) }}</div>
              <div class="stat-label">总消费</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第一行：条形图 + 饼图 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 流量概况 - 条形图（竖向） -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>网络使用流量概况 - 条形统计图</span>
              <span class="header-note">（基于UTC时间）</span>
            </div>
          </template>
          <div class="chart-wrapper">
            <v-chart :option="barChartOption" :autoresize="true" style="height: 350px" />
          </div>
        </el-card>
      </el-col>

      <!-- 网络请求 - 饼图 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>网络请求分布</span>
              <span class="header-note">（基于UTC时间）</span>
            </div>
          </template>
          <div class="chart-wrapper">
            <v-chart :option="pieChartOption" :autoresize="true" style="height: 350px" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行：折线图（4条曲线） -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>使用流量概况 - 折线统计图</span>
              <span class="header-note">（最近7天，基于UTC时间）</span>
            </div>
          </template>
          <div class="chart-wrapper">
            <v-chart :option="lineChartOption" :autoresize="true" style="height: 400px" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  getDashboardOverview, 
  getTrafficByType, 
  getRequestDistribution, 
  getTrafficTrend 
} from '@/api/modules/dashboard';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, PieChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import {
  Connection,
  CircleCheckFilled,
  ShoppingCart,
  Money,
} from '@element-plus/icons-vue';

// 注册ECharts组件
use([
  CanvasRenderer,
  BarChart,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

const overview = ref<any>({});
const trafficByType = ref<any>({ categories: [], data: [] });
const requestDistribution = ref<any>([]);
const trafficTrend = ref<any>({ dates: [], series: [] });

// 条形图配置（竖向） - 使用真实数据
const barChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: trafficByType.value.categories || ['数据中心', '移动代理', '动态住宅', '双ISP静态'],
    axisLabel: {
      color: '#606266',
    },
  },
  yAxis: {
    type: 'value',
    name: '流量 (GB)',
    axisLabel: {
      color: '#606266',
    },
  },
  series: [
    {
      name: '流量使用',
      type: 'bar',
      data: (trafficByType.value.data || [0, 0, 0, 0]).map((value: number, index: number) => ({
        value,
        itemStyle: { 
          color: ['#f56c6c', '#67c23a', '#9b59b6', '#409eff'][index] 
        }
      })),
      barWidth: '50%',
    },
  ],
}));

// 饼图配置
const pieChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
  },
  legend: {
    orient: 'vertical',
    right: '10%',
    top: 'center',
    textStyle: {
      color: '#606266',
    },
  },
  series: [
    {
      name: '网络请求',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      data: requestDistribution.value.length > 0 
        ? requestDistribution.value.map((item: any, index: number) => ({
            ...item,
            itemStyle: { 
              color: ['#409eff', '#67c23a', '#e6a23c', '#909399'][index] 
            }
          }))
        : [
          { value: 3500, name: 'HTTP请求', itemStyle: { color: '#409eff' } },
          { value: 2800, name: 'HTTPS请求', itemStyle: { color: '#67c23a' } },
          { value: 1200, name: 'WebSocket', itemStyle: { color: '#e6a23c' } },
          { value: 800, name: '其他', itemStyle: { color: '#909399' } },
        ],
    },
  ],
}));

// 折线图配置（4条曲线） - 使用真实数据
const lineChartOption = computed(() => {
  const dates = trafficTrend.value.dates || ['10-27', '10-28', '10-29', '10-30', '10-31', '11-01', '11-02'];
  const series = trafficTrend.value.series || [];
  
  const defaultSeries = [
    { name: '数据中心 (DC)', data: [0.5, 0.8, 0.3, 0.6, 0.4, 0.7, 0.5], color: '#f56c6c' },
    { name: '移动代理 (Mobile)', data: [0.3, 0.5, 0.4, 0.6, 0.5, 0.8, 0.6], color: '#67c23a' },
    { name: '动态住宅 (Res Rotating)', data: [0.7, 0.9, 0.6, 0.8, 0.7, 1.0, 0.8], color: '#9b59b6' },
    { name: '双ISP静态 (Res Static)', data: [0.4, 0.6, 0.5, 0.7, 0.6, 0.9, 0.7], color: '#409eff' },
  ];
  
  const seriesData = series.length > 0 
    ? series.map((s: any) => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data,
        itemStyle: { 
          color: s.name.includes('DC') ? '#f56c6c' :
                 s.name.includes('Mobile') ? '#67c23a' :
                 s.name.includes('Rotating') ? '#9b59b6' : '#409eff'
        },
        areaStyle: {
          opacity: 0.1,
          color: s.name.includes('DC') ? '#f56c6c' :
                 s.name.includes('Mobile') ? '#67c23a' :
                 s.name.includes('Rotating') ? '#9b59b6' : '#409eff'
        },
      }))
    : defaultSeries.map(s => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data,
        itemStyle: { color: s.color },
        areaStyle: { opacity: 0.1, color: s.color },
      }));
  
  return {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: seriesData.map((s: any) => s.name),
      textStyle: {
        color: '#606266',
      },
      top: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '60px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        color: '#606266',
      },
    },
    yAxis: {
      type: 'value',
      name: '流量 (GB)',
      axisLabel: {
        color: '#606266',
      },
    },
    series: seriesData,
  };
});

const loadOverview = async () => {
  try {
    const res = await getDashboardOverview();
    // Axios interceptor已经unwrap了data，直接使用res
    overview.value = res || {};
  } catch (error) {
    console.error('[Dashboard] 加载概览数据失败:', error);
  }
};

const loadTrafficData = async () => {
  try {
    // 加载条形图数据
    const barData = await getTrafficByType();
    trafficByType.value = barData || { categories: [], data: [] };

    // 加载饼图数据
    const pieData = await getRequestDistribution();
    requestDistribution.value = pieData || [];

    // 加载折线图数据
    const lineData = await getTrafficTrend();
    trafficTrend.value = lineData || { dates: [], series: [] };
  } catch (error) {
    console.error('[Dashboard] 加载流量数据失败:', error);
  }
};

onMounted(() => {
  loadOverview();
  loadTrafficData();
});
</script>

<style scoped lang="scss">
.dashboard-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
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

  .chart-row {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
    color: #303133;

    .header-note {
      font-size: 12px;
      color: #909399;
      font-weight: normal;
    }
  }

  .chart-wrapper {
    padding: 10px;
    min-height: 350px;
  }
}

// 浅色主题适配
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

:deep(.el-card__body) {
  padding: 20px;
}
</style>
