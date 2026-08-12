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
