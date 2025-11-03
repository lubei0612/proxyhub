import { createI18n } from 'vue-i18n';
import zhCN from './zh-CN';
import enUS from './en-US';

// 从localStorage读取用户偏好语言
const getDefaultLocale = (): string => {
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale && ['zh-CN', 'en-US'].includes(savedLocale)) {
    return savedLocale;
  }
  
  // 检测浏览器语言
  const browserLocale = navigator.language;
  if (browserLocale.startsWith('zh')) {
    return 'zh-CN';
  }
  if (browserLocale.startsWith('en')) {
    return 'en-US';
  }
  
  return 'zh-CN'; // 默认中文
};

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getDefaultLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
  globalInjection: true, // 全局注入 $t 函数
});

export default i18n;

