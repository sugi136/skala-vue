<script setup>
// ============================================
// 3장 Hands on : Weather Composition
// 2장 Mockup 을 베이스로, 하드코딩되어 있던 값들을 Composition API 로 전환
// 사용 문법: ref / computed / watch / watchEffect
//
// [2장 -> 3장 변화]
//   1) 검색창이 표시만 하던 것    -> computed 로 목록을 실제 필터링 (+ 초성 검색)
//   2) 요약 패널의 하드코딩       -> computed 로 weatherList 에서 자동 계산
//   3) 헤더 색상 고정           -> computed 로 선택 도시 날씨에 따라 변경
//   4) 변화 추적 없음           -> watch / watchEffect 추가
// ============================================
import { ref, computed, watch, watchEffect } from 'vue'

// --------------------------------------------
//   4일차 API 연동을 대비한 가상의 백엔드 데이터 배열 (v-for 및 :key 실습용)
//   name   -> data.name
//   temp   -> data.main.temp
//   status -> data.weather[0].description
// [Customization] icon 필드 추가
// --------------------------------------------
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', icon: '☀️' },
  { id: 'city_02', name: '수원', temp: 24, status: '비', icon: '🌧️' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', icon: '⛅' },
  { id: 'city_04', name: '제주', temp: 27, status: '맑음', icon: '☀️' },
  { id: 'city_05', name: '강릉', temp: 25, status: '흐림', icon: '☁️' },
])

//  검색어 및 상태바 제어용 데이터
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

// [Customization] 선택된 도시의 id — 헤더 테마 계산에 사용
const selectedCityId = ref(null)

// [Customization] 오늘 날짜 — 페이지 진입 시 1회만 계산되므로 ref 불필요
const today = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

// --------------------------------------------
// [Customization] 한글 초성 추출기
//
// '서울'.includes('ㅅ') 은 false 다. 한글은 한 글자가 통째로 하나의 문자이므로
// 초성만 따로 뽑아내야 'ㅅㅇ' 같은 검색이 가능해진다.
//
// 원리: 완성형 한글(가~힣)은 유니코드 0xAC00 부터 순서대로 배열되어 있고
//       (초성 인덱스 × 588) + (중성 인덱스 × 28) + 종성 인덱스 구조를 가진다.
//       따라서 588 로 나눈 몫이 곧 초성의 순번이다.
// --------------------------------------------
const CHOSUNG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]

const getChosung = (str) =>
  // ... 스프레드로 문자열을 글자 배열로 분해 -> map 으로 변환 -> join 으로 결합
  [...str]
    .map((char) => {
      const code = char.charCodeAt(0) - 0xac00
      // 완성형 한글 범위(0 ~ 11171) 밖이면 원래 글자를 그대로 둔다
      if (code < 0 || code > 11171) return char
      return CHOSUNG[Math.floor(code / 588)]
    })
    .join('')

// --------------------------------------------
// [3장 추가 1] computed — 실시간 검색 필터링  ★ 핵심
//
// 2장에서는 검색어를 화면에 표시만 했지만,
// 이제 searchQuery 가 바뀔 때마다 목록 자체가 다시 계산
// [핵심] computed 는 의존값(searchQuery, weatherList)이 바뀔 때만 재연산하고
//        그렇지 않으면 캐시된 결과를 재사용
// [주의] computed 는 읽기 전용. filteredList.value = ... 처럼 대입할 수 없다.
// --------------------------------------------
const filteredList = computed(() => {
  const query = searchQuery.value.trim()

  // [문법] 빈 문자열은 falsy 이므로 length 비교 없이 !query 로 충분
  if (!query) return weatherList.value

  // [Customization] 초성 검색은 startsWith 로 앞에서부터만 매칭
  //   includes 를 쓰면 'ㅅ' 입력 시 '부산'(ㅂㅅ)의 두 번째 초성까지 걸려버린다.
  return weatherList.value.filter(
    (item) => item.name.startsWith(query) || getChosung(item.name).startsWith(query),
  )
})

// --------------------------------------------
// [3장 추가 2] computed — 오늘의 요약 자동 계산  ★ 2장 하드코딩 제거
//
// 2장 주석에 "(예정)"으로 적어둔 계산식을 실제로 구현
// 이제 도시를 추가/삭제하면 요약도 자동으로 따라 변경
// --------------------------------------------

// 기온만 뽑은 숫자 배열 — 아래 계산들이 공통으로 사용
// map으로 각 요소를 변환해 새 배열 생성
const temps = computed(() => weatherList.value.map((item) => item.temp))

