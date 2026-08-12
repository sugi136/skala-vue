<script setup>
// ============================================
// 5장 Hands on : views/WeatherDetailView.vue
//
// [요구사항 4] 지역별 상세 기상관측 정보 페이지
//   - Router 동적 경로(:cityId)를 기반으로
//   - Mount 시점에 Mock Data 에서 도시 객체를 선택
// ============================================
import { ref, computed, onMounted } from 'vue'
// [핵심] useRoute  — 현재 주소의 정보를 읽는다 (params, query 등)
//        useRouter — 페이지를 이동시킨다
//        이름이 한 글자 차이라 헷갈리기 쉽다.
import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { findCityById, findDetailById } from '@/data/weatherMockData.js'

const route = useRoute()
const router = useRouter()

// --------------------------------------------
// [핵심] 동적 경로 파라미터 수신
//   /weather/city_01 로 접근하면 route.params.cityId 는 'city_01'
//   라우터 설정의 path: '/weather/:cityId' 에서 :cityId 라는 이름을 정했다.
// --------------------------------------------
const cityId = route.params.cityId

const city = ref(null)
const detail = ref(null)
const isLoading = ref(true)

// --------------------------------------------
// [요구사항 4] Mount 시점에 데이터 선택
//
// [핵심] onMounted 는 컴포넌트가 실제 DOM 에 부착된 직후 실행된다.
//        [7장] 여기가 axios 로 실제 API 를 호출할 자리다.
//        지금은 Mock Data 에서 꺼내오는 것으로 그 흐름을 미리 연습한다.
// --------------------------------------------
onMounted(() => {
  city.value = findCityById(cityId)
  detail.value = findDetailById(cityId)
  isLoading.value = false

  console.log(`[onMounted] cityId='${cityId}' 로 상세 데이터 조회`)
})

// --------------------------------------------
// [computed] 상세 항목을 화면용 배열로 조립
//   [7장] 각 항목이 /weather 응답 한 번으로 전부 채워진다.
// --------------------------------------------
const detailItems = computed(() => {
  if (!detail.value) return []

  return [
    { id: 'd1', icon: '🌡️', label: '체감 온도', value: `${detail.value.feelsLike}°C` },
    { id: 'd2', icon: '💧', label: '습도', value: `${detail.value.humidity}%` },
    {
      id: 'd3',
      icon: '🍃',
      label: '바람',
      value: `${detail.value.windSpeed} m/s`,
      sub: detail.value.windDir,
    },
    { id: 'd4', icon: '☁️', label: '구름량', value: `${detail.value.clouds}%` },
    { id: 'd5', icon: '👁️', label: '가시거리', value: `${detail.value.visibility} km` },
    { id: 'd6', icon: '📊', label: '기압', value: `${detail.value.pressure} hPa` },
    { id: 'd7', icon: '🌅', label: '일출', value: detail.value.sunrise },
    { id: 'd8', icon: '🌇', label: '일몰', value: detail.value.sunset },
  ]
})

// --------------------------------------------
// [핵심] 뒤로 가기 두 가지 방법
//   router.back()  — 브라우저 히스토리의 이전 페이지로 (뒤로가기 버튼과 동일)
//   router.push('/') — 무조건 홈으로
//
// 여기서는 back() 을 쓴다. 사용자가 어디서 왔든 온 곳으로 돌아가는 게 자연스럽다.
// [주의] 주소창에 직접 URL 을 입력해 들어온 경우 돌아갈 히스토리가 없으므로,
//        홈으로 가는 RouterLink 도 함께 제공한다.
// --------------------------------------------
const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="detail-wrapper">
    <!-- [핵심] v-if / v-else-if / v-else 3단 분기
         로딩 중 / 데이터 있음 / 잘못된 도시 ID -->
    <p v-if="isLoading" class="state-message">불러오는 중...</p>

    <template v-else-if="city">
      <!-- ===== 헤더 ===== -->
      <header class="detail-header">
        <button class="btn-back" @click="goBack">← 뒤로</button>

        <div class="header-main">
          <div class="header-icon">{{ city.icon }}</div>
          <div>
            <h1>{{ city.name }}</h1>
            <p class="header-sub">{{ city.status }} · {{ city.temp }}°C</p>
          </div>
        </div>
      </header>

      <!-- ===== 상세 관측 정보 ===== -->
      <!-- [4장 재사용] BaseDashboardCard 는 날씨를 모르는 껍데기이므로
           상세 페이지에서도 그대로 쓸 수 있다. 컴포넌트 분리의 효과. -->
      <BaseDashboardCard title="상세 기상관측 정보" icon="📡">
        <div class="detail-grid">
          <div v-for="item in detailItems" :key="item.id" class="detail-item">
            <span class="item-icon">{{ item.icon }}</span>
            <p class="item-label">{{ item.label }}</p>
            <p class="item-value">{{ item.value }}</p>
            <p v-if="item.sub" class="item-sub">{{ item.sub }}</p>
          </div>
        </div>
      </BaseDashboardCard>

      <!-- [핵심] 코드 이동(router.push)이 아닌 링크 이동은 RouterLink 사용 -->
      <RouterLink to="/" class="link-home">대시보드로 돌아가기</RouterLink>
    </template>

    <!-- 존재하지 않는 도시 ID 로 접근한 경우 -->
    <div v-else class="state-message">
      <p>'{{ cityId }}' 에 해당하는 도시 정보를 찾을 수 없습니다.</p>
      <RouterLink to="/" class="link-home">대시보드로 돌아가기</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.detail-wrapper {
  max-width: 940px;
  margin: 0 auto;
  padding: 0 0 30px;
  color: #253858;
}

/* ===== 헤더 ===== */
.detail-header {
  padding: 26px 30px 30px;
  margin-bottom: 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, #4a90f0 0%, #74b0fb 100%);
  color: #fff;
  box-shadow: 0 12px 30px rgba(45, 90, 180, 0.16);
}

.btn-back {
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
.btn-back:hover {
  background: rgba(255, 255, 255, 0.32);
}

.header-main {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 20px;
}
.header-icon {
  font-size: 60px;
  line-height: 1;
}
.detail-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.header-sub {
  margin: 6px 0 0;
  font-size: 15px;
  opacity: 0.92;
}

/* ===== 상세 항목 그리드 ===== */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.detail-item {
  padding: 16px 12px;
  text-align: center;
  background: #fbfcff;
  border: 1px solid #e6edf9;
  border-radius: 13px;
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
.item-sub {
  margin: 2px 0 0;
  font-size: 11px;
  color: #8899ad;
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
  padding: 10px 20px;
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

@media (max-width: 780px) {
  .detail-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 520px) {
  .detail-header {
    padding: 22px 20px 24px;
  }
  .header-icon {
    font-size: 46px;
  }
  .detail-header h1 {
    font-size: 26px;
  }
}
</style>
