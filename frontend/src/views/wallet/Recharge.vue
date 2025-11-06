<template>
  <div class="recharge-container">
    <h1>钱包充值</h1>

    <!-- 单列布局 -->
    <el-card shadow="hover" class="recharge-form-card">
      <template #header>
        <div class="card-header">
          <span>充值信息</span>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
            <!-- 充值金额 -->
            <el-form-item label="充值金额" prop="amount">
              <el-input
                v-model.number="form.amount"
                type="number"
                placeholder="请输入充值金额（USD）"
              >
                <template #prefix>$</template>
                <template #append>USD</template>
              </el-input>
              <div class="amount-tips">
                <span>最小充值：$1</span>
                <span>最大充值：$10,000</span>
              </div>
            </el-form-item>

            <!-- 快捷金额 -->
            <el-form-item label="快捷选择">
              <div class="quick-amounts">
                <el-button
                  v-for="amount in quickAmounts"
                  :key="amount"
                  @click="form.amount = amount"
                  :type="form.amount === amount ? 'primary' : ''"
                >
                  ${{ amount }}
                </el-button>
              </div>
            </el-form-item>

            <!-- 充值预览（移到这里） -->
            <el-form-item v-if="form.amount > 0">
              <el-alert type="info" :closable="false" class="preview-alert">
                <template #title>
                  <div class="preview-content">
                    <div class="preview-row">
                      <span class="label">充值金额（USD）：</span>
                      <span class="value primary">${{ form.amount.toFixed(2) }}</span>
                    </div>
                    <div class="preview-row">
                      <span class="label">折合人民币（CNY）：</span>
                      <span class="value">¥{{ (form.amount * exchangeRate).toFixed(2) }}</span>
                    </div>
                    <div class="preview-row">
                      <span class="label">当前汇率：</span>
                      <span class="value">1 USD = {{ exchangeRate }} CNY</span>
                    </div>
                  </div>
                </template>
              </el-alert>
            </el-form-item>

            <!-- 支付方式（优化样式） -->
            <el-form-item label="支付方式" prop="paymentMethod">
              <el-radio-group v-model="form.paymentMethod" class="payment-methods">
                <el-radio label="wechat" border class="payment-option-fixed">
                  <div class="payment-content">
                    <el-icon :size="20" color="#07c160"><ChatDotRound /></el-icon>
                    <div class="payment-text">
                      <div class="payment-name">微信支付</div>
                      <div class="payment-desc">扫码支付，即时到账</div>
                    </div>
                  </div>
                </el-radio>

                <el-radio label="alipay" border class="payment-option-fixed">
                  <div class="payment-content">
                    <el-icon :size="20" color="#1677ff"><Money /></el-icon>
                    <div class="payment-text">
                      <div class="payment-name">支付宝</div>
                      <div class="payment-desc">扫码支付，即时到账</div>
                    </div>
                  </div>
                </el-radio>

                <el-radio label="usdt" border class="payment-option-fixed">
                  <div class="payment-content">
                    <el-icon :size="20" color="#26a17b"><CreditCard /></el-icon>
                    <div class="payment-text">
                      <div class="payment-name">USDT（TRC20）</div>
                      <div class="payment-desc">区块链转账，30分钟内到账</div>
                    </div>
                  </div>
                </el-radio>

                <el-radio label="usd" border class="payment-option-fixed">
                  <div class="payment-content">
                    <el-icon :size="20" color="#f56c6c"><Coin /></el-icon>
                    <div class="payment-text">
                      <div class="payment-name">美金支付</div>
                      <div class="payment-desc">银行转账或PayPal</div>
                    </div>
                  </div>
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 备注信息 -->
            <el-form-item label="备注信息" prop="remark">
              <el-input
                v-model="form.remark"
                type="textarea"
                :rows="4"
                placeholder="请输入备注信息（如USDT地址、转账凭证号等）"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <!-- 联系客服（卡片样式，双客服） -->
            <el-form-item label="联系客服">
              <el-alert type="info" :closable="false" class="customer-service-alert">
                <template #default>
                  <div class="service-content">
                    <div class="service-header">
                      <el-icon :size="20"><Service /></el-icon>
                      <span>需要帮助？联系我们的客服团队</span>
                    </div>
                    <div class="service-buttons">
                      <el-button type="primary" @click="openTelegram('lubei12')">
                        <el-icon><ChatDotRound /></el-icon>
                        客服1: @lubei12
                      </el-button>
                      <el-button type="success" @click="openTelegram('proxyhub_support')">
                        <el-icon><ChatDotRound /></el-icon>
                        客服2: @proxyhub_support
                      </el-button>
                    </div>
                  </div>
                </template>
              </el-alert>
            </el-form-item>

            <!-- 提交按钮 -->
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="submitting"
                @click="handleSubmit"
                class="submit-btn"
              >
                <el-icon><Check /></el-icon>
                提交充值申请
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import {
  ChatDotRound,
  Money,
  CreditCard,
  Coin,
  Check,
  InfoFilled,
  Service,
} from '@element-plus/icons-vue';
import { createRecharge } from '@/api/modules/billing';

