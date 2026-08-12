<script setup>
// ============================================
// App.vue (전체)
// Navigation Bar 옆에 단위 설정 UI 배치
// [핵심] App.vue 는 "화면"이 아니라 "레이아웃 틀"이다.
//        상단 내비게이션은 고정되고, <RouterView> 자리만 갈아 끼워진다.
// ============================================

// [참고] RouterLink, RouterView 는 main.js 의 app.use(router) 로 전역 등록되므로
//        import 가 필요 없다.
import UnitToggler from '@/components/exercise/UnitToggler.vue'
</script>

<template>
  <div class="app-shell">
    <!-- ===== Navigation Bar ===== -->
    <nav class="nav-bar">
      <div class="nav-brand">
        <span class="brand-icon">🌤️</span>
        <span class="brand-text">Weather Dashboard</span>
      </div>

      <div class="nav-right">
        <!-- [핵심] <a href> 를 쓰면 브라우저가 강제 새로고침되어
             메모리의 모든 반응형 상태(ref, computed, store)가 초기화된다.
             반드시 <RouterLink> 를 사용할 것. -->
        <div class="nav-links">
          <RouterLink to="/">대시보드</RouterLink>
          <RouterLink to="/favorites">즐겨찾기</RouterLink>
          <RouterLink to="/about">서비스 소개</RouterLink>
        </div>

        <!-- 단위 설정 UI
             props 를 전혀 받지 않는다. store 에서 직접 읽고 직접 바꾼다. -->
        <UnitToggler />
      </div>
    </nav>

    <!-- ===== 메인 콘텐츠 ===== -->
    <main class="app-main">
      <!-- [핵심] 현재 URL 에 매칭되는 컴포넌트가 이 자리에 렌더링된다.
           페이지가 바뀌어도 위의 nav-bar 는 그대로 유지된다. -->
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
}

/* ===== Navigation Bar ===== */
/* [레이아웃] 본문(1200px)과 좌우 정렬을 맞춘다 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* 본문과 좌우 정렬을 맞춘다 */
  width: min(1400px, 100%);
  margin-inline: auto;
  padding: 18px 20px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 800;
  color: #253858;
}

.brand-icon {
  font-size: 20px;
}

/* 우측 영역 — 메뉴 + 단위 토글 */
.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-links {
  display: flex;
  gap: 6px;
}

.nav-links a {
  padding: 8px 15px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7a90;
  text-decoration: none;
  border-radius: 9px;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.nav-links a:hover {
  background: #e8eefb;
  color: #2f6fe4;
}

/* [핵심] router-link-active / router-link-exact-active 는
   Vue Router 가 현재 경로와 일치하는 링크에 자동으로 붙여주는 클래스다.
   별도 로직 없이 CSS 만으로 현재 메뉴를 강조할 수 있다. */
.nav-links a.router-link-exact-active {
  background: #5b9bf8;
  color: #fff;
}

/* ===== 메인 영역 ===== */
.app-main {
  padding: 0 20px 40px;
}

@media (max-width: 640px) {
  .nav-bar {
    flex-direction: column;
    gap: 12px;
    padding: 14px 8px;
  }
  .nav-right {
    flex-direction: column;
    gap: 10px;
  }
  .nav-links a {
    padding: 7px 11px;
    font-size: 13px;
  }
}
</style>
