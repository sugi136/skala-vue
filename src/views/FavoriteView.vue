<script setup>
// ============================================
// 5장 Hands on : views/FavoriteView.vue
//
// [요구사항 6] 본인이 추가한 view
//
// [학습 목적] 이 페이지는 5장에서 배운 두 가지를 실제로 사용한다.
//   1) Query String — /favorites?sort=temp 처럼 ? 뒤에 옵션을 실어 보낸다
//   2) router.replace — 히스토리를 쌓지 않고 URL 만 교체
//
// [params vs query 차이]
//   params : 경로의 일부. /weather/city_01  -> 무엇을 볼지 결정
//   query  : ? 뒤의 옵션.  /favorites?sort=temp -> 어떻게 볼지 결정
// ============================================
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { weatherMockList } from '@/data/weatherMockData.js'

const route = useRoute()
const router = useRouter()

// [임시] 즐겨찾기 도시 id 목록
//   [6장] 이 상태는 페이지를 벗어나면 사라진다.
//         Pinia store 로 옮기면 앱 전체에서 유지할 수 있다.
const favoriteIds = ref(['city_01', 'city_03', 'city_05'])

// --------------------------------------------
// [핵심] Query String 읽기
//   /favorites?sort=temp 로 접근하면 route.query.sort 는 'temp'
//   [문법] ?? — 값이 없을 때만 기본값 사용 (nullish 병합)
// --------------------------------------------
const sortKey = ref(route.query.sort ?? 'name')

// --------------------------------------------
// [핵심] router.replace 로 URL 갱신
//   push 를 쓰면 정렬을 바꿀 때마다 히스토리가 쌓여
//   뒤로가기를 여러 번 눌러야 이전 페이지로 갈 수 있다.
//   replace 는 현재 항목을 대체하므로 그런 문제가 없다.
// --------------------------------------------
const changeSort = (key) => {
  sortKey.value = key
  router.replace({ name: 'weather-favorites', query: { sort: key } })
}

// --------------------------------------------
// [computed] 즐겨찾기 필터링 + 정렬
// --------------------------------------------
const favoriteList = computed(() => {
  // [9장 문법] filter + includes
  const list = weatherMockList.filter((item) => favoriteIds.value.includes(item.id))

  // [주의] sort 는 원본 배열을 직접 바꾸는(mutating) 메서드다.
  //        스프레드로 복사본을 만든 뒤 정렬해야 원본이 오염되지 않는다.
  if (sortKey.value === 'temp') {
    return [...list].sort((a, b) => b.temp - a.temp) // 기온 높은 순
  }
  return [...list].sort((a, b) => a.name.localeCompare(b.name)) // 이름 가나다순
})

// --------------------------------------------
// [핵심] 주소창에 직접 URL 을 입력해 들어온 경우에도
//        정렬 상태가 반영되도록 query 변화를 감시한다.
// --------------------------------------------
watch(
  () => route.query.sort,
  (newSort) => {
    sortKey.value = newSort ?? 'name'
    console.log(`[watch] 정렬 기준 변경: ${sortKey.value}`)
  },
)

// 즐겨찾기 해제
const removeFavorite = (city) => {
  favoriteIds.value = favoriteIds.value.filter((id) => id !== city.id)
}

// 카드의 상세보기 -> 상세 페이지로 이동
const goDetail = (city) => {
  router.push({ name: 'weather-detail', params: { cityId: city.id } })
}
</script>

<template>
  <div class="favorite-wrapper">
    <header class="favorite-header">
      <div>
        <h1>⭐ 즐겨찾기</h1>
        <p class="header-sub">자주 확인하는 도시를 모아봤습니다.</p>
      </div>
    </header>

    <BaseDashboardCard title="즐겨찾기 도시" icon="📌">
      <!-- [핵심] 정렬 옵션 — 누르면 URL 이 /favorites?sort=temp 로 바뀐다 -->
      <div class="sort-tabs">
        <button :class="{ active: sortKey === 'name' }" @click="changeSort('name')">이름순</button>
        <button :class="{ active: sortKey === 'temp' }" @click="changeSort('temp')">기온순</button>
      </div>

      <!-- [4장 재사용] WeatherCard 를 그대로 사용.
           카드는 자기가 어느 페이지에 있는지 모르므로 어디서든 쓸 수 있다. -->
      <WeatherCard
        v-for="item in favoriteList"
        :key="item.id"
        :city="item"
        @select-card="removeFavorite"
        @click-detail="goDetail"
      />

      <p v-if="favoriteList.length === 0" class="empty-message">즐겨찾기한 도시가 없습니다.</p>

      <p class="hint">카드를 클릭하면 즐겨찾기에서 제외됩니다.</p>
    </BaseDashboardCard>

    <RouterLink to="/" class="link-home">← 메인 대시보드로 돌아가기</RouterLink>
  </div>
</template>

<style scoped>
.favorite-wrapper {
  max-width: 940px;
  margin: 0 auto;
  padding: 0 0 40px;
  color: #253858;
}

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

/* ===== 정렬 탭 ===== */
.sort-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
}

.sort-tabs button {
  padding: 7px 15px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7a90;
  background: #f0f4fa;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.sort-tabs button:hover {
  background: #e3ebf7;
}

.sort-tabs button.active {
  background: #5b9bf8;
  color: #fff;
}

/* ===== 기타 ===== */
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
</style>
