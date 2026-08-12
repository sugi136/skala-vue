// ============================================
// src/data/weatherMockData.js
// [id 규칙] OpenWeather 응답의 data.name 이 영문 도시명("Seoul")으로 오므로
//   이를 소문자로 쓴 값을 id 로 삼는다.
//   장점: URL 이 /weather/seoul 처럼 읽기 쉽고,
//         7장에서 API 호출 시 ?q=seoul 로 그대로 넘길 수 있다.
// [예정] 이 파일 전체가 axios 응답으로 대체된다.
// ============================================

// --------------------------------------------
// 목록용 기본 데이터
//   id     -> data.name 을 소문자로 (API 조회 키로도 사용)
//   enName -> data.name
//   name   -> 화면 표시용 한글명 (API 에는 없으므로 직접 매핑 유지)
//   temp   -> data.main.temp
//   status -> data.weather[0].description
//   icon   -> data.weather[0].icon (지금은 이모지)
// --------------------------------------------
export const weatherMockList = [
  { id: 'seoul', enName: 'Seoul', name: '서울', temp: 28, status: '맑음', icon: '☀️' },
  { id: 'suwon', enName: 'Suwon', name: '수원', temp: 24, status: '비', icon: '🌧️' },
  { id: 'busan', enName: 'Busan', name: '부산', temp: 26, status: '구름', icon: '⛅' },
  { id: 'jeju', enName: 'Jeju', name: '제주', temp: 27, status: '맑음', icon: '☀️' },
  { id: 'gangneung', enName: 'Gangneung', name: '강릉', temp: 25, status: '흐림', icon: '☁️' },
]

// --------------------------------------------
// 상세 페이지용 확장 데이터
// [예정] OpenWeather /weather 응답 하나로 채워지는 항목
//     feelsLike  -> data.main.feels_like
//     humidity   -> data.main.humidity
//     windSpeed  -> data.wind.speed
//     clouds     -> data.clouds.all
//     visibility -> data.visibility (m -> km 변환)
//     pressure   -> data.main.pressure
//     sunrise    -> data.sys.sunrise (Unix timestamp -> 시각 변환)
//     sunset     -> data.sys.sunset
// [예정] 공공데이터포털 (별도 API)
//     uvIndex -> 기상청_생활기상지수 조회서비스(4.0)
//     pollen  -> 기상청_꽃가루농도위험지수 조회서비스(3.0)
//     dust    -> 에어코리아 미세먼지 정보
//   [주의] 세 API 모두 도시명이 아닌 행정구역코드(areaNo)로 조회하므로
//          별도의 지역코드 매핑 테이블이 필요하다.
// --------------------------------------------
export const weatherMockDetail = {
  seoul: {
    feelsLike: 29.1,
    humidity: 54,
    windSpeed: 3.0,
    windDir: '서풍',
    clouds: 10,
    visibility: 10,
    pressure: 1011,
    sunrise: '05:42',
    sunset: '19:32',
    uvIndex: 8,
    uvLevel: '매우높음',
    pollen: 2,
    pollenLevel: '낮음',
    dust: 32,
    dustLevel: '보통',
  },
  suwon: {
    feelsLike: 25.4,
    humidity: 82,
    windSpeed: 2.1,
    windDir: '남동풍',
    clouds: 95,
    visibility: 6,
    pressure: 1008,
    sunrise: '05:44',
    sunset: '19:33',
    uvIndex: 2,
    uvLevel: '낮음',
    pollen: 1,
    pollenLevel: '낮음',
    dust: 18,
    dustLevel: '좋음',
  },
  busan: {
    feelsLike: 27.2,
    humidity: 68,
    windSpeed: 4.3,
    windDir: '남풍',
    clouds: 60,
    visibility: 9,
    pressure: 1010,
    sunrise: '05:35',
    sunset: '19:24',
    uvIndex: 6,
    uvLevel: '높음',
    pollen: 3,
    pollenLevel: '보통',
    dust: 45,
    dustLevel: '보통',
  },
  jeju: {
    feelsLike: 28.5,
    humidity: 71,
    windSpeed: 5.2,
    windDir: '남서풍',
    clouds: 20,
    visibility: 10,
    pressure: 1009,
    sunrise: '05:47',
    sunset: '19:35',
    uvIndex: 9,
    uvLevel: '매우높음',
    pollen: 4,
    pollenLevel: '높음',
    dust: 22,
    dustLevel: '좋음',
  },
  gangneung: {
    feelsLike: 25.8,
    humidity: 77,
    windSpeed: 1.8,
    windDir: '북동풍',
    clouds: 88,
    visibility: 7,
    pressure: 1012,
    sunrise: '05:38',
    sunset: '19:28',
    uvIndex: 4,
    uvLevel: '보통',
    pollen: 2,
    pollenLevel: '낮음',
    dust: 58,
    dustLevel: '나쁨',
  },
}

