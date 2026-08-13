// ============================================
// src/api/weatherApi.js
//
// [역할] OpenWeather API 통신을 한 곳에 모은다.
//
// [왜 분리하나]
//   컴포넌트마다 axios 를 직접 호출하면 baseURL·API Key·에러 처리가 흩어진다.
//   여기에 모아두면 엔드포인트가 바뀌어도 이 파일만 고치면 된다.
// ============================================
import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = import.meta.env.VITE_OPENWEATHER_BASE_URL

if (!API_KEY) {
  console.warn('[weatherApi] VITE_OPENWEATHER_API_KEY 가 없습니다. .env 파일을 확인하세요.')
}

// --------------------------------------------
// axios 인스턴스
//
// [핵심] create 로 인스턴스를 만들면 공통 설정을 한 번만 지정하면 된다.
//   baseURL : 매 호출마다 전체 URL 을 쓰지 않아도 된다
//   params  : 모든 요청에 자동으로 붙는 쿼리스트링
//   timeout : 응답이 없을 때 무한 대기하지 않도록 제한
// --------------------------------------------
const weatherClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  params: {
    appid: API_KEY,
    units: 'metric', // 섭씨로 받는다. 화씨 변환은 configStore 가 담당
    lang: 'kr', // 날씨 설명(description)을 한글로 받는다
  },
})

// --------------------------------------------
// 응답 인터셉터 — 공통 에러 처리
//
// [핵심] 각 호출부에서 같은 에러 분기를 반복하지 않도록
//        여기서 사용자에게 보여줄 메시지로 변환한다.
// --------------------------------------------
weatherClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    let message = '날씨 정보를 불러오지 못했습니다.'

    if (status === 401) {
      message = 'API 키가 유효하지 않습니다. 발급 후 활성화까지 시간이 걸릴 수 있습니다.'
    } else if (status === 404) {
      message = '해당 도시를 찾을 수 없습니다.'
    } else if (status === 429) {
      message = '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.'
    } else if (error.code === 'ECONNABORTED') {
      message = '요청 시간이 초과되었습니다. 네트워크 상태를 확인해 주세요.'
    }

    console.error('[weatherApi]', status ?? error.code, error.message)

    // 가공한 메시지를 실어서 다시 던진다 -> 호출부의 catch 로 전달된다
    const wrapped = new Error(message)
    wrapped.status = status
    return Promise.reject(wrapped)
  },
)

// --------------------------------------------
// 응답 -> 화면용 데이터 변환
//
// [핵심] API 응답 구조를 컴포넌트가 직접 알지 않도록 여기서 매핑한다.
// --------------------------------------------
const toCityData = (data) => ({
  id: data.name.toLowerCase().replace(/\s+/g, '-'),
  enName: data.name,
  name: data.name, // 한글명은 regionList 매핑으로 호출부에서 덮어쓴다
  temp: Math.round(data.main.temp),
  status: data.weather[0].description,
  icon: data.weather[0].icon,
  // 좌표 — 공공데이터포털 연동 시 지역코드 변환에 사용 예정
  lat: data.coord.lat,
  lon: data.coord.lon,
})

const toDetailData = (data) => ({
  feelsLike: Math.round(data.main.feels_like),
  humidity: data.main.humidity,
  windSpeed: data.wind.speed,
  windDir: degToDirection(data.wind.deg),
  clouds: data.clouds.all,
  // visibility 는 미터 단위 -> km 로 변환
  visibility: Math.round((data.visibility ?? 0) / 1000),
  pressure: data.main.pressure,
  sunrise: toTimeString(data.sys.sunrise, data.timezone),
  sunset: toTimeString(data.sys.sunset, data.timezone),
  // 강수량은 비가 올 때만 응답에 포함된다
  rain1h: data.rain?.['1h'] ?? 0,
})

// --------------------------------------------
// 유틸
// --------------------------------------------
const DIRECTIONS = ['북풍', '북동풍', '동풍', '남동풍', '남풍', '남서풍', '서풍', '북서풍']

function degToDirection(deg) {
  if (deg === undefined) return '—'
  // 45도씩 8등분
  return DIRECTIONS[Math.round(deg / 45) % 8]
}

