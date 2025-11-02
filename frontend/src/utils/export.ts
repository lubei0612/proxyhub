/**
 * 导出工具类
 * 支持CSV和TXT格式导出
 */

/**
 * 导出为CSV格式
 * @param data 数据数组
 * @param headers 表头数组
 * @param filename 文件名（不含扩展名）
 */
export function exportToCSV(data: any[], headers: string[], filename: string) {
  try {
    // 构建CSV内容
    const csvRows: string[] = [];
    
    // 添加表头
    csvRows.push(headers.join(','));
    
    // 添加数据行
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header] || '';
        // 处理包含逗号、换行符或引号的值
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });
    
    // 创建Blob
    const csvContent = '\uFEFF' + csvRows.join('\n'); // 添加BOM以支持中文
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 下载
    downloadBlob(blob, `${filename}.csv`);
  } catch (error) {
    console.error('CSV export error:', error);
    throw new Error('导出CSV失败');
  }
}

/**
 * 导出为TXT格式（IP:Port:Username:Password格式）
 * @param data 数据数组
 * @param filename 文件名（不含扩展名）
 */
export function exportToTXT(data: any[], filename: string) {
  try {
    // 构建TXT内容（每行一个IP）
    const txtRows: string[] = [];
    
    data.forEach((item) => {
      const line = `${item.ipAddress}:${item.port}:${item.username}:${item.password}`;
      txtRows.push(line);
    });
    
    // 创建Blob
    const txtContent = txtRows.join('\n');
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    
    // 下载
    downloadBlob(blob, `${filename}.txt`);
  } catch (error) {
    console.error('TXT export error:', error);
    throw new Error('导出TXT失败');
  }
}

/**
 * 导出为JSON格式
 * @param data 数据数组
 * @param filename 文件名（不含扩展名）
 */
export function exportToJSON(data: any[], filename: string) {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    downloadBlob(blob, `${filename}.json`);
  } catch (error) {
    console.error('JSON export error:', error);
    throw new Error('导出JSON失败');
  }
}

/**
 * 下载Blob对象
 * @param blob Blob对象
 * @param filename 文件名
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * 格式化日期为字符串（用于文件名）
 * @param date 日期对象
 * @returns 格式化后的字符串（YYYYMMDD_HHMMSS）
 */
export function formatDateForFilename(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

