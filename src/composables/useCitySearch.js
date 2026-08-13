// ============================================
// src/composables/useCitySearch.js
//
// [배경] 초성 추출과 검색 필터링 로직이 WeatherHomeView 안에 있었다.
//   화면 컴포넌트가 "한글 유니코드 연산"까지 알고 있는 셈이라
//   책임이 섞여 있고, 다른 화면에서 같은 검색을 쓰려면 복사해야 한다.
//
// [Composable] 반응형 로직을 함수로 떼어내 재사용하는 Vue 3 의 방식.
//   이름을 use~ 로 시작하는 것이 관례다.
//   컴포넌트가 아니므로 <template> 이 없고, ref·computed 만 다룬다.
//
//   Mixin 과 달리 어떤 값이 어디서 왔는지 호출부에 드러나므로
//   이름 충돌이나 출처 불명 문제가 없다.
// ============================================
import { computed, unref } from 'vue'

// --------------------------------------------
// 한글 초성 목록
// 완성형 한글은 유니코드 0xAC00 부터
// (초성×588) + (중성×28) + 종성 순서로 배열되어 있다.
// 따라서 588 로 나눈 몫이 곧 초성의 순번이 된다.
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

const HANGUL_START = 0xac00
const HANGUL_END = 0xd7a3 - 0xac00 // 완성형 한글의 개수 - 1

/**
 * 문자열에서 초성만 뽑아낸다. 한글이 아닌 문자는 그대로 둔다.
 *   '서울' -> 'ㅅㅇ'
 *   'Seoul' -> 'Seoul'
 */
export const getChosung = (str) =>
  // [문법] 스프레드로 문자열을 글자 배열로 분해 -> map 변환 -> join 결합
  [...str]
    .map((char) => {
      const code = char.charCodeAt(0) - HANGUL_START
      if (code < 0 || code > HANGUL_END) return char
      return CHOSUNG[Math.floor(code / 588)]
    })
    .join('')

/**
 * 도시 목록을 검색어로 걸러내는 composable.
 *
 * @param {Ref<Array>} cities - 도시 목록 (ref 또는 일반 배열)
 * @param {Ref<string>} query - 검색어
 * @returns {{ filteredCities: ComputedRef }}
 */
export const useCitySearch = (cities, query) => {
  const filteredCities = computed(() => {
    // [문법] unref — ref 면 .value 를, 아니면 값 자체를 돌려준다.
    //        호출부가 ref 를 넘기든 배열을 넘기든 동작하게 해준다.
    const list = unref(cities)
    const keyword = unref(query).trim()

    if (!keyword) return list

    const lower = keyword.toLowerCase()

    // 한글명·영문명·초성 모두 "앞에서부터" 매칭한다.
    //
    // [설계] includes 를 쓰면 'ㅅ' 입력 시 '부산'(초성 ㅂㅅ)의
    //        두 번째 초성까지 걸려 검색 결과가 예측하기 어려워진다.
    //        세 가지 규칙을 startsWith 로 통일해 동작을 일관되게 만들었다.
    return list.filter(
      (city) =>
        city.name.startsWith(keyword) ||
        city.enName.toLowerCase().startsWith(lower) ||
        getChosung(city.name).startsWith(keyword),
    )
  })

  return { filteredCities }
}
