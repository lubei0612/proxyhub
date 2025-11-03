<template>
  <div class="dynamic-manage-container">
    <h1>动态住宅IP管理</h1>

    <!-- 套餐概览 -->
    <el-row :gutter="20" class="package-overview">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff">
              <el-icon :size="30"><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ packageInfo.name || '未订阅' }}</div>
              <div class="stat-label">当前套餐</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a">
              <el-icon :size="30"><DataLine /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ packageInfo.remaining || 0 }} GB</div>
              <div class="stat-label">剩余流量</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6a23c">
              <el-icon :size="30"><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ packageInfo.status || '运行中' }}</div>
              <div class="stat-label">状态</div>
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
              <div class="stat-value">${{ packageInfo.pricePerGb || 0 }}/GB</div>
              <div class="stat-label">流量单价</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作按钮 -->
    <el-card shadow="hover" class="action-card">
      <div class="action-buttons">
        <el-button type="primary" size="large" @click="handleContactService">
          <el-icon><ChatDotRound /></el-icon>
          联系客服购买套餐
        </el-button>
        <el-button type="success" size="large" @click="handleContactService">
          <el-icon><Plus /></el-icon>
          升级套餐
        </el-button>
        <el-button type="warning" size="large" @click="handleToggleStatus">
          <el-icon><Switch /></el-icon>
          {{ packageInfo.status === '运行中' ? '暂停使用' : '恢复使用' }}
        </el-button>
        <el-button type="info" size="large" @click="handleContactService">
          <el-icon><Setting /></el-icon>
          套餐设置
        </el-button>
      </div>
    </el-card>

    <!-- 使用说明 -->
    <el-card shadow="hover" class="info-card">
      <template #header>
        <div class="card-header">
          <span>使用说明</span>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="24">
          <div class="usage-info">
            <p>• 动态住宅代理按流量计费，流量用完后需要联系客服续费</p>
            <p>• 支持HTTP/HTTPS/SOCKS5协议</p>
            <p>• 联系客服: <el-link type="primary" href="https://t.me/lubei12" target="_blank">@lubei12</el-link></p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 使用统计 -->
    <el-card shadow="hover" class="usage-card">
      <template #header>
        <div class="card-header">
          <span>本月使用统计</span>
          <el-button type="primary" size="small" @click="loadUsageData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table :data="usageData" v-loading="loading" style="width: 100%">
        <el-table-column label="日期" prop="date" width="150" />
        <el-table-column label="请求数" prop="requests" width="120">
          <template #default="{ row }">
            <el-text type="primary">{{ row.requests.toLocaleString() }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="成功率" prop="successRate" width="100">
          <template #default="{ row }">
            <el-tag :type="row.successRate >= 95 ? 'success' : 'warning'">
              {{ row.successRate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="流量使用" prop="traffic" width="120">
          <template #default="{ row }">
            {{ row.traffic }} GB
          </template>
        </el-table-column>
        <el-table-column label="费用" prop="cost" width="100">
          <template #default="{ row }">
            ${{ row.cost.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="note" />
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadUsageData"
          @current-change="loadUsageData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Connection,
  DataLine,
  Timer,
  Money,
  ChatDotRound,
  Plus,
  Switch,
  Setting,
  Star,
  Trophy,
  Refresh,
  ShoppingBag,
  Monitor,
  Histogram,
} from '@element-plus/icons-vue';

// 套餐信息
const packageInfo = ref({
  name: '个人套餐',
  remaining: 50.5,
  status: '运行中',
  pricePerGb: 4.5,
});

// 热门业务场景
const scenarios = ref([
  {
    icon: ShoppingBag,
    title: '电商采集',
    description: '商品价格监控、库存追踪、竞品分析',
    color: '#409eff',
  },
  {
    icon: Monitor,
    title: '社交媒体',
    description: '账号管理、内容发布、数据统计',
    color: '#67c23a',
  },
  {
    icon: Histogram,
    title: 'SEO优化',
    description: '搜索排名监控、关键词分析、竞争对手追踪',
    color: '#e6a23c',
  },
  {
    icon: DataLine,
    title: '市场调研',
    description: '用户行为分析、市场趋势监测、数据采集',
    color: '#f56c6c',
  },
  {
    icon: Star,
    title: '广告验证',
    description: '广告展示验证、点击率监控、作弊检测',
    color: '#9b59b6',
  },
  {
    icon: Connection,
    title: '品牌保护',
    description: '假冒商品监测、侵权内容识别、品牌声誉管理',
    color: '#1abc9c',
  },
]);

// 使用统计
const usageData = ref<any[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 联系客服（跳转Telegram）
const handleContactService = () => {
  window.open('https://t.me/lubei12', '_blank');
  ElMessage.info('正在跳转到Telegram客服...');
};

// 切换状态
const handleToggleStatus = async () => {
  try {
    packageInfo.value.status = packageInfo.value.status === '运行中' ? '已暂停' : '运行中';
    ElMessage.success(`已${packageInfo.value.status === '运行中' ? '恢复' : '暂停'}使用`);
  } catch (error: any) {
    ElMessage.error('操作失败：' + error.message);
  }
};

// 加载使用数据
const loadUsageData = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock数据
    const mockData = Array.from({ length: 10 }, (_, i) => ({
      date: `2025-11-${String(i + 1).padStart(2, '0')}`,
      requests: Math.floor(Math.random() * 10000) + 5000,
      successRate: Math.floor(Math.random() * 5) + 95,
      traffic: parseFloat((Math.random() * 5 + 1).toFixed(2)),
      cost: parseFloat((Math.random() * 20 + 5).toFixed(2)),
      note: i % 3 === 0 ? '高峰期' : '',
    }));

    usageData.value = mockData;
    pagination.value.total = mockData.length;
  } catch (error: any) {
    ElMessage.error('加载失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUsageData();
});
</script>

<style scoped lang="scss">
.dynamic-manage-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .package-overview {
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
          font-size: 24px;
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

  .action-card {
    margin-bottom: 20px;

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }
  }

  .info-card {
    margin-bottom: 20px;

    .ip-type-info {
      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          padding: 8px 0;
          color: #606266;
          font-size: 14px;
        }
      }
    }
  }

  .scenarios-card {
    margin-bottom: 20px;

    .scenario-item {
      text-align: center;
      padding: 20px;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.15);
        transform: translateY(-2px);
      }

      h4 {
        margin: 15px 0 10px;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: #909399;
        line-height: 1.6;
      }
    }
  }

  .usage-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      color: #303133;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
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
