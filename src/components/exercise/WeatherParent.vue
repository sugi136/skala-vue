<script setup>
// ============================================
// 4장 Hands on : WeatherParent.vue
//
// [역할] 모든 반응형 데이터를 보유하고, 자식 컴포넌트들을 조립한다.
//
// [요구사항 1] 3장의 반응형 데이터를 그대로 유지 — 기능 변경 없음
// [핵심] 데이터는 위에서 아래로(props), 이벤트는 아래에서 위로(emits)
//        자식은 자기 화면만 그리고, 실제 상태 변경은 전부 여기서 일어난다.
// ============================================
import { ref, computed, watch, watchEffect } from 'vue'

import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import SummaryPanel from './SummaryPanel.vue'

// --------------------------------------------
//   4일차 API 연동을 대비한 가상의 백엔드 데이터 배열
//   name -> data.name / temp -> data.main.temp / status -> data.weather[0].description
// --------------------------------------------
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', icon: '☀️' },
  { id: 'city_02', name: '수원', temp: 24, status: '비', icon: '🌧️' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', icon: '⛅' },
  { id: 'city_04', name: '제주', temp: 27, status: '맑음', icon: '☀️' },
  { id: 'city_05', name: '강릉', temp: 25, status: '흐림', icon: '☁️' },
])

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const selectedCityId = ref(null)

const today = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

// --------------------------------------------
// 한글 초성 추출기 (3장에서 유지)
// 완성형 한글은 0xAC00 부터 (초성×588)+(중성×28)+종성 구조이므로
// 588 로 나눈 몫이 곧 초성의 순번이 된다.
// --------------------------------------------
const CHOSUNG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]

const getChosung = (str) =>
  [...str]
    .map((char) => {
      const code = char.charCodeAt(0) - 0xac00
      if (code < 0 || code > 11171) return char
      return CHOSUNG[Math.floor(code / 588)]
    })
    .join('')

// --------------------------------------------
// [computed] 검색 필터링 (3장에서 유지)
// 초성 매칭은 startsWith 로 앞에서부터만 — includes 를 쓰면
// 'ㅅ' 입력 시 '부산'(ㅂㅅ)의 두 번째 초성까지 걸려버린다.
// --------------------------------------------
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value

  return weatherList.value.filter(
    (item) => item.name.startsWith(query) || getChosung(item.name).startsWith(query),
  )
})

// --------------------------------------------
// [computed] 오늘의 요약 자동 계산 (3장에서 유지)
// --------------------------------------------
const temps = computed(() => weatherList.value.map((item) => item.temp))

const hottestCity = computed(() => {
  const max = Math.max(...temps.value)
  return weatherList.value.find((item) => item.temp === max)
})

const coldestCity = computed(() => {
  const min = Math.min(...temps.value)
  return weatherList.value.find((item) => item.temp === min)
})

const averageTemp = computed(() => {
  const sum = temps.value.reduce((acc, cur) => acc + cur, 0)
  return Number((sum / temps.value.length).toFixed(1))
})

const hotCityCount = computed(() => weatherList.value.filter((item) => item.temp >= 25).length)

const summaryList = computed(() => [
  {
    id: 'sum_01',
    icon: '🔥',
    label: '최고 기온',
    value: `${hottestCity.value.temp}°C`,
    sub: hottestCity.value.name,
    tone: 'hot',
  },
  {
    id: 'sum_02',
    icon: '❄️',
    label: '최저 기온',
    value: `${coldestCity.value.temp}°C`,
    sub: coldestCity.value.name,
    tone: 'cold',
  },
  {
    id: 'sum_03',
    icon: '📊',
    label: '평균 기온',
    value: `${averageTemp.value}°C`,
    sub: `${weatherList.value.length}개 도시`,
    tone: 'avg',
  },
  {
    id: 'sum_04',
    icon: '🌡️',
    label: '더운 도시',
    value: `${hotCityCount.value}곳`,
    sub: '25°C 이상',
    tone: 'count',
  },
])

