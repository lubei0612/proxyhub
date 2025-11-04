<template>
  <div class="price-overrides-container">
    <div class="page-header">
      <h1>价格覆盖管理</h1>
      <div class="header-actions">
        <el-button @click="loadIpPool" :loading="loading" :icon="Refresh">刷新</el-button>
        <el-button type="primary" @click="saveChanges" :disabled="!hasChanges" :icon="Check">保存修改</el-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <el-card shadow="never" class="statistics-card" v-if="statistics">
      <div class="statistics-content">
        <div class="stat-item">
          <el-icon :size="24" color="#409EFF"><Goods /></el-icon>
          <div class="stat-info">
            <div class="stat-label">总地区</div>
            <div class="stat-value">{{ statistics.totalRegions }}</div>
          </div>
        </div>
        <div class="stat-item">
          <el-icon :size="24" color="#67C23A"><CircleCheck /></el-icon>
          <div class="stat-info">
            <div class="stat-label">已覆盖</div>
            <div class="stat-value">{{ statistics.overridedCount }}</div>
          </div>
        </div>
        <div class="stat-item">
          <el-icon :size="24" color="#909399"><Warning /></el-icon>
          <div class="stat-info">
            <div class="stat-label">未覆盖</div>
            <div class="stat-value">{{ statistics.notOverridedCount }}</div>
          </div>
        </div>
        <div class="stat-item">
          <el-icon :size="24" color="#E6A23C"><Edit /></el-icon>
          <div class="stat-info">
            <div class="stat-label">待保存</div>
            <div class="stat-value">{{ Object.keys(changes).length }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 筛选器 -->
    <el-card shadow="never" class="filter-card">
      <div class="filter-content">
        <div class="filter-row">
          <div class="filter-item">
            <label>IP类型：</label>
            <el-radio-group v-model="filters.ipType" size="default">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="shared">普通IP</el-radio-button>
              <el-radio-button label="premium">原生IP</el-radio-button>
            </el-radio-group>
          </div>
          <div class="filter-item">
            <label>大洲：</label>
            <el-radio-group v-model="filters.continent" size="default">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="north-america">北美洲</el-radio-button>
              <el-radio-button label="asia">亚洲</el-radio-button>
              <el-radio-button label="europe">欧洲</el-radio-button>
              <el-radio-button label="south-america">南美洲</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-item">
            <label>状态：</label>
            <el-radio-group v-model="filters.status" size="default">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="overrided">已覆盖</el-radio-button>
              <el-radio-button label="not-overrided">未覆盖</el-radio-button>
            </el-radio-group>
          </div>
          <div class="filter-item">
            <label>搜索：</label>
            <el-input 
              v-model="filters.search" 
              placeholder="搜索国家或城市..." 
              clearable
              style="width: 280px"
              :prefix-icon="Search"
            />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 商品卡片网格 -->
    <div v-loading="loading" class="cards-section">
      <div v-if="filteredIpPool.length === 0" class="empty-state">
        <el-empty description="没有找到符合条件的IP地区" />
      </div>
      <div v-else class="ip-cards-grid">
        <div
          v-for="item in filteredIpPool"
          :key="`${item.country}-${item.city}-${item.ipType}`"
          class="ip-card"
          :class="{
            'has-override': hasOverride(item),
            'has-change': hasChange(item)
          }"
        >
          <!-- 卡片头部：国旗和国家信息 -->
          <div class="card-header-section">
            <img 
              :src="`https://flagcdn.com/w80/${item.country.toLowerCase()}.png`" 
              :alt="item.countryName"
              class="flag-image"
              @error="handleImageError"
            />
            <div class="location-info">
              <div class="country-name">{{ item.countryName }}</div>
              <div class="city-name">{{ item.city }}</div>
            </div>
          </div>

          <!-- IP类型标签 -->
          <div class="ip-type-tag">
            <el-tag :type="item.ipType === 'premium' ? 'warning' : 'info'" size="small">
              <el-icon v-if="item.ipType === 'premium'"><Star /></el-icon>
              {{ item.ipTypeName }}
            </el-tag>
          </div>

          <!-- 库存信息 -->
          <div class="stock-info">
            <el-icon color="#909399"><Box /></el-icon>
            <span>库存：{{ item.stock }}个</span>
          </div>

          <el-divider style="margin: 12px 0" />

          <!-- 价格设置 -->
          <div class="price-section">
            <div class="price-row">
              <span class="price-label">默认价格：</span>
              <span class="default-price">${{ item.defaultPrice.toFixed(2) }}/月</span>
            </div>
            <div class="price-row override-row">
              <span class="price-label">覆盖价格：</span>
              <el-input-number
                v-model="getOverridePrice(item)"
                :min="0"
                :max="999"
                :step="0.5"
                :precision="2"
                size="small"
                style="width: 120px"
                placeholder="留空"
                @change="handlePriceChange(item, $event)"
              />
            </div>
          </div>

          <!-- 卡片操作 -->
          <div class="card-actions">
            <el-button 
              size="small" 
              @click="resetPrice(item)" 
              :disabled="!hasChange(item) && !hasOverride(item)"
              text
            >
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
          </div>

          <!-- 已覆盖标识 -->
          <div v-if="hasOverride(item)" class="override-badge">
            <el-icon color="#67C23A"><CircleCheck /></el-icon>
          </div>

          <!-- 待保存标识 -->
          <div v-if="hasChange(item)" class="change-badge">
            <el-icon color="#E6A23C"><Edit /></el-icon>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="filteredIpPool.length > 0" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[12, 24, 48, 96]"
          :total="filteredIpPool.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Refresh, 
  Check, 
  Goods, 
  CircleCheck, 
  Warning, 
  Edit, 
  Search,
  Star,
  Box,
  RefreshLeft
} from '@element-plus/icons-vue';
import { getIpPool, batchUpdatePriceOverrides, type IpPoolItem } from '@/api/modules/pricing';

