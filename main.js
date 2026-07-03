import App from './App.vue'
import home from './pages/home/home.vue'
import articlelist from './pages/xiaotan/articlelist.vue'
import join from './pages/join/join.vue'
import news from './pages/news/news.vue'
import my from './pages/my/my.vue'
import cuCustom from '@/components/cu-custom.vue'
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)

  // 全局注册组件
  app.component('home', home)
  app.component('articlelist', articlelist)
  app.component('join', join)
  app.component('news', news)
  app.component('my', my)
  app.component('cu-custom', cuCustom)

  return {
    app
  }
}