// --------------------------------------------
// 기상특보 Mock Data
//
// [예정] 공공데이터포털 기상청_기상특보 조회서비스로 대체
//   - 한파/건조/안개/폭염/지진해일/폭풍해일/호우/대설/태풍/풍랑/강풍 등
//     12개 현상에 대해 주의보와 경보로 구분해 발표
//   - 178개 시·군 단위이므로 도시별 매핑이 가능하다
//   - 응답이 XML 기본이므로 dataType=JSON 파라미터를 붙여 조회한다
//
// [설계] 특보는 평소에 없는 것이 정상이다.
//        따라서 값이 없는 도시는 아예 키를 두지 않고,
//        화면에서는 v-if 로 있을 때만 배너를 띄운다.
//
//   level : 'warning'(주의보) | 'alert'(경보)
// --------------------------------------------
export const weatherMockAlert = {
  seoul: [
    {
      id: 'seoul_a1',
      type: '폭염',
      level: 'warning',
      title: '폭염주의보',
      message: '일 최고 체감온도 33℃ 이상인 상태가 이틀 이상 지속될 것으로 예상됩니다.',
      issuedAt: '오늘 11:00',
    },
  ],
  suwon: [
    {
      id: 'suwon_a1',
      type: '호우',
      level: 'alert',
      title: '호우경보',
      message: '3시간 강우량 90mm 이상이 예상됩니다. 하천 근처 접근을 자제해 주세요.',
      issuedAt: '오늘 09:30',
    },
    {
      id: 'suwon_a2',
      type: '강풍',
      level: 'warning',
      title: '강풍주의보',
      message: '순간풍속 20m/s 이상이 예상됩니다. 시설물 관리에 유의하세요.',
      issuedAt: '오늘 09:30',
    },
  ],
  gangneung: [
    {
      id: 'gangneung_a1',
      type: '풍랑',
      level: 'warning',
      title: '풍랑주의보',
      message: '동해 중부 앞바다에 유의파고 3m 이상이 예상됩니다.',
      issuedAt: '오늘 06:00',
    },
  ],
  // busan, jeju 는 특보 없음 — 키 자체를 두지 않는다
}

// --------------------------------------------
// 시간대별 예보 Mock Data (24시간 / 3시간 간격 8칸)
// [예정] /data/2.5/forecast 응답의 list 배열 앞 8개를 그대로 쓰면 된다.
//   list[0] = 가장 가까운 3시간 뒤 예보
//   각 항목: dt_txt(시각), main.temp, weather[0].icon, pop(강수확률 0~1)
//   -> 5일 예보와 달리 날짜별로 묶는 가공이 필요 없다.
//   pop 은 0~1 사이 소수이므로 화면에는 Math.round(pop * 100) 으로 표시한다.
// --------------------------------------------

// [주의] Math.random() 을 쓰면 렌더링될 때마다 값이 바뀐다.
//        index 기반의 고정된 패턴으로 만들어 항상 같은 결과가 나오게 한다.
const HOUR_TEMP_OFFSET = [0, -1, -3, -4, -3, -1, 1, 0]
const HOUR_ICON_CLEAR = ['☀️', '☀️', '🌙', '🌙', '🌙', '☀️', '☀️', '⛅']
const HOUR_ICON_RAIN = ['🌧️', '🌧️', '🌧️', '☁️', '☁️', '⛅', '☀️', '☀️']
const HOUR_POP_CLEAR = [0, 0, 0.1, 0.1, 0, 0, 0.2, 0.3]
const HOUR_POP_RAIN = [0.8, 0.9, 0.7, 0.4, 0.3, 0.2, 0.1, 0]

