<template>
  <div class="price-override-container">
    <h1>价格覆盖管理</h1>

    <el-card shadow="hover" class="price-card">
      <template #header>
        <div class="card-header">
          <span>自定义价格配置</span>
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            新增价格覆盖
          </el-button>
        </div>
      </template>

      <!-- 产品卡片展示 -->
      <div class="product-cards">
        <el-row :gutter="20">
          <!-- 韩国普通IP -->
          <el-col :span="6">
            <div class="product-card">
              <div class="product-header">
                <img src="/flags/1x1/kr.svg" class="flag-large" />
                <div class="product-title">
                  <h3>韩国</h3>
                  <span class="product-type">普通IP</span>
                </div>
              </div>
              <div class="product-price">
                <div class="price-label">30天价格</div>
                <div class="price-value">
                  $<input
                    type="number"
                    v-model.number="prices.korea.shared"
                    @blur="updatePrice('korea', 'shared')"
                    class="price-input"
                  />
                </div>
              </div>
              <el-button type="primary" size="small" @click="resetPrice('korea', 'shared')">
                重置为默认
              </el-button>
            </div>
          </el-col>

          <!-- 韩国原生IP -->
          <el-col :span="6">
            <div class="product-card">
              <div class="product-header">
                <img src="/flags/1x1/kr.svg" class="flag-large" />
                <div class="product-title">
                  <h3>韩国</h3>
                  <span class="product-type native">原生IP</span>
                </div>
              </div>
              <div class="product-price">
                <div class="price-label">30天价格</div>
                <div class="price-value">
                  $<input
                    type="number"
                    v-model.number="prices.korea.native"
                    @blur="updatePrice('korea', 'native')"
                    class="price-input"
                  />
                </div>
              </div>
              <el-button type="primary" size="small" @click="resetPrice('korea', 'native')">
                重置为默认
              </el-button>
            </div>
          </el-col>

          <!-- 日本普通IP -->
          <el-col :span="6">
            <div class="product-card">
              <div class="product-header">
                <img src="/flags/1x1/jp.svg" class="flag-large" />
                <div class="product-title">
                  <h3>日本</h3>
                  <span class="product-type">普通IP</span>
                </div>
              </div>
              <div class="product-price">
                <div class="price-label">30天价格</div>
                <div class="price-value">
                  $<input
                    type="number"
                    v-model.number="prices.japan.shared"
                    @blur="updatePrice('japan', 'shared')"
                    class="price-input"
                  />
                </div>
              </div>
              <el-button type="primary" size="small" @click="resetPrice('japan', 'shared')">
                重置为默认
              </el-button>
            </div>
          </el-col>

          <!-- 日本原生IP -->
          <el-col :span="6">
            <div class="product-card">
              <div class="product-header">
                <img src="/flags/1x1/jp.svg" class="flag-large" />
                <div class="product-title">
                  <h3>日本</h3>
                  <span class="product-type native">原生IP</span>
                </div>
              </div>
              <div class="product-price">
                <div class="price-label">30天价格</div>
                <div class="price-value">
                  $<input
                    type="number"
                    v-model.number="prices.japan.native"
                    @blur="updatePrice('japan', 'native')"
                    class="price-input"
                  />
                </div>
              </div>
              <el-button type="primary" size="small" @click="resetPrice('japan', 'native')">
                重置为默认
              </el-button>
            </div>
          </el-col>

          <!-- 新加坡普通IP -->
          <el-col :span="6">
            <div class="product-card">
              <div class="product-header">
                <img src="/flags/1x1/sg.svg" class="flag-large" />
                <div class="product-title">
                  <h3>新加坡</h3>
                  <span class="product-type">普通IP</span>
                </div>
              </div>
              <div class="product-price">
                <div class="price-label">30天价格</div>
                <div class="price-value">
                  $<input
                    type="number"
                    v-model.number="prices.singapore.shared"
                    @blur="updatePrice('singapore', 'shared')"
                    class="price-input"
                  />
                </div>
              </div>
              <el-button type="primary" size="small" @click="resetPrice('singapore', 'shared')">
                重置为默认
              </el-button>
            </div>
          </el-col>

          <!-- 新加坡原生IP -->
          <el-col :span="6">
            <div class="product-card">
              <div class="product-header">
                <img src="/flags/1x1/sg.svg" class="flag-large" />
                <div class="product-title">
                  <h3>新加坡</h3>
                  <span class="product-type native">原生IP</span>
                </div>
              </div>
              <div class="product-price">
                <div class="price-label">30天价格</div>
                <div class="price-value">
                  $<input
                    type="number"
                    v-model.number="prices.singapore.native"
                    @blur="updatePrice('singapore', 'native')"
                    class="price-input"
                  />
                </div>
              </div>
              <el-button type="primary" size="small" @click="resetPrice('singapore', 'native')">
                重置为默认
              </el-button>
            </div>
          </el-col>

          <!-- 默认价格 -->
          <el-col :span="6">
            <div class="product-card default">
              <div class="product-header">
                <el-icon :size="48" color="#909399"><Setting /></el-icon>
                <div class="product-title">
                  <h3>默认价格</h3>
                  <span class="product-type">其他国家</span>
                </div>
              </div>
              <div class="product-price">
                <div class="price-label">普通IP (30天)</div>
                <div class="price-value">$5.00</div>
              </div>
              <div class="product-price">
                <div class="price-label">原生IP (30天)</div>
                <div class="price-value">$8.00</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 价格覆盖历史列表 -->
      <el-divider />
      <h3>价格覆盖历史</h3>

      <el-table :data="overrideList" v-loading="loading" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="60" />

        <el-table-column label="国家" width="150">
          <template #default="{ row }">
            <img :src="`/flags/1x1/${row.countryCode.toLowerCase()}.svg`" class="flag-icon" />
            {{ row.country }}
          </template>
        </el-table-column>

        <el-table-column label="IP类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.ipType === 'native' ? 'success' : ''">
              {{ row.ipType === 'native' ? '原生IP' : '普通IP' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="30天价格" width="120">
          <template #default="{ row }">
            <span class="price-display">${{ row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>

        <el-table-column label="更新人" width="150">
          <template #default="{ row }">
            {{ row.updatedBy || 'Admin' }}
          </template>
        </el-table-column>

        <el-table-column label="备注" min-width="200">
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="deleteOverride(row)">
              删除
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

    <!-- 新增价格覆盖对话框 -->
    <el-dialog v-model="addDialogVisible" title="新增价格覆盖" width="500px">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="国家" prop="country">
          <el-select v-model="addForm.country" placeholder="选择国家" filterable>
            <el-option label="韩国" value="korea" />
            <el-option label="日本" value="japan" />
            <el-option label="新加坡" value="singapore" />
            <el-option label="美国" value="us" />
            <el-option label="英国" value="uk" />
            <el-option label="德国" value="germany" />
          </el-select>
        </el-form-item>

        <el-form-item label="IP类型" prop="ipType">
          <el-radio-group v-model="addForm.ipType">
            <el-radio label="shared">普通IP</el-radio>
            <el-radio label="native">原生IP</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="30天价格" prop="price">
          <el-input-number v-model="addForm.price" :min="1" :max="1000" :precision="2" />
          <span style="margin-left: 10px">USD</span>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="addForm.remark"
            type="textarea"
            :rows="3"
            placeholder="备注说明（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdd" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { Plus, Setting } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

// 价格数据
const prices = ref({
  korea: {
    shared: 5.0,
    native: 8.0,
  },
  japan: {
    shared: 5.0,
    native: 8.0,
  },
  singapore: {
    shared: 5.0,
    native: 8.0,
  },
});

// 默认价格
const defaultPrices = {
  shared: 5.0,
  native: 8.0,
};

const overrideList = ref<any[]>([]);
const loading = ref(false);

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 新增对话框
const addDialogVisible = ref(false);
const addFormRef = ref<FormInstance>();
const submitting = ref(false);

const addForm = ref({
  country: '',
  ipType: 'shared',
  price: 5.0,
  remark: '',
});

const addRules = {
  country: [{ required: true, message: '请选择国家', trigger: 'change' }],
  ipType: [{ required: true, message: '请选择IP类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock数据 - 实际应该调用API
    const mockData = [
      {
        id: 1,
        country: '韩国',
        countryCode: 'KR',
        ipType: 'native',
        price: 8.0,
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedBy: 'Admin',
        remark: '热门国家原生IP',
      },
      {
        id: 2,
        country: '日本',
        countryCode: 'JP',
        ipType: 'native',
        price: 8.0,
        updatedAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
        updatedBy: 'Admin',
        remark: '热门国家原生IP',
      },
      {
        id: 3,
        country: '新加坡',
        countryCode: 'SG',
        ipType: 'native',
        price: 8.0,
        updatedAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
        updatedBy: 'Admin',
        remark: '热门国家原生IP',
      },
    ];

    overrideList.value = mockData;
    pagination.value.total = mockData.length;
  } catch (error: any) {
    ElMessage.error('加载失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

// 更新价格
const updatePrice = async (country: string, ipType: string) => {
  const price = (prices.value as any)[country][ipType];

  try {
    // TODO: 调用API更新价格
    await new Promise((resolve) => setTimeout(resolve, 300));

    ElMessage.success(`${getCountryName(country)}${ipType === 'native' ? '原生' : '普通'}IP价格已更新为$${price.toFixed(2)}`);
    loadData();
  } catch (error: any) {
    ElMessage.error('更新失败：' + error.message);
  }
};

// 重置价格
const resetPrice = async (country: string, ipType: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置${getCountryName(country)}${ipType === 'native' ? '原生' : '普通'}IP价格为默认值吗？`,
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    (prices.value as any)[country][ipType] = (defaultPrices as any)[ipType];

    // TODO: 调用API删除价格覆盖
    await new Promise((resolve) => setTimeout(resolve, 300));

    ElMessage.success('价格已重置为默认值');
    loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('重置失败：' + error.message);
    }
  }
};

// 显示新增对话框
const showAddDialog = () => {
  addForm.value = {
    country: '',
    ipType: 'shared',
    price: 5.0,
    remark: '',
  };
  addDialogVisible.value = true;
};

// 确认新增
const confirmAdd = async () => {
  if (!addFormRef.value) return;

  await addFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true;

        // TODO: 调用API新增价格覆盖
        await new Promise((resolve) => setTimeout(resolve, 500));

        ElMessage.success('新增成功！');
        addDialogVisible.value = false;
        loadData();
      } catch (error: any) {
        ElMessage.error('新增失败：' + error.message);
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 删除覆盖
const deleteOverride = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除${row.country}${row.ipType === 'native' ? '原生' : '普通'}IP的价格覆盖吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // TODO: 调用API删除
    await new Promise((resolve) => setTimeout(resolve, 300));

    ElMessage.success('删除成功！');
    loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message);
    }
  }
};

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 获取国家名称
const getCountryName = (country: string) => {
  const nameMap: Record<string, string> = {
    korea: '韩国',
    japan: '日本',
    singapore: '新加坡',
    us: '美国',
    uk: '英国',
    germany: '德国',
  };
  return nameMap[country] || country;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.price-override-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .price-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      color: #303133;
    }

    .product-cards {
      margin-bottom: 30px;

      .product-card {
        padding: 24px;
        background: #fff;
        border: 2px solid #e4e7ed;
        border-radius: 12px;
        transition: all 0.3s;
        margin-bottom: 20px;

        &:hover {
          border-color: #409eff;
          box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
        }

        &.default {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: #fff;

          .product-title h3,
          .product-type,
          .price-label,
          .price-value {
            color: #fff;
          }
        }

        .product-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;

          .flag-large {
            width: 48px;
            height: 48px;
            margin-right: 12px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .product-title {
            h3 {
              margin: 0;
              font-size: 18px;
              font-weight: 600;
              color: #303133;
            }

            .product-type {
              display: inline-block;
              padding: 2px 8px;
              background: #e4e7ed;
              color: #606266;
              border-radius: 4px;
              font-size: 12px;
              margin-top: 4px;

              &.native {
                background: #67c23a;
                color: #fff;
              }
            }
          }
        }

        .product-price {
          margin-bottom: 16px;

          .price-label {
            font-size: 12px;
            color: #909399;
            margin-bottom: 4px;
          }

          .price-value {
            font-size: 24px;
            font-weight: 600;
            color: #409eff;
            display: flex;
            align-items: baseline;

            .price-input {
              width: 80px;
              font-size: 24px;
              font-weight: 600;
              color: #409eff;
              border: none;
              border-bottom: 2px solid #dcdfe6;
              outline: none;
              text-align: right;
              padding: 0 4px;

              &:focus {
                border-bottom-color: #409eff;
              }

              /* 移除number input的箭头 */
              &::-webkit-inner-spin-button,
              &::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }
            }
          }
        }
      }
    }

    .flag-icon {
      width: 24px;
      height: 24px;
      margin-right: 8px;
      vertical-align: middle;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .price-display {
      color: #409eff;
      font-weight: 600;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>

