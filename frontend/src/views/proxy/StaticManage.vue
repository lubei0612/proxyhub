<template>
  <div class="static-manage-container">
    <h1>静态住宅IP管理</h1>

    <el-card shadow="hover" class="manage-card">
      <template #header>
        <div class="card-header">
          <span>我的静态IP列表</span>
          <div class="header-actions">
            <el-dropdown @command="handleBatchExport">
              <el-button type="success">
                <el-icon><Download /></el-icon>
                导出
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="csv">
                    <el-icon><Document /></el-icon>
                    导出为 CSV
                  </el-dropdown-item>
                  <el-dropdown-item command="txt">
                    <el-icon><Tickets /></el-icon>
                    导出为 TXT（IP:Port:User:Pass）
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="warning" @click="handleBatchRenew">
              <el-icon><RefreshRight /></el-icon>
              批量续费
            </el-button>
          </div>
        </div>
      </template>

      <!-- 筛选条件（3行布局） -->
      <div class="filter-section">
        <!-- 第一行 -->
        <el-row :gutter="15" class="filter-row">
          <el-col :span="6">
            <el-input
              v-model="filters.ip"
              placeholder="请输入IP"
              clearable
              @clear="loadData"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>

          <el-col :span="6">
            <el-select
              v-model="filters.channel"
              placeholder="请选择所属通道"
              clearable
              @change="loadData"
            >
              <el-option label="默认通道" value="default" />
              <el-option label="电商专用" value="ecommerce" />
              <el-option label="社交媒体" value="social" />
            </el-select>
          </el-col>

          <el-col :span="6">
            <el-select
              v-model="filters.country"
              placeholder="选择国家"
              clearable
              filterable
              @change="handleCountryChange"
            >
              <el-option
                v-for="country in countryList"
                :key="country.code"
                :label="country.name"
                :value="country.code"
              >
                <img :src="getFlagUrl(country.code)" class="flag-option" />
                {{ country.name }}
              </el-option>
            </el-select>
          </el-col>

          <el-col :span="6">
            <el-select
              v-model="filters.city"
              placeholder="选择城市"
              clearable
              @change="loadData"
              :disabled="!filters.country"
            >
              <el-option
                v-for="city in cityList"
                :key="city"
                :label="city"
                :value="city"
              />
            </el-select>
          </el-col>
        </el-row>

        <!-- 第二行 -->
        <el-row :gutter="15" class="filter-row">
          <el-col :span="6">
            <el-input
              v-model="filters.nodeId"
              placeholder="节点ID"
              clearable
              @clear="loadData"
            />
          </el-col>

          <el-col :span="6">
            <el-radio-group v-model="filters.ipType" @change="loadData">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="shared">普通</el-radio-button>
              <el-radio-button label="premium">原生</el-radio-button>
            </el-radio-group>
          </el-col>

          <el-col :span="6">
            <el-select
              v-model="filters.status"
              placeholder="状态"
              clearable
              @change="loadData"
            >
              <el-option label="全部" value="" />
              <el-option label="运行中" value="active" />
              <el-option label="即将过期" value="expiring" />
              <el-option label="已过期" value="expired" />
            </el-select>
          </el-col>

          <el-col :span="6">
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

      <!-- IP列表表格（可横向滚动） -->
      <el-table
        :data="proxyList"
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :row-key="(row) => row.id"
      >
        <el-table-column type="selection" width="55" fixed />

        <el-table-column label="IP地址" width="150" fixed>
          <template #default="{ row }">
            <el-text type="primary" copyable>{{ row.ip }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="端口" width="80" prop="port" />

        <el-table-column label="账号" width="120" prop="username">
          <template #default="{ row }">
            <el-text copyable>{{ row.username }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="密码" width="120">
          <template #default="{ row }">
            <el-text copyable type="info">{{ row.password }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="国家/城市" width="180">
          <template #default="{ row }">
            <div class="location-cell">
              <img :src="getFlagUrl(row.countryCode)" class="flag-icon" />
              <span>{{ row.country }} / {{ row.city }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="IP类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.ipType === 'premium' ? 'warning' : 'info'" size="small">
              {{ row.ipType === 'premium' ? '原生' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="所属通道" width="120" prop="channel" />

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="到期时间" width="180">
          <template #default="{ row }">
            <span :class="{ 'expiring': isExpiringSoon(row.expireTime) }">
              {{ formatDate(row.expireTime) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="释放时间" width="180">
          <template #default="{ row }">
            <span class="muted-text">{{ getReleaseTime(row.expireTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="节点ID" width="120" prop="nodeId" />

        <el-table-column label="备注" width="150">
          <template #default="{ row }">
            <el-input
              v-model="row.remark"
              placeholder="添加备注"
              size="small"
              @blur="handleRemarkChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleRenew(row)"
              :disabled="row.status === 'active' && !isExpiringSoon(row.expireTime)"
            >
              续费
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleRelease(row)"
            >
              释放
            </el-button>
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
    </el-card>

    <!-- 续费对话框 -->
    <el-dialog
      v-model="renewDialogVisible"
      title="续费静态IP"
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="续费时长">
          <el-select v-model="renewDuration" placeholder="请选择续费时长">
            <el-option label="30天" :value="30" />
            <el-option label="60天" :value="60" />
            <el-option label="90天" :value="90" />
            <el-option label="180天" :value="180" />
            <el-option label="360天" :value="360" />
          </el-select>
        </el-form-item>

        <el-form-item label="续费数量">
          <span>{{ renewingProxies.length }} 个IP</span>
        </el-form-item>

        <el-form-item label="续费金额">
          <span class="renew-price">${{ calculateRenewPrice().toFixed(2) }}</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="renewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRenew">确认续费</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Download,
  Document,
  RefreshRight,
  Search,
  Refresh,
  ArrowDown,
  Tickets,
} from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { exportToCSV, exportToTXT, formatDateForFilename } from '@/utils/export';

// 筛选条件
const filters = ref({
  ip: '',
  channel: '',
  country: '',
  city: '',
  nodeId: '',
  ipType: '',
  status: '',
});

// 国家和城市列表
const countryList = ref([
  { code: 'US', name: '美国' },
  { code: 'GB', name: '英国' },
  { code: 'JP', name: '日本' },
  { code: 'DE', name: '德国' },
  { code: 'FR', name: '法国' },
  { code: 'CA', name: '加拿大' },
  { code: 'BR', name: '巴西' },
  { code: 'KR', name: '韩国' },
  { code: 'SG', name: '新加坡' },
]);

const cityList = ref<string[]>([]);

// 代理列表
const proxyList = ref<any[]>([]);
const loading = ref(false);
const selectedProxies = ref<any[]>([]);

// 分页
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 续费对话框
const renewDialogVisible = ref(false);
const renewingProxies = ref<any[]>([]);
const renewDuration = ref(30);

// 获取国旗URL
const getFlagUrl = (code: string) => {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};

// 处理国家变化
const handleCountryChange = (countryCode: string) => {
  if (!countryCode) {
    cityList.value = [];
    filters.value.city = '';
    return;
  }

  // Mock城市数据
  const cityMap: Record<string, string[]> = {
    US: ['Los Angeles', 'New York', 'Chicago', 'Houston'],
    GB: ['London', 'Manchester', 'Birmingham'],
    JP: ['Tokyo', 'Osaka', 'Kyoto'],
    DE: ['Berlin', 'Munich', 'Hamburg'],
    FR: ['Paris', 'Lyon', 'Marseille'],
  };

  cityList.value = cityMap[countryCode] || [];
  filters.value.city = '';
  loadData();
};

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    active: 'success',
    expiring: 'warning',
    expired: 'danger',
  };
  return typeMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '运行中',
    expiring: '即将过期',
    expired: '已过期',
  };
  return textMap[status] || status;
};

// 判断是否即将过期（7天内）
const isExpiringSoon = (expireTime: string) => {
  const daysLeft = dayjs(expireTime).diff(dayjs(), 'day');
  return daysLeft <= 7 && daysLeft >= 0;
};

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 获取释放时间（到期后24小时）
const getReleaseTime = (expireTime: string) => {
  return dayjs(expireTime).add(24, 'hour').format('YYYY-MM-DD HH:mm:ss');
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // Mock数据
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockData = [
      {
        id: 1,
        ip: '192.168.1.100',
        port: 8080,
        username: 'user_001',
        password: 'pass_001',
        country: '美国',
        countryCode: 'US',
        city: 'Los Angeles',
        ipType: 'shared',
        channel: '默认通道',
        status: 'active',
        expireTime: dayjs().add(25, 'day').format('YYYY-MM-DD HH:mm:ss'),
        nodeId: 'NODE_001',
        remark: '',
      },
      {
        id: 2,
        ip: '192.168.1.101',
        port: 8081,
        username: 'user_002',
        password: 'pass_002',
        country: '英国',
        countryCode: 'GB',
        city: 'London',
        ipType: 'premium',
        channel: '电商专用',
        status: 'expiring',
        expireTime: dayjs().add(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
        nodeId: 'NODE_002',
        remark: '重要客户',
      },
      {
        id: 3,
        ip: '192.168.1.102',
        port: 8082,
        username: 'user_003',
        password: 'pass_003',
        country: '日本',
        countryCode: 'JP',
        city: 'Tokyo',
        ipType: 'shared',
        channel: '社交媒体',
        status: 'active',
        expireTime: dayjs().add(60, 'day').format('YYYY-MM-DD HH:mm:ss'),
        nodeId: 'NODE_003',
        remark: '',
      },
    ];

    proxyList.value = mockData;
    pagination.value.total = mockData.length;
  } catch (error: any) {
    ElMessage.error('加载失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

// 重置筛选
const resetFilters = () => {
  filters.value = {
    ip: '',
    channel: '',
    country: '',
    city: '',
    nodeId: '',
    ipType: '',
    status: '',
  };
  cityList.value = [];
  loadData();
};

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedProxies.value = selection;
};

// 批量导出
const handleBatchExport = (format: 'csv' | 'txt') => {
  if (selectedProxies.value.length === 0) {
    ElMessage.warning('请先选择要导出的IP');
    return;
  }

  try {
    const filename = `static-proxies_${formatDateForFilename()}`;

    if (format === 'csv') {
      // CSV格式：所有字段
      const headers = ['ip', 'port', 'username', 'password', 'country', 'city', 'ipType', 'expireTime'];
      const data = selectedProxies.value.map((proxy) => ({
        ip: proxy.ip,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password,
        country: proxy.country,
        city: proxy.city,
        ipType: proxy.ipType === 'premium' ? '原生' : '普通',
        expireTime: dayjs(proxy.expireTime).format('YYYY-MM-DD HH:mm:ss'),
      }));
      
      exportToCSV(data, headers, filename);
    } else {
      // TXT格式：IP:Port:Username:Password
      const data = selectedProxies.value.map((proxy) => ({
        ipAddress: proxy.ip,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password,
      }));
      
      exportToTXT(data, filename);
    }

    ElMessage.success(`已导出 ${selectedProxies.value.length} 个IP`);
  } catch (error: any) {
    ElMessage.error('导出失败：' + error.message);
  }
};

// 批量续费
const handleBatchRenew = () => {
  if (selectedProxies.value.length === 0) {
    ElMessage.warning('请先选择要续费的IP');
    return;
  }

  renewingProxies.value = selectedProxies.value;
  renewDialogVisible.value = true;
};

// 单个续费
const handleRenew = (proxy: any) => {
  renewingProxies.value = [proxy];
  renewDialogVisible.value = true;
};

// 计算续费价格
const calculateRenewPrice = () => {
  let total = 0;
  renewingProxies.value.forEach((proxy) => {
    const unitPrice = proxy.ipType === 'premium' ? 8 : 5;
    const months = renewDuration.value / 30;
    total += unitPrice * months;
  });
  return total;
};

// 确认续费
const confirmRenew = async () => {
  try {
    // TODO: 调用API续费
    await new Promise((resolve) => setTimeout(resolve, 1000));

    ElMessage.success('续费成功！');
    renewDialogVisible.value = false;
    loadData();
  } catch (error: any) {
    ElMessage.error('续费失败：' + error.message);
  }
};

// 释放IP
const handleRelease = async (proxy: any) => {
  try {
    await ElMessageBox.confirm(
      `确认释放IP ${proxy.ip}？释放后无法恢复。`,
      '确认释放',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // TODO: 调用API释放
    await new Promise((resolve) => setTimeout(resolve, 1000));

    ElMessage.success('释放成功！');
    loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('释放失败：' + error.message);
    }
  }
};

// 备注变更
const handleRemarkChange = async (proxy: any) => {
  try {
    // TODO: 调用API更新备注
    await new Promise((resolve) => setTimeout(resolve, 300));
  } catch (error: any) {
    ElMessage.error('备注更新失败：' + error.message);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.static-manage-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .manage-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      color: #303133;

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }

    .filter-section {
      margin-bottom: 20px;

      .filter-row {
        margin-bottom: 15px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .flag-option {
        width: 20px;
        height: 15px;
        margin-right: 8px;
        vertical-align: middle;
      }
    }

    .location-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .flag-icon {
        width: 24px;
        height: 18px;
        object-fit: cover;
        border-radius: 2px;
      }
    }

    .expiring {
      color: #e6a23c;
      font-weight: 600;
    }

    .muted-text {
      color: #909399;
      font-size: 12px;
    }

    .renew-price {
      font-size: 20px;
      font-weight: 600;
      color: #f56c6c;
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
