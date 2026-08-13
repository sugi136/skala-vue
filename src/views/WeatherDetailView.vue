<script setup>
// ============================================
// views/WeatherDetailView.vue
//
// [변경] 직접 API 를 호출하던 것을 weatherStore 로 일원화
//   - 메인에서 이미 받아온 데이터가 있으면 재요청하지 않는다 (캐시)
//   - URL 로 직접 접근한 경우에는 store 가 알아서 조회한다
// ============================================
import { ref, computed, onMounted } from 'vue'
// [핵심] useRoute  — 현재 주소의 정보를 읽는다 (params, query 등)
//        useRouter — 페이지를 이동시킨다
import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherAlert from '@/components/exercise/WeatherAlert.vue'
import HourlyStrip from '@/components/exercise/HourlyStrip.vue'
import ForecastStrip from '@/components/exercise/ForecastStrip.vue'
import SunArc from '@/components/exercise/SunArc.vue'

import { useConfigStore } from '@/stores/configStore.js'
import { useWeatherStore } from '@/stores/weatherStore.js'
import { useFavoriteStore } from '@/stores/favoriteStore.js'
import { getIconUrl } from '@/api/weatherApi.js'
import { Star, StarFilled } from '@element-plus/icons-vue'
import { pm10Tone, uvTone as getUvTone } from '@/api/publicDataApi.js'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const favoriteStore = useFavoriteStore()

// --------------------------------------------
// [핵심] 동적 경로 파라미터 수신
//   /weather/seoul 로 접근하면 route.params.cityId 는 'seoul'
// --------------------------------------------
const cityId = route.params.cityId

const isLoading = ref(true)
const errorMessage = ref('')

// --------------------------------------------
// store 에서 데이터를 읽는다.
//
// [핵심] ref 로 복사하지 않고 computed 로 store 를 참조한다.
//        store 가 갱신되면(단위 변경, 목록 새로고침 등) 화면도 따라온다.
// --------------------------------------------
const city = computed(() => weatherStore.findCity(cityId))
const detail = computed(() => weatherStore.findDetail(cityId))
const hourly = computed(() => weatherStore.findForecast(cityId)?.hourly ?? [])
const forecast = computed(() => weatherStore.findForecast(cityId)?.daily ?? [])

// 공공데이터포털 — 미세먼지·자외선
const air = computed(() => weatherStore.findAir(cityId))

// 기상특보 — 전국 목록에서 이 지역 것만 걸러낸다
const alerts = computed(() => weatherStore.findAlerts(cityId))

// --------------------------------------------
// [핵심] onMounted 는 DOM 부착 직후 실행되므로 API 호출의 적기다.
//
//   ensureDetail / ensureForecast 는 캐시를 먼저 확인하므로,
//   메인에서 넘어온 경우에는 네트워크 요청이 발생하지 않는다.
//   URL 로 직접 접근한 경우에만 실제 호출이 일어난다.
// --------------------------------------------
onMounted(async () => {
  try {
    // OpenWeather 데이터가 화면의 뼈대이므로 먼저 확보한다.
    // 순차로 하면 두 번 기다려야 하므로 Promise.all 로 묶는다.
    await Promise.all([weatherStore.ensureDetail(cityId), weatherStore.ensureForecast(cityId)])
  } catch (error) {
    // 인터셉터가 가공한 메시지가 여기로 온다
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }

  // 공공데이터포털은 보조 정보이므로 화면을 막지 않는다.
  // await 하지 않고 별도로 진행시켜, 도착하는 대로 화면에 반영되게 한다.
  weatherStore.ensureAirData(cityId).catch(() => {})
  weatherStore.ensureAlerts().catch(() => {})

  console.log(`[onMounted] cityId='${cityId}' 상세 데이터 확보 완료`)
})

// --------------------------------------------
// [computed] 상세 항목
//   [주의] 온도 단위 변환은 체감 온도에만 적용한다.
//          습도·바람·기압 등은 온도 단위와 무관하다.
// --------------------------------------------
const detailItems = computed(() => {
  if (!detail.value) return []

  const d = detail.value

  return [
    {
      id: 'd1',
      icon: '🌡️',
      label: '체감 온도',
      value: `${configStore.convertTemp(d.feelsLike)}${configStore.unitSymbol}`,
    },
    { id: 'd2', icon: '💧', label: '습도', value: `${d.humidity}%` },
    { id: 'd3', icon: '🍃', label: '바람', value: `${d.windSpeed} m/s`, sub: d.windDir },
    { id: 'd4', icon: '☁️', label: '구름량', value: `${d.clouds}%` },
    { id: 'd5', icon: '🔭', label: '가시거리', value: `${d.visibility} km` },
    {
      id: 'd6',
      icon: '🎈',
      label: '기압',
      // [단위] 1 atm = 1013.25 hPa (표준대기압)
      //        일상적인 값은 1 근처라 소수 셋째 자리까지 표시한다
      value: `${(d.pressure / 1013.25).toFixed(3)} atm`,
      sub: `${d.pressure} hPa`,
    },
    // 강수량은 비가 올 때만 응답에 포함되므로 없으면 0 으로 표시된다
    { id: 'd9', icon: '☔', label: '강수량', value: `${d.rain1h} mm`, sub: '최근 1시간' },
    // 아래는 공공데이터포털 데이터.
    // 아직 도착하지 않았거나 국내 지역이 아니면 '—' 로 표시된다.
    {
      id: 'd10',
      icon: '😎',
      label: '자외선',
      value: air.value?.uv ? `${air.value.uv.value}` : '—',
      // 검색으로 추가한 도시는 행정구역코드가 없어 조회할 수 없다
      sub: air.value?.uv?.level ?? '기본 지역만 지원',
      tone: air.value?.uv ? getUvTone(air.value.uv.value) : null,
    },
    {
      id: 'd11',
      icon: '🌫️',
      label: '미세먼지',
      value: air.value?.dust ? `${air.value.dust.pm10}` : '—',
      sub: air.value?.dust ? `㎍/㎥ · ${air.value.dust.grade}` : '에어코리아',
      tone: air.value?.dust ? pm10Tone(air.value.dust.pm10) : null,
    },
    {
      id: 'd12',
      icon: '😷',
      label: '초미세먼지',
      value: air.value?.dust?.pm25 != null ? `${air.value.dust.pm25}` : '—',
      sub: '㎍/㎥ · PM2.5',
    },
  ]
})

