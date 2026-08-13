<script setup>
// ============================================
// views/FavoriteView.vue
//
// [변경] weatherStore 연동
//   즐겨찾기는 id·이름만 저장하므로 실시간 날씨는 store 에서 가져온다.
//   새로고침 직후 검색으로 추가했던 도시는 목록에 없으므로 다시 조회한다.
// ============================================
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { useFavoriteStore } from '@/stores/favoriteStore.js'
import { useWeatherStore } from '@/stores/weatherStore.js'

const route = useRoute()
const router = useRouter()
const favoriteStore = useFavoriteStore()
const weatherStore = useWeatherStore()

// [핵심] state 와 getters 는 storeToRefs 로 꺼내야 반응성이 유지된다.
const { favorites, favoriteCount } = storeToRefs(favoriteStore)
const { cities } = storeToRefs(weatherStore)

// actions(함수)는 반응성과 무관하므로 그냥 구조분해해도 된다
const { clearAll } = favoriteStore

const isLoading = ref(false)
const missingCities = ref([])

// --------------------------------------------
// 즐겨찾기한 도시의 실시간 날씨를 확보한다.
//
// [배경] 즐겨찾기는 { id, enName, name } 만 localStorage 에 저장한다.
//        기온·아이콘 같은 실시간 값은 금방 낡으므로 저장하지 않는다.
//        따라서 이 페이지에 들어올 때마다 store 에서 최신 값을 가져와야 한다.
//
// [핵심] ensureDetail 은 캐시를 먼저 확인하므로,
//        기본 17개 지역은 이미 받아둔 데이터를 그대로 쓴다.
//        검색으로 추가했다가 새로고침으로 사라진 도시만 실제로 호출된다.
// --------------------------------------------
onMounted(async () => {
  // 기본 목록이 아직 없으면 먼저 불러온다 (URL 로 직접 접근한 경우)
  await weatherStore.loadCities()

  if (favorites.value.length === 0) return

  isLoading.value = true
  missingCities.value = []

  // [문법] map 으로 Promise 배열을 만들고 allSettled 로 병렬 실행.
  //        일부가 실패해도 나머지는 표시되도록 한다.
  const results = await Promise.allSettled(
    favorites.value.map((fav) => weatherStore.ensureDetail(fav.id)),
  )

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      missingCities.value.push(favorites.value[index].name)
    }
  })

  isLoading.value = false
})

// --------------------------------------------
// Query String 으로 정렬 상태 관리
//   /favorites?sort=temp 로 접근하면 route.query.sort 는 'temp'
//   [문법] ?? — 값이 없을 때만 기본값 사용 (nullish 병합)
//
//   URL 이 유일한 진실 공급원이 되도록 computed 로 만들었다.
//   뒤로가기로 주소가 바뀌어도 화면이 따라온다.
// --------------------------------------------
const sortKey = computed(() => route.query.sort ?? 'name')

// [핵심] router.replace 로 URL 갱신
//   push 를 쓰면 정렬을 바꿀 때마다 히스토리가 쌓여
//   뒤로가기를 여러 번 눌러야 이전 페이지로 갈 수 있다.
const changeSort = (key) => {
  router.replace({ name: 'weather-favorites', query: { sort: key } })
}

// --------------------------------------------
// [computed] 즐겨찾기 목록 + 정렬
//   저장된 id 로 store 에서 실시간 데이터를 찾는다.
//   아직 못 불러온 도시는 목록에서 제외된다.
// --------------------------------------------
const favoriteList = computed(() => {
  const list = favorites.value
    .map((fav) => cities.value.find((item) => item.id === fav.id))
    // [문법] Boolean 을 넘기면 undefined·null 을 걸러낸다
    .filter(Boolean)

  // [주의] sort 는 원본 배열을 직접 바꾸는(mutating) 메서드다.
  //        스프레드로 복사본을 만든 뒤 정렬해야 원본이 오염되지 않는다.
  if (sortKey.value === 'temp') {
    return [...list].sort((a, b) => b.temp - a.temp) // 기온 높은 순
  }
  return [...list].sort((a, b) => a.name.localeCompare(b.name)) // 이름 가나다순
})

