<template>
  <div class="admin-users-container">
    <h1>用户管理</h1>

    <!-- 筛选 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true">
        <el-form-item label="角色">
          <el-select v-model="filters.role" placeholder="全部" clearable>
            <el-option label="普通用户" value="user" />
            <el-option label="代理商" value="agent" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="活跃" value="active" />
            <el-option label="未激活" value="inactive" />
            <el-option label="已封禁" value="banned" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadUsers">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card shadow="hover" class="table-card">
      <el-table :data="users" v-loading="loading" style="width: 100%" stripe>
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.role === 'admin'" type="danger">管理员</el-tag>
            <el-tag v-else-if="row.role === 'agent'" type="warning">代理商</el-tag>
            <el-tag v-else type="success">普通用户</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success">活跃</el-tag>
            <el-tag v-else-if="row.status === 'inactive'" type="info">未激活</el-tag>
            <el-tag v-else type="danger">已封禁</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="余额" width="120">
          <template #default="{ row }">
            ${{ row.balance }}
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="handleEditUser(row)">
              编辑
            </el-button>
            <el-button
              text
              :type="row.status === 'banned' ? 'success' : 'danger'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'banned' ? '解禁' : '封禁' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadUsers"
          @current-change="loadUsers"
        />
      </div>
    </el-card>

    <!-- 编辑用户对话框 -->
    <el-dialog v-model="editDialog.visible" title="编辑用户" width="500px">
      <el-form :model="editDialog.form" label-width="80px">
        <el-form-item label="角色">
          <el-select v-model="editDialog.form.role">
            <el-option label="普通用户" value="user" />
            <el-option label="代理商" value="agent" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editDialog.form.status">
            <el-option label="活跃" value="active" />
            <el-option label="未激活" value="inactive" />
            <el-option label="已封禁" value="banned" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getAllUsers, updateUserRole, updateUserStatus } from '@/api/modules/admin';
import { ElMessage, ElMessageBox } from 'element-plus';

const users = ref<any[]>([]);
const loading = ref(false);

const filters = reactive({
  role: '',
  status: '',
});

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
});

const editDialog = reactive({
  visible: false,
  userId: '',
  form: {
    role: '',
    status: '',
  },
});

const loadUsers = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
    };
    const res = await getAllUsers(params);
    if (res.data) {
      users.value = res.data.data;
      pagination.total = res.data.total;
    }
  } catch (error) {
    console.error('Failed to load users:', error);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.role = '';
  filters.status = '';
  pagination.page = 1;
  loadUsers();
};

const handleEditUser = (row: any) => {
  editDialog.userId = row.id;
  editDialog.form.role = row.role;
  editDialog.form.status = row.status;
  editDialog.visible = true;
};

const handleSaveUser = async () => {
  try {
    await updateUserRole(editDialog.userId, editDialog.form.role);
    await updateUserStatus(editDialog.userId, editDialog.form.status);
    ElMessage.success('用户信息已更新');
    editDialog.visible = false;
    loadUsers();
  } catch (error) {
    console.error('Failed to update user:', error);
  }
};

const handleToggleStatus = async (row: any) => {
  const newStatus = row.status === 'banned' ? 'active' : 'banned';
  const action = newStatus === 'banned' ? '封禁' : '解禁';

  try {
    await ElMessageBox.confirm(`确认${action}用户 ${row.email}？`, '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await updateUserStatus(row.id, newStatus);
    ElMessage.success(`用户已${action}`);
    loadUsers();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to toggle status:', error);
    }
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped lang="scss">
.admin-users-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .table-card {
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>

