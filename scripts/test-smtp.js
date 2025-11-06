const nodemailer = require('nodemailer');

async function testGmailSMTP() {
  console.log('\n🔍 测试Gmail SMTP连接和发送...\n');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'chenyuqi061245@gmail.com',
      pass: 'vvdgyeerdtycwxka',
    },
    debug: true, // 启用调试模式
    logger: true, // 启用日志
  });

  try {
    console.log('📧 尝试发送测试邮件...\n');
    
    const info = await transporter.sendMail({
      from: 'ProxyHub <chenyuqi061245@gmail.com>',
      to: 'RobinsonKevin5468@outlook.com',
      subject: 'ProxyHub 邮件测试 - Gmail配置验证',
      text: '这是ProxyHub的测试邮件。如果您收到此邮件，说明Gmail SMTP配置完全正确！',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">✅ ProxyHub 邮件测试成功</h2>
          <p>这是ProxyHub的测试邮件。</p>
          <p><strong>如果您收到此邮件，说明Gmail SMTP配置完全正确！</strong></p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            密码: vvdgyeerdtycwxka<br>
            发送时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
          </p>
        </div>
      `,
    });
    
    console.log('\n✅ 邮件发送成功！');
    console.log('📨 Message ID:', info.messageId);
    console.log('📬 响应:', info.response);
    console.log('\n请检查 RobinsonKevin5468@outlook.com 邮箱！\n');
    
  } catch (error) {
    console.log('\n❌ 邮件发送失败！');
    console.log('错误类型:', error.code);
    console.log('错误消息:', error.message);
    console.log('\n完整错误信息:');
    console.log(error);
  }
}

testGmailSMTP();