// --------------------------------------------
// 카드 이벤트 핸들러
//   카드 안에 별 아이콘이 있으므로 해제는 별이 전담한다.
//   카드 클릭은 상세 페이지 이동.
// --------------------------------------------
const goDetail = (city) => {
  router.push({ name: 'weather-detail', params: { cityId: city.id } })
}
</script>

<template>
  <div class="favorite-wrapper">
    <header class="favorite-header">
      <div>
        <h1>⭐ 즐겨찾기</h1>
        <p class="header-sub">자주 확인하는 지역을 모아봤습니다. 현재 {{ favoriteCount }}개</p>
      </div>
    </header>

    <BaseDashboardCard title="즐겨찾기 지역" icon="📌">
      <div class="list-toolbar">
        <!-- 정렬 옵션 — 누르면 URL 이 /favorites?sort=temp 로 바뀐다 -->
        <!-- [Element Plus] el-radio-group 으로 정렬 옵션을 표현한다.
             "여러 선택지 중 하나"라는 의미가 마크업에 드러난다. -->
        <el-radio-group :model-value="sortKey" size="small" @change="changeSort">
          <el-radio-button value="name">이름순</el-radio-button>
          <el-radio-button value="temp">기온순</el-radio-button>
        </el-radio-group>

        <el-button v-if="favoriteCount > 0" type="danger" plain size="small" @click="clearAll">
          전체 삭제
        </el-button>
      </div>

      <el-skeleton v-if="isLoading" :rows="3" animated />

      <el-alert
        v-else-if="missingCities.length > 0"
        class="mb"
        type="warning"
        :title="`일부 지역을 불러오지 못했습니다: ${missingCities.join(', ')}`"
        :closable="false"
        show-icon
      />

      <!-- [재사용] WeatherCard 를 그대로 사용.
           카드가 store 를 직접 구독하므로 별 아이콘이 이 페이지에서도 동작한다. -->
      <div v-if="favoriteList.length > 0" class="card-grid">
        <WeatherCard
          v-for="item in favoriteList"
          :key="item.id"
          :city="item"
          @select-card="goDetail"
          @click-detail="goDetail"
        />
      </div>

      <p v-else-if="!isLoading" class="empty-message">
        즐겨찾기한 지역이 없습니다.<br />
        대시보드에서 ☆ 를 눌러 추가해 보세요.
      </p>

      <p v-if="favoriteList.length > 0" class="hint">★ 아이콘을 누르면 즐겨찾기에서 제외됩니다.</p>
    </BaseDashboardCard>

    <RouterLink to="/" class="link-home">← 메인 대시보드로 돌아가기</RouterLink>
  </div>
</template>

<style scoped>
.favorite-wrapper {
  width: min(1400px, 100%);
  margin-inline: auto;
  padding: 0 0 40px;
  color: #253858;
}

/* ===== 헤더 ===== */
.favorite-header {
  padding: 30px 32px;
  margin-bottom: 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f0a63c 0%, #f7c469 100%);
  color: #fff;
  box-shadow: 0 12px 30px rgba(200, 140, 40, 0.18);
}

.favorite-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.header-sub {
  margin: 8px 0 0;
  font-size: 14px;
  opacity: 0.94;
}

/* ===== 툴바 ===== */
.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.mb {
  margin-bottom: 14px;
}

/* 카드 목록 — 폭에 따라 열 수가 자동으로 늘어난다 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

/* ===== 기타 ===== */
.state-message {
  padding: 30px 0;
  text-align: center;
  font-size: 14px;
  color: #6b7a90;
}

.state-message.warn {
  color: #8a5a12;
}

.empty-message {
  margin: 0;
  padding: 40px 0;
  text-align: center;
  font-size: 14px;
  line-height: 1.7;
  color: #94a3b8;
  background: #fbfcff;
  border: 1px dashed #dbe4f2;
  border-radius: 14px;
}

.hint {
  margin: 14px 0 0;
  font-size: 12px;
  color: #9aa8bd;
  text-align: center;
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

@media (max-width: 560px) {
  .list-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}
</style>
