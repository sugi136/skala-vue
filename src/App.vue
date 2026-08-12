<script setup>
// ============================================
// 5장 Hands on : App.vue
//
// [요구사항 2] Navigation Bar(RouterLink) 추가 및 메인 콘텐츠 영역(RouterView) 배치
//
// [핵심] App.vue 는 이제 "화면"이 아니라 "레이아웃 틀"이 된다.
//        상단 내비게이션은 고정되고, 그 아래 <RouterView> 자리만 갈아 끼워진다.
// ============================================

// [참고] RouterLink, RouterView 는 main.js 에서 app.use(router) 로 등록되어
//        전역 컴포넌트가 되므로 import 가 필요 없다.
</script>

<template>
  <div class="app-shell">
    <!-- ===== Navigation Bar ===== -->
    <nav class="nav-bar">
      <div class="nav-brand">
        <span class="brand-icon">🌤️</span>
        <span class="brand-text">Weather Dashboard</span>
      </div>

      <div class="nav-links">
        <!-- [핵심] <a href> 를 쓰면 브라우저가 강제 새로고침되어
             메모리의 모든 반응형 상태(ref, computed)가 초기화된다.
             반드시 <RouterLink> 를 사용할 것.

             [문법] to 에 문자열 경로 또는 { name: '라우트이름' } 객체를 넘길 수 있다.
             이름으로 지정하면 나중에 경로가 바뀌어도 수정할 필요가 없다. -->
        <RouterLink to="/">대시보드</RouterLink>
        <RouterLink to="/favorites">즐겨찾기</RouterLink>
        <RouterLink to="/about">서비스 소개</RouterLink>
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
  background: #f4f7fe;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
}

/* ===== Navigation Bar ===== */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 940px;
  margin: 0 auto;
  padding: 18px 8px;
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
   별도 로직 없이 CSS 만으로 현재 메뉴를 강조할 수 있다.
   - active       : 경로가 "포함"되면 붙음 (/weather/city_01 에서도 / 링크에 붙음)
   - exact-active : 경로가 완전히 일치할 때만 붙음 */
.nav-links a.router-link-exact-active {
  background: #5b9bf8;
  color: #fff;
}

/* ===== 메인 영역 ===== */
.app-main {
  padding: 0 8px 40px;
}

@media (max-width: 520px) {
  .nav-bar {
    flex-direction: column;
    gap: 12px;
    padding: 14px 8px;
  }
  .nav-links a {
    padding: 7px 11px;
    font-size: 13px;
  }
}
</style>
