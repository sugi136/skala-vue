<script setup>
// ============================================
// 5장 Hands on : views/WeatherAboutView.vue
//
// [요구사항 5] 서비스 소개용 정적 페이지 + 메인 대시보드로 돌아가기
//
// [핵심] 반응형 상태가 전혀 없는 정적 페이지도 하나의 라우트가 된다.
//        Lazy Loading 덕분에 사용자가 이 메뉴를 누르기 전까지는
//        이 파일이 다운로드되지 않는다.
// ============================================

// 사용 기술 스택 목록 (v-for 렌더링용)
const techStack = [
  { id: 't1', icon: '⚡', name: 'Vue 3', desc: 'Composition API 기반 프론트엔드 프레임워크' },
  { id: 't2', icon: '🧭', name: 'Vue Router', desc: 'SPA 페이지 전환 및 동적 경로 매칭' },
  { id: 't3', icon: '🍍', name: 'Pinia', desc: '전역 상태 관리 (6장 적용 예정)' },
  { id: 't4', icon: '🔌', name: 'Axios', desc: 'OpenWeather API 연동 (7장 적용 예정)' },
  { id: 't5', icon: '🛠️', name: 'Vite', desc: '개발 서버 및 번들링' },
]

// 주요 기능 목록
const features = [
  {
    id: 'f1',
    title: '실시간 도시 검색',
    desc: '도시명은 물론 초성(ㅅㅇ)으로도 검색할 수 있습니다.',
  },
  {
    id: 'f2',
    title: '오늘의 요약',
    desc: '전체 도시의 최고·최저·평균 기온을 자동으로 집계합니다.',
  },
  { id: 'f3', title: '날씨별 테마', desc: '선택한 도시의 날씨에 따라 화면 색조가 바뀝니다.' },
  {
    id: 'f4',
    title: '상세 관측 정보',
    desc: '체감온도·습도·바람·일출/일몰 등을 확인할 수 있습니다.',
  },
]
</script>

<template>
  <div class="about-wrapper">
    <header class="about-header">
      <div class="about-icon">🌤️</div>
      <h1>서비스 소개</h1>
      <p class="about-lead">
        전국 주요 도시의 날씨를 한눈에 확인할 수 있는 대시보드입니다.<br />
        SK AX Full-Stack Engineering 과정의 Vue.js 실습 프로젝트로 제작되었습니다.
      </p>
    </header>

    <section class="about-section">
      <h2>주요 기능</h2>
      <div class="feature-grid">
        <div v-for="item in features" :key="item.id" class="feature-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <section class="about-section">
      <h2>사용 기술</h2>
      <ul class="tech-list">
        <li v-for="tech in techStack" :key="tech.id" class="tech-item">
          <span class="tech-icon">{{ tech.icon }}</span>
          <div>
            <p class="tech-name">{{ tech.name }}</p>
            <p class="tech-desc">{{ tech.desc }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- [요구사항 5] 메인 대시보드로 돌아가기 -->
    <!-- [핵심] <a href="/"> 를 쓰면 새로고침되어 앱이 처음부터 다시 로드된다.
         반드시 <RouterLink> 를 사용할 것. -->
    <RouterLink to="/" class="link-home">← 메인 대시보드로 돌아가기</RouterLink>
  </div>
</template>

<style scoped>
.about-wrapper {
  max-width: 940px;
  margin: 0 auto;
  padding: 0 0 40px;
  color: #253858;
}

/* ===== 헤더 ===== */
.about-header {
  padding: 44px 34px;
  margin-bottom: 20px;
  text-align: center;
  border-radius: 20px;
  background: linear-gradient(135deg, #4a90f0 0%, #74b0fb 100%);
  color: #fff;
  box-shadow: 0 12px 30px rgba(45, 90, 180, 0.16);
}

.about-icon {
  font-size: 56px;
  line-height: 1;
}

.about-header h1 {
  margin: 14px 0 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.about-lead {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.7;
  opacity: 0.94;
}

/* ===== 섹션 ===== */
.about-section {
  padding: 24px 26px;
  margin-bottom: 18px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(45, 90, 180, 0.07);
}

.about-section h2 {
  margin: 0 0 16px;
  font-size: 17px;
  font-weight: 700;
  color: #2f6fe4;
}

/* ===== 주요 기능 ===== */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.feature-card {
  padding: 16px 18px;
  background: #fbfcff;
  border: 1px solid #e6edf9;
  border-radius: 13px;
}

.feature-card h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.feature-card p {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #6b7a90;
}

/* ===== 사용 기술 ===== */
.tech-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 0;
  border-bottom: 1px solid #f0f4fa;
}

.tech-item:last-child {
  border-bottom: none;
}

.tech-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 11px;
  background: #eef4fd;
  font-size: 17px;
}

.tech-name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.tech-desc {
  margin: 3px 0 0;
  font-size: 12px;
  color: #8899ad;
}

/* ===== 돌아가기 ===== */
.link-home {
  display: inline-block;
  padding: 11px 22px;
  font-size: 14px;
  font-weight: 600;
  color: #2f6fe4;
  background: #e8eefb;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.15s ease;
}

.link-home:hover {
  background: #dbe6f8;
}

@media (max-width: 640px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
  .about-header {
    padding: 34px 22px;
  }
}
</style>
