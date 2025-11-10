const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'chenyuqi061245@gmail.com',
    pass: 'vvdgyeerdtycwxka'
  }
});

const code = Math.floor(100000 + Math.random() * 900000);

const mailOptions = {
  from: 'ProxyHub <noreply@proxyhub.com>',
  to: 'chenyuqi061245@gmail.com',
  subject: 'ProxyHub Test Code',
  html: `
    <h2 style="color: #2C5F8D;">ProxyHub Verification Code</h2>
    <p>Your verification code is:</p>
    <p style="font-size:32px; font-weight:bold; color:#409eff; letter-spacing:5px;">${code}</p>
    <p>Valid for 5 minutes</p>
  `
};

console.log('Sending email to:', mailOptions.to);
console.log('Verification code:', code);

transporter.sendMail(mailOptions)
  .then((info) => {
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  })
  .catch((error) => {
    console.error('❌ Failed to send email:');
    console.error('Error:', error.message);
    console.error('Full error:', error);
  });