const createHourly = (city) => {
  const now = new Date()
  // 가장 가까운 3시간 단위로 올림 (예: 14:20 -> 15:00)
  const startHour = Math.ceil(now.getHours() / 3) * 3

  const isRainy = city.status === '비'
  const icons = isRainy ? HOUR_ICON_RAIN : HOUR_ICON_CLEAR
  const pops = isRainy ? HOUR_POP_RAIN : HOUR_POP_CLEAR

  // [문법] Array.from 으로 길이 8인 배열을 만들며 각 요소를 생성
  return Array.from({ length: 8 }, (_, index) => {
    const hour = (startHour + index * 3) % 24

    return {
      id: `${city.id}_h${index + 1}`,
      // [문법] padStart(2, '0') — 한 자리 시각 앞에 0을 채워 09:00 형태로
      time: index === 0 ? '지금' : `${String(hour).padStart(2, '0')}:00`,
      icon: icons[index],
      temp: city.temp + HOUR_TEMP_OFFSET[index],
      // 강수확률은 0~1 소수 -> 퍼센트로 변환해 저장
      pop: Math.round(pops[index] * 100),
    }
  })
}

export const weatherMockHourly = weatherMockList.reduce((acc, city) => {
  acc[city.id] = createHourly(city)
  return acc
}, {})

// --------------------------------------------
// 5일 예보 Mock Data
// [예정] /data/2.5/forecast 로 대체된다.
//   - 최대 5일, 3시간 간격 40개 배열로 응답이 온다
//   - 날짜별로 묶어 최고/최저를 뽑는 가공이 필요
//   - 좌표 기반 조회: ?lat={위도}&lon={경도}
// --------------------------------------------

const WEEKDAY_LABEL = ['일', '월', '화', '수', '목', '금', '토']

const TEMP_OFFSET = [0, 1, -2, -1, -3]
const ICON_PATTERN = ['☀️', '☀️', '🌧️', '⛅', '☁️']
const DAY_POP = [10, 0, 80, 30, 20]

const createForecast = (city) => {
  const today = new Date()

  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)

    const high = city.temp + TEMP_OFFSET[index]
    const low = high - 8

    return {
      id: `${city.id}_f${index + 1}`,
      day: index === 0 ? '오늘' : WEEKDAY_LABEL[date.getDay()],
      date: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
      icon: ICON_PATTERN[index],
      high,
      low,
      // [예정] 하루치 list 항목들의 pop 중 최댓값을 쓰면 된다
      pop: DAY_POP[index],
    }
  })
}

export const weatherMockForecast = weatherMockList.reduce((acc, city) => {
  acc[city.id] = createForecast(city)
  return acc
}, {})

// --------------------------------------------
// 조회 함수
// [문법] find 는 없으면 undefined 를 반환하므로 호출부에서 v-if 로 처리한다.
// --------------------------------------------
export const findCityById = (cityId) => weatherMockList.find((item) => item.id === cityId)

export const findDetailById = (cityId) => weatherMockDetail[cityId] ?? null

export const findForecastById = (cityId) => weatherMockForecast[cityId] ?? []

export const findHourlyById = (cityId) => weatherMockHourly[cityId] ?? []

// 특보가 없는 도시는 빈 배열을 돌려준다 -> 호출부에서 length 로 판단
export const findAlertById = (cityId) => weatherMockAlert[cityId] ?? []

// 특보가 있는지 여부만 확인 (카드 배지용)
export const hasAlert = (cityId) => (weatherMockAlert[cityId]?.length ?? 0) > 0

// --------------------------------------------
// [예정] 기본 도시 id
//   현재 위치 좌표 조회가 실패하거나 사용자가 권한을 거부했을 때 사용한다.
//   navigator.geolocation 은 HTTPS(또는 localhost)에서만 동작하고,
//   사용자가 거부할 수 있으므로 폴백이 반드시 필요하다.
// --------------------------------------------
export const DEFAULT_CITY_ID = 'seoul'
