import { createRouter, createWebHistory } from 'vue-router';
import ImporterTool from '../views/ImporterTool.vue'; // 导入我们的页面组件

// 定义路由规则
const routes = [
  {
    path: '/', // 网站的根路径 (e.g., http://localhost:5173/)
    name: 'Importer',
    component: ImporterTool // 当访问根路径时，显示 ImporterTool 组件
  },
  // 你可以在这里添加更多路由，例如：
  // {
  //   path: '/about',
  //   name: 'About',
  //   component: () => import('../views/About.vue') // 懒加载方式
  // }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 History 模式，URL更美观
  routes, // 应用路由规则
});

// 导出路由实例，以便在 main.js 中使用
export default router;