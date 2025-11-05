<template>
  <div class="dynamic-channels-container">
    <h1>动态住宅管理</h1>

    <!-- 顶部操作栏 -->
    <el-card shadow="hover" class="toolbar-card">
      <el-row :gutter="15" justify="space-between" align="middle">
        <el-col :span="12">
          <el-button
            type="primary"
            size="large"
            @click="showCreateDialog"
            :icon="Plus"
          >
            添加通道
          </el-button>
        </el-col>
        <el-col :span="12" style="text-align: right;">
          <el-input
            v-model="filters.channelName"
            placeholder="搜索通道名"
            style="width: 200px; margin-right: 10px;"
            clearable
            @clear="loadData"
            @keyup.enter="loadData"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            v-model="filters.status"
            placeholder="状态筛选"
            style="width: 120px; margin-right: 10px;"
            clearable
            @change="loadData"
          >
            <el-option label="全部" value="" />
            <el-option label="运行中" value="active" />
            <el-option label="已暂停" value="paused" />
          </el-select>
          <el-button @click="loadData" :icon="Refresh">刷新</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 通道列表表格 -->
    <el-card shadow="hover" class="table-card">
      <el-table
        :data="channelList"
        v-loading="loading"
        stripe
        style="width: 100%"
        :default-sort="{ prop: 'createdAt', order: 'descending' }"
      >
        <el-table-column label="通道名" prop="channelName" min-width="150" fixed>
          <template #default="{ row }">
            <div class="channel-name">
              <el-icon :size="18" style="margin-right: 6px; color: #409eff;">
                <Connection />
              </el-icon>
              <span style="font-weight: 600;">{{ row.channelName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="费用" prop="pricePerGb" width="100" align="center">
          <template #default="{ row }">
            <el-text type="warning" style="font-weight: 600;">
              ${{ parseFloat(row.pricePerGb).toFixed(2) }}/GB
            </el-text>
          </template>
        </el-table-column>

        <el-table-column label="限制" prop="concurrentLimit" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="large">
              {{ row.concurrentLimit }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="流量" prop="totalTraffic" width="120" align="center">
          <template #default="{ row }">
            <span style="font-weight: 500; color: #67c23a;">
              {{ parseFloat(row.totalTraffic).toFixed(3) }} GB
            </span>
          </template>
        </el-table-column>

        <el-table-column label="花费" prop="totalCost" width="100" align="center">
          <template #default="{ row }">
            <el-text type="danger" style="font-weight: 600;">
              ${{ parseFloat(row.totalCost).toFixed(2) }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column label="备注" prop="remark" min-width="150">
          <template #default="{ row }">
            <el-tooltip :content="row.remark || '无备注'" placement="top">
              <span class="remark-text">{{ row.remark || '-' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'active' ? 'success' : 'info'"
              size="large"
              effect="dark"
            >
              {{ row.status === 'active' ? '运行中' : '已暂停' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" prop="createdAt" width="160" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEdit(row)"
              :icon="Edit"
            >
              编辑
            </el-button>
            <el-button
              :type="row.status === 'active' ? 'warning' : 'success'"
              size="small"
              link
              @click="handleToggleStatus(row)"
              :icon="row.status === 'active' ? VideoPause : VideoPlay"
            >
              {{ row.status === 'active' ? '暂停' : '启动' }}
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDelete(row)"
              :icon="Delete"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 底部统计 -->
    <el-card shadow="hover" class="statistics-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-item">
            <el-icon :size="24" color="#409eff"><Connection /></el-icon>
            <div class="stat-content">
              <div class="stat-label">总通道数</div>
              <div class="stat-value">{{ statistics.totalChannels }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <el-icon :size="24" color="#67c23a"><DataLine /></el-icon>
            <div class="stat-content">
              <div class="stat-label">总流量</div>
              <div class="stat-value">{{ statistics.totalTraffic.toFixed(3) }} GB</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <el-icon :size="24" color="#f56c6c"><Money /></el-icon>
            <div class="stat-content">
              <div class="stat-label">总金额</div>
              <div class="stat-value">${{ statistics.totalCost.toFixed(2) }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 添加/编辑通道对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑通道' : '添加通道'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="通道名" prop="channelName">
          <el-input
            v-model="formData.channelName"
            placeholder="请输入通道名"
            clearable
          />
        </el-form-item>

        <el-form-item label="流量单价" prop="pricePerGb">
          <el-input-number
            v-model="formData.pricePerGb"
            :min="0"
            :step="0.1"
            :precision="2"
            style="width: 100%;"
          />
          <span style="margin-left: 8px; color: #909399;">$/GB</span>
        </el-form-item>

        <el-form-item label="并发限制" prop="concurrentLimit">
          <el-input-number
            v-model="formData.concurrentLimit"
            :min="1"
            :step="100"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">运行中</el-radio>
            <el-radio label="paused">暂停</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import {
  Plus,
  Search,
  Refresh,
  Edit,
  Delete,
  VideoPause,
  VideoPlay,
  Connection,
  DataLine,
  Money,
} from '@element-plus/icons-vue';
import * as dynamicApi from '@/api/modules/dynamic';

// 通道列表
const channelList = ref<any[]>([]);
const loading = ref(false);

// 筛选条件
const filters = reactive({
  channelName: '',
  status: '',
});

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
});

// 统计数据
const statistics = ref({
  totalChannels: 0,
  totalTraffic: 0,
  totalCost: 0,
});

// 对话框
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentEditId = ref<number | null>(null);
const submitting = ref(false);

// 表单
const formRef = ref<FormInstance>();
const formData = reactive({
  channelName: '',
  pricePerGb: 4.5,
  concurrentLimit: 1000,
  status: 'active',
  remark: '',
});

// 表单验证规则
const formRules: FormRules = {
  channelName: [{ required: true, message: '请输入通道名', trigger: 'blur' }],
  pricePerGb: [{ required: true, message: '请输入流量单价', trigger: 'blur' }],
  concurrentLimit: [{ required: true, message: '请输入并发限制', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 加载通道列表
const loadData = async () => {
  loading.value = true;
  try {
    const response = await dynamicApi.getChannels({
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });

    channelList.value = response.data || [];
    pagination.total = response.total || 0;

    // 加载统计数据
    await loadStatistics();
  } catch (error: any) {
    ElMessage.error('加载失败：' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await dynamicApi.getChannelStatistics();
    statistics.value = response;
  } catch (error: any) {
    console.error('加载统计数据失败:', error);
  }
};

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false;
  currentEditId.value = null;
  Object.assign(formData, {
    channelName: '',
    pricePerGb: 4.5,
    concurrentLimit: 1000,
    status: 'active',
    remark: '',
  });
  dialogVisible.value = true;
};

// 编辑通道
const handleEdit = (row: any) => {
  isEdit.value = true;
  currentEditId.value = row.id;
  Object.assign(formData, {
    channelName: row.channelName,
    pricePerGb: parseFloat(row.pricePerGb),
    concurrentLimit: row.concurrentLimit,
    status: row.status,
    remark: row.remark || '',
  });
  dialogVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    submitting.value = true;
    try {
      if (isEdit.value && currentEditId.value) {
        // 更新
        await dynamicApi.updateChannel(currentEditId.value, formData);
        ElMessage.success('更新成功');
      } else {
        // 创建
        await dynamicApi.createChannel(formData);
        ElMessage.success('创建成功');
      }

      dialogVisible.value = false;
      await loadData();
    } catch (error: any) {
      ElMessage.error('操作失败：' + (error.message || '未知错误'));
    } finally {
      submitting.value = false;
    }
  });
};

// 切换状态
const handleToggleStatus = async (row: any) => {
  try {
    await dynamicApi.toggleChannelStatus(row.id);
    const newStatus = row.status === 'active' ? 'paused' : 'active';
    ElMessage.success(`已${newStatus === 'active' ? '启动' : '暂停'}通道`);
    await loadData();
  } catch (error: any) {
    ElMessage.error('操作失败：' + (error.message || '未知错误'));
  }
};

// 删除通道
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除通道 "${row.channelName}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await dynamicApi.deleteChannel(row.id);
    ElMessage.success('删除成功');
    await loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'));
    }
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.dynamic-channels-container {
  padding: 20px;

  h1 {
    margin: 0 0 24px 0;
    color: #303133;
    font-size: 26px;
    font-weight: 600;
  }

  .toolbar-card {
    margin-bottom: 20px;
    border-radius: 12px;

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .table-card {
    margin-bottom: 20px;
    border-radius: 12px;

    .channel-name {
      display: flex;
      align-items: center;
    }

    .remark-text {
      display: inline-block;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #606266;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .statistics-card {
    border-radius: 12px;

    :deep(.el-card__body) {
      padding: 24px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
      border-radius: 8px;

      .stat-content {
        flex: 1;

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 6px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #303133;
        }
      }
    }
  }
}

// Element Plus 样式覆盖
:deep(.el-card) {
  background-color: #ffffff;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
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
</style>


