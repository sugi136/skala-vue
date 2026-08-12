// ============================================
// 5장 : src/data/weatherMockData.js
//
// [배경] 라우터로 페이지가 분리되면서 문제가 생긴다.
//   HomeView 의 weatherList 는 그 컴포넌트 안의 지역 상태이므로
//   DetailView 로 이동하면 접근할 수 없다.
//
// [임시 해결] 공통 데이터를 별도 모듈로 분리해 양쪽에서 import 한다.
//   [6장] 이 방식은 "읽기 전용 상수"에만 유효하다.
//         상태를 공유하고 변경까지 하려면 Pinia store 가 필요하다.
//   [7장] 여기가 axios 응답으로 대체될 자리다.
// ============================================

// 목록용 기본 데이터
//   name -> data.name / temp -> data.main.temp / status -> data.weather[0].description
export const weatherMockList = [
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', icon: '☀️' },
  { id: 'city_02', name: '수원', temp: 24, status: '비', icon: '🌧️' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', icon: '⛅' },
  { id: 'city_04', name: '제주', temp: 27, status: '맑음', icon: '☀️' },
  { id: 'city_05', name: '강릉', temp: 25, status: '흐림', icon: '☁️' },
]

// 상세 페이지용 확장 데이터
//   [7장] 아래 항목은 모두 /weather 응답 하나로 채울 수 있다.
//     feelsLike  -> data.main.feels_like
//     humidity   -> data.main.humidity
//     windSpeed  -> data.wind.speed
//     clouds     -> data.clouds.all
//     visibility -> data.visibility (m -> km 변환)
//     pressure   -> data.main.pressure
//     sunrise    -> data.sys.sunrise (Unix timestamp)
//     sunset     -> data.sys.sunset
export const weatherMockDetail = {
  city_01: {
    feelsLike: 29.1,
    humidity: 54,
    windSpeed: 3.0,
    windDir: '서풍',
    clouds: 10,
    visibility: 10,
    pressure: 1011,
    sunrise: '05:42',
    sunset: '19:32',
  },
  city_02: {
    feelsLike: 25.4,
    humidity: 82,
    windSpeed: 2.1,
    windDir: '남동풍',
    clouds: 95,
    visibility: 6,
    pressure: 1008,
    sunrise: '05:44',
    sunset: '19:33',
  },
  city_03: {
    feelsLike: 27.2,
    humidity: 68,
    windSpeed: 4.3,
    windDir: '남풍',
    clouds: 60,
    visibility: 9,
    pressure: 1010,
    sunrise: '05:35',
    sunset: '19:24',
  },
  city_04: {
    feelsLike: 28.5,
    humidity: 71,
    windSpeed: 5.2,
    windDir: '남서풍',
    clouds: 20,
    visibility: 10,
    pressure: 1009,
    sunrise: '05:47',
    sunset: '19:35',
  },
  city_05: {
    feelsLike: 25.8,
    humidity: 77,
    windSpeed: 1.8,
    windDir: '북동풍',
    clouds: 88,
    visibility: 7,
    pressure: 1012,
    sunrise: '05:38',
    sunset: '19:28',
  },
}

// [문법] find 로 id 에 해당하는 도시 객체를 찾는다.
//        없으면 undefined 를 반환하므로 호출부에서 v-if 로 처리한다.
export const findCityById = (cityId) => weatherMockList.find((item) => item.id === cityId)

export const findDetailById = (cityId) => weatherMockDetail[cityId] ?? null

// --------------------------------------------
// 5일 예보 Mock Data
//
// [7장] OpenWeather 무료 티어의 /data/2.5/forecast 로 대체할 예정
//   - 최대 5일, 3시간 간격 40개 배열로 응답
//   - 날짜별로 묶어 최고/최저를 뽑는 가공이 필요 (9장 reduce / filter 활용)
//   - 좌표 기반 조회: ?lat={위도}&lon={경도}
//
// [설계] 도시마다 25개 항목을 손으로 적는 대신 생성 함수 사용
//        7장에서 실제 데이터로 교체 예정
// --------------------------------------------

// 요일 라벨을 오늘 기준으로 만든다
const WEEKDAY_LABEL = ['일', '월', '화', '수', '목', '금', '토']

// [주의] Math.random() 을 쓰면 렌더링될 때마다 값이 바뀐다.
//        index 기반의 고정된 패턴으로 만들어 항상 같은 결과가 나오게 한다.
const TEMP_OFFSET = [0, 1, -2, -1, -3] // 오늘부터 5일간의 기온 변화 폭
const ICON_PATTERN = ['☀️', '☀️', '🌧️', '⛅', '☁️']

/**
 * 도시 하나의 5일 예보를 생성한다.
 * @param {object} city - { id, name, temp, icon }
 * @returns {Array} 5일치 예보 배열
 */
const createForecast = (city) => {
  const today = new Date()

  // Array.from 으로 길이 5인 배열을 만들며 각 요소를 생성
  return Array.from({ length: 5 }, (_, index) => {
    // 오늘 날짜에 index 일을 더한다
    const date = new Date(today)
    date.setDate(today.getDate() + index)

    // 기온: 도시의 현재 기온을 기준으로 고정된 오프셋을 적용
    const high = city.temp + TEMP_OFFSET[index]
    const low = high - 8

    return {
      id: `${city.id}_f${index + 1}`,
      // 오늘만 '오늘'로 표시하고 나머지는 요일
      day: index === 0 ? '오늘' : WEEKDAY_LABEL[date.getDay()],
      // [문법] padStart(2, '0') — 한 자리 숫자 앞에 0을 채워 08/12 형태로
      date: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
      icon: ICON_PATTERN[index],
      high,
      low,
    }
  })
}

// reduce 로 { city_01: [...], city_02: [...] } 형태의 객체를 조립
export const weatherMockForecast = weatherMockList.reduce((acc, city) => {
  acc[city.id] = createForecast(city)
  return acc
}, {})

// 도시 id 로 예보 배열을 조회, 없으면 빈 배열
export const findForecastById = (cityId) => weatherMockForecast[cityId] ?? []

// --------------------------------------------
// [7장 대비] 기본 도시 id
//   현재 위치 좌표 조회가 실패하거나 사용자가 권한을 거부했을 때 사용
//   navigator.geolocation 은 HTTPS(또는 localhost)에서만 동작하고,
//   사용자가 거부할 수 있으므로 폴백이 반드시 필요
// --------------------------------------------
export const DEFAULT_CITY_ID = 'city_01' // 서울