// Unix timestamp(초) + timezone offset(초) -> 'HH:MM'
function toTimeString(unixSeconds, timezoneOffset) {
  // [주의] JS Date 는 밀리초 단위이므로 1000 을 곱한다.
  //        UTC 기준으로 계산한 뒤 도시의 offset 을 더해야 현지 시각이 나온다.
  const date = new Date((unixSeconds + timezoneOffset) * 1000)
  const hh = String(date.getUTCHours()).padStart(2, '0')
  const mm = String(date.getUTCMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

// --------------------------------------------
// 예보 가공
//
// [응답 구조] list 배열에 3시간 간격 40개 항목이 들어온다.
//   dt_txt      '2026-08-12 15:00:00'
//   main.temp   기온
//   weather[0]  아이콘·설명
//   pop         강수확률 (0~1 소수)
// --------------------------------------------

// 시간대별 — 앞 8개(24시간)를 그대로 사용. 날짜별로 묶는 가공이 필요 없다.
const toHourly = (list, cityId) =>
  list.slice(0, 8).map((item, index) => {
    const hhmm = item.dt_txt.split(' ')[1].slice(0, 5)

    return {
      id: `${cityId}_h${index + 1}`,
      time: index === 0 ? '곧' : hhmm,
      icon: item.weather[0].icon,
      temp: Math.round(item.main.temp),
      // pop 은 0~1 소수 -> 퍼센트로 변환
      pop: Math.round((item.pop ?? 0) * 100),
    }
  })

const WEEKDAY_LABEL = ['일', '월', '화', '수', '목', '금', '토']

// 5일 예보 — 40개 항목을 날짜별로 묶어 최고/최저를 뽑는다.
const toDaily = (list, cityId) => {
  // 1) 날짜(YYYY-MM-DD)를 키로 그룹핑
  const grouped = list.reduce((acc, item) => {
    const date = item.dt_txt.split(' ')[0]
    // [문법] ||= 는 값이 없을 때만 대입한다 (논리 OR 할당)
    acc[date] ||= []
    acc[date].push(item)
    return acc
  }, {})

  const today = new Date().toISOString().split('T')[0]

  // 2) 날짜별로 최고/최저/대표아이콘/최대 강수확률을 계산
  return Object.entries(grouped)
    .slice(0, 5) // 무료 티어는 최대 5일
    .map(([date, items], index) => {
      const temps = items.map((it) => it.main.temp)
      // 대표 아이콘: 정오에 가장 가까운 항목. 없으면 첫 항목
      const noon = items.find((it) => it.dt_txt.includes('12:00:00')) ?? items[0]
      const dateObj = new Date(date)

      return {
        id: `${cityId}_f${index + 1}`,
        day: date === today ? '오늘' : WEEKDAY_LABEL[dateObj.getDay()],
        date: `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`,
        icon: noon.weather[0].icon,
        high: Math.round(Math.max(...temps)),
        low: Math.round(Math.min(...temps)),
        pop: Math.round(Math.max(...items.map((it) => it.pop ?? 0)) * 100),
      }
    })
}

// --------------------------------------------
// 공개 함수
// --------------------------------------------

/** 도시 이름(또는 'Seoul,KR' 형식)으로 현재 날씨를 조회한다. */
export const fetchWeatherByCity = async (query) => {
  const { data } = await weatherClient.get('/weather', { params: { q: query } })
  return { city: toCityData(data), detail: toDetailData(data) }
}

/** 좌표로 현재 날씨를 조회한다. (현재 위치 기반) */
export const fetchWeatherByCoords = async (lat, lon) => {
  const { data } = await weatherClient.get('/weather', { params: { lat, lon } })
  return { city: toCityData(data), detail: toDetailData(data) }
}

/**
 * 여러 도시의 날씨를 병렬로 조회한다.
 *
 * [핵심] Promise.all 은 하나라도 실패하면 전체가 실패한다.
 *        일부 도시만 실패해도 나머지는 보여주기 위해 allSettled 를 쓴다.
 *
 * @param {Array} regionList - [{ id, query, enName, name }] 형태
 */
export const fetchWeatherByCities = async (regionList) => {
  const results = await Promise.allSettled(
    regionList.map((region) => fetchWeatherByCity(region.query)),
  )

  const cities = []
  const details = {}
  const failed = []

  results.forEach((result, index) => {
    const origin = regionList[index]

    if (result.status === 'fulfilled') {
      // API 응답에는 한글 도시명이 없으므로 기준 매핑을 유지한다
      cities.push({
        ...result.value.city,
        id: origin.id,
        name: origin.name,
        enName: origin.enName,
        region: origin.region,
      })
      details[origin.id] = result.value.detail
    } else {
      failed.push(origin.name)
    }
  })

  return { cities, details, failed }
}

/**
 * 검색어로 도시를 조회한다. (목록에 없는 도시 추가용)
 *
 * [주의] 한글 도시명으로는 조회되지 않는다. 영문명을 입력해야 한다.
 *        예: '도쿄' X / 'Tokyo' O
 */
export const searchCity = async (keyword) => {
  const { city, detail } = await fetchWeatherByCity(keyword)

  return {
    city: {
      ...city,
      // API 가 돌려준 영문명을 한글명 자리에도 그대로 쓴다
      name: city.enName,
      // 검색으로 추가된 도시임을 표시 -> 새로고침 시 목록에서 제외
      isSearched: true,
    },
    detail,
  }
}

/** 도시의 시간대별·5일 예보를 조회한다. */
export const fetchForecastByCity = async (query, cityId) => {
  const { data } = await weatherClient.get('/forecast', { params: { q: query } })

  return {
    hourly: toHourly(data.list, cityId),
    daily: toDaily(data.list, cityId),
  }
}

/** OpenWeather 아이콘 코드를 이미지 URL 로 변환한다. (예: '04d') */
export const getIconUrl = (iconCode) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`

/**
 * 브라우저에서 현재 위치 좌표를 가져온다.
 *
 * [주의] navigator.geolocation 은 콜백 방식이므로 Promise 로 감싼다.
 *        HTTPS(또는 localhost)에서만 동작하고, 사용자가 거부할 수 있다.
 *        실패는 정상적인 흐름이므로 호출부에서 폴백을 준비해야 한다.
 */
export const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저는 위치 조회를 지원하지 않습니다.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }),
      (error) => reject(new Error(`위치 조회 실패: ${error.message}`)),
      // 10초 안에 못 받으면 포기하고, 5분 이내 캐시된 위치는 재사용한다
      { timeout: 10000, maximumAge: 300000 },
    )
  })