// --------------------------------------------
// [computed] 선택 도시 및 날씨별 헤더 테마 (3장에서 유지)
// --------------------------------------------
const selectedCity = computed(() =>
  weatherList.value.find((item) => item.id === selectedCityId.value),
)

const headerTheme = computed(() => {
  const status = selectedCity.value?.status
  if (status === '비') return 'rain'
  if (status === '흐림') return 'cloudy'
  if (status === '구름') return 'cloud'
  return 'clear'
})

// --------------------------------------------
// [4장 핵심] 자식이 emit 한 이벤트를 받아 처리하는 핸들러들
//
// 자식은 "이런 일이 있었다"고 알리기만 하고,
// 실제 상태 변경은 전부 부모인 여기서 수행한다.
// --------------------------------------------

// SearchBar 의 update-query 수신
const handleUpdateQuery = (newQuery) => {
  searchQuery.value = newQuery
}

// WeatherCard 의 select-card 수신
const handleSelectCard = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
}

// WeatherCard 의 click-detail 수신
const handleClickDetail = (city) => {
  window.alert(`${city.name}의 현재 날씨는 [${city.status}] 상태입니다.`)
}

// --------------------------------------------
// [watch / watchEffect] 3장에서 유지
// --------------------------------------------
watch(selectedCityInfo, (newInfo, oldInfo) => {
  console.log(`[watch] 상태바 변경: "${oldInfo}" -> "${newInfo}"`)
})

watch(searchQuery, (newQuery) => {
  console.log(`[watch] 검색어 '${newQuery}' -> 결과 ${filteredWeatherList.value.length}건`)
})

watchEffect(() => {
  console.log(
    `[watchEffect] 검색어 '${searchQuery.value}' / 표시 중인 도시 ${filteredWeatherList.value.length}개`,
  )
})
</script>

<template>
  <div class="dashboard-wrapper" :class="['theme-' + headerTheme]">
    <!-- ===== 헤더 ===== -->
    <header class="app-header">
      <div class="header-top">
        <div>
          <h1>과제 3: 날씨 (Component)</h1>
          <p class="header-date">
            {{ today }}
            <span v-if="selectedCity" class="header-city">{{ selectedCity.name }}</span>
          </p>
        </div>
        <div class="header-deco" aria-hidden="true">{{ selectedCity?.icon ?? '☀️' }}</div>
      </div>

      <!--  BaseDashboardCard 로 검색 영역 감싸기
            slot 내부의 SearchBar 는 부모 스코프에서 평가되므로
              WeatherParent 의 데이터와 직접 바인딩/통신이 가능하다 -->
      <BaseDashboardCard title="도시 검색" icon="🔍" class="search-panel">
        <SearchBar
          :query="searchQuery"
          :result-count="filteredWeatherList.length"
          @update-query="handleUpdateQuery"
        />
      </BaseDashboardCard>
    </header>

    <!-- ===== 본문 ===== -->
    <div class="dashboard-body">
      <!-- ---------- 왼쪽 : 지역별 날씨 현황 ---------- -->
      <BaseDashboardCard title="지역별 날씨 현황" icon="🏙️">
        <!-- [핵심] v-for 로 자식 컴포넌트를 반복 생성.
             각 카드에 도시 객체 하나씩을 props 로 내려준다 -->
        <WeatherCard
          v-for="item in filteredWeatherList"
          :key="item.id"
          :city="item"
          :is-selected="item.id === selectedCityId"
          @select-card="handleSelectCard"
          @click-detail="handleClickDetail"
        />

        <p v-if="filteredWeatherList.length === 0" class="empty-message">
          검색 결과와 일치하는 도시가 없습니다.
        </p>
      </BaseDashboardCard>

      <!-- ---------- 오른쪽 : 오늘의 요약 ---------- -->
      <!-- 추가로 분리한 SummaryPanel 컴포넌트 -->
      <BaseDashboardCard title="오늘의 요약" icon="📋">
        <SummaryPanel :items="summaryList" />
      </BaseDashboardCard>
    </div>

    <!-- 하단 상태바 -->
    <div class="status-bar">
      <span class="status-dot"></span>
      {{ selectedCityInfo }}
    </div>
  </div>
