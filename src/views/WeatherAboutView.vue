<script setup>
// ============================================
// views/WeatherAboutView.vue
//
// [역할] 서비스 소개용 정적 페이지
//
// [핵심] 반응형 상태가 전혀 없는 정적 페이지도 하나의 라우트가 된다.
//        Lazy Loading 덕분에 사용자가 이 메뉴를 누르기 전까지는
//        이 파일이 다운로드되지 않는다.
// ============================================

// 주요 기능
const features = [
  {
    id: 'f1',
    icon: '🏙️',
    title: '전국 17개 지역 실시간 날씨',
    desc: '광역시·도 기준으로 현재 기온과 날씨 상태를 한 번에 조회합니다.',
  },
  {
    id: 'f2',
    icon: '🗺️',
    title: '전국 날씨 지도',
    desc: 'API 응답의 좌표를 SVG에 투영해 지역별 날씨와 기온을 지도 위에 표시합니다. 지도 라이브러리 없이 직접 구현했습니다.',
  },
  {
    id: 'f3',
    icon: '🕐',
    title: '시간대별 · 5일 예보',
    desc: '3시간 간격 24시간 예보와 5일 예보를 강수확률과 함께 제공합니다.',
  },
  {
    id: 'f4',
    icon: '📍',
    title: '현재 위치 기반 조회',
    desc: '브라우저 위치 정보로 가까운 지역의 날씨를 자동으로 불러옵니다. 권한을 거부하면 기본 지역으로 표시됩니다.',
  },
  {
    id: 'f5',
    icon: '🔍',
    title: '한글 · 초성 검색',
    desc: '지역명은 물론 초성(ㅅㅇ)으로도 검색할 수 있습니다. 목록에 없는 도시는 API로 조회해 추가합니다.',
  },
  {
    id: 'f6',
    icon: '🌫️',
    title: '대기환경 정보',
    desc: '공공데이터포털을 연동해 자외선지수·미세먼지·기상특보를 함께 제공합니다.',
  },
  {
    id: 'f7',
    icon: '⭐',
    title: '즐겨찾기',
    desc: '자주 확인하는 지역을 저장하면 새로고침 후에도 유지됩니다.',
  },
  {
    id: 'f8',
    icon: '🌡️',
    title: '섭씨 · 화씨 전환',
    desc: '단위를 바꾸면 카드·요약·예보·상세 화면의 온도가 동시에 변환됩니다.',
  },
]

// 사용 기술 스택
const techStack = [
  { id: 't1', icon: '⚡', name: 'Vue 3', desc: 'Composition API 기반 프론트엔드 프레임워크' },
  { id: 't2', icon: '🧭', name: 'Vue Router', desc: 'SPA 페이지 전환 및 동적 경로 매칭' },
  {
    id: 't3',
    icon: '🍍',
    name: 'Pinia',
    desc: '전역 상태 관리 — 날씨 데이터 캐싱, 단위 설정, 즐겨찾기',
  },
  { id: 't4', icon: '🔌', name: 'Axios', desc: 'OpenWeather · 공공데이터포털 API 통신' },
  { id: 't5', icon: '🎨', name: 'Element Plus', desc: '버튼·알림·스켈레톤 등 UI 컴포넌트' },
  { id: 't6', icon: '🛠️', name: 'Vite', desc: '개발 서버 및 번들링' },
  {
    id: 't7',
    icon: '▲',
    name: 'Vercel',
    desc: '정적 배포 및 공공데이터 프록시 서버리스 함수',
  },
]

// 데이터 출처
const dataSources = [
  {
    id: 'd1',
    icon: '🌤️',
    name: 'OpenWeather',
    desc: '현재 날씨 · 시간대별 예보 · 5일 예보',
  },
  {
    id: 'd2',
    icon: '🏛️',
    name: '기상청 (공공데이터포털)',
    desc: '생활기상지수(자외선) · 기상특보',
  },
  {
    id: 'd3',
    icon: '😷',
    name: '에어코리아 (한국환경공단)',
    desc: '미세먼지 · 초미세먼지 실시간 측정정보',
  },
]
</script>

<template>
  <div class="about-wrapper">
    <header class="about-header">
      <div class="about-icon">🌤️</div>
      <h1>서비스 소개</h1>
      <p class="about-lead">
        전국 주요 지역의 날씨를 한눈에 확인할 수 있는 대시보드입니다.<br />
        SK AX Full-Stack Engineering 과정의 Vue.js 실습 프로젝트로 제작되었습니다.
      </p>
    </header>

    <section class="about-section">
      <h2>주요 기능</h2>
      <div class="feature-grid">
        <div v-for="item in features" :key="item.id" class="feature-card">
          <div class="feature-head">
            <span class="feature-icon">{{ item.icon }}</span>
            <h3>{{ item.title }}</h3>
          </div>
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

    <section class="about-section">
      <h2>데이터 출처</h2>
      <ul class="tech-list">
        <li v-for="source in dataSources" :key="source.id" class="tech-item">
          <span class="tech-icon">{{ source.icon }}</span>
          <div>
            <p class="tech-name">{{ source.name }}</p>
            <p class="tech-desc">{{ source.desc }}</p>
          </div>
        </li>
      </ul>

      <p class="source-note">
        공공데이터포털 API는 브라우저 직접 호출이 차단되어 있어, 개발 환경에서는 Vite 프록시, 배포
        환경에서는 Vercel 서버리스 함수를 통해 조회합니다.
      </p>
    </section>

    <!-- [핵심] &lt;a href="/"&gt; 를 쓰면 새로고침되어 앱이 처음부터 다시 로드된다.
         반드시 &lt;RouterLink&gt; 를 사용할 것. -->
    <RouterLink to="/" class="link-home">← 메인 대시보드로 돌아가기</RouterLink>
  </div>
</template>

<style scoped>
.about-wrapper {
  width: min(1400px, 100%);
  margin-inline: auto;
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
/* 폭에 따라 열 수가 자동으로 조정된다 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.feature-card {
  padding: 16px 18px;
  background: #fbfcff;
  border: 1px solid #e6edf9;
  border-radius: 13px;
}

.feature-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-icon {
  font-size: 18px;
}

.feature-card h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.feature-card p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #6b7a90;
}

/* ===== 사용 기술 · 데이터 출처 ===== */
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

.source-note {
  margin: 14px 0 0;
  padding: 12px 14px;
  font-size: 12px;
  line-height: 1.7;
  color: #6b7a90;
  background: #f7f9fd;
  border-radius: 10px;
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
  .about-header {
    padding: 34px 22px;
  }
}
</style>