// 최고 기온 도시 (Math.max)
// 프레드(...)로 배열을 펼쳐 Math.max 의 인자로 전달
const hottestCity = computed(() => {
  const max = Math.max(...temps.value)
  return weatherList.value.find((item) => item.temp === max)
})

// 최저 기온 도시 (Math.min)
const coldestCity = computed(() => {
  const min = Math.min(...temps.value)
  return weatherList.value.find((item) => item.temp === min)
})

// 평균 기온 (Math.round / toFixed) — 소수점 1자리까지 표시
// reduce 로 누적 합을 구한 뒤 개수로 나눈다
const averageTemp = computed(() => {
  const sum = temps.value.reduce((acc, cur) => acc + cur, 0)
  // toFixed(1) -> 소수점 1자리 문자열이므로 Number() 로 다시 숫자 변환
  return Number((sum / temps.value.length).toFixed(1))
})

// 25도 이상인 도시 개수 (filter + length)
const hotCityCount = computed(() => weatherList.value.filter((item) => item.temp >= 25).length)

// 위 계산 결과를 화면에 뿌리기 좋은 형태로 조립
// [핵심] computed 안에서 다른 computed 를 참조할 수 있다 (의존성 체인)
const summaryList = computed(() => [
  {
    id: 'sum_01',
    icon: '🔥',
    label: '최고 기온',
    value: `${hottestCity.value.temp}°C`,
    sub: hottestCity.value.name,
    tone: 'hot',
  },
  {
    id: 'sum_02',
    icon: '❄️',
    label: '최저 기온',
    value: `${coldestCity.value.temp}°C`,
    sub: coldestCity.value.name,
    tone: 'cold',
  },
  {
    id: 'sum_03',
    icon: '📊',
    label: '평균 기온',
    value: `${averageTemp.value}°C`,
    sub: `${weatherList.value.length}개 도시`,
    tone: 'avg',
  },
  {
    id: 'sum_04',
    icon: '🌡️',
    label: '더운 도시',
    value: `${hotCityCount.value}곳`,
    sub: '25°C 이상',
    tone: 'count',
  },
])

// --------------------------------------------
// [3장 추가 3 / Customization] computed — 날씨에 따른 헤더 테마
//
// 선택된 도시의 status 값을 CSS 클래스명으로 변환한다.
// 아무것도 선택하지 않았으면 기본 테마(clear)를 쓴다.
// --------------------------------------------
const selectedCity = computed(() =>
  weatherList.value.find((item) => item.id === selectedCityId.value),
)

const headerTheme = computed(() => {
  // optional chaining(?.) — selectedCity 가 없어도 에러 없이 undefined
  const status = selectedCity.value?.status

  if (status === '비') return 'rain'
  if (status === '흐림') return 'cloudy'
  if (status === '구름') return 'cloud'
  return 'clear' // 맑음 또는 미선택
})

// 카드 클릭 시 두 상태를 함께 갱신
const selectCity = (item) => {
  selectedCityId.value = item.id
  selectedCityInfo.value = `${item.name}이 선택되었습니다.`
}

// --------------------------------------------
// [3장 추가 4] watch — 명시적 감시
//
// 감시 대상을 직접 지정, 값이 바뀌는 순간에만 콜백 실행
// [핵심] 이전 값(oldValue)을 받을 수 있다.
// [7장] 실제로는 여기서 선택 도시의 날씨 API 를 다시 호출하게 된다.
// --------------------------------------------
watch(selectedCityInfo, (newInfo, oldInfo) => {
  console.log(`[watch] 상태바 변경: "${oldInfo}" -> "${newInfo}"`)
})

// 검색어를 감시해 결과 건수를 로그로 남긴다
watch(searchQuery, (newQuery) => {
  console.log(`[watch] 검색어 '${newQuery}' -> 결과 ${filteredList.value.length}건`)
})

// --------------------------------------------
// [3장 추가 5] watchEffect — 자동 의존성 추적
//
// 감시 대상을 지정하지 않아도, 콜백 안에서 읽은 반응형 값을 Vue 가 자동 등록
// [핵심] watch 와 달리 선언 즉시 1회 실행된다 (새로고침하자마자 로그가 찍힘)
// [주의] 이전 값(oldValue)은 받을 수 없다.
// --------------------------------------------
watchEffect(() => {
  // 아래에서 searchQuery 와 filteredList 를 읽었으므로 둘 다 자동 감시 대상이 된다
  console.log(
    `[watchEffect] 검색어 '${searchQuery.value}' / 표시 중인 도시 ${filteredList.value.length}개`,
  )
})

