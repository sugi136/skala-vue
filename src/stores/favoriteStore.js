// ============================================
// 6장 Hands on : src/stores/favoriteStore.js
// 본인만의 추가 Store
// [배경] 5장에서 즐겨찾기 목록은 FavoriteView 안의 지역 상태였다.
//        그래서 대시보드에서 별을 눌러도 페이지를 이동하면 초기화되었다.
//        store 로 올리면 앱 어디서든 같은 목록을 보고 변경할 수 있다.
//        -> "왜 Pinia 가 필요한가"를 보여주는 사례
// ============================================
import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

// localStorage 에 저장할 때 사용하는 키
const STORAGE_KEY = 'weather-favorites'

// --------------------------------------------
// 저장된 즐겨찾기를 불러온다.
//
// [주의] localStorage 는 문자열만 저장할 수 있으므로 JSON 으로 변환해 주고받는다.
//        저장된 값이 손상되었거나 형식이 다를 수 있으므로 try/catch 로 감싼다.
//        실패하면 빈 배열로 시작한다.
// --------------------------------------------
const loadFavorites = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []

    const parsed = JSON.parse(saved)
    // 배열이 아닌 값이 저장돼 있으면 무시한다
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('[favoriteStore] 저장된 즐겨찾기를 불러오지 못했습니다.', error)
    return []
  }
}

export const useFavoriteStore = defineStore('favorite', () => {
  // --------------------------------------------
  // 1. state — 즐겨찾기한 도시 id 목록
  // --------------------------------------------
  // 초기값을 localStorage 에서 불러온다 -> 새로고침해도 유지된다
  const favoriteIds = ref(loadFavorites())

  // --------------------------------------------
  // [핵심] 목록이 바뀔 때마다 자동으로 저장한다.
  //
  //   각 action 마다 저장 코드를 넣으면 중복이 생기고,
  //   나중에 action 을 추가할 때 저장을 빠뜨리기 쉽다.
  //   watch 로 한 곳에서 처리하면 그런 실수가 없다.
  //
  // [주의] 배열을 통째로 교체하는 방식(filter, 스프레드)으로만 변경하므로
  //        deep 옵션 없이도 감지된다.
  // --------------------------------------------
  watch(favoriteIds, (newIds) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds))
    } catch (error) {
      // 사파리 시크릿 모드 등 저장이 막힌 환경에서도 앱이 멈추지 않도록 한다
      console.warn('[favoriteStore] 즐겨찾기를 저장하지 못했습니다.', error)
    }
  })

  // --------------------------------------------
  // 2. getters
  // --------------------------------------------
  const favoriteCount = computed(() => favoriteIds.value.length)

  const hasFavorite = computed(() => favoriteIds.value.length > 0)

  // [핵심] 특정 id 가 즐겨찾기인지 판별
  //   getter 가 "인자를 받아야" 할 때는 함수를 반환하는 computed 로 만든다.
  //   사용: favoriteStore.isFavorite('seoul')
  //   [주의] 이 형태는 결과가 캐싱되지 않는다. 매번 새로 계산된다.
  const isFavorite = computed(() => (cityId) => favoriteIds.value.includes(cityId))

  // --------------------------------------------
  // 3. actions
  // --------------------------------------------
  // 별 아이콘 클릭 시 추가/제거를 토글
  function toggleFavorite(cityId) {
    if (favoriteIds.value.includes(cityId)) {
      // [문법] filter 로 해당 id 를 제외한 새 배열 생성
      favoriteIds.value = favoriteIds.value.filter((id) => id !== cityId)
    } else {
      // [문법] 스프레드로 기존 배열에 새 id 를 더한 새 배열 생성
      favoriteIds.value = [...favoriteIds.value, cityId]
    }
  }

  function removeFavorite(cityId) {
    favoriteIds.value = favoriteIds.value.filter((id) => id !== cityId)
  }

  function clearAll() {
    favoriteIds.value = []
  }

  return {
    // state
    favoriteIds,
    // getters
    favoriteCount,
    hasFavorite,
    isFavorite,
    // actions
    toggleFavorite,
    removeFavorite,
    clearAll,
  }
})
