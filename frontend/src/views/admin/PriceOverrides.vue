<template>
  <div class="price-overrides-container">
    <h1>价格覆盖管理</h1>

    <el-card shadow="hover" class="overrides-card">
      <template #header>
        <div class="card-header">
          <span>国家/城市级别价格设置</span>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>
            新增价格覆盖
          </el-button>
        </div>
      </template>

      <!-- 筛选 -->
      <div class="filter-section">
        <el-row :gutter="15">
          <el-col :span="6">
            <el-select v-model="filters.productType" placeholder="产品类型" clearable @change="loadData">
              <el-option label="全部" value="" />
              <el-option label="普通IP" value="static_shared" />
              <el-option label="原生IP" value="static_premium" />
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

      <!-- 覆盖价格列表 -->
      <el-table :data="overrideList" v-loading="loading" style="width: 100%">
        <el-table-column label="ID" prop="id" width="80" />
        
        <el-table-column label="产品类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getProductTypeTag(row.priceConfigId)">
              {{ getProductTypeName(row.priceConfigId) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="国家代码" prop="countryCode" width="100">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img :src="getFlagUrl(row.countryCode)" style="width: 24px; height: 18px; border-radius: 2px;" />
              {{ row.countryCode }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="城市" width="150">
          <template #default="{ row }">
            {{ row.cityName || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="覆盖价格" width="120">
          <template #default="{ row }">
            <el-text type="success" style="font-size: 16px; font-weight: 600">
              ${{ parseFloat(row.overridePrice).toFixed(2) }}/月
            </el-text>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openEditDialog(row)">
              编辑
            </el-button>
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

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增价格覆盖' : '编辑价格覆盖'"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="产品类型" prop="productType">
          <el-select v-model="form.productType" placeholder="请选择产品类型" :disabled="dialogMode === 'edit'">
            <el-option label="普通IP" value="static_shared" />
            <el-option label="原生IP" value="static_premium" />
          </el-select>
        </el-form-item>

        <el-form-item label="国家代码" prop="countryCode">
          <el-input v-model="form.countryCode" placeholder="如：US, JP, KR" :disabled="dialogMode === 'edit'" maxlength="2" />
          <div class="form-tip">ISO 3166-1 alpha-2 两位国家代码（大写）</div>
        </el-form-item>

        <el-form-item label="城市名称">
          <el-input v-model="form.cityName" placeholder="可选，如：Tokyo, Seoul" :disabled="dialogMode === 'edit'" />
          <div class="form-tip">留空则为国家级覆盖，填写则为城市级覆盖</div>
        </el-form-item>

        <el-form-item label="覆盖价格" prop="overridePrice">
          <el-input-number
            v-model="form.overridePrice"
            :min="0"
            :step="0.5"
            :precision="2"
          />
          <span class="unit">USD/月</span>
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="form.isActive" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ dialogMode === 'create' ? '创建' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, Refresh } from '@element-plus/icons-vue';
import request from '@/api/request';

// 数据
const overrideList = ref<any[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const submitting = ref(false);
const priceConfigs = ref<any[]>([]);

// 分页
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 筛选
const filters = ref({
  productType: '',
});

// 表单
const form = ref({
  id: 0,
  productType: 'static_shared',
  countryCode: '',
  cityName: '',
  overridePrice: 10,
  isActive: true,
});

const formRef = ref();

const rules = {
  productType: [{ required: true, message: '请选择产品类型', trigger: 'change' }],
  countryCode: [
    { required: true, message: '请输入国家代码', trigger: 'blur' },
    { pattern: /^[A-Z]{2}$/, message: '国家代码必须是2位大写字母', trigger: 'blur' },
  ],
  overridePrice: [{ required: true, message: '请输入价格', trigger: 'blur' }],
};

// 获取国旗URL
const getFlagUrl = (code: string) => {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};

// 获取产品类型名称
const getProductTypeName = (priceConfigId: number) => {
  const config = priceConfigs.value.find((c) => c.id === priceConfigId);
  if (!config) return '未知';
  return config.productType === 'static_premium' ? '原生IP' : '普通IP';
};

// 获取产品类型标签颜色
const getProductTypeTag = (priceConfigId: number) => {
  const config = priceConfigs.value.find((c) => c.id === priceConfigId);
  if (!config) return '';
  return config.productType === 'static_premium' ? 'warning' : 'primary';
};

// 加载价格配置
const loadPriceConfigs = async () => {
  try {
    const response = await request.get('/price/configs');
    priceConfigs.value = response.data || [];
  } catch (error: any) {
    console.error('Failed to load price configs:', error);
  }
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (filters.value.productType) {
      params.productType = filters.value.productType;
    }

    const response = await request.get('/price/overrides', { params });
    const list = response.data || [];
    
    // 分页处理
    pagination.value.total = list.length;
    const start = (pagination.value.page - 1) * pagination.value.pageSize;
    const end = start + pagination.value.pageSize;
    overrideList.value = list.slice(start, end);
  } catch (error: any) {
    ElMessage.error('加载失败：' + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
  }
};

// 重置筛选
const resetFilters = () => {
  filters.value.productType = '';
  pagination.value.page = 1;
  loadData();
};

// 打开创建对话框
const openCreateDialog = () => {
  dialogMode.value = 'create';
  form.value = {
    id: 0,
    productType: 'static_shared',
    countryCode: '',
    cityName: '',
    overridePrice: 10,
    isActive: true,
  };
  dialogVisible.value = true;
};

// 打开编辑对话框
const openEditDialog = (row: any) => {
  dialogMode.value = 'edit';
  const config = priceConfigs.value.find((c) => c.id === row.priceConfigId);
  form.value = {
    id: row.id,
    productType: config?.productType || 'static_shared',
    countryCode: row.countryCode,
    cityName: row.cityName || '',
    overridePrice: parseFloat(row.overridePrice),
    isActive: row.isActive,
  };
  dialogVisible.value = true;
};

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    if (dialogMode.value === 'create') {
      await request.post('/price/overrides', form.value);
      ElMessage.success('创建成功');
    } else {
      await request.put(`/price/overrides/${form.value.id}`, {
        overridePrice: form.value.overridePrice,
        isActive: form.value.isActive,
      });
      ElMessage.success('更新成功');
    }

    dialogVisible.value = false;
    loadData();
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '操作失败');
  } finally {
    submitting.value = false;
  }
};

// 删除
const deleteOverride = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确认删除 ${row.countryCode}${row.cityName ? '/' + row.cityName : ''} 的价格覆盖？`,
      '确认删除',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await request.delete(`/price/overrides/${row.id}`);
    ElMessage.success('删除成功');
    loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + (error.response?.data?.message || error.message));
    }
  }
};

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

onMounted(() => {
  loadPriceConfigs();
  loadData();
});
</script>

<style scoped lang="scss">
.price-overrides-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .overrides-card {
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
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }

  .unit {
    margin-left: 10px;
    color: #909399;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
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

