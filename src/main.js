import './assets/main.css'

// ============================================
// src/main.js
//
// [변경] Element Plus 전역 등록
// ============================================
import { createApp } from 'vue'
import { createPinia } from 'pinia'

// --------------------------------------------
// Element Plus
//
// [전체 등록] app.use(ElementPlus) 로 모든 컴포넌트를 한 번에 등록한다.
//   장점: 설정이 간단하고 어디서든 <el-*> 를 바로 쓸 수 있다
//   단점: 쓰지 않는 컴포넌트까지 번들에 포함된다
//
//   번들 크기를 줄이려면 unplugin-vue-components 로 자동 import 를
//   설정하는 방법이 있으나, 추가 플러그인이 필요해 강의 범위를 벗어난다.
//   실습 규모에서는 전체 등록으로 충분하다.
// --------------------------------------------
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 날짜 선택기 등의 UI 문구를 한글로 표시한다
import ko from 'element-plus/es/locale/lang/ko'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: ko })

app.mount('#app')
