// ============================================
// 6장 Hands on : src/stores/configStore.js
// [과제] 날씨 단위를 세팅하는 store
//   state   : unit        단위를 저장 (초기값 celsius)
//   getters : unitSymbol  현재 단위에 맞는 기호 (℃ / ℉)
//   actions : toggleUnit  celsius <-> fahrenheit 토글
// [왜 Store 인가]
//   단위 설정은 대시보드·상세 페이지·요약 패널·예보가 모두 공유해야 한다.
//   props 로 내리면 컴포넌트 단계마다 전달해야 하고(Props Drilling),
//   페이지가 바뀌면 상태가 초기화된다. -> 전역 store 가 적합.
// ============================================
import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

// localStorage 에 저장할 때 사용하는 키
const STORAGE_KEY = 'weather-config'

// 저장된 설정을 불러온다. 실패하면 기본값으로 시작한다.
const loadConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.warn('[configStore] 저장된 설정을 불러오지 못했습니다.', error)
    return null
  }
}

// [상수] 더움/선선함을 가르는 기준 온도 (섭씨)
//   판정은 항상 이 값으로 하고, 화면 표시만 단위에 맞춰 변환한다.
const HOT_THRESHOLD_CELSIUS = 25

export const useConfigStore = defineStore('config', () => {
  // --------------------------------------------
  // 1. state
  // --------------------------------------------
  // 값은 오직 'celsius' 또는 'fahrenheit' 두 가지만 가진다.
  const saved = loadConfig()

  const unit = ref(saved?.unit ?? 'celsius')

  // [Customization] 추가 state — 날씨별 화면 테마 사용 여부
  const useWeatherTheme = ref(saved?.useWeatherTheme ?? true)

  // --------------------------------------------
  // 설정이 바뀔 때마다 자동 저장 -> 새로고침해도 유지된다
  //
  // [문법] watch 의 첫 인자로 배열을 넘기면 여러 값을 동시에 감시한다.
  // --------------------------------------------
  watch([unit, useWeatherTheme], () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ unit: unit.value, useWeatherTheme: useWeatherTheme.value }),
      )
    } catch (error) {
      console.warn('[configStore] 설정을 저장하지 못했습니다.', error)
    }
  })

  // --------------------------------------------
  // [핵심] 섭씨 원본값을 현재 단위에 맞게 변환
  // [배경] 과제 참고사항에 "메인/상세에 유사한 코드가 중복된다"고 되어 있다.
  //        변환 로직을 store 로 올려두면 각 컴포넌트는
  //        configStore.convertTemp(temp) 한 줄만 쓰면 된다.
  //        (Composable 로도 해결 가능하지만 강의 범위 밖이므로 store 활용)
  // [주의] computed 보다 위에 선언해야 아래 getters 에서 참조할 수 있다.
  // --------------------------------------------
  function convertTemp(celsiusTemp) {
    if (unit.value === 'fahrenheit') {
      // ℉ = ℃ × 9/5 + 32
      return Math.round((celsiusTemp * 9) / 5 + 32)
    }
    return celsiusTemp
  }

  // --------------------------------------------
  // 2. getters
  // --------------------------------------------
  // 현재 단위 상태에 맞춰 화면에 뿌릴 기호를 실시간 리턴
  const unitSymbol = computed(() => (unit.value === 'celsius' ? '℃' : '℉'))

  // [Customization] 추가 getter — 단위의 한글 표기
  const unitLabel = computed(() => (unit.value === 'celsius' ? '섭씨' : '화씨'))

  // [Customization] 추가 getter — 현재 화씨 모드인지 여부
  const isFahrenheit = computed(() => unit.value === 'fahrenheit')

  // [Customization] 추가 getter — 현재 단위로 환산한 더움 기준값
  //   섭씨 25도 -> 화씨 77도
  //   배지 문구를 "더움 (25도 이상)" / "더움 (77도 이상)" 으로 자동 전환하기 위함
  const hotThreshold = computed(() => convertTemp(HOT_THRESHOLD_CELSIUS))

  // [Customization] 배지 문구를 통째로 만들어주는 getter
  //   각 컴포넌트가 문자열을 조립하지 않도록 store 에서 완성해 내려준다.
  const hotLabel = computed(() => `더움 (${hotThreshold.value}${unitSymbol.value} 이상)`)
  const coolLabel = computed(() => `선선함 (${hotThreshold.value}${unitSymbol.value} 미만)`)

  // --------------------------------------------
  // 3. actions
  // --------------------------------------------
  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  // [Customization] 추가 action — 단위를 직접 지정
  //   허용된 값만 받아들인다. 잘못된 값이 들어오면 무시
  function setUnit(newUnit) {
    if (newUnit === 'celsius' || newUnit === 'fahrenheit') {
      unit.value = newUnit
    }
  }

  // [Customization] 추가 action — 테마 사용 토글
  function toggleTheme() {
    useWeatherTheme.value = !useWeatherTheme.value
  }

  // [핵심] return 에 담은 것만 외부에 공개된다
  return {
    // state
    unit,
    useWeatherTheme,
    // getters
    unitSymbol,
    unitLabel,
    isFahrenheit,
    hotThreshold,
    hotLabel,
    coolLabel,
    // actions
    convertTemp,
    toggleUnit,
    setUnit,
    toggleTheme,
  }
})
