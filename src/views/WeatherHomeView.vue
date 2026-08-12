<script setup>
// ============================================
// views/WeatherHomeView.vue
// [변경 사항]
//   - 데스크톱 기준 레이아웃으로 폭 확대 (940 -> 1200px)
//   - 시간대별 예보 섹션 추가
// ============================================
import { ref, computed, watch, watchEffect } from 'vue'
// [핵심] useRouter — 코드로 페이지를 이동시킬 때 사용하는 함수
import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import SummaryPanel from '@/components/exercise/SummaryPanel.vue'
import HourlyStrip from '@/components/exercise/HourlyStrip.vue'
import ForecastStrip from '@/components/exercise/ForecastStrip.vue'

import {
  weatherMockList,
  findForecastById,
  findHourlyById,
  DEFAULT_CITY_ID,
} from '@/data/weatherMockData.js'
import { useConfigStore } from '@/stores/configStore.js'

// [핵심] useRouter() 와 use~Store() 는 <script setup> 최상단에서 호출한다.
// 함수 호출 시점이 컴포넌트 렌더링과 관련되어 있기 때문에, 함수나 조건문 안에서 호출하면 안 된다.
const router = useRouter()
const configStore = useConfigStore()

// --------------------------------------------
// 반응형 상태
// --------------------------------------------
const weatherList = ref(weatherMockList)
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
// 한글 초성 추출기
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
// [computed] 검색 필터링
// 일반 검색과 초성 검색 모두 startsWith 로 통일 — 매칭 규칙 일관성 유지
// --------------------------------------------
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value

  return weatherList.value.filter(
    (item) => item.name.startsWith(query) || getChosung(item.name).startsWith(query),
  )
})

// --------------------------------------------
// [computed] 오늘의 요약 자동 계산
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

// [주의] 25도 이상 판정은 항상 섭씨 원본으로 한다.
//        화씨로 변환한 값(82 등)을 25 와 비교하면 전부 "더움"이 된다.
const hotCityCount = computed(() => weatherList.value.filter((item) => item.temp >= 25).length)

const summaryList = computed(() => [
  {
    id: 'sum_01',
    icon: '🔥',
    label: '최고 기온',
    value: `${configStore.convertTemp(hottestCity.value.temp)}${configStore.unitSymbol}`,
    sub: hottestCity.value.name,
    tone: 'hot',
  },
  {
    id: 'sum_02',
    icon: '❄️',
    label: '최저 기온',
    value: `${configStore.convertTemp(coldestCity.value.temp)}${configStore.unitSymbol}`,
    sub: coldestCity.value.name,
    tone: 'cold',
  },
  {
    id: 'sum_03',
    icon: '📊',
    label: '평균 기온',
    value: `${configStore.convertTemp(averageTemp.value)}${configStore.unitSymbol}`,
    sub: `${weatherList.value.length}개 도시`,
    tone: 'avg',
  },
  {
    id: 'sum_04',
    icon: '🌡️',
    label: '더운 도시',
    value: `${hotCityCount.value}곳`,
    // 기준값도 현재 단위로 환산해 표시
    sub: `${configStore.hotThreshold}${configStore.unitSymbol} 이상`,
    tone: 'count',
  },
])

// --------------------------------------------
// [computed] 선택 도시 및 날씨별 헤더 테마
// [주의] selectedCityId(ref, id 문자열)와 selectedCity(computed, 도시 객체)는 다른 변수다.
// --------------------------------------------
const selectedCity = computed(() =>
  weatherList.value.find((item) => item.id === selectedCityId.value),
)

const headerTheme = computed(() => {
  // store 에서 테마 기능을 껐으면 항상 기본값
  if (!configStore.useWeatherTheme) return 'clear'

  const status = selectedCity.value?.status
  if (status === '비') return 'rain'
  if (status === '흐림') return 'cloudy'
  if (status === '구름') return 'cloud'
  return 'clear'
})

// --------------------------------------------
// [예보 기준 도시] 우선순위
//   1. 사용자가 카드를 선택했으면 그 도시
//   2. 아니면 현재 위치 기반 도시
//   3. 위치 조회 실패 시 기본값(서울)
// [예정] currentLocationCityId 를 navigator.geolocation 결과로 채운다.
//   navigator.geolocation.getCurrentPosition(
//     (pos) => { /* pos.coords.latitude, longitude 로 API 호출 */ },
//     (err) => { /* 권한 거부 시 DEFAULT_CITY_ID 유지 */ }
//   )
//   지금은 API 미연동 상태이므로 기본값(서울)을 그대로 사용한다.
// --------------------------------------------
const currentLocationCityId = ref(DEFAULT_CITY_ID)

