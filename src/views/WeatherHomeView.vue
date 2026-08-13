<script setup>
// ============================================
// views/WeatherHomeView.vue
//
// [변경] 직접 API 를 호출하던 것을 weatherStore 로 일원화
//   - 도시 목록·상세·예보를 store 가 캐싱하므로 중복 호출이 없다
//   - 상세 페이지·즐겨찾기 페이지가 같은 데이터를 공유한다
//   - 현재 위치 조회 추가
// ============================================
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import SummaryPanel from '@/components/exercise/SummaryPanel.vue'
import KoreaMap from '@/components/exercise/KoreaMap.vue'
import HourlyStrip from '@/components/exercise/HourlyStrip.vue'
import ForecastStrip from '@/components/exercise/ForecastStrip.vue'

import { DEFAULT_CITY_ID } from '@/data/regionList.js'
import { useCitySearch } from '@/composables/useCitySearch.js'
import { useConfigStore } from '@/stores/configStore.js'
import { useWeatherStore } from '@/stores/weatherStore.js'
import { getIconUrl } from '@/api/weatherApi.js'
// [Element Plus] ElMessage 는 컴포넌트가 아니라 함수형 API 다.
//   호출하면 화면 상단에 토스트가 떴다가 자동으로 사라진다.
import { ElMessage } from 'element-plus'

// [핵심] useRouter() 와 use~Store() 는 함수 안이 아니라
//        <script setup> 본문에서 직접 호출해야 한다.
//        setup 실행 중에만 현재 컴포넌트를 알 수 있기 때문이다.
const router = useRouter()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()

// [핵심] state 와 getters 는 storeToRefs 로 꺼내야 반응성이 유지된다.
//        그냥 구조분해하면 값만 복사되어 화면이 갱신되지 않는다.
const { cities, isLoading, errorMessage, failedCities, currentLocationId } =
  storeToRefs(weatherStore)

// --------------------------------------------
// 이 화면에서만 쓰는 지역 상태
// (여러 페이지가 공유하지 않으므로 store 에 올리지 않는다)
// --------------------------------------------
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const selectedCityId = ref(null)
const isSearching = ref(false)
const searchError = ref('')

const today = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

// --------------------------------------------
// 초기 로딩
//
// [핵심] onMounted 는 DOM 부착 직후 실행되므로 API 호출의 적기다.
//        도시 목록을 먼저 받고, 그 다음 현재 위치를 조회한다.
//        (위치 조회 결과가 기존 목록에 있는 도시인지 대조해야 하므로 순서가 중요)
// --------------------------------------------
onMounted(async () => {
  await weatherStore.loadCities()
  await weatherStore.detectCurrentLocation()

  // 기상특보는 전국 목록을 한 번만 받아 각 카드가 걸러 쓴다.
  // 보조 정보이므로 화면을 막지 않고 별도로 진행시킨다.
  weatherStore.ensureAlerts().catch(() => {})
})

// --------------------------------------------
// 검색 필터링
// 초성 추출과 매칭 규칙은 composable 로 분리했다.
// 화면 컴포넌트가 한글 유니코드 연산까지 알 필요는 없기 때문이다.
// --------------------------------------------
const { filteredCities: filteredWeatherList } = useCitySearch(cities, searchQuery)

// --------------------------------------------
// [computed] 오늘의 요약 자동 계산
// --------------------------------------------
const temps = computed(() => cities.value.map((item) => item.temp))

const hottestCity = computed(() => {
  if (cities.value.length === 0) return null
  const max = Math.max(...temps.value)
  return cities.value.find((item) => item.temp === max)
})

const coldestCity = computed(() => {
  if (cities.value.length === 0) return null
  const min = Math.min(...temps.value)
  return cities.value.find((item) => item.temp === min)
})

const averageTemp = computed(() => {
  if (cities.value.length === 0) return 0
  const sum = temps.value.reduce((acc, cur) => acc + cur, 0)
  return Number((sum / temps.value.length).toFixed(1))
})

// [주의] 25도 이상 판정은 항상 섭씨 원본으로 한다.
//        화씨로 변환한 값(82 등)을 25 와 비교하면 전부 "더움"이 된다.
const hotCityCount = computed(() => cities.value.filter((item) => item.temp >= 25).length)

// 비가 오는 지역
// [주의] API 의 description 은 '실 비', '가벼운 비' 등 표현이 다양하므로
//        정확히 일치가 아닌 포함 여부로 판정한다
const rainyCities = computed(() =>
  cities.value.filter((item) => item.status.includes('비') || item.status.includes('소나기')),
)

// 전국 기온 차 — 최고와 최저의 간격
const tempGap = computed(() => {
  if (!hottestCity.value || !coldestCity.value) return 0
  return hottestCity.value.temp - coldestCity.value.temp
})

