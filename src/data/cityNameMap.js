// ============================================
// src/data/cityNameMap.js
//
// [배경] OpenWeather 는 한글 도시명으로 조회되지 않는다.
//   q=서울 로 요청하면 404 가 돌아온다.
//   lang=kr 을 붙여도 날씨 설명만 한글이 될 뿐 조회어는 영문이어야 한다.
//
// [해결] 국내 주요 도시의 한글↔영문 매핑을 두고,
//   검색어가 매핑에 있으면 영문명으로 바꿔 조회한다.
//   매핑에 없으면 입력값을 그대로 넘겨 영문 검색도 계속 지원한다.
//
// [범위] 전국 226개 시군구를 모두 넣지 않은 이유
//   - 군 단위는 OpenWeather 에 데이터가 없거나 엉뚱한 지점이 잡히는 경우가 많다
//   - 실제로 조회되는 시 단위 위주로 약 60개를 선별했다
//   - 기본 17개 광역시·도는 regionList 에 이미 있어 로컬 필터로 처리된다
//
// [문법] ',KR' 국가코드를 붙여 동명 해외 도시와 구분한다.
// ============================================

export const KO_TO_EN = {
  // ===== 경기 =====
  성남: 'Seongnam,KR',
  고양: 'Goyang,KR',
  용인: 'Yongin,KR',
  부천: 'Bucheon,KR',
  안산: 'Ansan,KR',
  안양: 'Anyang,KR',
  남양주: 'Namyangju,KR',
  화성: 'Hwaseong,KR',
  평택: 'Pyeongtaek,KR',
  의정부: 'Uijeongbu,KR',
  시흥: 'Siheung,KR',
  파주: 'Paju,KR',
  김포: 'Gimpo,KR',
  광명: 'Gwangmyeong,KR',
  군포: 'Gunpo,KR',
  하남: 'Hanam,KR',
  오산: 'Osan,KR',
  이천: 'Icheon,KR',
  안성: 'Anseong,KR',
  구리: 'Guri,KR',
  양주: 'Yangju,KR',
  포천: 'Pocheon,KR',
  여주: 'Yeoju,KR',

  // ===== 강원 =====
  원주: 'Wonju,KR',
  강릉: 'Gangneung,KR',
  동해: 'Donghae,KR',
  속초: 'Sokcho,KR',
  삼척: 'Samcheok,KR',
  태백: 'Taebaek,KR',

  // ===== 충북 =====
  충주: 'Chungju,KR',
  제천: 'Jecheon,KR',

  // ===== 충남 =====
  아산: 'Asan,KR',
  서산: 'Seosan,KR',
  논산: 'Nonsan,KR',
  공주: 'Gongju,KR',
  보령: 'Boryeong,KR',
  당진: 'Dangjin,KR',

  // ===== 전북 =====
  익산: 'Iksan,KR',
  군산: 'Gunsan,KR',
  정읍: 'Jeongeup,KR',
  남원: 'Namwon,KR',
  김제: 'Gimje,KR',

  // ===== 전남 =====
  여수: 'Yeosu,KR',
  순천: 'Suncheon,KR',
  광양: 'Gwangyang,KR',
  나주: 'Naju,KR',

  // ===== 경북 =====
  포항: 'Pohang,KR',
  구미: 'Gumi,KR',
  경주: 'Gyeongju,KR',
  김천: 'Gimcheon,KR',
  경산: 'Gyeongsan,KR',
  영주: 'Yeongju,KR',
  상주: 'Sangju,KR',
  문경: 'Mungyeong,KR',

  // ===== 경남 =====
  진주: 'Jinju,KR',
  김해: 'Gimhae,KR',
  양산: 'Yangsan,KR',
  거제: 'Geoje,KR',
  통영: 'Tongyeong,KR',
  사천: 'Sacheon,KR',
  밀양: 'Miryang,KR',

  // ===== 제주 =====
  서귀포: 'Seogwipo,KR',
}

/**
 * 검색어를 조회용 문자열로 변환한다.
 *
 * @param {string} keyword - 사용자가 입력한 검색어
 * @returns {{ query: string, koreanName: string|null }}
 *   query       API 에 넘길 조회어
 *   koreanName  매핑에 있으면 한글명, 없으면 null
 */
export const resolveSearchKeyword = (keyword) => {
  const trimmed = keyword.trim()

  // 1) 한글명 그대로 매칭
  if (KO_TO_EN[trimmed]) {
    return { query: KO_TO_EN[trimmed], koreanName: trimmed }
  }

  // 2) '포항시', '여수시' 처럼 '시'를 붙여 입력한 경우
  const withoutSuffix = trimmed.replace(/(특별시|광역시|시|군)$/, '')
  if (KO_TO_EN[withoutSuffix]) {
    return { query: KO_TO_EN[withoutSuffix], koreanName: withoutSuffix }
  }

  // 3) 매핑에 없으면 입력값을 그대로 넘긴다 (영문 검색 지원)
  return { query: trimmed, koreanName: null }
}

/** 한글 검색을 지원하는 도시 개수 (안내 문구용) */
export const SUPPORTED_KO_COUNT = Object.keys(KO_TO_EN).length