//  알림 대행 함수 (window 객체 격리 우회)
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <!-- [Customization] 테마 클래스를 최상위에 붙여 헤더~본문 색조를 함께 제어 -->
  <div class="dashboard-wrapper" :class="['theme-' + headerTheme]">
    <!-- ===== 헤더 ===== -->
    <header class="app-header">
      <div class="header-top">
        <div>
          <h1>과제 2: 날씨 (Composition)</h1>
          <p class="header-date">
            {{ today }}
            <!-- [Customization] 선택된 도시가 있을 때만 이름을 덧붙인다 -->
            <span v-if="selectedCity" class="header-city">{{ selectedCity.name }}</span>
          </p>
        </div>
        <!-- [Customization] 선택 도시의 아이콘을 헤더에 반영 -->
        <div class="header-deco" aria-hidden="true">{{ selectedCity?.icon ?? '☀️' }}</div>
      </div>

      <!--  검색 박스 -->
      <!-- [Customization] v-model 대신 :value + @input
           v-model 은 한글 조합(IME)이 끝나야 값이 반영되어 'ㅅ' 입력 시 반응하지 않는다.
           @input 은 조합 중에도 발생하므로 초성 검색이 실시간으로 동작한다. -->
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          :value="searchQuery"
          @input="(e) => (searchQuery = e.target.value)"
          placeholder="도시 이름 또는 초성 입력 (예: 서울, ㅅㅇ)"
        />
      </div>

      <!-- [3장 변화] 단순 표시에서 "몇 건 검색됨"으로 발전 -->
      <p class="search-status">
        <template v-if="searchQuery">
          검색 중인 도시: <strong>{{ searchQuery }}</strong>
          <span class="result-count">({{ filteredList.length }}건)</span>
        </template>
        <template v-else> 도시 이름을 입력하면 목록이 실시간으로 걸러집니다. </template>
      </p>
    </header>

    <!-- ===== 본문 : 좌(목록) / 우(요약) ===== -->
    <div class="dashboard-body">
      <!-- ---------- 왼쪽 : 지역별 날씨 현황 ---------- -->
      <section class="panel list-box">
        <h3 class="panel-title"><span class="title-icon">🏙️</span> 지역별 날씨 현황</h3>

        <!-- [3장 변화] weatherList -> filteredList (computed 결과를 렌더링) -->
        <div
          v-for="item in filteredList"
          :key="item.id"
          class="weather-card"
          :class="{ 'is-selected': item.id === selectedCityId }"
          @click="selectCity(item)"
        >
          <div class="card-icon">{{ item.icon }}</div>

          <div class="card-main">
            <h4 class="card-name">
              {{ item.name }} <span class="card-status">({{ item.status }})</span>
            </h4>
            <p class="card-temp">
              현재 기온: <strong>{{ item.temp }}°C</strong>
            </p>

            <!-- [핵심] v-if / v-else — 기온에 따라 다른 배지 -->
            <span v-if="item.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
            <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>
          </div>

          <!-- [핵심] @click.stop — 부모 카드로 이벤트가 버블링되는 것을 차단 -->
          <button class="btn-detail" @click.stop="showDetail(item.name, item.status)">
            상세보기
          </button>
        </div>

        <!-- [3장 추가] 검색 결과가 없을 때의 안내 -->
        <p v-if="filteredList.length === 0" class="empty-message">
          검색 결과와 일치하는 도시가 없습니다.
        </p>
      </section>

      <!-- ---------- 오른쪽 : 오늘의 요약 ---------- -->
      <aside class="panel summary-box">
        <h3 class="panel-title"><span class="title-icon">📋</span> 오늘의 요약</h3>

        <!-- [3장 변화] 하드코딩 배열 -> computed 계산 결과 -->
        <ul class="summary-list">
          <li v-for="sum in summaryList" :key="sum.id" class="summary-row">
            <!-- [문법] :class 배열 형식 — 고정 클래스 + 동적으로 조립한 클래스 -->
            <span class="summary-badge" :class="['tone-' + sum.tone]">{{ sum.icon }}</span>
            <div class="summary-text">
              <p class="summary-label">{{ sum.label }}</p>
              <p class="summary-value">{{ sum.value }}</p>
              <p class="summary-sub">{{ sum.sub }}</p>
            </div>
          </li>
        </ul>
      </aside>
    </div>

    <!--  하단 상태바 -->
    <div class="status-bar">
      <span class="status-dot"></span>
      {{ selectedCityInfo }}
    </div>
  </div>
</template>
