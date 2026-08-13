// ============================================
// src/api/publicDataApi.js
//
// [역할] 공공데이터포털(data.go.kr) API 통신
//   - 미세먼지  : 에어코리아 시도별 실시간 측정정보
//   - 자외선    : 기상청 생활기상지수 조회서비스(4.0)
//   - 기상특보  : 기상청 기상특보 조회서비스
//
// [CORS] data.go.kr 은 브라우저 직접 호출을 허용하지 않는다.
//        개발 중에는 vite.config.js 의 proxy 로 우회하고,
//        배포 시에는 서버리스 함수 등 별도 프록시가 필요하다.
//        -> baseURL 을 '/api/data-go' 로 두고 Vite 가 대신 요청하게 한다.
//
// [인증키] 계정당 1개로 모든 서비스 공용. 파라미터 이름은 serviceKey.
//        [주의] 포털에 인코딩/디코딩 두 종류가 있는데 디코딩 키를 써야 한다.
//               axios 가 자동으로 인코딩하므로, 인코딩 키를 넣으면
//               '%2B' 가 '%252B' 로 이중 인코딩되어 인증에 실패한다.
// ============================================
import axios from 'axios'

const SERVICE_KEY = import.meta.env.VITE_DATA_GO_KR_API_KEY

if (!SERVICE_KEY) {
  console.warn('[publicDataApi] VITE_DATA_GO_KR_API_KEY 가 없습니다. .env 를 확인하세요.')
}

const publicClient = axios.create({
  // Vite 프록시 경로. 실제 요청은 https://apis.data.go.kr 로 전달된다
  baseURL: '/api/data-go',
  timeout: 10000,
  params: {
    serviceKey: SERVICE_KEY,
    // 기본 응답이 XML 이므로 JSON 을 명시한다.
    // 서비스마다 파라미터 이름이 dataType / returnType 으로 다르다
    dataType: 'JSON',
    returnType: 'json',
  },
})

// --------------------------------------------
// 미세먼지 — 에어코리아 시도별 실시간 측정정보
//
// 시도명(서울, 경기 등)으로 조회하면 그 안의 측정소 목록이 전부 온다.
// 대표값으로 쓰기 위해 유효한 값들의 평균을 낸다.
// --------------------------------------------

// 에어코리아 등급 코드 -> 한글
const GRADE_LABEL = { 1: '좋음', 2: '보통', 3: '나쁨', 4: '매우나쁨' }

export const fetchDustBySido = async (sidoName) => {
  const { data } = await publicClient.get(
    '/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty',
    {
      params: {
        sidoName,
        numOfRows: 100,
        pageNo: 1,
        ver: '1.3',
      },
    },
  )

  const items = data?.response?.body?.items ?? []
  if (items.length === 0) return null

  // [문법] filter 로 유효한 숫자만 남긴다.
  //        측정소가 점검 중이면 '-' 나 빈 문자열이 온다.
  const toNumbers = (key) =>
    items.map((it) => Number(it[key])).filter((n) => Number.isFinite(n) && n >= 0)

  const pm10List = toNumbers('pm10Value')
  const pm25List = toNumbers('pm25Value')

  if (pm10List.length === 0) return null

  const avg = (list) => Math.round(list.reduce((acc, cur) => acc + cur, 0) / list.length)

  const pm10 = avg(pm10List)
  const pm25 = pm25List.length > 0 ? avg(pm25List) : null

  return {
    pm10,
    pm25,
    // 등급은 평균값으로 다시 판정한다 (측정소마다 등급이 달라서)
    grade: pm10Grade(pm10),
    // 가장 최근 측정 시각
    dataTime: items[0]?.dataTime ?? '',
    stationCount: pm10List.length,
  }
}

// 에어코리아 PM10 기준: 0~30 좋음 / 31~80 보통 / 81~150 나쁨 / 151~ 매우나쁨
export const pm10Grade = (value) => {
  if (value <= 30) return GRADE_LABEL[1]
  if (value <= 80) return GRADE_LABEL[2]
  if (value <= 150) return GRADE_LABEL[3]
  return GRADE_LABEL[4]
}

export const pm10Tone = (value) => {
  if (value <= 30) return 'safe'
  if (value <= 80) return 'warn'
  return 'danger'
}

