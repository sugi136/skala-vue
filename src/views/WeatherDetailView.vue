<script setup>
// ============================================
// views/WeatherDetailView.vue
// [변경 사항]
//   - 상세 관측 항목 11개로 확장 (자외선 / 꽃가루 / 미세먼지 추가)
//   - 시간대별 예보(24시간) 섹션 추가
//   - 데스크톱 기준 레이아웃으로 폭 확대 (940 -> 1200px)
//   - 헤더에 핵심 지표를 함께 배치해 여백 축소
// ============================================
import { ref, computed, onMounted } from 'vue'
// [핵심] useRoute  — 현재 주소의 정보를 읽는다 (params, query 등)
//        useRouter — 페이지를 이동시킨다
import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherAlert from '@/components/exercise/WeatherAlert.vue'
import HourlyStrip from '@/components/exercise/HourlyStrip.vue'
import ForecastStrip from '@/components/exercise/ForecastStrip.vue'
import {
  findCityById,
  findDetailById,
  findForecastById,
  findHourlyById,
  findAlertById,
} from '@/data/weatherMockData.js'
import { useConfigStore } from '@/stores/configStore.js'
import { useFavoriteStore } from '@/stores/favoriteStore.js'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()

// --------------------------------------------
// [핵심] 동적 경로 파라미터 수신
//   /weather/seoul 로 접근하면 route.params.cityId 는 'seoul'
// --------------------------------------------
const cityId = route.params.cityId

const city = ref(null)
const detail = ref(null)
const hourly = ref([])
const forecast = ref([])
const alerts = ref([])
const isLoading = ref(true)

// --------------------------------------------
// [핵심] onMounted 는 컴포넌트가 실제 DOM 에 부착된 직후 실행된다.
//   [예정] 여기가 axios 로 실제 API 를 호출할 자리다.
// --------------------------------------------
onMounted(() => {
  city.value = findCityById(cityId)
  detail.value = findDetailById(cityId)
  alerts.value = findAlertById(cityId)
  hourly.value = findHourlyById(cityId)
  forecast.value = findForecastById(cityId)
  isLoading.value = false

  console.log(`[onMounted] cityId='${cityId}' 로 상세 데이터 조회`)
})

// --------------------------------------------
// [computed] 상세 항목 11개
//   [주의] 온도 단위 변환은 체감 온도에만 적용한다.
//          습도·바람·기압 등은 온도 단위와 무관하다.
// --------------------------------------------
const detailItems = computed(() => {
  if (!detail.value) return []

  return [
    {
      id: 'd1',
      icon: '🌡️',
      label: '체감 온도',
      value: `${configStore.convertTemp(detail.value.feelsLike)}${configStore.unitSymbol}`,
    },
    { id: 'd2', icon: '💧', label: '습도', value: `${detail.value.humidity}%` },
    {
      id: 'd3',
      icon: '🍃',
      label: '바람',
      value: `${detail.value.windSpeed} m/s`,
      sub: detail.value.windDir,
    },
    { id: 'd4', icon: '☁️', label: '구름량', value: `${detail.value.clouds}%` },
    { id: 'd5', icon: '🔭', label: '가시거리', value: `${detail.value.visibility} km` },
    { id: 'd6', icon: '🎈', label: '기압', value: `${detail.value.pressure} hPa` },
    { id: 'd7', icon: '🌅', label: '일출', value: detail.value.sunrise },
    { id: 'd8', icon: '🌇', label: '일몰', value: detail.value.sunset },
    // [공공데이터포털] 기상청_생활기상지수 조회서비스(4.0)
    {
      id: 'd9',
      icon: '😎',
      label: '자외선',
      value: `${detail.value.uvIndex}`,
      sub: detail.value.uvLevel,
      tone: uvTone(detail.value.uvIndex),
    },
    // [공공데이터포털] 기상청_꽃가루농도위험지수 조회서비스(3.0)
    {
      id: 'd10',
      icon: '🌾',
      label: '꽃가루',
      value: `${detail.value.pollen}`,
      sub: detail.value.pollenLevel,
    },
    // [공공데이터포털] 에어코리아 미세먼지 정보
    {
      id: 'd11',
      icon: '🌫️',
      label: '미세먼지',
      value: `${detail.value.dust}`,
      sub: `㎍/㎥ · ${detail.value.dustLevel}`,
      tone: dustTone(detail.value.dust),
    },
  ]
})

