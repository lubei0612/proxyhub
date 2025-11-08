const axios = require('axios');

const API_KEY = 'ne_hj06qomI-bmVfaGowNnFvbUk0YzIzMTc2MTQ1Nzk1Mw==';
const BASE_URL = 'https://open-api.985proxy.com/api';

const orderNos = [
  '34449adb-1e9a-4720-b9c4-d01ce90d9a51',
  '79693aa9-2ef6-4f6e-a981-fae36b1c3f92',
];

async function checkOrder(orderNo) {
  try {
    const response = await axios.post(
      `${BASE_URL}/res_static/order_result`,
      { order_no: orderNo },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_KEY,
        },
      }
    );
    
    console.log(`\n========== Order: ${orderNo} ==========`);
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data?.data?.info?.result) {
      const ips = response.data.data.info.result;
      console.log(`\n✅ Found ${ips.length} IPs:`);
      ips.forEach(ip => {
        console.log(`  - ${ip.ip}:${ip.port} (${ip.username}/${ip.password})`);
        console.log(`    Country: ${ip.country_code}, City: ${ip.city_name}`);
        console.log(`    Expire: ${ip.expire_time_utc}`);
      });
    }
  } catch (error) {
    console.error(`\n❌ Error checking order ${orderNo}:`, error.message);
  }
}

async function main() {
  console.log('🔍 Checking 985Proxy orders...\n');
  
  for (const orderNo of orderNos) {
    await checkOrder(orderNo);
  }
}

main();

