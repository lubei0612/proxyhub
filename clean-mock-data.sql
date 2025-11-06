-- 查看所有IP数据
SELECT id, ip, channelName, remark, createdAt 
FROM static_proxies 
ORDER BY id DESC;

-- 识别mock数据 (包含[MOCK]或channelName='默认通道')
SELECT id, ip, channelName, remark, createdAt
FROM static_proxies 
WHERE remark LIKE '%[MOCK]%' 
   OR channelName = '默认通道'
ORDER BY id DESC;

-- 删除mock数据
DELETE FROM static_proxies 
WHERE remark LIKE '%[MOCK]%' 
   OR channelName = '默认通道';

-- 查看剩余的真实数据
SELECT id, ip, channelName, remark, createdAt 
FROM static_proxies 
ORDER BY id DESC;