const summaryList = computed(() => {
  // 데이터가 아직 없으면 빈 배열 -> SummaryPanel 이 아무것도 그리지 않는다
  if (!hottestCity.value || !coldestCity.value) return []

  return [
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
      sub: `${cities.value.length}개 지역`,
      tone: 'avg',
    },
    {
      id: 'sum_04',
      icon: '🌡️',
      label: '기온 차',
      // 단위 변환은 "차이"에 그대로 적용할 수 없다.
      // 화씨 변환은 ×9/5 + 32 인데, 차이값에는 +32 를 빼야 하므로 ×9/5 만 적용한다.
      value: configStore.isFahrenheit
        ? `${Math.round((tempGap.value * 9) / 5)}${configStore.unitSymbol}`
        : `${tempGap.value}${configStore.unitSymbol}`,
      sub: `${coldestCity.value.name} ↔ ${hottestCity.value.name}`,
      tone: 'gap',
    },
    {
      id: 'sum_05',
      icon: '☔',
      label: '비 오는 지역',
      value: `${rainyCities.value.length}곳`,
      // [문법] map 으로 이름만 뽑아 join. 3곳까지만 표시하고 나머지는 생략
      sub:
        rainyCities.value.length === 0
          ? '전국 대체로 맑음'
          : rainyCities.value
              .slice(0, 3)
              .map((c) => c.name)
              .join(', ') + (rainyCities.value.length > 3 ? ' 외' : ''),
      tone: 'rain',
    },
    {
      id: 'sum_06',
      icon: '🔥',
      label: '더운 지역',
      value: `${hotCityCount.value} / ${cities.value.length}`,
      sub: `${configStore.hotThreshold}${configStore.unitSymbol} 이상`,
      tone: 'count',
    },
  ]
})

// --------------------------------------------
// [computed] 선택 도시 및 날씨별 헤더 테마
// [주의] selectedCityId(ref, id 문자열)와 selectedCity(computed, 도시 객체)는 다른 변수다.
// --------------------------------------------
const selectedCity = computed(() => cities.value.find((item) => item.id === selectedCityId.value))

const headerTheme = computed(() => {
  // store 에서 테마 기능을 껐으면 항상 기본값
  if (!configStore.useWeatherTheme) return 'clear'

  // [주의] API 응답의 description 은 '온흐림', '실 비' 등 다양하므로
  //        정확히 일치가 아닌 포함 여부로 판정한다
  const status = headerCity.value?.status ?? ''

  if (status.includes('비') || status.includes('소나기')) return 'rain'
  if (status.includes('눈')) return 'cloudy'
  if (status.includes('흐림')) return 'cloudy'
  if (status.includes('구름')) return 'cloud'
  return 'clear'
})

// --------------------------------------------
// [예보·헤더 기준 도시] 우선순위
//   1. 사용자가 카드를 선택했으면 그 도시
//   2. 아니면 현재 위치로 판별된 도시
//   3. 위치 조회 실패 시 기본값(서울)
// --------------------------------------------
const headerCityId = computed(
  () => selectedCityId.value ?? currentLocationId.value ?? DEFAULT_CITY_ID,
)

const headerCity = computed(() => cities.value.find((item) => item.id === headerCityId.value))

// 예보 데이터 — store 캐시에서 읽는다
const hourlyList = computed(() => weatherStore.findForecast(headerCityId.value)?.hourly ?? [])
const forecastList = computed(() => weatherStore.findForecast(headerCityId.value)?.daily ?? [])

// --------------------------------------------
// [핵심] 기준 도시가 바뀌면 예보를 확보한다.
//   store 의 ensureForecast 는 캐시가 있으면 API 를 호출하지 않으므로
//   같은 도시를 여러 번 눌러도 요청이 반복되지 않는다.
// --------------------------------------------
watch(
  headerCityId,
  async (cityId) => {
    // 목록이 아직 로드되지 않았으면 건너뛴다
    if (!cityId || cities.value.length === 0) return

    try {
      await weatherStore.ensureForecast(cityId)
    } catch (error) {
      console.error('[forecast]', error.message)
    }
  },
  { immediate: true },
)

// 목록 로딩이 끝난 직후에도 한 번 실행되도록 감시한다
watch(
  () => cities.value.length,
  async (len) => {
    if (len > 0) {
      try {
        await weatherStore.ensureForecast(headerCityId.value)
      } catch (error) {
        console.error('[forecast]', error.message)
      }
    }
  },
)

// --------------------------------------------
// 자식 컴포넌트의 emit 수신 핸들러
// --------------------------------------------
const handleUpdateQuery = (newQuery) => {
  searchQuery.value = newQuery
  searchError.value = ''
}

const handleSelectCard = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
}

// window.alert 대신 Programmatic Navigation 으로 상세 페이지 이동
const handleClickDetail = (city) => {
  router.push({ name: 'weather-detail', params: { cityId: city.id } })
}