// 数据状态
const loading = ref(false);
const ipPool = ref<IpPoolItem[]>([]);
const statistics = ref<any>(null);

// 筛选器状态
const filters = ref({
  ipType: 'all',
  continent: 'all',
  status: 'all',
  search: '',
});

// 分页状态
const pagination = ref({
  page: 1,
  pageSize: 24,
});

// 价格修改记录（key: country-city-ipType, value: new price or null）
const changes = ref<Record<string, number | null>>({});

/**
 * 加载IP池数据
 */
const loadIpPool = async () => {
  try {
    loading.value = true;
    const response = await getIpPool();
    ipPool.value = response.data;
    statistics.value = response.statistics;
    
    // 清空未保存的修改
    changes.value = {};
    
    ElMessage.success('IP池数据已更新');
  } catch (error: any) {
    ElMessage.error(error.message || '加载IP池失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 筛选后的IP池
 */
const filteredIpPool = computed(() => {
  let result = [...ipPool.value];

  // IP类型筛选
  if (filters.value.ipType !== 'all') {
    result = result.filter(item => item.ipType === filters.value.ipType);
  }

  // 大洲筛选
  if (filters.value.continent !== 'all') {
    result = result.filter(item => item.continent === filters.value.continent);
  }

  // 状态筛选
  if (filters.value.status === 'overrided') {
    result = result.filter(item => hasOverride(item));
  } else if (filters.value.status === 'not-overrided') {
    result = result.filter(item => !hasOverride(item));
  }

  // 搜索筛选
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase();
    result = result.filter(item => 
      item.countryName.toLowerCase().includes(searchLower) ||
      item.city.toLowerCase().includes(searchLower) ||
      item.country.toLowerCase().includes(searchLower)
    );
  }

  return result;
});

/**
 * 获取卡片的唯一key
 */
const getItemKey = (item: IpPoolItem) => {
  return `${item.country}-${item.city}-${item.ipType}`;
};

/**
 * 判断是否有覆盖价格（原始数据）
 */
const hasOverride = (item: IpPoolItem) => {
  return item.overridePrice !== null;
};

/**
 * 判断是否有未保存的修改
 */
const hasChange = (item: IpPoolItem) => {
  const key = getItemKey(item);
  return key in changes.value;
};

/**
 * 获取当前显示的覆盖价格
 */
const getOverridePrice = (item: IpPoolItem) => {
  const key = getItemKey(item);
  if (key in changes.value) {
    return changes.value[key];
  }
  return item.overridePrice;
};

/**
 * 处理价格修改
 */
const handlePriceChange = (item: IpPoolItem, newValue: number | null) => {
  const key = getItemKey(item);
  
  // 如果新值等于原始值，则删除修改记录
  if (newValue === item.overridePrice) {
    delete changes.value[key];
  } else {
    changes.value[key] = newValue;
  }
};

/**
 * 重置单个价格
 */
const resetPrice = (item: IpPoolItem) => {
  const key = getItemKey(item);
  
  if (hasChange(item)) {
    // 有未保存的修改，删除修改记录
    delete changes.value[key];
  } else if (hasOverride(item)) {
    // 有已保存的覆盖，将其标记为删除（null）
    changes.value[key] = null;
  }
};

/**
 * 是否有未保存的修改
 */
const hasChanges = computed(() => {
  return Object.keys(changes.value).length > 0;
});

/**
 * 保存所有修改
 */
const saveChanges = async () => {
  if (!hasChanges.value) {
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要保存 ${Object.keys(changes.value).length} 个价格修改吗？`,
      '确认保存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    loading.value = true;

    // 构建批量更新请求
    const updates = Object.entries(changes.value).map(([key, overridePrice]) => {
      const [country, city, ipType] = key.split('-');
      return { country, city, ipType, overridePrice };
    });

    // 发送批量更新请求
    const response = await batchUpdatePriceOverrides(updates);

    ElMessage.success({
      message: `保存成功！成功：${response.summary.success}，失败：${response.summary.failed}`,
      duration: 3000,
    });

    // 重新加载数据
    await loadIpPool();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '保存失败');
    }
  } finally {
    loading.value = false;
  }
};

/**
 * 图片加载失败处理
 */
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'https://via.placeholder.com/80x60?text=Flag';
};

// 组件挂载时加载数据
onMounted(() => {
  loadIpPool();
});
</script>

<style scoped lang="scss">
.price-overrides-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

// 统计卡片
.statistics-card {
  margin-bottom: 20px;

  .statistics-content {
    display: flex;
    gap: 40px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .stat-info {
        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
  }
}

// 筛选卡片
.filter-card {
  margin-bottom: 20px;

  .filter-content {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .filter-row {
      display: flex;
      gap: 24px;
      align-items: center;
      flex-wrap: wrap;

      .filter-item {
        display: flex;
        align-items: center;
        gap: 12px;

        label {
          font-size: 14px;
          color: #606266;
          white-space: nowrap;
          font-weight: 500;
        }
      }
    }
  }
}

// 卡片区域
.cards-section {
  min-height: 400px;
}

.empty-state {
  padding: 60px 0;
}

// IP卡片网格
.ip-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

// 单个IP卡片
.ip-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  &.has-override {
    border-color: #67C23A;
    background: #f0f9ff;
  }

  &.has-change {
    border-color: #E6A23C;
    animation: pulse 2s infinite;
  }

  .card-header-section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .flag-image {
      width: 60px;
      height: 45px;
      border-radius: 4px;
      object-fit: cover;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .location-info {
      flex: 1;

      .country-name {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .city-name {
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .ip-type-tag {
    margin-bottom: 8px;
  }

  .stock-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #606266;
    margin-bottom: 12px;
  }

  .price-section {
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .price-label {
        font-size: 14px;
        color: #606266;
      }

      .default-price {
        font-size: 14px;
        color: #909399;
        font-weight: 500;
      }

      &.override-row {
        align-items: center;
      }
    }
  }

  .card-actions {
    display: flex;
    justify-content: center;
    margin-top: 12px;
  }

  .override-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: #67C23A;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .change-badge {
    position: absolute;
    top: 40px;
    right: 12px;
    background: #E6A23C;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>
