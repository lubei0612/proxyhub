import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
// import i18n from './locales'; // TODO: 稍后添加

// 导入浅色主题样式
import './styles/variables.scss';
import './assets/styles/global.scss';

const app = createApp(App);

// Pinia状态管理
app.use(createPinia());

// 路由
app.use(router);

// Element Plus
app.use(ElementPlus);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 国际化 TODO
// app.use(i18n);

app.mount('#app');