// --------------------------------------------
// [Customization] 지수 구간에 따른 강조 색 클래스
//   기상청 자외선지수 기준: 3미만 낮음 / 3~5 보통 / 6~7 높음 / 8~10 매우높음 / 11이상 위험
//   에어코리아 미세먼지(PM10) 기준: 0~30 좋음 / 31~80 보통 / 81~150 나쁨 / 151~ 매우나쁨
// --------------------------------------------
function uvTone(value) {
  if (value >= 8) return 'danger'
  if (value >= 6) return 'warn'
  return 'safe'
}

function dustTone(value) {
  if (value > 80) return 'danger'
  if (value > 30) return 'warn'
  return 'safe'
}

// 즐겨찾기 토글
const isFavorite = computed(() => favoriteStore.isFavorite(cityId))

const handleToggleFavorite = () => {
  favoriteStore.toggleFavorite(cityId)
}

// --------------------------------------------
// [핵심] 뒤로 가기
//   [주의] 주소창에 직접 URL 을 입력해 들어온 경우 돌아갈 히스토리가 없으므로,
//          홈으로 가는 RouterLink 도 함께 제공한다.
// --------------------------------------------
const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="detail-wrapper">
    <!-- [핵심] v-if / v-else-if / v-else 3단 분기 -->
    <p v-if="isLoading" class="state-message">불러오는 중...</p>

    <template v-else-if="city">
      <!-- ===== 헤더 ===== -->
      <header class="detail-header">
        <div class="header-bar">
          <button class="btn-back" @click="goBack">← 뒤로</button>

          <button
            class="btn-star"
            :class="{ active: isFavorite }"
            :title="isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'"
            @click="handleToggleFavorite"
          >
            {{ isFavorite ? '★ 즐겨찾기' : '☆ 즐겨찾기' }}
          </button>
        </div>

        <div class="header-body">
          <!-- 왼쪽: 도시명 + 큰 온도 -->
          <div class="header-main">
            <div class="header-icon">{{ city.icon }}</div>
            <div>
              <p class="header-en">{{ city.enName }}</p>
              <h1>{{ city.name }}</h1>
              <p class="header-status">{{ city.status }}</p>
            </div>
            <p class="header-temp">
              {{ configStore.convertTemp(city.temp) }}<span>{{ configStore.unitSymbol }}</span>
            </p>
          </div>

          <!-- 오른쪽: 핵심 지표 요약 (헤더 여백 축소) -->
          <div class="header-quick">
            <div class="quick-item">
              <p class="quick-label">체감</p>
              <p class="quick-value">
                {{ configStore.convertTemp(detail.feelsLike) }}{{ configStore.unitSymbol }}
              </p>
            </div>
            <div class="quick-item">
              <p class="quick-label">습도</p>
              <p class="quick-value">{{ detail.humidity }}%</p>
            </div>
            <div class="quick-item">
              <p class="quick-label">바람</p>
              <p class="quick-value">{{ detail.windSpeed }}m/s</p>
            </div>
            <div class="quick-item">
              <p class="quick-label">미세먼지</p>
              <p class="quick-value">{{ detail.dustLevel }}</p>
            </div>
          </div>
        </div>
      </header>

      <!-- ===== 기상특보 =====
           특보가 없으면 컴포넌트 내부에서 아무것도 렌더링하지 않으므로
           여기에 v-if 를 따로 쓰지 않는다 -->
      <WeatherAlert :items="alerts" />

      <!-- ===== 상세 관측 정보 ===== -->
      <!-- [재사용] BaseDashboardCard 는 날씨를 모르는 껍데기이므로
           상세 페이지에서도 그대로 쓸 수 있다. 컴포넌트 분리의 효과. -->
      <BaseDashboardCard title="상세 기상관측 정보" icon="📡">
        <div class="detail-grid">
          <div v-for="item in detailItems" :key="item.id" class="detail-item">
            <span class="item-icon">{{ item.icon }}</span>
            <p class="item-label">{{ item.label }}</p>
            <!-- [문법] :class 배열 — tone 이 있을 때만 강조 클래스를 붙인다 -->
            <p class="item-value" :class="item.tone ? ['tone-' + item.tone] : []">
              {{ item.value }}
            </p>
            <p v-if="item.sub" class="item-sub">{{ item.sub }}</p>
          </div>
        </div>
      </BaseDashboardCard>

      <!-- ===== 시간대별 예보 ===== -->
      <BaseDashboardCard title="시간대별 예보 (24시간)" icon="🕐" class="section-gap">
        <HourlyStrip :items="hourly" />
      </BaseDashboardCard>

      <!-- ===== 5일 예보 ===== -->
      <BaseDashboardCard title="5일 예보" icon="📅" class="section-gap">
        <ForecastStrip :items="forecast" />
      </BaseDashboardCard>

      <!-- [핵심] 코드 이동(router.push)이 아닌 링크 이동은 RouterLink 사용 -->
      <RouterLink to="/" class="link-home">← 대시보드로 돌아가기</RouterLink>
    </template>

    <!-- 존재하지 않는 도시 ID 로 접근한 경우 -->
    <div v-else class="state-message">
      <p>'{{ cityId }}' 에 해당하는 도시 정보를 찾을 수 없습니다.</p>
      <RouterLink to="/" class="link-home">대시보드로 돌아가기</RouterLink>
    </div>
  </div>
