<script setup>
// ============================================
// 2장 Hands on : Weather Mockup
// 강사님 예제 코드를 베이스로, 우측 "오늘의 요약" 패널과 디자인을 추가함
// 사용 문법: ref / v-for / v-bind / v-if / v-else /
//          v-model / @click / @click.stop / scoped
// ============================================
import { ref } from 'vue'

// --------------------------------------------
//   4일차 API 연동을 대비한 가상의 백엔드 데이터 배열 (v-for 및 :key 실습용)
//   name   -> data.name
//   temp   -> data.main.temp
//   status -> data.weather[0].description
// [Customization] icon 필드 추가
// --------------------------------------------
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', icon: '☀️' },
  { id: 'city_02', name: '수원', temp: 24, status: '비', icon: '🌧️' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', icon: '⛅' },
  { id: 'city_04', name: '제주', temp: 27, status: '맑음', icon: '☀️' },
  { id: 'city_05', name: '강릉', temp: 25, status: '흐림', icon: '☁️' },
])

//  검색어 및 상태바 제어용 데이터
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

// [Customization] 오늘 날짜 — 페이지 진입 시 1회만 계산되므로 ref 불필요
const today = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

// --------------------------------------------
// [Customization] 오늘의 요약 (예정)
//   최고/최저 -> temp 의 max / min
//   평균      -> temp 의 합 / 개수
//   더운 도시 -> temp >= 25 인 항목 수
// --------------------------------------------
const summaryList = ref([
  { id: 'sum_01', icon: '🔥', label: '최고 기온', value: '28°C', sub: '서울', tone: 'hot' },
  { id: 'sum_02', icon: '❄️', label: '최저 기온', value: '24°C', sub: '수원', tone: 'cold' },
  { id: 'sum_03', icon: '📊', label: '평균 기온', value: '26°C', sub: '5개 도시', tone: 'avg' },
  { id: 'sum_04', icon: '🌡️', label: '더운 도시', value: '3곳', sub: '25°C 이상', tone: 'count' },
])

//  알림 대행 함수 (window 객체 격리 우회)
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- ===== 헤더 ===== -->
    <header class="app-header">
      <div class="header-top">
        <div>
          <h1>과제 1: 날씨 (Mockup)</h1>
          <p class="header-date">{{ today }}</p>
        </div>
        <div class="header-deco" aria-hidden="true">☀️</div>
      </div>

      <!--  검색 박스 -->
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          :value="searchQuery"
          @input="(e) => (searchQuery = e.target.value)"
          placeholder="검색할 도시 이름 입력"
        />
      </div>

      <!-- [핵심] v-if / v-else — 입력 여부에 따라 다른 안내 -->
      <p class="search-status">
        <template v-if="searchQuery">
          검색 중인 도시: <strong>{{ searchQuery }}</strong>
        </template>
        <template v-else> 도시 이름을 입력하면 이곳에 표시됩니다. </template>
      </p>
    </header>

    <!-- ===== 본문 : 좌(목록) / 우(요약) ===== -->
    <div class="dashboard-body">
      <!-- ---------- 왼쪽 : 지역별 날씨 현황 ---------- -->
      <section class="panel list-box">
        <h3 class="panel-title"><span class="title-icon">🏙️</span> 지역별 날씨 현황</h3>

        <!-- [핵심] v-for + :key / 카드 전체 클릭 -->
        <div
          v-for="item in weatherList"
          :key="item.id"
          class="weather-card"
          @click="selectedCityInfo = `${item.name}이 선택되었습니다.`"
        >
          <div class="card-icon">{{ item.icon }}</div>

          <div class="card-main">
            <h4 class="card-name">
              {{ item.name }} <span class="card-status">({{ item.status }})</span>
            </h4>
            <p class="card-temp">
              현재 기온: <strong>{{ item.temp }}°C</strong>
            </p>

            <!-- [핵심] v-if / v-else — 기온에 따라 다른 배지 -->
            <span v-if="item.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
            <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>
          </div>

          <!-- [핵심] @click.stop — 부모 카드로 이벤트가 버블링되는 것을 차단 -->
          <button class="btn-detail" @click.stop="showDetail(item.name, item.status)">
            상세보기
          </button>
        </div>
      </section>

      <!-- ---------- 오른쪽 : 오늘의 요약 ---------- -->
      <aside class="panel summary-box">
        <h3 class="panel-title"><span class="title-icon">📋</span> 오늘의 요약</h3>

        <ul class="summary-list">
          <li v-for="sum in summaryList" :key="sum.id" class="summary-row">
            <!-- [문법] :class 배열 형식 — 고정 클래스 + 동적으로 조립한 클래스 -->
            <span class="summary-badge" :class="['tone-' + sum.tone]">{{ sum.icon }}</span>
            <div class="summary-text">
              <p class="summary-label">{{ sum.label }}</p>
              <p class="summary-value">{{ sum.value }}</p>
              <p class="summary-sub">{{ sum.sub }}</p>
            </div>
          </li>
        </ul>
      </aside>
    </div>

    <!--  하단 상태바 -->
    <div class="status-bar">
      <span class="status-dot"></span>
      {{ selectedCityInfo }}
    </div>
  </div>
</template>
