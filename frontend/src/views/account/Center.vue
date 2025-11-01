<template>
  <div class="account-center-container">
    <h1>账户中心</h1>

    <el-row :gutter="20">
      <!-- 个人信息 -->
      <el-col :span="12">
        <el-card shadow="hover" class="profile-card">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <el-button text type="primary" @click="editProfile">编辑</el-button>
            </div>
          </template>

          <el-descriptions :column="1" border v-if="profile">
            <el-descriptions-item label="邮箱">
              {{ profile.email }}
            </el-descriptions-item>
            <el-descriptions-item label="昵称">
              {{ profile.nickname || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag v-if="profile.role === 'admin'" type="danger">管理员</el-tag>
              <el-tag v-else-if="profile.role === 'agent'" type="warning">代理商</el-tag>
              <el-tag v-else type="success">普通用户</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="余额">
              <span style="color: #67c23a; font-weight: bold; font-size: 18px">
                ${{ profile.balance }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="赠送余额">
              ${{ profile.gift_balance }}
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">
              {{ formatDate(profile.createdAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- API Key -->
      <el-col :span="12">
        <el-card shadow="hover" class="api-key-card">
          <template #header>
            <div class="card-header">
              <span>API Key</span>
            </div>
          </template>

          <div class="api-key-section">
            <el-input
              v-model="apiKey"
              readonly
              placeholder="暂无API Key"
            >
              <template #append>
                <el-button @click="copyApiKey" :disabled="!apiKey">复制</el-button>
              </template>
            </el-input>

            <div class="api-key-actions">
              <el-button type="primary" @click="handleGenerateApiKey" :loading="apiKeyLoading">
                {{ apiKey ? '重新生成' : '生成API Key' }}
              </el-button>
              <el-button @click="$router.push('/docs/api')">查看API文档</el-button>
            </div>

            <el-alert
              title="安全提示"
              type="warning"
              :closable="false"
              show-icon
              class="security-tip"
            >
              请妥善保管您的API Key，不要泄露给他人。如发现泄露，请立即重新生成。
            </el-alert>
          </div>
        </el-card>

        <!-- 修改密码 -->
        <el-card shadow="hover" class="password-card">
          <template #header>
            <div class="card-header">
              <span>修改密码</span>
            </div>
          </template>

          <el-form :model="passwordForm" label-width="100px">
            <el-form-item label="原密码">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                show-password
                placeholder="请输入原密码"
              />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="handleChangePassword"
                :loading="passwordLoading"
              >
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑个人信息对话框 -->
    <el-dialog v-model="editDialog.visible" title="编辑个人信息" width="500px">
      <el-form :model="editDialog.form" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="editDialog.form.nickname" placeholder="请输入昵称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveProfile">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getProfile, updateProfile, changePassword, generateApiKey } from '@/api/modules/user';
import { ElMessage } from 'element-plus';

const profile = ref<any>(null);
const apiKey = ref('');

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const editDialog = reactive({
  visible: false,
  form: {
    nickname: '',
  },
});

const apiKeyLoading = ref(false);
const passwordLoading = ref(false);

const loadProfile = async () => {
  try {
    const res = await getProfile();
    if (res.data) {
      profile.value = res.data;
      apiKey.value = res.data.apiKey || '';
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
};

const editProfile = () => {
  editDialog.form.nickname = profile.value?.nickname || '';
  editDialog.visible = true;
};

const handleSaveProfile = async () => {
  try {
    await updateProfile(editDialog.form);
    ElMessage.success('个人信息已更新');
    editDialog.visible = false;
    loadProfile();
  } catch (error) {
    console.error('Failed to update profile:', error);
  }
};

const handleGenerateApiKey = async () => {
  apiKeyLoading.value = true;
  try {
    const res = await generateApiKey();
    if (res.data) {
      apiKey.value = res.data.apiKey;
      ElMessage.success('API Key已生成');
    }
  } catch (error) {
    console.error('Failed to generate API key:', error);
  } finally {
    apiKeyLoading.value = false;
  }
};

const copyApiKey = () => {
  navigator.clipboard.writeText(apiKey.value).then(() => {
    ElMessage.success('API Key已复制到剪贴板');
  });
};

const handleChangePassword = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致');
    return;
  }

  if (passwordForm.newPassword.length < 6) {
    ElMessage.warning('新密码长度不能少于6位');
    return;
  }

  passwordLoading.value = true;
  try {
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    });
    ElMessage.success('密码修改成功');
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  } catch (error) {
    console.error('Failed to change password:', error);
  } finally {
    passwordLoading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
};

onMounted(() => {
  loadProfile();
});
</script>

<style scoped lang="scss">
.account-center-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
  }

  .profile-card,
  .api-key-card,
  .password-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
    }

    .api-key-section {
      .api-key-actions {
        margin-top: 15px;
        display: flex;
        gap: 10px;
      }

      .security-tip {
        margin-top: 15px;
      }
    }
  }
}
</style>

