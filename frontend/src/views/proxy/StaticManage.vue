<template>
  <div class="static-manage-container">
    <div class="header-section">
      <h1>静态代理IP管理</h1>
      <el-button type="primary" @click="$router.push('/proxy/static/buy')">
        <el-icon><Plus /></el-icon>
        购买新IP
      </el-button>
    </div>

    <!-- 筛选 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="活跃" value="active" />
            <el-option label="已过期" value="expired" />
            <el-option label="已释放" value="released" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadProxies">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 代理列表 -->
    <el-card shadow="hover" class="table-card">
      <el-table
        :data="proxies"
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="port" label="端口" width="100" />
        <el-table-column label="国家/城市" width="150">
          <template #default="{ row }">
            <flag-icon :country-code="row.countryCode" />
            {{ row.countryCode }} / {{ row.cityName }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="password" label="密码" width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success">活跃</el-tag>
            <el-tag v-else-if="row.status === 'expired'" type="danger">已过期</el-tag>
            <el-tag v-else type="info">已释放</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="过期时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.expireTimeUtc) }}
          </template>
        </el-table-column>
        <el-table-column label="自动续费" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.auto_renew"
              @change="handleToggleAutoRenew(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="handleEditRemark(row)">
              编辑备注
            </el-button>
            <el-button text type="primary" size="small" @click="handleCopyProxy(row)">
              复制
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
          @size-change="loadProxies"
          @current-change="loadProxies"
        />
      </div>
    </el-card>

    <!-- 编辑备注对话框 -->
    <el-dialog v-model="remarkDialog.visible" title="编辑备注" width="500px">
      <el-input
        v-model="remarkDialog.remark"
        type="textarea"
        :rows="3"
        placeholder="请输入备注信息"
      />
      <template #footer>
        <el-button @click="remarkDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRemark">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getStaticProxyList, toggleAutoRenew, updateProxyRemark } from '@/api/modules/proxy';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import FlagIcon from '@/components/common/FlagIcon.vue';

const proxies = ref<any[]>([]);
const loading = ref(false);

const filters = reactive({
  status: '',
});

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
});

const remarkDialog = reactive({
  visible: false,
  proxyId: '',
  remark: '',
});

const loadProxies = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
    };
    const res = await getStaticProxyList(params);
    if (res.data) {
      proxies.value = res.data.data;
      pagination.total = res.data.total;
    }
  } catch (error) {
    console.error('Failed to load proxies:', error);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.status = '';
  pagination.page = 1;
  loadProxies();
};

const handleToggleAutoRenew = async (row: any) => {
  try {
    await toggleAutoRenew(row.id);
    ElMessage.success('自动续费设置已更新');
  } catch (error) {
    row.auto_renew = !row.auto_renew; // Rollback on error
    console.error('Failed to toggle auto renew:', error);
  }
};

const handleEditRemark = (row: any) => {
  remarkDialog.proxyId = row.id;
  remarkDialog.remark = row.remark || '';
  remarkDialog.visible = true;
};

const handleSaveRemark = async () => {
  try {
    await updateProxyRemark(remarkDialog.proxyId, remarkDialog.remark);
    ElMessage.success('备注已更新');
    remarkDialog.visible = false;
    loadProxies();
  } catch (error) {
    console.error('Failed to update remark:', error);
  }
};

const handleCopyProxy = (row: any) => {
  const proxyStr = `${row.ip}:${row.port}:${row.username}:${row.password}`;
  navigator.clipboard.writeText(proxyStr).then(() => {
    ElMessage.success('代理信息已复制到剪贴板');
  });
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
};

onMounted(() => {
  loadProxies();
});
</script>

<style scoped lang="scss">
.static-manage-container {
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      margin: 0;
      color: #303133;
    }
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

