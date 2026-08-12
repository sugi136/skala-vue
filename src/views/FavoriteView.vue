<script setup>
// ============================================
// 6장 : views/FavoriteView.vue
// [참고]
//   5장: favoriteIds 가 이 컴포넌트의 지역 상태였다.
//        -> 대시보드에서 별을 눌러도 여기에 반영되지 않고,
//           페이지를 벗어나면 목록이 초기화되었다.
//   6장: favoriteStore 로 옮겨 앱 전체가 같은 목록을 공유한다.
//        -> "왜 Pinia 가 필요한가"를 보여주는 사례
// [참고] Query String, router.replace, useRoute/useRouter
// ============================================
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { weatherMockList } from '@/data/weatherMockData.js'
import { useFavoriteStore } from '@/stores/favoriteStore.js'

const route = useRoute()
const router = useRouter()

// --------------------------------------------
// [핵심] 즐겨찾기 store 연결
// [주의] state 를 그냥 구조분해하면 반응성이 끊긴다.
//   const { favoriteIds } = favoriteStore   ← 배열 값만 복사되어 갱신 안 됨
//   반드시 storeToRefs 로 감쌀 것.
// --------------------------------------------
const favoriteStore = useFavoriteStore()

// state / getters -> storeToRefs
const { favoriteIds, favoriteCount } = storeToRefs(favoriteStore)

// actions(함수) -> 반응성과 무관하므로 그냥 구조분해해도 된다
const { removeFavorite, clearAll } = favoriteStore

// --------------------------------------------
// [유지] Query String 으로 정렬 상태 관리
//   /favorites?sort=temp 로 접근하면 route.query.sort 는 'temp'
//   [문법] ?? — 값이 없을 때만 기본값 사용 (nullish 병합)
// [변경] 5장에서는 ref 로 따로 관리했으나,
//        URL 이 유일한 진실 공급원이 되도록 computed 로 바꿨다.
//        뒤로가기로 URL 이 바뀌어도 화면이 따라온다.
// --------------------------------------------
const sortKey = computed(() => route.query.sort ?? 'name')

// [핵심] router.replace 로 URL 갱신
//   push 를 쓰면 정렬을 바꿀 때마다 히스토리가 쌓여
//   뒤로가기를 여러 번 눌러야 이전 페이지로 갈 수 있다.
const changeSort = (key) => {
  router.replace({ name: 'weather-favorites', query: { sort: key } })
}

// --------------------------------------------
// [computed] 즐겨찾기 필터링 + 정렬
//   favoriteIds 가 store 값이므로, 대시보드에서 별을 누르면
//   이 목록도 자동으로 다시 계산된다.
// --------------------------------------------
const favoriteList = computed(() => {
  // [문법] filter + includes
  const list = weatherMockList.filter((item) => favoriteIds.value.includes(item.id))

  // [주의] sort 는 원본 배열을 직접 바꾸는(mutating) 메서드다.
  //        스프레드로 복사본을 만든 뒤 정렬해야 원본이 오염되지 않는다.
  if (sortKey.value === 'temp') {
    return [...list].sort((a, b) => b.temp - a.temp) // 기온 높은 순
  }
  return [...list].sort((a, b) => a.name.localeCompare(b.name)) // 이름 가나다순
})

// 정렬 변경 로그
watch(sortKey, (newSort) => {
  console.log(`[watch] 정렬 기준 변경: ${newSort}`)
})

// --------------------------------------------
// 카드 이벤트 핸들러
// [변경] 5장에서는 카드 클릭이 즐겨찾기 해제였다.
//        6장에서는 카드 안에 별 아이콘이 생겼으므로
//        카드 클릭은 아무 동작도 하지 않게 두고, 해제는 별로 처리한다.
//        (WeatherCard 가 store 를 직접 구독하므로 여기서 할 일이 없다)
// --------------------------------------------
const goDetail = (city) => {
  router.push({ name: 'weather-detail', params: { cityId: city.id } })
}

// 카드 전체 클릭 — 상세 페이지로 이동
const handleSelectCard = (city) => {
  goDetail(city)
}
</script>

<template>
  <div class="favorite-wrapper">
    <header class="favorite-header">
      <div>
        <h1>⭐ 즐겨찾기</h1>
        <!-- [참고] store 의 getter 활용 -->
        <p class="header-sub">자주 확인하는 도시를 모아봤습니다. 현재 {{ favoriteCount }}개</p>
      </div>
    </header>

    <BaseDashboardCard title="즐겨찾기 도시" icon="📌">
      <div class="list-toolbar">
        <!-- [유지] 정렬 옵션 — 누르면 URL 이 /favorites?sort=temp 로 바뀐다 -->
        <div class="sort-tabs">
          <button :class="{ active: sortKey === 'name' }" @click="changeSort('name')">
            이름순
          </button>
          <button :class="{ active: sortKey === 'temp' }" @click="changeSort('temp')">
            기온순
          </button>
        </div>

        <!-- [추가] store 의 action 을 직접 호출 -->
        <button v-if="favoriteList.length > 0" class="btn-clear" @click="clearAll">
          전체 삭제
        </button>
      </div>

      <!-- [재사용] WeatherCard 를 그대로 사용.
           카드가 store 를 직접 구독하므로 별 아이콘이 이 페이지에서도 동작한다. -->
      <div class="card-grid">
        <WeatherCard
          v-for="item in favoriteList"
          :key="item.id"
          :city="item"
          @select-card="handleSelectCard"
          @click-detail="goDetail"
        />
      </div>

      <p v-if="favoriteList.length === 0" class="empty-message">
        즐겨찾기한 도시가 없습니다.<br />
        대시보드에서 ☆ 를 눌러 추가해 보세요.
      </p>

      <p v-else class="hint">★ 아이콘을 누르면 즐겨찾기에서 제외됩니다.</p>
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

.sort-tabs {
  display: flex;
  gap: 6px;
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

.btn-clear {
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #d9534f;
  background: #fdefee;
  border: 1px solid #f7d9d7;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-clear:hover {
  background: #fbe2e0;
}

/* 카드 목록 — 폭에 따라 열 수가 자동으로 늘어난다 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 12px;
}

/* ===== 기타 ===== */
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
