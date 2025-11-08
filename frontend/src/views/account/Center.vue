<template>
  <div class="account-center-container responsive-container">
    <h1 class="text-responsive">账户中心</h1>

    <el-row :gutter="20" class="flex-responsive">
      <!-- 左侧：账户信息 -->
      <el-col :span="16">
        <!-- 基本信息 -->
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-button type="primary" size="small" @click="editDialogVisible = true">
                <el-icon><Edit /></el-icon>
                编辑资料
              </el-button>
            </div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户ID">
              {{ userInfo.id }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ userInfo.email }}
            </el-descriptions-item>
            <el-descriptions-item label="昵称">
              {{ userInfo.nickname || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag :type="userInfo.role === 'admin' ? 'danger' : 'success'">
                {{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="账户状态">
              <el-tag :type="userInfo.status === 'active' ? 'success' : 'danger'">
                {{ userInfo.status === 'active' ? '正常' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">
              {{ formatDate(userInfo.createdAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 余额信息 -->
        <el-card shadow="hover" class="balance-card">
          <template #header>
            <div class="card-header">
              <span>余额信息</span>
              <el-button type="primary" size="small" @click="$router.push('/wallet/recharge')">
                <el-icon><Wallet /></el-icon>
                充值
              </el-button>
            </div>
          </template>

          <div class="balance-item">
            <div class="balance-icon" style="background-color: #409eff">
              <el-icon :size="40"><Money /></el-icon>
            </div>
            <div class="balance-info">
              <div class="balance-label">账户余额</div>
              <div class="balance-value">${{ Number(userInfo.balance || 0).toFixed(2) }}</div>
              <div class="balance-note">可用于购买代理IP</div>
            </div>
          </div>
        </el-card>

        <!-- 安全设置 -->
        <el-card shadow="hover" class="security-card">
          <template #header>
            <div class="card-header">
              <span>安全设置</span>
            </div>
          </template>

          <div class="security-items">
            <div class="security-item">
              <div class="item-info">
                <el-icon :size="24" color="#409eff"><Lock /></el-icon>
                <div class="item-content">
                  <div class="item-title">登录密码</div>
                  <div class="item-desc">定期修改密码，保护账户安全</div>
                </div>
              </div>
              <el-button type="primary" @click="changePasswordDialogVisible = true">
                修改密码
              </el-button>
            </div>

            <el-divider />

            <div class="security-item">
              <div class="item-info">
                <el-icon :size="24" color="#67c23a"><Message /></el-icon>
                <div class="item-content">
                  <div class="item-title">邮箱绑定</div>
                  <div class="item-desc">{{ userInfo.email }}</div>
                </div>
              </div>
              <el-tag type="success">已绑定</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：快捷操作和客服 -->
      <el-col :span="8">
        <!-- 快捷操作 -->
        <el-card shadow="hover" class="quick-actions-card">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>

          <div class="action-list">
            <el-button type="primary" @click="$router.push('/proxy/static/buy')" class="action-btn">
              <el-icon><ShoppingCart /></el-icon>
              购买静态IP
            </el-button>
            <el-button type="success" @click="$router.push('/proxy/dynamic/manage')" class="action-btn">
              <el-icon><Connection /></el-icon>
              动态代理管理
            </el-button>
            <el-button type="info" @click="$router.push('/proxy/static/manage')" class="action-btn">
              <el-icon><Memo /></el-icon>
              静态IP管理
            </el-button>
            <el-button type="warning" @click="$router.push('/billing/orders')" class="action-btn">
              <el-icon><Document /></el-icon>
              查看订单
            </el-button>
          </div>
        </el-card>

        <!-- 客服联系 - ✅ Task 13: 隐藏客服链接（防撬客户）-->
        <el-card shadow="hover" class="service-card">
          <template #header>
            <div class="card-header">
              <span>联系客服</span>
            </div>
          </template>

          <div class="service-content">
            <p class="service-title">需要帮助？请联系您的专属客服</p>
            
            <!-- ✅ 保留样式但隐藏具体客服信息 -->
            <div class="service-item">
              <div class="service-info">
                <el-icon :size="20" color="#0088cc"><ChatDotRound /></el-icon>
                <span>请联系您的客服</span>
              </div>
              <el-button type="primary" size="small" disabled>
                请联系您的客服
              </el-button>
            </div>

            <el-alert type="info" :closable="false" class="service-note">
              <p>工作时间：周一至周日 9:00-22:00</p>
              <p>平均响应时间：5分钟</p>
            </el-alert>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑资料" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="changePasswordDialogVisible" title="修改密码" width="500px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="changePasswordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import {
  Edit,
  Wallet,
  Money,
  Present,
  Lock,
  Message,
  ShoppingCart,
  Connection,
  Memo,
  Document,
  ChatDotRound,
} from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import dayjs from 'dayjs';

const userStore = useUserStore();

const userInfo = ref<any>({
  id: 1,
  email: 'user@example.com',
  nickname: '测试用户',
  role: 'user',
  status: 'active',
  balance: 1000,
  giftBalance: 50,
  createdAt: '2025-01-01 10:00:00',
});

const editDialogVisible = ref(false);
const editForm = ref({
  nickname: '',
});

const changePasswordDialogVisible = ref(false);
const passwordFormRef = ref<FormInstance>();
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const handleSaveProfile = async () => {
  try {
    // TODO: 调用API保存资料
    await new Promise((resolve) => setTimeout(resolve, 500));
    ElMessage.success('保存成功！');
    editDialogVisible.value = false;
  } catch (error: any) {
    ElMessage.error('保存失败：' + error.message);
  }
};

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();
    
    // TODO: 调用API修改密码
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    ElMessage.success('密码修改成功！');
    changePasswordDialogVisible.value = false;
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('修改失败：' + error.message);
    }
  }
};

onMounted(async () => {
  if (userStore.user) {
    userInfo.value = { ...userInfo.value, ...userStore.user };
    editForm.value.nickname = userInfo.value.nickname;
  }
});
</script>

<style scoped lang="scss">
.account-center-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
    color: #303133;
  }

  .info-card,
  .balance-card,
  .security-card {
    margin-bottom: 20px;
  }

  .balance-card {
    .balance-item {
      display: flex;
      gap: 20px;
      padding: 20px;
      background-color: #f5f7fa;
      border-radius: 8px;

      .balance-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      .balance-info {
        flex: 1;

        .balance-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .balance-value {
          font-size: 32px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 8px;
        }

        .balance-note {
          font-size: 12px;
          color: #c0c4cc;
        }
      }
    }
  }

  .security-card {
    .security-items {
      .security-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px 0;

        .item-info {
          display: flex;
          align-items: center;
          gap: 15px;

          .item-content {
            .item-title {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 5px;
            }

            .item-desc {
              font-size: 13px;
              color: #909399;
            }
          }
        }
      }
    }
  }

  .quick-actions-card {
    margin-bottom: 20px;

    .action-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .action-btn {
        width: 100%;
        justify-content: flex-start;
        padding: 15px 20px;
        font-size: 15px;
      }
    }
  }

  .service-card {
    .service-content {
      .service-title {
        font-size: 14px;
        color: #606266;
        margin-bottom: 15px;
      }

      .service-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #ebeef5;

        .service-info {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #303133;
        }
      }

      .service-note {
        margin-top: 15px;

        p {
          margin: 5px 0;
          font-size: 13px;
        }
      }
    }
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
</style>