// [참고] 구간별 색상 판정 기준은 publicDataApi.js 에 모아두었다.
//   기상청 자외선지수: 3미만 낮음 / 3~5 보통 / 6~7 높음 / 8~10 매우높음 / 11이상 위험
//   에어코리아 PM10: 0~30 좋음 / 31~80 보통 / 81~150 나쁨 / 151~ 매우나쁨

// --------------------------------------------
// 즐겨찾기
// --------------------------------------------
const isFavorite = computed(() => favoriteStore.isFavorite(cityId))

const handleToggleFavorite = () => {
  if (!city.value) return
  // 검색으로 추가된 도시는 regionList 에 없으므로 객체를 통째로 넘긴다
  favoriteStore.toggleFavorite(city.value)
}

// --------------------------------------------
// [핵심] 뒤로 가기
//   [주의] 주소창에 URL 을 직접 입력해 들어온 경우 돌아갈 히스토리가 없으므로,
//          홈으로 가는 RouterLink 도 함께 제공한다.
// --------------------------------------------
const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="detail-wrapper">
    <!-- 로딩 중 / 에러 / 데이터 있음 / 존재하지 않는 도시 -->
    <!-- [Element Plus] el-skeleton — 로딩 중 레이아웃 뼈대를 보여준다 -->
    <el-skeleton v-if="isLoading" :rows="6" animated />

    <div v-else-if="errorMessage" class="state-message">
      <el-alert type="error" :title="errorMessage" :closable="false" show-icon />
      <RouterLink to="/" class="link-home">대시보드로 돌아가기</RouterLink>
    </div>

    <template v-else-if="city && detail">
      <!-- ===== 헤더 ===== -->
      <header class="detail-header">
        <div class="header-bar">
          <!-- [Element Plus] link 속성 — 배경과 테두리 없이 텍스트만 남긴다.
               파란 헤더 위에서는 버튼 박스가 오히려 지저분해 보인다. -->
          <el-button class="btn-ghost" link @click="goBack">← 뒤로</el-button>

          <!-- 별 아이콘만 남긴다. 의미는 title 툴팁으로 전달 -->
          <el-button
            class="btn-star"
            :class="{ 'is-fav': isFavorite }"
            link
            :title="isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'"
            @click="handleToggleFavorite"
          >
            <el-icon :size="24">
              <StarFilled v-if="isFavorite" />
              <Star v-else />
            </el-icon>
          </el-button>
        </div>

        <div class="header-body">
          <!-- 왼쪽: 도시명 + 큰 온도 -->
          <div class="header-main">
            <img class="header-icon" :src="getIconUrl(city.icon)" :alt="city.status" />
            <div>
              <p class="header-en">{{ city.enName }}</p>
              <h1>{{ city.name }}</h1>
              <p class="header-status">
                {{ city.status }}
                <span v-if="city.region" class="header-region">· {{ city.region }}</span>
              </p>
            </div>
            <p class="header-temp">
              {{ configStore.convertTemp(city.temp) }}<span>{{ configStore.unitSymbol }}</span>
            </p>
          </div>

          <!-- 오른쪽: 핵심 지표 요약 -->
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
              <p class="quick-label">구름량</p>
              <p class="quick-value">{{ detail.clouds }}%</p>
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
          <!-- 일출·일몰 — 두 칸을 차지하는 반원 궤도 그래픽 -->
          <SunArc class="sun-cell" :sunrise="detail.sunrise" :sunset="detail.sunset" />

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
      <p>'{{ cityId }}' 에 해당하는 지역 정보를 찾을 수 없습니다.</p>
      <RouterLink to="/" class="link-home">대시보드로 돌아가기</RouterLink>
    </div>
  </div>
</template>

<style scoped>
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

/* 헤더가 파란 배경이므로 글자만 흰색으로 맞춘다.
   :deep() 는 scoped 안에서 자식 컴포넌트 내부를 선택할 때 쓴다. */
:deep(.btn-ghost) {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 600;
}

:deep(.btn-ghost:hover) {
  color: #fff;
}

/* 별 아이콘 — 켜지면 노란색 */
:deep(.btn-star) {
  color: rgba(255, 255, 255, 0.8);
  transition:
    color 0.15s ease,
    transform 0.15s ease;
}

:deep(.btn-star:hover) {
  color: #fff;
  transform: scale(1.15);
}

:deep(.btn-star.is-fav),
:deep(.btn-star.is-fav:hover) {
  color: #ffd43b;
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
  width: 92px;
  height: 92px;
  flex-shrink: 0;
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

.header-region {
  opacity: 0.75;
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
/* 폭에 따라 열 수가 자동으로 조정된다 */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

/* 일출·일몰 그래픽은 두 칸을 차지한다 */
.sun-cell {
  grid-column: span 2;
}

@media (max-width: 520px) {
  .sun-cell {
    grid-column: span 2;
  }
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
    width: 70px;
    height: 70px;
  }
  .detail-header h1 {
    font-size: 27px;
  }
  .header-temp {
    font-size: 40px;
  }
}
</style>
