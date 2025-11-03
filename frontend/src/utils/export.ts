/**
 * Export Utility for Static Proxy Data
 * Provides functions to export proxy data in CSV and TXT formats
 */

export interface StaticProxyExportData {
  credentials?: string; // IP:Port:Account:Password (from backend virtual field)
  ip?: string;
  port?: number;
  username?: string;
  password?: string;
  countryName?: string;
  cityName?: string;
  ipType?: string;
  channelName?: string;
  expireTimeUtc?: string | Date;
  releaseTimeUtc?: string | Date;
  nodeId?: string;
  remark?: string;
}

/**
 * Format proxy data as TXT (one credential per line)
 * Format: IP:Port:Account:Password
 */
function formatAsTXT(data: StaticProxyExportData[]): string {
  return data
    .map((proxy) => {
      // Use credentials field if available (from backend), otherwise construct it
      if (proxy.credentials) {
        return proxy.credentials;
      }
      return `${proxy.ip}:${proxy.port}:${proxy.username}:${proxy.password}`;
    })
    .join('\n');
}

/**
 * Format proxy data as CSV with headers
 * Format: IP地址:端口:账号:密码,国家/城市,IP类型,所属通道,到期时间,释放时间,节点ID,备注
 */
function formatAsCSV(data: StaticProxyExportData[]): string {
  // CSV headers
  const headers = [
    'IP地址:端口:账号:密码',
    '国家/城市',
    'IP类型',
    '所属通道',
    '到期时间',
    '释放时间',
    '节点ID',
    '备注',
  ];

  // Create CSV rows
  const rows = data.map((proxy) => {
    // Get credentials string
    const credentials = proxy.credentials || `${proxy.ip}:${proxy.port}:${proxy.username}:${proxy.password}`;
    
    // Format location
    const location = proxy.cityName ? `${proxy.countryName}/${proxy.cityName}` : proxy.countryName || '';
    
    // Format IP type
    const ipType = proxy.ipType === 'premium' ? '原生' : '普通';
    
    // Format dates
    const expireTime = proxy.expireTimeUtc ? formatDateTime(proxy.expireTimeUtc) : '';
    const releaseTime = proxy.releaseTimeUtc ? formatDateTime(proxy.releaseTimeUtc) : '';
    
    // Create row array
    return [
      credentials,
      location,
      ipType,
      proxy.channelName || '',
      expireTime,
      releaseTime,
      proxy.nodeId || '',
      proxy.remark || '',
    ];
  });

  // Combine headers and rows into CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Escape CSV cell content (handle commas, quotes, newlines)
 */
function escapeCsvCell(cell: string): string {
  if (!cell) return '';
  
  // If cell contains comma, quote, or newline, wrap in quotes and escape quotes
  if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  
  return cell;
}

/**
 * Format date/time to local string
 */
function formatDateTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Generate filename with timestamp
 */
function generateFilename(format: 'csv' | 'txt'): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const time = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
  return `static-proxies-${timestamp}-${time}.${format}`;
}

/**
 * Trigger browser download for a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  try {
    // Create blob
    const blob = new Blob([content], { type: mimeType });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('文件下载失败');
  }
}

/**
 * Main export function - exports static proxy data in specified format
 * @param format - Export format ('csv' or 'txt')
 * @param data - Array of static proxy data
 * @throws Error if data is empty or export fails
 */
export async function exportStaticProxies(
  format: 'csv' | 'txt',
  data: StaticProxyExportData[],
): Promise<void> {
  // Validate data
  if (!data || data.length === 0) {
    throw new Error('没有可导出的IP数据');
  }

  try {
    // Format content based on export type
    let content: string;
    let mimeType: string;

    if (format === 'txt') {
      content = formatAsTXT(data);
      mimeType = 'text/plain;charset=utf-8';
    } else if (format === 'csv') {
      content = formatAsCSV(data);
      mimeType = 'text/csv;charset=utf-8';
    } else {
      throw new Error('不支持的导出格式');
    }

    // Generate filename
    const filename = generateFilename(format);

    // Download file
    downloadFile(content, filename, mimeType);
  } catch (error: any) {
    console.error('Export failed:', error);
    
    // If download failed, try to copy to clipboard as fallback
    if (error.message !== '没有可导出的IP数据' && error.message !== '不支持的导出格式') {
      try {
        const content = format === 'txt' ? formatAsTXT(data) : formatAsCSV(data);
        await navigator.clipboard.writeText(content);
        throw new Error('导出失败，数据已复制到剪贴板');
      } catch (clipboardError) {
        throw new Error('导出失败，请重试');
      }
    }
    
    throw error;
  }
}

/**
 * Export only credentials (IP:Port:Account:Password) as TXT
 * Simpler version for quick credential export
 */
export async function exportCredentials(
  data: StaticProxyExportData[],
): Promise<void> {
  return exportStaticProxies('txt', data);
}

/**
 * Generic CSV export function for any data
 * @param data - Array of objects to export
 * @param headers - Column headers
 * @param filename - Custom filename (optional)
 */
export function exportToCSV(
  data: any[],
  headers: string[],
  filename?: string,
): void {
  if (!data || data.length === 0) {
    throw new Error('没有可导出的数据');
  }

  try {
    // Create CSV content
    const csvRows = [
      headers.join(','),
      ...data.map((row) => {
        return headers.map((header) => {
          const value = row[header] ?? '';
          return escapeCsvCell(String(value));
        }).join(',');
      }),
    ];

    const csvContent = csvRows.join('\n');
    
    // Generate filename if not provided
    const finalFilename = filename || `export-${formatDateForFilename()}.csv`;
    
    // Download
    downloadFile(csvContent, finalFilename, 'text/csv;charset=utf-8');
  } catch (error) {
    console.error('CSV export failed:', error);
    throw new Error('CSV导出失败');
  }
}

/**
 * Format current date for filename
 * @returns Formatted date string (YYYYMMDD-HHMMSS)
 */
export function formatDateForFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

