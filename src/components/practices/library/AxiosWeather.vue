<script setup>
// ============================================
// 7장 Code Challenge : AxiosWeather.vue
// 위치: src/components/practices/library/AxiosWeather.vue
//
// [목적] axios 통신의 기본 흐름을 확인한다.
//   - async / await 로 응답을 기다린다
//   - try / catch / finally 로 성공·실패·정리를 나눈다
//   - fetch 와 달리 .json() 변환 없이 response.data 로 바로 접근한다
// ============================================
import { ref } from 'vue'
import axios from 'axios'

const weatherData = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

// [핵심] API 키는 소스에 직접 쓰지 않고 환경 변수에서 읽는다.
//        Vite 는 VITE_ 접두사가 붙은 변수만 클라이언트에 노출한다.
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const handleFetchWeather = async () => {
  isLoading.value = true
  errorMessage.value = ''

  // 광주 좌표
  const URL = 'https://api.openweathermap.org/data/2.5/weather'

  try {
    // [핵심] await — 서버 응답이 올 때까지 이 줄에서 기다린다.
    //        params 로 넘기면 axios 가 쿼리스트링을 알아서 조립하고
    //        URL 인코딩까지 처리해 준다.
    const response = await axios.get(URL, {
      params: {
        lat: 35.158582,
        lon: 126.804975,
        appid: API_KEY,
        units: 'metric', // 섭씨. 없으면 켈빈(301.36)으로 온다
        lang: 'kr', // 날씨 설명을 한글로
      },
    })

    // [비교] fetch 는 res.json() 을 한 번 더 호출해야 하지만
    //        axios 는 response.data 에 이미 파싱된 객체가 들어 있다.
    console.log('Axios 응답 전체 객체:', response)
    console.log('핵심 데이터(response.data):', response.data)

    weatherData.value = response.data
  } catch (error) {
    // [핵심] 4xx·5xx 응답이나 네트워크 오류가 자동으로 여기로 들어온다.
    //        fetch 는 404 를 성공으로 취급하므로 직접 res.ok 를 확인해야 한다.
    console.error('통신 중 에러가 발생했습니다:', error)

    const status = error.response?.status
    if (status === 401) {
      errorMessage.value = 'API 키가 유효하지 않습니다. 발급 후 활성화까지 시간이 걸립니다.'
    } else if (status === 429) {
      errorMessage.value = '요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.'
    } else {
      errorMessage.value = '데이터를 가져오지 못했습니다.'
    }
  } finally {
    // [핵심] 성공하든 실패하든 반드시 실행된다. 로딩 해제는 여기서.
    isLoading.value = false
  }
}

// --------------------------------------------
// [비교 실습] Promise .then 체이닝 방식
//
//   async/await 와 동작은 같지만 실행 순서가 눈에 덜 보인다.
//   콘솔에 찍히는 순서를 비교해 보면 비동기의 성질이 드러난다.
// --------------------------------------------
const handleFetchWithThen = () => {
  console.log('1. 요청 직전')

  axios
    .get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: 'Seoul,KR', appid: API_KEY, units: 'metric', lang: 'kr' },
    })
    .then((response) => {
      console.log('3. 데이터 도착:', response.data.name)
      weatherData.value = response.data
    })
    .catch((error) => {
      console.error('3. 실패:', error.message)
    })

  // [핵심] 이 줄이 3번보다 먼저 찍힌다.
  //        요청을 보내놓고 기다리지 않은 채 다음 줄로 넘어가기 때문이다.
  console.log('2. 요청 직후 (데이터는 아직 없음)')
}
</script>

<template>
  <div class="practice-section">
    <h2>Axios 통신 검증</h2>

    <div class="btn-group">
      <button :disabled="isLoading" @click="handleFetchWeather">
        {{ isLoading ? '데이터 로딩 중...' : 'async/await 로 가져오기 (광주)' }}
      </button>
      <button class="btn-then" @click="handleFetchWithThen">
        .then 체이닝으로 가져오기 (서울)
      </button>
    </div>

    <p class="hint">※ 두 버튼을 눌러보고 콘솔(F12)에 찍히는 순서를 비교해 보세요.</p>

    <p v-if="errorMessage" class="error-box">{{ errorMessage }}</p>

    <div v-else-if="weatherData" class="result-card">
      <p>
        위치: <strong>{{ weatherData.name }}</strong>
      </p>
      <p>
        현재 기온: <strong>{{ weatherData.main.temp }}°C</strong>
      </p>
      <p>
        체감 온도: <strong>{{ weatherData.main.feels_like }}°C</strong>
      </p>
      <p>
        날씨 상태: <strong>{{ weatherData.weather[0].description }}</strong>
      </p>
      <p>
        습도: <strong>{{ weatherData.main.humidity }}%</strong>
      </p>
      <p>
        풍속: <strong>{{ weatherData.wind.speed }} m/s</strong>
      </p>
    </div>

    <div v-else>
      <p class="empty">아직 가져온 데이터가 없습니다. 버튼을 눌러 통신을 시작하세요.</p>
    </div>
  </div>
</template>

<style scoped>
.btn-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

button {
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: #0284c7;
  border: none;
  border-radius: 7px;
  cursor: pointer;
}

button:disabled {
  background: #94a3b8;
  cursor: default;
}

.btn-then {
  background: #7c5cd0;
}

.hint {
  margin: 0 0 16px;
  font-size: 12px;
  color: #64748b;
}

.result-card {
  padding: 15px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  line-height: 1.8;
}

.result-card p {
  margin: 0;
}

.result-card strong {
  color: #0284c7;
}

.error-box {
  padding: 13px 16px;
  color: #922f2f;
  background: #fdefee;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.empty {
  color: #94a3b8;
  font-size: 14px;
}
</style>
