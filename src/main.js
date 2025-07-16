import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // 1. 导入我们创建的路由实例

const app = createApp(App)

app.use(router) // 2. 让应用使用路由

app.mount('#app')