</template>

<style scoped>
/* [레이아웃] 데스크톱 기준 1200px — 모바일 앱을 늘린 듯한 여백을 줄인다 */
.detail-wrapper {
  width: min(1400px, 100%);
  margin-inline: auto;
  padding: 0 0 40px;
  color: #253858;
}

/* ===== 헤더 ===== */
.detail-header {
  padding: 20px 30px 26px;
  margin-bottom: 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, #4a90f0 0%, #74b0fb 100%);
  color: #fff;
  box-shadow: 0 12px 30px rgba(45, 90, 180, 0.16);
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-back,
.btn-star {
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-back:hover,
.btn-star:hover {
  background: rgba(255, 255, 255, 0.32);
}

.btn-star.active {
  background: rgba(255, 255, 255, 0.9);
  color: #e0a020;
}

/* 헤더 본문 — 좌(도시 정보) / 우(핵심 지표) */
.header-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  margin-top: 18px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  font-size: 64px;
  line-height: 1;
}

.header-en {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.75;
}

.detail-header h1 {
  margin: 2px 0 0;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.header-status {
  margin: 4px 0 0;
  font-size: 14px;
  opacity: 0.9;
}

.header-temp {
  margin: 0 0 0 14px;
  font-size: 54px;
  font-weight: 800;
  letter-spacing: -2px;
  line-height: 1;
}

.header-temp span {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0;
}

/* 헤더 우측 핵심 지표 */
.header-quick {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  backdrop-filter: blur(6px);
}

.quick-item {
  min-width: 62px;
  text-align: center;
}

.quick-label {
  margin: 0;
  font-size: 11px;
  opacity: 0.8;
}

.quick-value {
  margin: 4px 0 0;
  font-size: 16px;
  font-weight: 700;
}

/* ===== 상세 항목 그리드 ===== */
/* [레이아웃] 11개 항목 -> 6열 2행 (6 + 5) */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.detail-item {
  padding: 16px 10px;
  text-align: center;
  background: #fbfcff;
  border: 1px solid #e6edf9;
  border-radius: 13px;
  transition: border-color 0.15s ease;
}

.detail-item:hover {
  border-color: #c6dafb;
}

.item-icon {
  font-size: 22px;
}

.item-label {
  margin: 8px 0 0;
  font-size: 12px;
  color: #8899ad;
}

.item-value {
  margin: 4px 0 0;
  font-size: 19px;
  font-weight: 800;
}

/* 지수 구간별 강조 */
.item-value.tone-safe {
  color: #2e9e63;
}
.item-value.tone-warn {
  color: #e08a2e;
}
.item-value.tone-danger {
  color: #d94f4f;
}

.item-sub {
  margin: 2px 0 0;
  font-size: 11px;
  color: #8899ad;
}

/* ===== 섹션 간격 ===== */
.section-gap {
  margin-top: 18px;
}

/* ===== 공통 ===== */
.state-message {
  padding: 60px 0;
  text-align: center;
  font-size: 15px;
  color: #6b7a90;
}

.link-home {
  display: inline-block;
  margin-top: 18px;
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

/* ===== 반응형 ===== */
@media (max-width: 1100px) {
  .header-body {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .header-quick {
    width: 100%;
  }
}

@media (max-width: 700px) {
  .header-quick {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .detail-header {
    padding: 18px 20px 22px;
  }
  .header-icon {
    font-size: 48px;
  }
  .detail-header h1 {
    font-size: 27px;
  }
  .header-temp {
    font-size: 40px;
  }
}
</style>
