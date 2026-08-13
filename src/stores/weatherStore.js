// ============================================
// src/stores/weatherStore.js
//
// [배경] 지금까지는 각 페이지가 따로 API 를 호출했다.
//   - 메인에서 17개 도시를 부르고
//   - 상세 페이지에 들어가면 그 도시를 또 부르고
//   - 즐겨찾기 페이지에서 또 부른다
//   같은 데이터를 반복 요청하므로 느리고 API 한도도 낭비된다.
//
// [해결] 도시 목록·상세·예보를 store 에 모아두고 캐싱한다.
//        이미 받아온 데이터는 재요청하지 않는다.
// ============================================
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { REGION_LIST, DEFAULT_CITY_ID, findRegionById } from '@/data/regionList.js'
import {
  fetchWeatherByCities,
  fetchWeatherByCity,
  fetchWeatherByCoords,
  fetchForecastByCity,
  searchCity,
  getCurrentPosition,
} from '@/api/weatherApi.js'
import {
  fetchDustBySido,
  fetchUvByArea,
  fetchWeatherAlerts,
  filterAlertsByRegion,
} from '@/api/publicDataApi.js'

export const useWeatherStore = defineStore('weather', () => {
  // --------------------------------------------
  // 1. state
  // --------------------------------------------
  // 화면에 표시되는 도시 목록 (기본 17개 + 검색으로 추가된 도시)
  const cities = ref([])

  // 상세 정보 캐시 { cityId: detail }
  const detailMap = ref({})

  // 예보 캐시 { cityId: { hourly, daily } }
  const forecastMap = ref({})

  // 공공데이터포털 캐시 { cityId: { dust, uv } }
  const airMap = ref({})

  // 기상특보는 전국 목록을 한 번만 받아 지역별로 걸러 쓴다
  const allAlerts = ref([])
  const alertsLoaded = ref(false)

  // 현재 위치로 판별된 도시 id
  const currentLocationId = ref(null)

  // 통신 상태
  const isLoading = ref(false)
  const errorMessage = ref('')
  const failedCities = ref([])

  // --------------------------------------------
  // 2. getters
  // --------------------------------------------
  // [핵심] 인자를 받는 getter 는 함수를 반환하는 computed 로 만든다
  const findCity = computed(() => (cityId) => cities.value.find((item) => item.id === cityId))

  const findDetail = computed(() => (cityId) => detailMap.value[cityId] ?? null)

  const findForecast = computed(() => (cityId) => forecastMap.value[cityId] ?? null)

  const findAir = computed(() => (cityId) => airMap.value[cityId] ?? null)

  // 특정 지역의 기상특보만 골라낸다
  const findAlerts = computed(() => (cityId) => {
    const region = findRegionById(cityId)
    if (!region) return []
    return filterAlertsByRegion(allAlerts.value, region.region)
  })

  // 검색으로 추가된 도시만 추린다
  const searchedCities = computed(() => cities.value.filter((item) => item.isSearched))

  const hasData = computed(() => cities.value.length > 0)

  // --------------------------------------------
  // 3. actions
  // --------------------------------------------

  /** 기본 17개 도시의 현재 날씨를 한 번에 불러온다. */
  async function loadCities() {
    // 이미 불러왔으면 다시 요청하지 않는다
    if (cities.value.length > 0) return

    isLoading.value = true
    errorMessage.value = ''
    failedCities.value = []

    try {
      const { cities: list, details, failed } = await fetchWeatherByCities(REGION_LIST)

      cities.value = list
      detailMap.value = { ...detailMap.value, ...details }
      failedCities.value = failed
    } catch (error) {
      errorMessage.value = error.message
    } finally {
      // 성공하든 실패하든 로딩은 반드시 해제한다
      isLoading.value = false
    }
  }

  /** 목록을 강제로 다시 불러온다. (새로고침 버튼용) */
  async function reloadCities() {
    cities.value = []
    detailMap.value = {}
    forecastMap.value = {}
    await loadCities()
  }

  /**
   * 특정 도시의 상세 정보를 확보한다.
   * 캐시에 있으면 그대로 쓰고, 없으면 API 를 호출한다.
   * (상세 페이지에 URL 로 직접 접근한 경우 목록이 비어 있을 수 있다)
   */
  async function ensureDetail(cityId) {
    if (detailMap.value[cityId]) return detailMap.value[cityId]

    const region = findRegionById(cityId)
    // 기본 목록에 없는 도시(검색 추가분)는 id 를 그대로 조회어로 쓴다
    const query = region?.query ?? cityId

    const { city, detail } = await fetchWeatherByCity(query)

    // 목록에 없으면 추가해 둔다
    if (!findCity.value(cityId)) {
      cities.value.push({
        ...city,
        id: cityId,
        name: region?.name ?? city.enName,
        enName: region?.enName ?? city.enName,
        region: region?.region,
        isSearched: !region,
      })
    }

    detailMap.value[cityId] = detail
    return detail
  }

  /**
   * 특정 도시의 예보를 확보한다. 캐시 우선.
   */
  async function ensureForecast(cityId) {
    if (forecastMap.value[cityId]) return forecastMap.value[cityId]

    const region = findRegionById(cityId)
    const query = region?.query ?? findCity.value(cityId)?.enName ?? cityId

    const forecast = await fetchForecastByCity(query, cityId)
    forecastMap.value[cityId] = forecast
    return forecast
  }

  /**
   * 검색어로 도시를 조회해 목록에 추가한다.
   *
   * [주의] 새로고침하면 사라진다. 유지하려면 즐겨찾기에 등록해야 한다.
   * @returns {string|null} 추가된 도시 id. 실패 시 null
   */
  async function addCityBySearch(keyword) {
    const trimmed = keyword.trim()
    if (!trimmed) return null

    const { city, detail } = await searchCity(trimmed)

    // 이미 목록에 있으면 중복 추가하지 않는다
    if (findCity.value(city.id)) return city.id

    cities.value.push(city)
    detailMap.value[city.id] = detail
    return city.id
  }

  /**
   * 현재 위치를 조회해 해당 지역 날씨를 목록에 추가한다.
   *
   * [설계] 권한 거부·조회 실패는 정상적인 흐름이므로
   *        조용히 기본 도시(서울)로 폴백한다.
   */
  async function detectCurrentLocation() {
    try {
      const { lat, lon } = await getCurrentPosition()
      const { city, detail } = await fetchWeatherByCoords(lat, lon)

      // 이미 기본 목록에 있는 도시라면 그 id 를 쓴다
      const existing = cities.value.find(
        (item) => item.enName.toLowerCase() === city.enName.toLowerCase(),
      )

      if (existing) {
        currentLocationId.value = existing.id
        return existing.id
      }

      // 목록에 없는 지역이면 맨 앞에 추가한다
      const located = { ...city, isCurrentLocation: true }
      cities.value.unshift(located)
      detailMap.value[located.id] = detail
      currentLocationId.value = located.id
      return located.id
    } catch (error) {
      // 폴백 — 사용자에게 에러를 노출하지 않는다
      console.info(
        '[weatherStore] 현재 위치를 사용할 수 없어 기본 도시를 사용합니다.',
        error.message,
      )
      currentLocationId.value = DEFAULT_CITY_ID
      return DEFAULT_CITY_ID
    }
  }

  /**
   * 공공데이터포털 정보(미세먼지·자외선)를 확보한다. 캐시 우선.
   *
   * [설계] 두 API 는 실패해도 앱 전체를 막지 않는다.
   *        각각 독립적으로 처리하고, 실패하면 null 로 둔다.
   */
  async function ensureAirData(cityId) {
    if (airMap.value[cityId]) return airMap.value[cityId]

    const region = findRegionById(cityId)
    // 검색으로 추가한 해외 도시 등은 국내 지역코드가 없으므로 건너뛴다
    if (!region) return null

    // [문법] allSettled — 하나가 실패해도 나머지 결과는 받는다
    const [dustResult, uvResult] = await Promise.allSettled([
      fetchDustBySido(region.sidoName),
      fetchUvByArea(region.areaNo),
    ])

    // [진단] allSettled 는 실패를 조용히 넘기므로 원인이 보이지 않는다.
    //        어떤 API 가 왜 실패했는지 콘솔에 남긴다.
    if (dustResult.status === 'rejected') {
      console.warn(
        '[미세먼지 실패]',
        region.sidoName,
        dustResult.reason?.message ?? dustResult.reason,
      )
    }
    if (uvResult.status === 'rejected') {
      console.warn('[자외선 실패]', region.areaNo, uvResult.reason?.message ?? uvResult.reason)
    }

    const air = {
      dust: dustResult.status === 'fulfilled' ? dustResult.value : null,
      uv: uvResult.status === 'fulfilled' ? uvResult.value : null,
    }

    airMap.value[cityId] = air
    return air
  }

  /** 전국 기상특보 목록을 한 번만 받아둔다. */
  async function ensureAlerts() {
    if (alertsLoaded.value) return allAlerts.value

    try {
      allAlerts.value = await fetchWeatherAlerts()
    } catch (error) {
      console.error('[weatherStore] 기상특보 조회 실패', error.message)
      allAlerts.value = []
    } finally {
      // 실패해도 재시도로 매번 요청하지 않도록 플래그를 세운다
      alertsLoaded.value = true
    }

    return allAlerts.value
  }

  return {
    // state
    cities,
    detailMap,
    forecastMap,
    airMap,
    allAlerts,
    currentLocationId,
    isLoading,
    errorMessage,
    failedCities,
    // getters
    findCity,
    findDetail,
    findForecast,
    findAir,
    findAlerts,
    searchedCities,
    hasData,
    // actions
    loadCities,
    reloadCities,
    ensureDetail,
    ensureForecast,
    ensureAirData,
    ensureAlerts,
    addCityBySearch,
    detectCurrentLocation,
  }
})