// --------------------------------------------
// 자외선지수 — 기상청 생활기상지수 조회서비스(4.0)
//
// [주의] 발표 시각이 정해져 있다. time 파라미터는 YYYYMMDDHH 형식이며
//        06시 또는 18시 발표분만 조회된다.
//        따라서 현재 시각을 그대로 넣으면 결과가 비어 있다.
// --------------------------------------------

/** 가장 최근 발표 시각(06 또는 18)을 YYYYMMDDHH 형식으로 만든다. */
const getLatestBaseTime = () => {
  const now = new Date()
  const hour = now.getHours()

  let baseHour
  if (hour >= 18) {
    baseHour = 18
  } else if (hour >= 6) {
    baseHour = 6
  } else {
    // 새벽 0~5시에는 전날 18시 발표분을 쓴다
    now.setDate(now.getDate() - 1)
    baseHour = 18
  }

  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(baseHour).padStart(2, '0')

  return `${yyyy}${mm}${dd}${hh}`
}

export const fetchUvByArea = async (areaNo) => {
  const { data } = await publicClient.get('/1360000/LivingWthrIdxServiceV5/getUVIdxV5', {
    params: {
      areaNo,
      time: getLatestBaseTime(),
      numOfRows: 10,
      pageNo: 1,
    },
  })

  const item = data?.response?.body?.items?.item?.[0]
  if (!item) return null

  // h0 = 발표 시점, h3 = 3시간 후 ... 현재 시점 값인 h0 을 쓴다
  const value = Number(item.h0)
  if (!Number.isFinite(value)) return null

  return { value, level: uvLevel(value) }
}

// 기상청 자외선지수 기준: 3미만 낮음 / 3~5 보통 / 6~7 높음 / 8~10 매우높음 / 11이상 위험
export const uvLevel = (value) => {
  if (value >= 11) return '위험'
  if (value >= 8) return '매우높음'
  if (value >= 6) return '높음'
  if (value >= 3) return '보통'
  return '낮음'
}

export const uvTone = (value) => {
  if (value >= 8) return 'danger'
  if (value >= 6) return 'warn'
  return 'safe'
}

// --------------------------------------------
// 기상특보 — 기상청 기상특보 조회서비스
//
// 전국 특보 목록을 한 번에 받아 지역명으로 걸러낸다.
// --------------------------------------------
export const fetchWeatherAlerts = async () => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')

  const { data } = await publicClient.get('/1360000/WthrWrnInfoService/getWthrWrnList', {
    params: {
      numOfRows: 50,
      pageNo: 1,
      // 오늘 하루치를 조회한다
      fromTmFc: `${yyyy}${mm}${dd}`,
      toTmFc: `${yyyy}${mm}${dd}`,
    },
  })

  const items = data?.response?.body?.items?.item ?? []
  // 응답이 단일 객체로 올 수도 있어 배열로 통일한다
  return Array.isArray(items) ? items : [items]
}

/**
 * 전체 특보 목록에서 특정 지역에 해당하는 것만 골라 화면용으로 변환한다.
 * @param {Array} allAlerts - fetchWeatherAlerts 결과
 * @param {string} regionName - '서울특별시' 등
 */
export const filterAlertsByRegion = (allAlerts, regionName) => {
  if (!regionName) return []

  // 시·도 앞 두 글자로 대조한다 ('서울특별시' -> '서울')
  const keyword = regionName.slice(0, 2)

  return allAlerts
    .filter((item) => (item.t6 ?? '').includes(keyword) || (item.t7 ?? '').includes(keyword))
    .map((item, index) => {
      // t3: 특보 종류, t4: 주의보/경보 구분이 문자열로 섞여 온다
      const title = item.title ?? `${item.t3 ?? '기상특보'}`
      const isAlert = title.includes('경보')

      return {
        id: `alert_${index}`,
        type: (item.t3 ?? '기상').replace(/(주의보|경보)/g, ''),
        level: isAlert ? 'alert' : 'warning',
        title,
        message: item.t7 ?? item.t6 ?? '자세한 내용은 기상청 발표를 확인하세요.',
        issuedAt: item.tmFc ? formatIssuedAt(String(item.tmFc)) : '',
      }
    })
}

// '202608130600' -> '08/13 06:00'
const formatIssuedAt = (tmFc) => {
  if (tmFc.length < 12) return tmFc
  return `${tmFc.slice(4, 6)}/${tmFc.slice(6, 8)} ${tmFc.slice(8, 10)}:${tmFc.slice(10, 12)}`
}