// --------------------------------------------
// 목록에 없는 도시를 API 로 검색해 추가한다.
//
// [주의] 검색으로 추가된 도시는 새로고침하면 사라진다.
//        유지하려면 즐겨찾기(★)에 등록해야 한다.
// --------------------------------------------
const handleSearchApi = async (keyword) => {
  isSearching.value = true
  searchError.value = ''

  try {
    const addedId = await weatherStore.addCityBySearch(keyword)

    if (addedId) {
      // 추가된 도시를 바로 선택 상태로 만든다
      selectedCityId.value = addedId
      searchQuery.value = ''
      selectedCityInfo.value = `'${keyword}' 을(를) 목록에 추가했습니다.`

      // [Element Plus] 토스트로 결과를 알린다.
      //   alert 와 달리 사용자의 조작을 막지 않고 자동으로 사라진다.
      ElMessage.success(`'${keyword}' 을(를) 목록에 추가했습니다.`)
    }
  } catch (error) {
    searchError.value = error.message
    ElMessage.error(error.message)
  } finally {
    isSearching.value = false
  }
}

// 목록 새로고침
const handleReload = () => weatherStore.reloadCities()

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
          <h1>과제 6: 날씨 (Axios)</h1>
          <p class="header-date">
            {{ today }}
            <span v-if="headerCity" class="header-city">
              {{ headerCity.name }}
              <!-- 현재 위치로 판별된 도시라면 표시 -->
              <em v-if="headerCityId === currentLocationId" class="location-badge">📍 내 위치</em>
            </span>
          </p>
        </div>

        <!-- 기준 도시의 실제 날씨 아이콘 -->
        <img
          v-if="headerCity"
          class="header-deco-img"
          :src="getIconUrl(headerCity.icon)"
          :alt="headerCity.status"
        />
        <div v-else class="header-deco" aria-hidden="true">☀️</div>
      </div>

      <BaseDashboardCard title="도시 검색" icon="🔍" class="search-panel">
        <SearchBar
          :query="searchQuery"
          :result-count="filteredWeatherList.length"
          :is-searching="isSearching"
          :search-error="searchError"
          @update-query="handleUpdateQuery"
          @search-api="handleSearchApi"
        />
      </BaseDashboardCard>
    </header>

    <!-- ===== 본문 ===== -->
    <div class="dashboard-body">
      <!-- API 통신 상태 표시 -->
      <!-- [Element Plus] el-alert — type 하나로 색상·아이콘이 함께 적용된다 -->
      <el-alert
        v-if="errorMessage"
        class="full-width"
        type="error"
        :title="errorMessage"
        :closable="false"
        show-icon
      >
        <el-button type="danger" size="small" @click="handleReload">다시 시도</el-button>
      </el-alert>

      <el-alert
        v-else-if="failedCities.length > 0"
        class="full-width"
        type="warning"
        :title="`일부 지역을 불러오지 못했습니다: ${failedCities.join(', ')}`"
        :closable="false"
        show-icon
      />

      <!-- 지역별 날씨 — 평소에는 지도, 검색 중에는 카드 목록을 보여준다.
           [설계] 검색으로 추가한 해외 도시는 좌표가 지도 범위 밖이라
                  지도에 표시할 수 없다. 검색 중에는 목록으로 전환한다. -->
      <BaseDashboardCard title="전국 날씨 지도" icon="🗺️">
        <el-skeleton v-if="isLoading" :rows="6" animated />

        <!-- 검색 중 — 카드 목록 -->
        <template v-else-if="searchQuery">
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
            검색 결과와 일치하는 지역이 없습니다.
          </p>
        </template>

        <!-- 평소 — 지도 -->
        <KoreaMap
          v-else
          :cities="cities"
          :selected-id="selectedCityId"
          @select-city="handleSelectCard"
          @click-detail="handleClickDetail"
        />
      </BaseDashboardCard>

      <BaseDashboardCard title="오늘의 요약" icon="📋">
        <SummaryPanel :items="summaryList" />
      </BaseDashboardCard>

      <!-- 시간대별 예보 — 좌우 컬럼을 가로질러 전체 폭 사용 -->
      <BaseDashboardCard
        :title="`시간대별 예보 (${headerCity?.name ?? '—'})`"
        icon="🕐"
        class="full-width"
      >
        <HourlyStrip :items="hourlyList" />
      </BaseDashboardCard>

      <!-- 5일 예보 -->
      <BaseDashboardCard
        :title="`5일 예보 (${headerCity?.name ?? '—'})`"
        icon="📅"
        class="full-width"
      >
        <ForecastStrip :items="forecastList" />

        <p v-if="!selectedCityId" class="forecast-hint">
          현재 위치 기준입니다. 지역 카드를 선택하면 해당 지역 예보로 바뀝니다.
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
.location-badge {
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-style: normal;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.24);
}
.header-deco {
  font-size: 54px;
  line-height: 1;
}
.header-deco-img {
  width: 78px;
  height: 78px;
}
.search-panel {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
}

/* ===== 본문 그리드 ===== */
.dashboard-body {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 18px;
  padding: 20px;
}

/* 카드 목록 — 폭에 따라 열 수가 자동으로 늘어난다.
   카드 하나가 340px 아래로 줄어들 것 같으면 열을 줄인다. */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

/* ===== API 통신 상태 ===== */
/* Element Plus 기본값보다 모서리를 둥글게 맞춘다 */
:deep(.el-alert) {
  padding: 14px 18px;
  border-radius: 14px;
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
  .header-deco,
  .header-deco-img {
    display: none;
  }
  .status-bar {
    padding: 14px 20px;
  }
}
</style>
