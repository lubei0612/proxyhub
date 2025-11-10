# Gmail SMTP 配置指南

## 📧 配置Gmail发送验证码

为了使用Gmail发送验证码，你需要获取Gmail的**应用专用密码**（App Password），而不是你的Gmail登录密码。

---

## 🔐 第1步：启用两步验证（如果还没启用）

1. 访问 https://myaccount.google.com/security
2. 在"登录Google"部分，点击"两步验证"
3. 按照指示启用两步验证

---

## 🔑 第2步：生成应用专用密码

1. 访问 https://myaccount.google.com/apppasswords
2. 选择"选择应用" → "邮件"
3. 选择"选择设备" → "其他（自定义名称）"
4. 输入名称，例如："ProxyHub"
5. 点击"生成"
6. **复制生成的16位密码**（例如：`abcd efgh ijkl mnop`）

---

## ⚙️ 第3步：配置.env文件

打开项目根目录的`.env`文件，添加以下配置：

```env
# Gmail SMTP配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=你的Gmail地址@gmail.com
SMTP_PASS=abcdefghijklmnop  # 刚才生成的16位应用专用密码（去掉空格）
SMTP_FROM=ProxyHub <noreply@proxyhub.com>
```

⚠️ **重要提示**:
- `SMTP_USER`: 填写你的完整Gmail地址
- `SMTP_PASS`: 填写应用专用密码（16位，**去掉空格**）
- 不要使用你的Gmail登录密码！

---

## 🚀 第4步：重启Docker服务

配置完成后，重启后端服务使配置生效：

```bash
docker compose restart backend
```

---

## ✅ 第5步：测试验证码

1. 打开注册页面: http://localhost/register
2. 输入你的邮箱
3. 点击"获取验证码"按钮
4. 检查邮箱收件箱（可能在垃圾邮件文件夹）

---

## 🐛 故障排查

### 问题1: 没有收到邮件

**检查后端日志**:
```bash
docker compose logs backend | findstr "验证码"
```

可能的原因：
- SMTP配置错误
- 应用专用密码不正确
- Gmail账号未启用两步验证
- 邮件被Gmail标记为垃圾邮件

### 问题2: "无效的凭据"错误

- 确认使用的是**应用专用密码**，不是Gmail登录密码
- 确认应用专用密码去掉了所有空格
- 重新生成应用专用密码

### 问题3: "需要两步验证"

- 访问 https://myaccount.google.com/security
- 启用两步验证后再生成应用专用密码

---

## 📝 配置示例

完整的.env配置示例：

```env
# ========================================
# SMTP邮件配置（Gmail示例）
# ========================================

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=ProxyHub <noreply@proxyhub.com>
```

---

## 🎯 验证码功能说明

- **有效期**: 5分钟
- **长度**: 6位数字
- **存储**: Redis缓存
- **防刷**: 60秒内只能发送一次

---

## 💡 其他SMTP服务

如果不想使用Gmail，也可以使用其他邮件服务：

### QQ邮箱
```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your@qq.com
SMTP_PASS=授权码（在QQ邮箱设置中获取）
```

### 163邮箱
```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=your@163.com
SMTP_PASS=授权码（在163邮箱设置中获取）
```

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your@outlook.com
SMTP_PASS=你的Outlook密码
```

---

## 🔗 相关链接

- [Gmail应用专用密码](https://myaccount.google.com/apppasswords)
- [Gmail安全设置](https://myaccount.google.com/security)
- [Gmail两步验证](https://myaccount.google.com/signinoptions/two-step-verification)

