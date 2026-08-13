// ============================================
// src/stores/favoriteStore.js
//
// [변경] id 문자열이 아니라 도시 객체를 저장한다.
//
//   기본 17개 도시는 id 만 알아도 regionList 에서 정보를 찾을 수 있다.
//   그런데 검색으로 추가한 도시(예: tokyo)는 regionList 에 없으므로,
//   id 만 저장하면 새로고침 후 어떤 도시였는지 알 수 없게 된다.
//   따라서 { id, query, enName, name } 을 통째로 보관한다.
// ============================================
import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'weather-favorites'

// --------------------------------------------
// 저장된 즐겨찾기를 불러온다.
//
// [주의] localStorage 는 문자열만 저장하므로 JSON 으로 변환해 주고받는다.
//        저장 값이 손상되었거나 형식이 다를 수 있으므로 try/catch 로 감싼다.
// --------------------------------------------
const loadFavorites = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []

    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    // 예전 버전(문자열 배열)이 저장돼 있으면 객체 형태로 변환한다
    return parsed.map((item) => (typeof item === 'string' ? { id: item, name: item } : item))
  } catch (error) {
    console.warn('[favoriteStore] 저장된 즐겨찾기를 불러오지 못했습니다.', error)
    return []
  }
}

export const useFavoriteStore = defineStore('favorite', () => {
  // --------------------------------------------
  // 1. state — [{ id, enName, name }] 형태
  // --------------------------------------------
  const favorites = ref(loadFavorites())

  // --------------------------------------------
  // 목록이 바뀔 때마다 자동 저장.
  //
  //   각 action 마다 저장 코드를 넣으면 중복이 생기고,
  //   나중에 action 을 추가할 때 저장을 빠뜨리기 쉽다.
  //   watch 로 한 곳에서 처리하면 그런 실수가 없다.
  //
  // [주의] 배열을 통째로 교체하는 방식으로만 변경하므로 deep 옵션이 필요 없다.
  // --------------------------------------------
  watch(favorites, (newList) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList))
    } catch (error) {
      // 사파리 시크릿 모드 등 저장이 막힌 환경에서도 앱이 멈추지 않도록 한다
      console.warn('[favoriteStore] 즐겨찾기를 저장하지 못했습니다.', error)
    }
  })

  // --------------------------------------------
  // 2. getters
  // --------------------------------------------
  const favoriteIds = computed(() => favorites.value.map((item) => item.id))

  const favoriteCount = computed(() => favorites.value.length)

  const hasFavorite = computed(() => favorites.value.length > 0)

  // [핵심] 인자를 받는 getter 는 함수를 반환하는 computed 로 만든다
  const isFavorite = computed(() => (cityId) => favoriteIds.value.includes(cityId))

  // --------------------------------------------
  // 3. actions
  // --------------------------------------------

  /**
   * 즐겨찾기 추가/제거를 토글한다.
   * @param {object} city - { id, enName, name } 최소 이 세 개는 있어야 한다
   */
  function toggleFavorite(city) {
    if (favoriteIds.value.includes(city.id)) {
      // [문법] filter 로 해당 id 를 제외한 새 배열 생성
      favorites.value = favorites.value.filter((item) => item.id !== city.id)
    } else {
      // 화면 렌더링에 필요한 최소 정보만 저장한다.
      // 기온·아이콘 등 실시간 값은 저장하지 않는다 (금방 낡기 때문)
      favorites.value = [
        ...favorites.value,
        {
          id: city.id,
          enName: city.enName,
          name: city.name,
          isSearched: city.isSearched ?? false,
        },
      ]
    }
  }

  function removeFavorite(cityId) {
    favorites.value = favorites.value.filter((item) => item.id !== cityId)
  }

  function clearAll() {
    favorites.value = []
  }

  return {
    // state
    favorites,
    // getters
    favoriteIds,
    favoriteCount,
    hasFavorite,
    isFavorite,
    // actions
    toggleFavorite,
    removeFavorite,
    clearAll,
  }
})
