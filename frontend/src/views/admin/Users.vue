<template>
  <div class="admin-users-container">
    <h1>用户管理</h1>

    <el-card shadow="hover" class="users-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-tag type="info">总用户数：{{ pagination.total }}</el-tag>
        </div>
      </template>

      <!-- 筛选 -->
      <div class="filter-section">
        <el-row :gutter="15">
          <el-col :span="6">
            <el-input v-model="filters.email" placeholder="用户邮箱" clearable>
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>

          <el-col :span="4">
            <el-select v-model="filters.role" placeholder="角色" clearable>
              <el-option label="全部" value="" />
              <el-option label="普通用户" value="user" />
              <el-option label="管理员" value="admin" />
            </el-select>
          </el-col>

          <el-col :span="4">
            <el-select v-model="filters.status" placeholder="状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="正常" value="active" />
              <el-option label="禁用" value="disabled" />
            </el-select>
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

      <!-- 用户列表 -->
      <el-table :data="userList" v-loading="loading" style="width: 100%">
        <el-table-column label="用户ID" width="80" prop="id" />

        <el-table-column label="邮箱" width="200">
          <template #default="{ row }">
            <el-text type="primary">{{ row.email }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="昵称" width="120" prop="nickname" />

        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'success'">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="账户余额" width="120">
          <template #default="{ row }">
            <el-text type="success">${{ parseFloat(row.balance || 0).toFixed(2) }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="赠送余额" width="120">
          <template #default="{ row }">
            <el-text type="info">${{ parseFloat(row.gift_balance || 0).toFixed(2) }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="350" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.role !== 'admin'"
              type="primary"
              size="small"
              @click="handleSetAdmin(row)"
            >
              设为管理员
            </el-button>
            <el-button
              v-if="row.role === 'admin'"
              type="warning"
              size="small"
              @click="handleRemoveAdmin(row)"
            >
              取消管理员
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="handleGiftBalance(row)"
            >
              赠送余额
            </el-button>
            <el-button
              :type="row.status === 'active' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="viewUserDetail(row)"
            >
              详情
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

    <!-- 赠送余额对话框 -->
    <el-dialog v-model="giftDialogVisible" title="赠送余额" width="500px">
      <el-form :model="giftForm" label-width="100px">
        <el-form-item label="用户邮箱">
          <el-input v-model="giftForm.userEmail" disabled />
        </el-form-item>
        <el-form-item label="当前余额">
          <el-text type="success">${{ parseFloat(giftForm.currentBalance || 0).toFixed(2) }}</el-text>
        </el-form-item>
        <el-form-item label="当前赠送余额">
          <el-text type="info">${{ parseFloat(giftForm.currentGiftBalance || 0).toFixed(2) }}</el-text>
        </el-form-item>
        <el-form-item label="赠送金额" required>
          <el-input-number
            v-model="giftForm.amount"
            :min="0.01"
            :max="10000"
            :precision="2"
            :step="1"
            placeholder="输入赠送金额"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="giftForm.remark"
            type="textarea"
            :rows="3"
            placeholder="赠送理由（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="giftDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="gifting" @click="confirmGift">
          确认赠送
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { getAllUsers, updateUserRole, updateUserStatus } from '@/api/modules/admin';

const filters = ref({
  email: '',
  role: '',
  status: '',
});

const userList = ref<any[]>([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
});

// 赠送余额对话框
const giftDialogVisible = ref(false);
const gifting = ref(false);
const giftForm = ref({
  userId: '',
  userEmail: '',
  currentBalance: 0,
  currentGiftBalance: 0,
  amount: 1,
  remark: '',
});

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.pageSize,
      email: filters.value.email || undefined,
      role: filters.value.role || undefined,
      status: filters.value.status || undefined,
    };

    // 调用真实API
    const response = await getAllUsers(params);
    userList.value = response.data || response.list || [];
    pagination.value.total = response.total || userList.value.length;
  } catch (error: any) {
    console.error('[AdminUsers] 加载失败:', error);
    ElMessage.error('加载失败：' + (error.message || '未知错误'));
    userList.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    email: '',
    role: '',
    status: '',
  };
  loadData();
};

const handleSetAdmin = async (user: any) => {
  try {
    await ElMessageBox.confirm(
      `确认将 ${user.email} 设为管理员吗？`,
      '确认操作',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 调用API更新角色
    await updateUserRole(user.id, 'admin');

    ElMessage.success('角色更新成功');
    // 刷新用户列表
    await loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败：' + (error.message || '未知错误'));
    }
  }
};

const handleRemoveAdmin = async (user: any) => {
  try {
    await ElMessageBox.confirm(
      `确认将 ${user.email} 取消管理员权限吗？`,
      '确认操作',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 调用API更新角色为普通用户
    await updateUserRole(user.id, 'user');

    ElMessage.success('已取消管理员权限');
    // 刷新用户列表
    await loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败：' + (error.message || '未知错误'));
    }
  }
};

const handleToggleStatus = async (user: any) => {
  const action = user.status === 'active' ? '禁用' : '启用';
  const newStatus = user.status === 'active' ? 'disabled' : 'active';
  
  try {
    await ElMessageBox.confirm(
      `确认${action}用户 ${user.email} 吗？`,
      '确认操作',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 调用API更新状态
    await updateUserStatus(user.id, newStatus);

    ElMessage.success(`${action}成功`);
    // 刷新用户列表
    await loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败：' + (error.message || '未知错误'));
    }
  }
};

const handleGiftBalance = (user: any) => {
  giftForm.value = {
    userId: user.id,
    userEmail: user.email,
    currentBalance: parseFloat(user.balance || 0),
    currentGiftBalance: parseFloat(user.gift_balance || 0),
    amount: 1,
    remark: '',
  };
  giftDialogVisible.value = true;
};

const confirmGift = async () => {
  if (!giftForm.value.amount || giftForm.value.amount <= 0) {
    ElMessage.warning('请输入有效的赠送金额');
    return;
  }

  gifting.value = true;
  try {
    // 调用后端API赠送余额
    const response = await fetch('/api/v1/admin/users/' + giftForm.value.userId + '/gift-balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        amount: giftForm.value.amount,
        remark: giftForm.value.remark,
      }),
    });

    if (!response.ok) {
      throw new Error('赠送失败');
    }

    ElMessage.success(`成功赠送 $${giftForm.value.amount.toFixed(2)} 给 ${giftForm.value.userEmail}`);
    giftDialogVisible.value = false;
    await loadData(); // 刷新用户列表
  } catch (error: any) {
    ElMessage.error('赠送失败：' + (error.message || '未知错误'));
  } finally {
    gifting.value = false;
  }
};

const viewUserDetail = (user: any) => {
  ElMessageBox.alert(
    `
    用户ID：${user.id}
    邮箱：${user.email}
    昵称：${user.nickname}
    角色：${user.role === 'admin' ? '管理员' : '普通用户'}
    账户余额：$${parseFloat(user.balance || 0).toFixed(2)}
    赠送余额：$${parseFloat(user.gift_balance || 0).toFixed(2)}
    状态：${user.status === 'active' ? '正常' : '禁用'}
    注册时间：${user.createdAt}
    `,
    '用户详情',
    {
      confirmButtonText: '关闭',
      customStyle: { whiteSpace: 'pre-line' },
    }
  );
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.admin-users-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .users-card {
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

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

:deep(.el-card) {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
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
