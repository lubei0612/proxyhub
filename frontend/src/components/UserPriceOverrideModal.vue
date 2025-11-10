<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`价格覆盖 - ${props.userName}`"
    width="90%"
    @close="handleClose"
  >
    <div class="user-price-override-modal">
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
              <div v-if="item.globalOverridePrice !== null" class="price-row">
                <span class="price-label">全局覆盖：</span>
                <span class="global-price">${{ item.globalOverridePrice.toFixed(2) }}/月</span>
              </div>
              <div class="price-row override-row">
                <span class="price-label">用户覆盖：</span>
                <el-input-number
                  :model-value="getOverridePrice(item)"
                  @update:model-value="handlePriceChange(item, $event)"
                  :min="0"
                  :max="999"
                  :step="0.5"
                  :precision="2"
                  size="small"
                  :controls="true"
                  style="width: 140px"
                />
              </div>
              <div v-if="hasChange(item)" class="change-indicator">
                <el-icon color="#E6A23C"><Warning /></el-icon>
                <span>有未保存的修改</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="saveChanges" :disabled="!hasChanges" :loading="saving">
        保存修改
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Star, Box, Warning } from '@element-plus/icons-vue';
import { getUserIpPool, updateUserPriceOverrides } from '@/api/modules/admin';

// Props
const props = defineProps<{
  userId: number;
  userName: string;
  visible: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'saved'): void;
}>();

// State
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const ipPoolData = ref<any[]>([]);
const loading = ref(false);
const saving = ref(false);

// Filters
const filters = ref({
  ipType: 'all',
  search: '',
});

// Changes tracking
const changes = ref<Map<string, number | null>>(new Map());

// Computed
const filteredIpPool = computed(() => {
  let result = ipPoolData.value;

  // Filter by IP type
  if (filters.value.ipType !== 'all') {
    result = result.filter(item => item.ipType === filters.value.ipType);
  }

  // Filter by search
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

const hasChanges = computed(() => changes.value.size > 0);

// Methods
const getChangeKey = (item: any): string => {
  return `${item.country}-${item.city}-${item.ipType}`;
};

const hasOverride = (item: any): boolean => {
  return item.userOverridePrice !== null || item.globalOverridePrice !== null;
};

const hasChange = (item: any): boolean => {
  return changes.value.has(getChangeKey(item));
};

const getOverridePrice = (item: any): number | null => {
  const key = getChangeKey(item);
  if (changes.value.has(key)) {
    return changes.value.get(key) || null;
  }
  return item.userOverridePrice;
};

const handlePriceChange = (item: any, newPrice: number | null) => {
  const key = getChangeKey(item);
  if (newPrice === item.userOverridePrice) {
    changes.value.delete(key);
  } else {
    changes.value.set(key, newPrice);
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZTBlMGUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPj88L3RleHQ+PC9zdmc+';
};

const loadUserIpPool = async () => {
  loading.value = true;
  try {
    const response = await getUserIpPool(props.userId);
    ipPoolData.value = response.data || response || [];
    changes.value.clear();
  } catch (error: any) {
    ElMessage.error('无法加载用户价格信息');
    console.error('[User IP Pool] Load error:', error);
  } finally {
    loading.value = false;
  }
};

const saveChanges = async () => {
  if (changes.value.size === 0) {
    return;
  }

  saving.value = true;
  try {
    // Convert changes Map to array
    const updates = Array.from(changes.value.entries()).map(([key, overridePrice]) => {
      const [country, city, ipType] = key.split('-');
      return { country, city, ipType, overridePrice };
    });

    await updateUserPriceOverrides(props.userId, { updates });
    
    ElMessage.success('价格覆盖已保存');
    changes.value.clear();
    emit('saved');
    handleClose();
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '保存失败，请重试');
    console.error('[User Price Override] Save error:', error);
  } finally {
    saving.value = false;
  }
};

const handleClose = () => {
  if (changes.value.size > 0) {
    ElMessage.warning('有未保存的修改');
  }
  emit('update:visible', false);
};

// Watch for modal opening
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      loadUserIpPool();
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.user-price-override-modal {
  .filter-card {
    margin-bottom: 20px;

    .filter-content {
      .filter-row {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        align-items: center;

        .filter-item {
          display: flex;
          align-items: center;
          gap: 10px;

          label {
            font-weight: 500;
            white-space: nowrap;
          }
        }
      }
    }
  }

  .cards-section {
    min-height: 400px;
    max-height: 600px;
    overflow-y: auto;

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
    }

    .ip-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
      padding: 4px;

      .ip-card {
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        padding: 16px;
        background: #fff;
        transition: all 0.3s ease;
        position: relative;

        &:hover {
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        &.has-override {
          border-left: 3px solid #67C23A;
        }

        &.has-change {
          border-left: 3px solid #E6A23C;
          background: #fef9f1;
        }

        .card-header-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;

          .flag-image {
            width: 50px;
            height: 38px;
            object-fit: cover;
            border-radius: 4px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
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
              font-size: 13px;
              color: #909399;
            }
          }
        }

        .ip-type-tag {
          margin-bottom: 8px;

          .el-tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
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
            margin-bottom: 10px;

            .price-label {
              font-size: 13px;
              color: #606266;
            }

            .default-price {
              font-size: 14px;
              color: #909399;
              font-weight: 500;
            }

            .global-price {
              font-size: 14px;
              color: #67C23A;
              font-weight: 500;
            }

            &.override-row {
              margin-top: 12px;
              padding-top: 12px;
              border-top: 1px dashed #e4e7ed;
            }
          }

          .change-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 8px;
            padding: 6px 10px;
            background: #fef0e6;
            border-radius: 4px;
            font-size: 12px;
            color: #E6A23C;
          }
        }
      }
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .user-price-override-modal {
    .filter-card .filter-content .filter-row {
      flex-direction: column;
      align-items: stretch;

      .filter-item {
        width: 100%;

        .el-input {
          width: 100% !important;
        }
      }
    }

    .cards-section .ip-cards-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>




