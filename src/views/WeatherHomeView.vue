<script setup>
// ============================================
// 5장 Hands on : views/WeatherHomeView.vue
//
//   WeatherParent 를 대체하는 '/' 경로 페이지
//   - 4장의 WeatherParent 내용을 그대로 옮기되
//   - 상세보기 버튼의 window.alert() 를 제거하고
//     Programmatic Navigation(router.push)으로 대체
// ============================================
import { ref, computed, watch, watchEffect } from 'vue'
// [핵심] useRouter — 코드로 페이지를 이동시킬 때 사용하는 함수
import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import SummaryPanel from '@/components/exercise/SummaryPanel.vue'

import ForecastStrip from '@/components/exercise/ForecastStrip.vue'
import { weatherMockList, findForecastById, DEFAULT_CITY_ID } from '@/data/weatherMockData.js'

// 데이터를 공통 모듈에서 가져온다.
//   DetailView 도 같은 데이터를 봐야 하므로 컴포넌트 안에 두면 공유할 수 없다.
import { weatherMockList } from '@/data/weatherMockData.js'

// [핵심] useRouter() 는 <script setup> 최상단에서 한 번만 호출한다.
//        함수 안에서 호출하면 컴포넌트 인스턴스를 찾지 못해 동작하지 않는다.
const router = useRouter()

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
// --------------------------------------------
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value

  return weatherList.value.filter(
    (item) => item.name.startsWith(query) || getChosung(item.name).startsWith(query),
  )
})

// --------------------------------------------
// [computed] 오늘의 요약
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
// [computed] 선택 도시 및 날씨별 테마
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
// [예보 기준 도시] 우선순위
//   1. 사용자가 카드를 선택했으면 그 도시
//   2. 아니면 현재 위치 기반 도시
//   3. 위치 조회 실패 시 기본값(서울)
//
// [7장] currentLocationCityId 를 navigator.geolocation 결과로 채운다.
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
//        카드를 클릭하면 하단 예보가 그 도시 것으로 바뀐다.
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

// --------------------------------------------
// Programmatic Navigation
//
// 4장: window.alert(...) 로 팝업을 띄웠다.
// 5장: router.push 로 상세 페이지로 이동시킨다.
//
// [문법] 두 가지 표기가 모두 가능하다.
//   router.push(`/weather/${city.id}`)                        경로 문자열
//   router.push({ name: 'weather-detail', params: {...} })    이름 + 파라미터
//
// 이름 방식을 쓰면 나중에 경로 규칙이 바뀌어도 이 코드를 고칠 필요가 없다.
// --------------------------------------------
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
          <h1>과제 4: 날씨 (Router)</h1>
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

      <BaseDashboardCard title="오늘의 요약" icon="📋">
        <SummaryPanel :items="summaryList" />
      </BaseDashboardCard>

      <!-- 5일 예보 — 좌우 컬럼을 가로질러 전체 폭 사용 -->
      <BaseDashboardCard
        :title="`5일 예보 (${forecastCity?.name ?? '—'})`"
        icon="📅"
        class="full-width"
      >
        <ForecastStrip :items="forecastList" />

        <!-- 선택 전에는 어느 기준인지 안내 -->
        <p v-if="!selectedCityId" class="forecast-hint">
          현재 위치 기준입니다. 도시 카드를 선택하면 해당 지역 예보로 바뀝니다.
        </p>
      </BaseDashboardCard>
    </div>

    <div class="status-bar">
      <span class="status-dot"></span>
      {{ selectedCityInfo }}
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  max-width: 940px;
  margin: 0 auto;
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
    var(--sky-mid) 180px,
    var(--sky-bottom) 340px,
    var(--body-bg) 460px
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
.search-panel {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
}

.dashboard-body {
  display: grid;
  grid-template-columns: 1fr 268px;
  gap: 18px;
  padding: 20px;
}

.full-width {
  grid-column: 1 / -1;
}

.forecast-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #9aa8bd;
  text-align: center;
}

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