const forecastCityId = computed(() => selectedCityId.value ?? currentLocationCityId.value)

const forecastCity = computed(() =>
  weatherList.value.find((item) => item.id === forecastCityId.value),
)

// [핵심] forecastCityId 가 바뀌면 예보도 자동으로 다시 조회된다.
const hourlyList = computed(() => findHourlyById(forecastCityId.value))
const forecastList = computed(() => findForecastById(forecastCityId.value))

// --------------------------------------------
// 자식 컴포넌트의 emit 수신 핸들러
// --------------------------------------------
const handleUpdateQuery = (newQuery) => {
  searchQuery.value = newQuery
}

const handleSelectCard = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
}

//  window.alert 대신 Programmatic Navigation 으로 상세 페이지 이동
const handleClickDetail = (city) => {
  router.push({ name: 'weather-detail', params: { cityId: city.id } })
}

// --------------------------------------------
// [watch / watchEffect]
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
          <h1>과제 5: 날씨 (Store)</h1>
          <p class="header-date">
            {{ today }}
            <span v-if="selectedCity" class="header-city">{{ selectedCity.name }}</span>
          </p>
        </div>
        <div class="header-deco" aria-hidden="true">{{ selectedCity?.icon ?? '☀️' }}</div>
      </div>

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
      <BaseDashboardCard title="지역별 날씨 현황" icon="🏙️">
        <!-- 화면이 넓어지면 카드가 2열, 3열로 자동 배치된다 -->
        <div class="card-grid">
          <WeatherCard
            v-for="item in filteredWeatherList"
            :key="item.id"
            :city="item"
            :is-selected="item.id === selectedCityId"
            @select-card="handleSelectCard"
            @click-detail="handleClickDetail"
          />
        </div>

        <p v-if="filteredWeatherList.length === 0" class="empty-message">
          검색 결과와 일치하는 도시가 없습니다.
        </p>
      </BaseDashboardCard>

      <BaseDashboardCard title="오늘의 요약" icon="📋">
        <SummaryPanel :items="summaryList" />
      </BaseDashboardCard>

      <!-- 시간대별 예보 — 좌우 컬럼을 가로질러 전체 폭 사용 -->
      <BaseDashboardCard
        :title="`시간대별 예보 (${forecastCity?.name ?? '—'})`"
        icon="🕐"
        class="full-width"
      >
        <HourlyStrip :items="hourlyList" />
      </BaseDashboardCard>

      <!-- 5일 예보 -->
      <BaseDashboardCard
        :title="`5일 예보 (${forecastCity?.name ?? '—'})`"
        icon="📅"
        class="full-width"
      >
        <ForecastStrip :items="forecastList" />

        <p v-if="!selectedCityId" class="forecast-hint">
          현재 위치 기준입니다. 도시 카드를 선택하면 해당 지역 예보로 바뀝니다.
        </p>
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
/* [레이아웃] 데스크톱 기준 1200px */
.dashboard-wrapper {
  /* 반응형 폭 — vw 는 스크롤바 폭까지 포함해 가로 스크롤을 만들 수 있으므로
     min() + % 조합을 사용한다. 넓은 화면에서는 1400px 에서 멈춘다. */
  width: min(1400px, 100%);
  margin-inline: auto;
  border-radius: 20px;
  overflow: hidden;
  color: #253858;
  box-shadow: 0 12px 40px rgba(45, 90, 180, 0.13);

  --sky-top: #4a90f0;
  --sky-mid: #74b0fb;
  --sky-bottom: #dbe9fd;
  --body-bg: #eef4fd;
  --accent: #2f6fe4;

  background: linear-gradient(
    180deg,
    var(--sky-top) 0px,
    var(--sky-mid) 170px,
    var(--sky-bottom) 300px,
    var(--body-bg) 400px
  );
  transition: background 0.6s ease;
}

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
  padding: 28px 30px 24px;
  color: #fff;
}
.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
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
.search-panel {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
}

/* ===== 본문 그리드 ===== */
/* [레이아웃] 폭이 넓어졌으므로 사이드 컬럼도 함께 확대 */
.dashboard-body {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 18px;
  padding: 20px;
}

/* 카드 목록 — 폭에 따라 열 수가 자동으로 늘어난다.
   카드 하나가 360px 아래로 줄어들 것 같으면 열을 줄인다. */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 12px;
}

/* 전체 폭을 쓰는 패널 */
.full-width {
  grid-column: 1 / -1;
}

.forecast-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #9aa8bd;
  text-align: center;
}

/* ===== 하단 상태바 ===== */
.status-bar {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 15px 30px;
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
@media (max-width: 900px) {
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
