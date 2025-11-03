warning: in the working copy of 'frontend/src/views/account/Center.vue', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/frontend/src/views/account/Center.vue b/frontend/src/views/account/Center.vue[m
[1mindex da87ebd..e08e929 100644[m
[1m--- a/frontend/src/views/account/Center.vue[m
[1m+++ b/frontend/src/views/account/Center.vue[m
[36m@@ -1,513 +1,23 @@[m
 <template>[m
   <div class="account-center-container">[m
     <h1>账户中心</h1>[m
[31m-[m
[31m-    <el-row :gutter="20">[m
[31m-      <!-- 左侧：账户信息 -->[m
[31m-      <el-col :span="16">[m
[31m-        <!-- 基本信息 -->[m
[31m-        <el-card shadow="hover" class="info-card">[m
[31m-          <template #header>[m
[31m-            <div class="card-header">[m
[31m-              <span>基本信息</span>[m
[31m-              <el-button type="primary" size="small" @click="editDialogVisible = true">[m
[31m-                <el-icon><Edit /></el-icon>[m
[31m-                编辑资料[m
[31m-              </el-button>[m
[31m-            </div>[m
[31m-          </template>[m
[31m-[m
[31m-          <el-descriptions :column="2" border>[m
[31m-            <el-descriptions-item label="用户ID">[m
[31m-              {{ userInfo.id }}[m
[31m-            </el-descriptions-item>[m
[31m-            <el-descriptions-item label="邮箱">[m
[31m-              {{ userInfo.email }}[m
[31m-            </el-descriptions-item>[m
[31m-            <el-descriptions-item label="昵称">[m
[31m-              {{ userInfo.nickname || '-' }}[m
[31m-            </el-descriptions-item>[m
[31m-            <el-descriptions-item label="角色">[m
[31m-              <el-tag :type="userInfo.role === 'admin' ? 'danger' : 'success'">[m
[31m-                {{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}[m
[31m-              </el-tag>[m
[31m-            </el-descriptions-item>[m
[31m-            <el-descriptions-item label="账户状态">[m
[31m-              <el-tag :type="userInfo.status === 'active' ? 'success' : 'danger'">[m
[31m-                {{ userInfo.status === 'active' ? '正常' : '禁用' }}[m
[31m-              </el-tag>[m
[31m-            </el-descriptions-item>[m
[31m-            <el-descriptions-item label="注册时间">[m
[31m-              {{ formatDate(userInfo.createdAt) }}[m
[31m-            </el-descriptions-item>[m
[31m-          </el-descriptions>[m
[31m-        </el-card>[m
[31m-[m
[31m-        <!-- 余额信息 -->[m
[31m-        <el-card shadow="hover" class="balance-card">[m
[31m-          <template #header>[m
[31m-            <div class="card-header">[m
[31m-              <span>余额信息</span>[m
[31m-              <el-button type="primary" size="small" @click="$router.push('/wallet/recharge')">[m
[31m-                <el-icon><Wallet /></el-icon>[m
[31m-                充值[m
[31m-              </el-button>[m
[31m-            </div>[m
[31m-          </template>[m
[31m-[m
[31m-          <el-row :gutter="20">[m
[31m-            <el-col :span="12">[m
[31m-              <div class="balance-item">[m
[31m-                <div class="balance-icon" style="background-color: #409eff">[m
[31m-                  <el-icon :size="40"><Money /></el-icon>[m
[31m-                </div>[m
[31m-                <div class="balance-info">[m
[31m-                  <div class="balance-label">账户余额</div>[m
[31m-                  <div class="balance-value">${{ userInfo.balance?.toFixed(2) || '0.00' }}</div>[m
[31m-                  <div class="balance-note">可用于购买代理IP</div>[m
[31m-                </div>[m
[31m-              </div>[m
[31m-            </el-col>[m
[31m-[m
[31m-            <el-col :span="12">[m
[31m-              <div class="balance-item">[m
[31m-                <div class="balance-icon" style="background-color: #67c23a">[m
[31m-                  <el-icon :size="40"><Gift /></el-icon>[m
[31m-                </div>[m
[31m-                <div class="balance-info">[m
[31m-                  <div class="balance-label">赠送余额</div>[m
[31m-                  <div class="balance-value">${{ userInfo.giftBalance?.toFixed(2) || '0.00' }}</div>[m
[31m-                  <div class="balance-note">活动赠送，不可提现</div>[m
[31m-                </div>[m
[31m-              </div>[m
[31m-            </el-col>[m
[31m-          </el-row>[m
[31m-        </el-card>[m
[31m-[m
[31m-        <!-- 安全设置 -->[m
[31m-        <el-card shadow="hover" class="security-card">[m
[31m-          <template #header>[m
[31m-            <div class="card-header">[m
[31m-              <span>安全设置</span>[m
[31m-            </div>[m
[31m-          </template>[m
[31m-[m
[31m-          <div class="security-items">[m
[31m-            <div class="security-item">[m
[31m-              <div class="item-info">[m
[31m-                <el-icon :size="24" color="#409eff"><Lock /></el-icon>[m
[31m-                <div class="item-content">[m
[31m-                  <div class="item-title">登录密码</div>[m
[31m-                  <div class="item-desc">定期修改密码，保护账户安全</div>[m
[31m-                </div>[m
[31m-              </div>[m
[31m-              <el-button type="primary" @click="changePasswordDialogVisible = true">[m
[31m-                修改密码[m
[31m-              </el-button>[m
[31m-            </div>[m
[31m-[m
[31m-            <el-divider />[m
[31m-[m
[31m-            <div class="security-item">[m
[31m-              <div class="item-info">[m
[31m-                <el-icon :size="24" color="#67c23a"><Message /></el-icon>[m
[31m-                <div class="item-content">[m
[31m-                  <div class="item-title">邮箱绑定</div>[m
[31m-                  <div class="item-desc">{{ userInfo.email }}</div>[m
[31m-                </div>[m
[31m-              </div>[m
[31m-              <el-tag type="success">已绑定</el-tag>[m
[31m-            </div>[m
[31m-          </div>[m
[31m-        </el-card>[m
[31m-      </el-col>[m
[31m-[m
[31m-      <!-- 右侧：快捷操作和客服 -->[m
[31m-      <el-col :span="8">[m
[31m-        <!-- 快捷操作 -->[m
[31m-        <el-card shadow="hover" class="quick-actions-card">[m
[31m-          <template #header>[m
[31m-            <div class="card-header">[m
[31m-              <span>快捷操作</span>[m
[31m-            </div>[m
[31m-          </template>[m
[31m-[m
[31m-          <div class="action-list">[m
[31m-            <el-button type="primary" @click="$router.push('/proxy/static/buy')" class="action-btn">[m
[31m-              <el-icon><ShoppingCart /></el-icon>[m
[31m-              购买静态IP[m
[31m-            </el-button>[m
[31m-            <el-button type="success" @click="$router.push('/proxy/dynamic/manage')" class="action-btn">[m
[31m-              <el-icon><Connection /></el-icon>[m
[31m-              动态代理管理[m
[31m-            </el-button>[m
[31m-            <el-button type="info" @click="$router.push('/proxy/static/manage')" class="action-btn">[m
[31m-              <el-icon><Memo /></el-icon>[m
[31m-              静态IP管理[m
[31m-            </el-button>[m
[31m-            <el-button type="warning" @click="$router.push('/billing/orders')" class="action-btn">[m
[31m-              <el-icon><Document /></el-icon>[m
[31m-              查看订单[m
[31m-            </el-button>[m
[31m-          </div>[m
[31m-        </el-card>[m
[31m-[m
[31m-        <!-- 客服联系 -->[m
[31m-        <el-card shadow="hover" class="service-card">[m
[31m-          <template #header>[m
[31m-            <div class="card-header">[m
[31m-              <span>联系客服</span>[m
[31m-            </div>[m
[31m-          </template>[m
[31m-[m
[31m-          <div class="service-content">[m
[31m-            <p class="service-title">需要帮助？联系我们的客服团队</p>[m
[31m-            [m
[31m-            <div class="