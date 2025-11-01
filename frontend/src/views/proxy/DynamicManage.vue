<template>
  <div class="dynamic-manage-container">
    <div class="header-section">
      <h1>动态代理管理</h1>
      <el-button type="primary" @click="$router.push('/proxy/dynamic/buy')">
        <el-icon><Plus /></el-icon>
        购买流量包
      </el-button>
    </div>

    <!-- 流量统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff">
              <el-icon :size="30"><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalTraffic || 0 }} GB</div>
              <div class="stat-label">总流量</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a">
              <el-icon :size="30"><CircleCheckFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.usedTraffic || 0 }} GB</div>
              <div class="stat-label">已使用</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6a23c">
              <el-icon :size="30"><PieChart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.remainingTraffic || 0 }} GB</div>
              <div class="stat-label">剩余流量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 代理配置 -->
    <el-card shadow="hover" class="config-card">
      <template #header>
        <div class="card-header">
          <span>代理配置信息</span>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="代理地址">
          <code>proxy.proxyhub.com</code>
          <el-button text type="primary" size="small" @click="copyText('proxy.proxyhub.com')">
            复制
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="端口">
          <code>10000</code>
        </el-descriptions-item>
        <el-descriptions-item label="用户名">
          <code>{{ userEmail }}</code>
          <el-button text type="primary" size="small" @click="copyText(userEmail)">
            复制
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="密码">
          <code>{{ apiKey || '请先生成API Key' }}</code>
          <el-button
            text
            type="primary"
            size="small"
            @click="copyText(apiKey)"
            :disabled="!apiKey"
          >
            复制
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="支持协议">
          HTTP / HTTPS / SOCKS5
        </el-descriptions-item>
        <el-descriptions-item label="切换方式">
          每次请求自动切换IP
        </el-descriptions-item>
      </el-descriptions>

      <el-alert
        title="使用说明"
        type="info"
        show-icon
        :closable="false"
        style="margin-top: 20px"
      >
        <ul style="margin: 0; padding-left: 20px">
          <li>动态代理每次请求自动切换IP地址</li>
          <li>支持HTTP/HTTPS/SOCKS5协议</li>
          <li>按实际使用流量扣费，不限使用时间</li>
          <li>如未生成API Key，请前往账户中心生成</li>
        </ul>
      </el-alert>
    </el-card>

    <!-- 使用记录 -->
    <el-card shadow="hover" class="usage-card">
      <template #header>
        <div class="card-header">
          <span>使用记录</span>
        </div>
      </template>

      <el-table :data="usageRecords" v-loading="loading" style="width: 100%">
        <el-table-column prop="date" label="日期" width="180" />
        <el-table-column label="使用流量" width="150">
          <template #default="{ row }">
            {{ row.traffic }} GB
          </template>
        </el-table-column>
        <el-table-column label="请求次数" width="150">
          <template #default="{ row }">
            {{ row.requests }}
          </template>
        </el-table-column>
        <el-table-column label="费用" width="120">
          <template #default="{ row }">
            ${{ row.cost }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="200" />
      </el-table>

      <el-empty v-if="!loading && usageRecords.length === 0" description="暂无使用记录" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';
import {
  Plus,
  Connection,
  CircleCheckFilled,
  PieChart,
} from '@element-plus/icons-vue';

const userStore = useUserStore();

const statistics = ref({
  totalTraffic: 100,
  usedTraffic: 35,
  remainingTraffic: 65,
});

const usageRecords = ref([
  { date: '2025-11-01', traffic: 5.2, requests: 1230, cost: 2.5, description: '正常使用' },
  { date: '2025-10-31', traffic: 8.5, requests: 2100, cost: 4.2, description: '正常使用' },
  { date: '2025-10-30', traffic: 12.3, requests: 3450, cost: 6.1, description: '正常使用' },
]);

const loading = ref(false);

const userEmail = computed(() => userStore.user?.email || '');
const apiKey = computed(() => userStore.user?.apiKey || '');

const copyText = (text: string) => {
  if (!text) {
    ElMessage.warning('无内容可复制');
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板');
  });
};

onMounted(() => {
  // Load usage data
});
</script>

<style scoped lang="scss">
.dynamic-manage-container {
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      margin: 0;
      color: #303133;
    }
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

  .config-card,
  .usage-card {
    margin-bottom: 20px;

    .card-header {
      font-weight: bold;
      font-size: 16px;
    }

    code {
      background-color: #f5f7fa;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: monospace;
      color: #409eff;
    }
  }
}
</style>

