<template>
  <div class="dynamic-manage-container">
    <h1>动态住宅IP管理</h1>

    <!-- 套餐概览 - 4个统计卡片 -->
    <el-row :gutter="20" class="package-overview">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card card-blue">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="32"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">套餐类型</div>
              <div class="stat-value">{{ packageInfo.name || '个人套餐' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card card-green">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="32"><DataLine /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">剩余流量</div>
              <div class="stat-value">{{ packageInfo.remaining || 0 }} GB</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card card-orange">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="32"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">状态</div>
              <div class="stat-value">{{ packageInfo.status || '运行中' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card card-red">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="32"><PriceTag /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">流量单价</div>
              <div class="stat-value">${{ packageInfo.pricePerGb || 4.5 }}/GB</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作按钮 -->
    <el-card shadow="hover" class="action-card">
      <el-row :gutter="15" justify="center">
        <el-col :span="6">
          <el-button
            type="primary"
            size="large"
            class="action-btn"
            disabled
          >
            <el-icon><ChatDotRound /></el-icon>
            请联系您的客服购买套餐
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button
            type="success"
            size="large"
            class="action-btn"
            @click="handleContactService"
          >
            <el-icon><Top /></el-icon>
            升级套餐
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button
            type="warning"
            size="large"
            class="action-btn"
            @click="handleToggleStatus"
          >
            <el-icon><VideoPause /></el-icon>
            {{ packageInfo.status === '运行中' ? '暂停使用' : '恢复使用' }}
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button
            type="info"
            size="large"
            class="action-btn"
            @click="handleContactService"
          >
            <el-icon><Setting /></el-icon>
            套餐设置
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 使用说明 -->
    <el-card shadow="hover" class="info-card">
      <template #header>
        <div class="card-header">
          <span>使用说明</span>
        </div>
      </template>

      <div class="usage-info">
        <p>• 动态住宅代理按流量计费，流量用完后需要联系您的客服续费</p>
        <p>• 支持HTTP/HTTPS/SOCKS5协议</p>
        <p>• 如需购买，请联系您的客服</p>
      </div>
    </el-card>

    <!-- 本月使用统计 -->
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

      <el-table :data="usageData" v-loading="loading" style="width: 100%" stripe>
        <el-table-column label="日期" prop="date" width="150" align="center" />
        <el-table-column label="请求数" prop="requests" width="120" align="center">
          <template #default="{ row }">
            <el-text type="primary" style="font-weight: 600;">{{ row.requests.toLocaleString() }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="成功率" prop="successRate" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.successRate >= 95 ? 'success' : 'warning'" size="large">
              {{ row.successRate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="流量使用" prop="traffic" width="120" align="center">
          <template #default="{ row }">
            <span style="font-weight: 500;">{{ row.traffic }} GB</span>
          </template>
        </el-table-column>
        <el-table-column label="费用" prop="cost" width="100" align="center">
          <template #default="{ row }">
            <el-text type="warning" style="font-weight: 600;">${{ row.cost.toFixed(2) }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="note" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.note" type="info" size="small">{{ row.note }}</el-tag>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
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
  Box,
  DataLine,
  CircleCheck,
  PriceTag,
  ChatDotRound,
  Top,
  VideoPause,
  Setting,
  Refresh,
} from '@element-plus/icons-vue';

// 套餐信息 - ✅ 移除硬编码，改为空状态
const packageInfo = ref({
  name: '',
  remaining: 0,
  status: '',
  pricePerGb: 0,
});

// 使用统计
const usageData = ref<any[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});

// ✅ 客服链接已隐藏（防止撬客户）

// 切换状态 - ✅ 禁用（需要真实API）
const handleToggleStatus = async () => {
  ElMessage.warning('此功能需要联系您的客服开通动态住宅套餐后才能使用');
};

// 加载使用数据 - ✅ 移除Mock数据，显示空状态
const loadUsageData = async () => {
  loading.value = true;
  try {
    // TODO: 集成真实的985Proxy使用统计API
    // const response = await getDynamicUsageStats();
    // usageData.value = response.data;
    // pagination.value.total = response.total;
    
    // ✅ 暂时显示空数据（等待API集成）
    usageData.value = [];
    pagination.value.total = 0;
    
    // 如果没有数据，提示用户
    if (usageData.value.length === 0) {
      ElMessage.info('暂无动态住宅套餐，请联系您的客服开通');
    }
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
  padding: 20px;

  h1 {
    margin: 0 0 24px 0;
    color: #303133;
    font-size: 26px;
    font-weight: 600;
  }

  .package-overview {
    margin-bottom: 20px;
  }

  // 统计卡片样式 - 模仿985Proxy
  .stat-card {
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 0;

      .stat-icon {
        width: 70px;
        height: 70px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        flex-shrink: 0;
      }

      .stat-info {
        flex: 1;

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 22px;
          font-weight: 700;
          color: #303133;
          line-height: 1.2;
        }
      }
    }

    // 不同颜色的卡片
    &.card-blue .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.card-green .stat-icon {
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
    }

    &.card-orange .stat-icon {
      background: linear-gradient(135deg, #f78ca0 0%, #f9748f 100%);
    }

    &.card-red .stat-icon {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
  }

  // 操作按钮卡片
  .action-card {
    margin-bottom: 20px;
    border-radius: 12px;

    :deep(.el-card__body) {
      padding: 24px;
    }

    .action-btn {
      width: 100%;
      height: 48px;
      font-size: 15px;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .el-icon {
        margin-right: 6px;
      }
    }
  }

  // 使用说明卡片
  .info-card {
    margin-bottom: 20px;
    border-radius: 12px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      font-size: 16px;
      color: #303133;
    }

    .usage-info {
      p {
        margin: 10px 0;
        color: #606266;
        font-size: 14px;
        line-height: 1.8;

        &:first-child {
          margin-top: 0;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  // 使用统计卡片
  .usage-card {
    border-radius: 12px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      font-size: 16px;
      color: #303133;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

// ProxyHub 浅色主题配色
:deep(.el-card) {
  background-color: #ffffff;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

:deep(.el-card__header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
  padding: 16px 20px;
}

:deep(.el-table) {
  color: #606266;
  border-radius: 8px;
  overflow: hidden;

  th {
    background-color: #f5f7fa;
    color: #303133;
    font-weight: 600;
  }

  tr:hover > td {
    background-color: #f5f7fa;
  }

  .el-table__row--striped > td {
    background-color: #fafafa;
  }
}

:deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;

  &:hover {
    background-color: #66b1ff;
    border-color: #66b1ff;
  }
}

:deep(.el-button--success) {
  background-color: #67c23a;
  border-color: #67c23a;

  &:hover {
    background-color: #85ce61;
    border-color: #85ce61;
  }
}

:deep(.el-button--warning) {
  background-color: #e6a23c;
  border-color: #e6a23c;

  &:hover {
    background-color: #ebb563;
    border-color: #ebb563;
  }
}

:deep(.el-button--info) {
  background-color: #909399;
  border-color: #909399;

  &:hover {
    background-color: #a6a9ad;
    border-color: #a6a9ad;
  }
}
</style>
