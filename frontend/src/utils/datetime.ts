import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 将UTC时间转换为北京时间并格式化
 * @param date UTC时间字符串或Date对象
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的北京时间字符串
 */
export function formatBeijingTime(date: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '-';
  return dayjs.utc(date).tz('Asia/Shanghai').format(format);
}

/**
 * 获取相对时间（如：5分钟前）
 * @param date UTC时间字符串或Date对象
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: string | Date): string {
  if (!date) return '-';
  
  const beijingTime = dayjs.utc(date).tz('Asia/Shanghai');
  const now = dayjs().tz('Asia/Shanghai');
  const diffMinutes = now.diff(beijingTime, 'minute');
  
  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  
  const diffHours = now.diff(beijingTime, 'hour');
  if (diffHours < 24) return `${diffHours}小时前`;
  
  const diffDays = now.diff(beijingTime, 'day');
  if (diffDays < 7) return `${diffDays}天前`;
  
  return beijingTime.format('YYYY-MM-DD HH:mm');
}

/**
 * 格式化日期为北京时间（不含时间）
 * @param date UTC时间字符串或Date对象
 * @returns 格式化后的日期字符串
 */
export function formatBeijingDate(date: string | Date): string {
  if (!date) return '-';
  return dayjs.utc(date).tz('Asia/Shanghai').format('YYYY-MM-DD');
}


