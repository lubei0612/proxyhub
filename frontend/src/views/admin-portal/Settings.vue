<template>
  <div class="admin-settings-container">
    <h1>系统设置</h1>

    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>基本设置</span>
        </div>
      </template>

      <el-form :model="form" label-width="150px">
        <el-form-item label="网站标题">
          <el-input v-model="form.siteTitle" placeholder="ProxyHub" />
        </el-form-item>

        <el-form-item label="客服邮箱">
          <el-input v-model="form.supportEmail" placeholder="support@proxyhub.com" />
        </el-form-item>

        <el-form-item label="充值审核开关">
          <el-switch v-model="form.rechargeApproval" />
          <span style="margin-left: 10px; color: #909399; font-size: 12px">
            开启后，充值需要管理员审核
          </span>
        </el-form-item>

        <el-form-item label="新用户注册">
          <el-switch v-model="form.allowRegister" />
          <span style="margin-left: 10px; color: #909399; font-size: 12px">
            是否允许新用户注册
          </span>
        </el-form-item>

        <el-form-item label="代理商佣金率">
          <el-input-number
            v-model="form.agentCommissionRate"
            :min="0"
            :max="100"
            :precision="2"
          />
          <span style="margin-left: 10px">%</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave">
            <el-icon><Check /></el-icon>
            保存设置
          </el-button>
          <el-button @click="loadSettings">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>危险操作</span>
        </div>
      </template>

      <el-alert
        title="警告"
        description="以下操作可能影响系统正常运行，请谨慎操作"
        type="warning"
        show-icon
        :closable="false"
      />

      <div style="margin-top: 20px">
        <el-button type="danger" plain>
          <el-icon><Delete /></el-icon>
          清理过期代理
        </el-button>
        <el-button type="danger" plain>
          <el-icon><Refresh /></el-icon>
          重置系统缓存
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { getSystemSettings, updateSystemSetting } from '@/api/modules/admin';
import { ElMessage } from 'element-plus';
import { Check, Refresh, Delete } from '@element-plus/icons-vue';

const form = reactive({
  siteTitle: 'ProxyHub',
  supportEmail: 'support@proxyhub.com',
  rechargeApproval: true,
  allowRegister: true,
  agentCommissionRate: 5.0,
});

const loadSettings = async () => {
  try {
    const res = await getSystemSettings();
    if (res.data) {
      Object.assign(form, res.data);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
};

const handleSave = async () => {
  try {
    // Save each setting
    for (const [key, value] of Object.entries(form)) {
      await updateSystemSetting(key, String(value));
    }
    ElMessage.success('系统设置已保存');
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped lang="scss">
.admin-settings-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
  }

  .card-header {
    font-weight: bold;
    font-size: 16px;
  }
}
</style>