const formRef = ref<FormInstance>();

// 表单数据
const form = ref({
  amount: 0,
  paymentMethod: 'wechat',
  remark: '',
});

// 快捷金额
const quickAmounts = [10, 50, 100, 200, 500, 1000];

// 汇率
const exchangeRate = ref(7.25);

// 表单验证规则
const rules: FormRules = {
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    { type: 'number', min: 1, max: 10000, message: '充值金额范围：$1 - $10,000', trigger: 'blur' },
  ],
  paymentMethod: [
    { required: true, message: '请选择支付方式', trigger: 'change' },
  ],
};

const submitting = ref(false);

// 联系客服
const handleContactService = () => {
  window.open('https://t.me/lubei12', '_blank');
  ElMessage.info('正在跳转到Telegram客服...');
};

// 提交充值申请
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    submitting.value = true;

    // 调用API提交充值申请
    await createRecharge({
      amount: form.value.amount,
      method: form.value.paymentMethod,
      remark: form.value.remark,
    });

    ElMessage.success('充值申请已提交，请等待管理员审核！');

    // 重置表单
    form.value = {
      amount: 0,
      paymentMethod: 'wechat',
      remark: '',
    };
    formRef.value.resetFields();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('提交失败：' + (error.response?.data?.message || error.message));
    }
  } finally {
    submitting.value = false;
  }
};

// 打开Telegram客服
const openTelegram = (username: string = 'lubei12') => {
  window.open(`https://t.me/${username}`, '_blank');
  ElMessage.info(`正在打开Telegram联系 @${username}...`);
};

onMounted(() => {
  // 加载汇率
  // TODO: 从API获取实时汇率
});
</script>

<style scoped lang="scss">
.recharge-container {
  h1 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .recharge-form-card {
    .card-header {
      font-weight: 600;
      color: #303133;
    }

    .amount-tips {
      display: flex;
      gap: 20px;
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
    }

    .quick-amounts {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .payment-methods {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;

      // 修复：支付方式选项样式（边框+描述）
      .payment-option-fixed {
        margin-right: 0 !important;
        margin-bottom: 0 !important;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;

        // Element Plus Radio Border样式覆盖
        :deep(.el-radio__label) {
          width: 100%;
          max-width: 100%;
          padding: 0;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        :deep(.el-radio.is-bordered) {
          padding: 12px 16px;
          height: auto;
        }

        .payment-content {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          max-width: 100%;
          padding: 4px 0;
          box-sizing: border-box;

          .el-icon {
            flex-shrink: 0;
          }

          .payment-text {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 8px;
            flex: 1;
            min-width: 0;
            overflow: hidden;

            .payment-name {
              font-size: 14px;
              font-weight: 600;
              color: #303133;
              line-height: 1.4;
              white-space: nowrap;
              flex-shrink: 0;
            }

            .payment-desc {
              font-size: 12px;
              color: #909399;
              line-height: 1.4;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              
              &::before {
                content: '- ';
                margin-right: 4px;
              }
            }
          }
        }
      }
    }

    // 充值预览样式
    .preview-alert {
      margin-top: 10px;

      :deep(.el-alert__content) {
        width: 100%;
      }

      .preview-content {
        width: 100%;

        .preview-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            color: #606266;
          }

          .value {
            font-weight: 600;
            color: #303133;

            &.primary {
              color: #409eff;
              font-size: 18px;
            }
          }
        }
      }
    }

    .remark-tips {
      margin-top: 10px;

      :deep(.el-alert) {
        padding: 12px;

        p {
          margin: 5px 0;
          font-size: 13px;
          line-height: 1.6;
        }
      }
    }

    .submit-btn {
      width: 100%;
      padding: 15px;
      font-size: 16px;
      margin-top: 20px;
    }
  }

  .preview-card {
    margin-bottom: 20px;

    .preview-content {
      .preview-row {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        font-size: 14px;

        .label {
          color: #606266;
        }

        .value {
          font-weight: 600;
          color: #303133;

          &.primary {
            font-size: 20px;
            color: #409eff;
          }
        }

        &.total {
          font-size: 18px;
          padding-top: 15px;

          .value {
            color: #f56c6c;
          }
        }
      }

      .preview-note {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background-color: #f0f7ff;
        border-radius: 4px;
        font-size: 13px;
        color: #409eff;
        margin-top: 15px;
      }
    }
  }

  .tips-card {
    position: sticky;
    top: 20px;

    .tips-content {
      h4 {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin: 15px 0 10px;

        &:first-child {
          margin-top: 0;
        }
      }

      ol, ul {
        padding-left: 20px;
        margin: 0;

        li {
          margin: 8px 0;
          font-size: 13px;
          color: #606266;
          line-height: 1.6;
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

// 客服联系卡片样式
.customer-service-alert {
  border-radius: 8px;
  
  :deep(.el-alert__content) {
    width: 100%;
  }

  .service-content {
    .service-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 12px;
    }

    .service-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .el-button {
        flex: 1;
        min-width: 180px;
      }
    }
  }
}
</style>