</template>

<style scoped>
/* WeatherParent 는 레이아웃만 담당
   카드·검색창·요약 항목의 디자인은 각 자식 컴포넌트로 이동 */

.dashboard-wrapper {
  max-width: 940px;
  margin: 0 auto;
  border-radius: 20px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
  color: #253858;
  box-shadow: 0 12px 40px rgba(45, 90, 180, 0.13);

  /* 날씨별 테마 기본값 (맑음) */
  --sky-top: #4a90f0;
  --sky-mid: #74b0fb;
  --sky-bottom: #dbe9fd;
  --body-bg: #eef4fd;
  --accent: #2f6fe4;

  /* 경계선 없는 그라데이션 — 래퍼 하나에만 배경을 깐다 */
  background: linear-gradient(
    180deg,
    var(--sky-top) 0px,
    var(--sky-mid) 180px,
    var(--sky-bottom) 340px,
    var(--body-bg) 460px
  );
  transition: background 0.6s ease;
}

/* 날씨별 테마 */
.dashboard-wrapper.theme-clear {
  --sky-top: #4a90f0;
  --sky-mid: #74b0fb;
  --sky-bottom: #dbe9fd;
  --body-bg: #eef4fd;
  --accent: #2f6fe4;
}
.dashboard-wrapper.theme-cloud {
  --sky-top: #6f8db8;
  --sky-mid: #9ab3d4;
  --sky-bottom: #dfe6ef;
  --body-bg: #f0f3f7;
  --accent: #4a6b96;
}
.dashboard-wrapper.theme-cloudy {
  --sky-top: #7c8794;
  --sky-mid: #a2acb8;
  --sky-bottom: #e2e5e9;
  --body-bg: #f2f3f5;
  --accent: #5a6470;
}
.dashboard-wrapper.theme-rain {
  --sky-top: #3f5f8a;
  --sky-mid: #5c7fae;
  --sky-bottom: #d5dee9;
  --body-bg: #eceff4;
  --accent: #3d5f8f;
}

/* ===== 헤더 ===== */
.app-header {
  padding: 30px 34px 28px;
  color: #fff;
}

.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22px;
}

.app-header h1 {
  margin: 0;
  font-size: 29px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.header-date {
  margin: 8px 0 0;
  font-size: 14px;
  opacity: 0.92;
}

.header-city {
  margin-left: 8px;
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.45);
  font-weight: 700;
}

.header-deco {
  font-size: 54px;
  line-height: 1;
}

/* 헤더 안의 검색 패널은 배경을 반투명하게 */
.search-panel {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
}

/* ===== 본문 그리드 ===== */
.dashboard-body {
  display: grid;
  grid-template-columns: 1fr 268px;
  gap: 18px;
  padding: 20px;
}

/* ===== 하단 상태바 ===== */
.status-bar {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 15px 34px;
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
  transition: color 0.6s ease;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
  transition: background 0.6s ease;
}

/* ===== 검색 결과 없음 ===== */
.empty-message {
  margin: 0;
  padding: 34px 0;
  text-align: center;
  font-size: 14px;
  color: #94a3b8;
  background: #fbfcff;
  border: 1px dashed #dbe4f2;
  border-radius: 14px;
}

/* ===== 반응형 ===== */
@media (max-width: 780px) {
  .dashboard-body {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 520px) {
  .app-header {
    padding: 24px 20px 22px;
  }
  .header-deco {
    display: none;
  }
  .status-bar {
    padding: 14px 20px;
  }
}
</style>
