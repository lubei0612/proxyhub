# 📝 GitHub 添加 Secrets 详细步骤

## 🎯 你已经在正确的页面了！

从你的截图看，你已经打开了正确的页面：
**Settings** > **Secrets and variables** > **Actions**

---

## 👆 具体操作步骤

### 1. 点击绿色按钮 "New repository secret"

在你截图中，**Repository secrets** 下面有个绿色的按钮：
```
New repository secret
```
**👆 点击这个绿色按钮**

---

### 2. 填写 Secret 信息

点击后会出现一个表单：

**Name（名称）**：
```
SERVER_HOST
```

**Secret（值）**：
```
43.130.35.117
```

然后点击 **Add secret**（绿色按钮）

---

### 3. 重复添加其他 Secrets

回到同一个页面，再次点击 "New repository secret"

**第二个 Secret：**
- Name: `SERVER_USER`
- Secret: `root`

点击 **Add secret**

---

**第三个 Secret：**
- Name: `SERVER_PASSWORD`
- Secret: `你的腾讯云服务器密码`（就是SSH登录的密码）

点击 **Add secret**

---

## ✅ 完成后的样子

添加完成后，你会看到：

```
Repository secrets

SERVER_HOST         Updated now
SERVER_USER         Updated now  
SERVER_PASSWORD     Updated now
```

**注意**：出于安全，你看不到Secret的值，只能看到名称。

---

## 🔑 关于 SERVER_PASSWORD

就是你SSH登录服务器时用的密码：

```bash
ssh root@43.130.35.117
# 输入的密码就是 SERVER_PASSWORD
```

**如果忘记了密码**，去腾讯云控制台：
1. 找到你的服务器
2. 点击 "重置密码"
3. 设置新密码
4. 重启服务器

---

## 📸 截图对照

### 你现在的页面（截图）：
```
Repository secrets
  This repository has no secrets.
  [New repository secret]  ← 点这个绿色按钮
```

### 点击按钮后：
```
Actions secrets / New secret

Name:
[输入框] ← 输入 SERVER_HOST

Secret:
[输入框] ← 输入 43.130.35.117

[Add secret] ← 点这个
```

### 添加完成后：
```
Repository secrets

SERVER_HOST         Updated now    [Update] [Remove]
SERVER_USER         Updated now    [Update] [Remove]
SERVER_PASSWORD     Updated now    [Update] [Remove]
```

---

## ⚠️ 常见问题

### Q: 找不到 "New repository secret" 按钮？

**A:** 检查：
- 你是仓库的 Owner 或 Admin 吗？
- 页面是 **Settings** > **Secrets and variables** > **Actions** 吗？
- 选的是 **Secrets** 标签，不是 **Variables** 标签

### Q: 添加后能看到值吗？

**A:** 不能！出于安全，添加后只能看到名称，看不到值。
如果输错了，可以点 **Update** 重新输入。

### Q: 没有腾讯云服务器密码怎么办？

**A:** 
1. 登录腾讯云控制台
2. 找到你的云服务器实例
3. 点击 "重置密码"
4. 设置新密码（记住它）
5. 重启服务器

---

## 🎯 快速检查清单

添加完成后检查：

- [ ] SECRET 名称完全一致（区分大小写）
  - `SERVER_HOST`（不是 server_host）
  - `SERVER_USER`（不是 server_user）
  - `SERVER_PASSWORD`（不是 server_password）

- [ ] 值正确无误
  - `SERVER_HOST`: 43.130.35.117
  - `SERVER_USER`: root
  - `SERVER_PASSWORD`: (你的密码，不要有空格)

- [ ] 共添加了 3 个 Secrets

---

## 🚀 测试自动部署

添加完 Secrets 后，试试推送代码：

```bash
git add .
git commit -m "test auto deploy"
git push origin master
```

然后：
1. 打开 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 应该能看到一个正在运行的工作流
4. 点击进去查看日志

**如果成功**：会显示绿色的 ✅

**如果失败**：会显示红色的 ❌，点进去看错误日志

---

**按照上面的步骤，就能添加 Secrets 了！** 🎉

