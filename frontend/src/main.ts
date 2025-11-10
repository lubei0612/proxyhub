import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import i18n from './locales';

// 导入浅色主题样式
import './styles/variables.scss';
import './assets/styles/global.scss';
// import './styles/responsive.scss'; // 已禁用响应式样式

// 导入flag-icons国旗图标CSS
import 'flag-icons/css/flag-icons.min.css';

const app = createApp(App);

// Pinia状态管理
app.use(createPinia());

// 路由
app.use(router);

// Element Plus
app.use(ElementPlus);

// 国际化
app.use(i18n);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app');

