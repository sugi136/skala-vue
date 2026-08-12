<script setup>
// ============================================
// 5장 Hands on : views/NotFoundView.vue
//
// [요구사항 1] Catch-all Route 로 연결되는 404 페이지
//
// [핵심] router/index.js 의 '/:pathMatch(.*)*' 규칙이
//        정의되지 않은 모든 경로를 이 컴포넌트로 보낸다.
//        예) /abcd, /weather, /some/deep/path
// ============================================
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// [핵심] route.fullPath — 쿼리스트링까지 포함한 현재 전체 경로
//        route.path 는 쿼리를 제외한 경로만 반환한다.
const wrongPath = route.fullPath

// [문법] router.back() — 브라우저 히스토리 이전으로
const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="notfound-wrapper">
    <div class="notfound-icon">🌫️</div>
    <h1>404</h1>
    <p class="notfound-lead">요청하신 페이지를 찾을 수 없습니다.</p>

    <!-- 어떤 경로로 들어왔는지 보여주면 사용자가 오타를 확인하기 쉽다 -->
    <p class="notfound-path">{{ wrongPath }}</p>

    <div class="notfound-actions">
      <button class="btn-back" @click="goBack">← 뒤로 가기</button>
      <RouterLink to="/" class="link-home">대시보드로 이동</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.notfound-wrapper {
  max-width: 940px;
  margin: 0 auto;
  padding: 90px 20px;
  text-align: center;
  color: #253858;
}

.notfound-icon {
  font-size: 66px;
  line-height: 1;
}

.notfound-wrapper h1 {
  margin: 16px 0 0;
  font-size: 54px;
  font-weight: 800;
  letter-spacing: -2px;
  color: #4a90f0;
}

.notfound-lead {
  margin: 10px 0 0;
  font-size: 16px;
  color: #5a6b82;
}

.notfound-path {
  display: inline-block;
  margin: 16px 0 0;
  padding: 7px 14px;
  font-size: 13px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #8899ad;
  background: #f0f4fa;
  border-radius: 8px;
}

.notfound-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;
}

.btn-back,
.link-home {
  padding: 11px 22px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-back {
  color: #5a6b82;
  background: #eef1f6;
  border: none;
}
.btn-back:hover {
  background: #e3e8f0;
}

.link-home {
  color: #fff;
  background: #5b9bf8;
}
.link-home:hover {
  background: #4287ef;
}
</style>
