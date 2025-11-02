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
            <el-text type="success">${{ row.balance.toFixed(2) }}</el-text>
          </template>
        </el-table-column>

        <el-table-column label="赠送余额" width="120">
          <template #default="{ row }">
            <el-text type="info">${{ row.giftBalance.toFixed(2) }}</el-text>
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

        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.role !== 'admin'"
              type="primary"
              size="small"
              @click="handleUpdateRole(row)"
            >
              设为管理员
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

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

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

const loadData = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockData = [
      {
        id: 1,
        email: 'admin@example.com',
        nickname: '系统管理员',
        role: 'admin',
        balance: 10000,
        giftBalance: 0,
        status: 'active',
        createdAt: '2025-01-01 10:00:00',
      },
      {
        id: 2,
        email: 'user@example.com',
        nickname: '测试用户',
        role: 'user',
        balance: 1000,
        giftBalance: 50,
        status: 'active',
        createdAt: '2025-01-15 14:30:00',
      },
      {
        id: 3,
        email: 'test@example.com',
        nickname: '测试账号',
        role: 'user',
        balance: 500,
        giftBalance: 0,
        status: 'active',
        createdAt: '2025-02-01 09:15:00',
      },
    ];

    userList.value = mockData;
    pagination.value.total = mockData.length;
  } catch (error: any) {
    ElMessage.error('加载失败：' + error.message);
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

const handleUpdateRole = async (user: any) => {
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

    // TODO: 调用API更新角色
    await new Promise((resolve) => setTimeout(resolve, 500));

    ElMessage.success('角色更新成功');
    loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败：' + error.message);
    }
  }
};

const handleToggleStatus = async (user: any) => {
  const action = user.status === 'active' ? '禁用' : '启用';
  
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

    // TODO: 调用API更新状态
    await new Promise((resolve) => setTimeout(resolve, 500));

    ElMessage.success(`${action}成功`);
    loadData();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败：' + error.message);
    }
  }
};

const viewUserDetail = (user: any) => {
  ElMessageBox.alert(
    `
    用户ID：${user.id}
    邮箱：${user.email}
    昵称：${user.nickname}
    角色：${user.role === 'admin' ? '管理员' : '普通用户'}
    账户余额：$${user.balance.toFixed(2)}
    赠送余额：$${user.giftBalance.toFixed(2)}
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
