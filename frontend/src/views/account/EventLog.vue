<template>
  <div class="event-log-container">
    <h1>事件日志</h1>

    <el-card shadow="hover" class="log-card">
      <template #header>
        <div class="card-header">
          <span>账户操作记录</span>
          <el-tag type="info">共 {{ pagination.total }} 条记录</el-tag>
        </div>
      </template>

      <!-- 筛选 -->
      <div class="filter-section">
        <el-row :gutter="15">
          <el-col :span="6">
            <el-select v-model="filters.eventType" placeholder="事件类型" clearable>
              <el-option label="全部" value="" />
              <el-option label="登录" value="login" />
              <el-option label="注册" value="register" />
              <el-option label="购买静态IP" value="purchase_static" />
              <el-option label="购买动态代理" value="purchase_dynamic" />
              <el-option label="充值" value="recharge" />
              <el-option label="充值审核通过" value="recharge_approved" />
              <el-option label="充值审核拒绝" value="recharge_rejected" />
              <el-option label="修改密码" value="password_change" />
              <el-option label="更新资料" value="profile_update" />
            </el-select>
          </el-col>

          <el-col :span="8">
            <el-date-picker
              v-model="filters.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="width: 100%"
            />
          </el-col>

          <el-col :span="4">
            <el-button type="primary" @click="loadData">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetFilters">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 日志列表 -->
      <el-table :data="logList" v-loading="loading" style="width: 100%">
        <el-table-column label="#编号" width="80" prop="id" />

        <el-table-column label="账户名" width="200">
          <template #default="{ row }">
            <el-text type="primary">{{ row.accountName }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="事件类型" width="150">
          <template #default="{ row }">
            <el-tag :type="getEventTypeColor(row.eventType)">
              {{ getEventTypeText(row.eventType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="事件内容" min-width="300">
          <template #default="{ row }">
            <div class="event-content">
              {{ row.eventContent }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="事件时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>

      <!-- 隐私说明 -->
      <el-alert type="info" :closable="false" class="privacy-note">
        <template #title>
          <el-icon><Lock /></el-icon>
          隐私保护
        </template>
        为保护您的隐私，事件日志不记录IP地址和设备信息。
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Refresh, Lock } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { getEventLogs } from '@/api/modules/order';

// 筛选条件
const filters = ref({
  eventType: '',
  dateRange: null as any,
});

// 日志列表
const logList = ref<any[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 事件类型文本映射
const eventTypeTextMap: Record<string, string> = {
  login: '登录',
  register: '注册',
  logout: '登出',
  purchase_static: '购买静态IP',
  purchase_dynamic: '购买动态代理',
  recharge: '充值',
  recharge_approved: '充值审核通过',
  recharge_rejected: '充值审核拒绝',
  password_change: '修改密码',
  profile_update: '更新资料',
};

// 事件类型颜色映射
const eventTypeColorMap: Record<string, any> = {
  login: 'success',
  register: 'success',
  logout: 'info',
  purchase_static: 'primary',
  purchase_dynamic: 'primary',
  recharge: 'warning',
  recharge_approved: 'success',
  recharge_rejected: 'danger',
  password_change: 'warning',
  profile_update: 'info',
};

const getEventTypeText = (type: string) => {
  return eventTypeTextMap[type] || type;
};

const getEventTypeColor = (type: string) => {
  return eventTypeColorMap[type] || 'info';
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.pageSize,
      eventType: filters.value.eventType || undefined,
      startTime: filters.value.dateRange?.[0] || undefined,
      endTime: filters.value.dateRange?.[1] || undefined,
    };

    // 调用实际API
    const response = await getEventLogs(params);
    logList.value = response.data || response.list || [];
    pagination.value.total = response.total || logList.value.length;
  } catch (error: any) {
    console.error('[EventLog] 加载失败:', error);
    ElMessage.error('加载失败：' + (error.message || '未知错误'));
    logList.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

// 重置筛选
const resetFilters = () => {
  filters.value = {
    eventType: '',
    dateRange: null,
  };
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.event-log-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .log-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      color: #303133;
    }

    .filter-section {
      margin-bottom: 20px;
    }

    .event-content {
      line-height: 1.6;
      color: #606266;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }

    .privacy-note {
      margin-top: 20px;

      :deep(.el-alert__title) {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
      }
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
