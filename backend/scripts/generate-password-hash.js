const bcrypt = require('bcrypt');

async function generateHashes() {
  const passwords = {
    'user@example.com': '123456',
    'admin@example.com': 'admin123',
    'test@example.com': 'test123'
  };

  console.log('生成密码哈希...\n');

  for (const [email, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${email} / ${password}:`);
    console.log(`'${hash}',\n`);
  }
}

generateHashes();

