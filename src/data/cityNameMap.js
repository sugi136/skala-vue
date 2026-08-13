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
// [구조]  한글명: [영문 조회어, 소속 시도, 광역자치단체 전체 이름]
//   sido   에어코리아 미세먼지 조회용 (시도 단위로 조회한다)
//   region 기상특보 필터링용 (전국 목록에서 지역명으로 걸러낸다)
//
//   배열로 적은 이유는 60여 개 항목을 한 줄씩 유지하기 위해서다.
//   객체로 쓰면 파일이 세 배로 길어진다.
//
// [범위] 전국 226개 시군구를 모두 넣지 않은 이유
//   - 군 단위는 OpenWeather 에 데이터가 없거나 엉뚱한 지점이 잡히는 경우가 많다
//   - 실제로 조회되는 시 단위 위주로 약 60개를 선별했다
//   - 기본 17개 광역시·도는 regionList 에 이미 있어 로컬 필터로 처리된다
//
// [문법] ',KR' 국가코드를 붙여 동명 해외 도시와 구분한다.
// ============================================

const RAW_MAP = {
  // ===== 경기도 =====
  성남: ['Seongnam,KR', '경기', '경기도'],
  고양: ['Goyang,KR', '경기', '경기도'],
  용인: ['Yongin,KR', '경기', '경기도'],
  부천: ['Bucheon,KR', '경기', '경기도'],
  안산: ['Ansan,KR', '경기', '경기도'],
  안양: ['Anyang,KR', '경기', '경기도'],
  남양주: ['Namyangju,KR', '경기', '경기도'],
  화성: ['Hwaseong,KR', '경기', '경기도'],
  평택: ['Pyeongtaek,KR', '경기', '경기도'],
  의정부: ['Uijeongbu,KR', '경기', '경기도'],
  시흥: ['Siheung,KR', '경기', '경기도'],
  파주: ['Paju,KR', '경기', '경기도'],
  김포: ['Gimpo,KR', '경기', '경기도'],
  광명: ['Gwangmyeong,KR', '경기', '경기도'],
  군포: ['Gunpo,KR', '경기', '경기도'],
  하남: ['Hanam,KR', '경기', '경기도'],
  오산: ['Osan,KR', '경기', '경기도'],
  이천: ['Icheon,KR', '경기', '경기도'],
  안성: ['Anseong,KR', '경기', '경기도'],
  구리: ['Guri,KR', '경기', '경기도'],
  양주: ['Yangju,KR', '경기', '경기도'],
  포천: ['Pocheon,KR', '경기', '경기도'],
  여주: ['Yeoju,KR', '경기', '경기도'],

  // ===== 강원특별자치도 =====
  원주: ['Wonju,KR', '강원', '강원특별자치도'],
  강릉: ['Gangneung,KR', '강원', '강원특별자치도'],
  동해: ['Donghae,KR', '강원', '강원특별자치도'],
  속초: ['Sokcho,KR', '강원', '강원특별자치도'],
  삼척: ['Samcheok,KR', '강원', '강원특별자치도'],
  태백: ['Taebaek,KR', '강원', '강원특별자치도'],

  // ===== 충청북도 =====
  충주: ['Chungju,KR', '충북', '충청북도'],
  제천: ['Jecheon,KR', '충북', '충청북도'],

  // ===== 충청남도 =====
  아산: ['Asan,KR', '충남', '충청남도'],
  서산: ['Seosan,KR', '충남', '충청남도'],
  논산: ['Nonsan,KR', '충남', '충청남도'],
  공주: ['Gongju,KR', '충남', '충청남도'],
  보령: ['Boryeong,KR', '충남', '충청남도'],
  당진: ['Dangjin,KR', '충남', '충청남도'],

  // ===== 전북특별자치도 =====
  익산: ['Iksan,KR', '전북', '전북특별자치도'],
  군산: ['Gunsan,KR', '전북', '전북특별자치도'],
  정읍: ['Jeongeup,KR', '전북', '전북특별자치도'],
  남원: ['Namwon,KR', '전북', '전북특별자치도'],
  김제: ['Gimje,KR', '전북', '전북특별자치도'],

  // ===== 전라남도 =====
  여수: ['Yeosu,KR', '전남', '전라남도'],
  순천: ['Suncheon,KR', '전남', '전라남도'],
  광양: ['Gwangyang,KR', '전남', '전라남도'],
  나주: ['Naju,KR', '전남', '전라남도'],

  // ===== 경상북도 =====
  포항: ['Pohang,KR', '경북', '경상북도'],
  구미: ['Gumi,KR', '경북', '경상북도'],
  경주: ['Gyeongju,KR', '경북', '경상북도'],
  김천: ['Gimcheon,KR', '경북', '경상북도'],
  경산: ['Gyeongsan,KR', '경북', '경상북도'],
  영주: ['Yeongju,KR', '경북', '경상북도'],
  상주: ['Sangju,KR', '경북', '경상북도'],
  문경: ['Mungyeong,KR', '경북', '경상북도'],

  // ===== 경상남도 =====
  진주: ['Jinju,KR', '경남', '경상남도'],
  김해: ['Gimhae,KR', '경남', '경상남도'],
  양산: ['Yangsan,KR', '경남', '경상남도'],
  거제: ['Geoje,KR', '경남', '경상남도'],
  통영: ['Tongyeong,KR', '경남', '경상남도'],
  사천: ['Sacheon,KR', '경남', '경상남도'],
  밀양: ['Miryang,KR', '경남', '경상남도'],

  // ===== 제주특별자치도 =====
  서귀포: ['Seogwipo,KR', '제주', '제주특별자치도'],
}

/**
 * 검색어를 조회에 필요한 정보로 변환한다.
 *
 * @param {string} keyword - 사용자가 입력한 검색어
 * @returns {{ query, koreanName, sidoName, region }}
 *   query       OpenWeather 에 넘길 조회어
 *   koreanName  매핑에 있으면 한글명, 없으면 null
 *   sidoName    에어코리아 미세먼지 조회용 시도명 (없으면 null)
 *   region      기상특보 필터링용 광역자치단체명 (없으면 null)
 */
export const resolveSearchKeyword = (keyword) => {
  const trimmed = keyword.trim()

  // [문법] 구조분해로 배열을 이름 있는 값으로 풀어낸다
  const build = (name, entry) => {
    const [query, sidoName, region] = entry
    return { query, koreanName: name, sidoName, region }
  }

  // 1) 한글명 그대로 매칭
  if (RAW_MAP[trimmed]) return build(trimmed, RAW_MAP[trimmed])

  // 2) '포항시', '여수시' 처럼 접미사를 붙여 입력한 경우
  const withoutSuffix = trimmed.replace(/(특별시|광역시|시|군)$/, '')
  if (RAW_MAP[withoutSuffix]) return build(withoutSuffix, RAW_MAP[withoutSuffix])

  // 3) 매핑에 없으면 입력값을 그대로 넘긴다 (영문 검색 지원)
  return { query: trimmed, koreanName: null, sidoName: null, region: null }
}

/** 한글 검색을 지원하는 도시 개수 (안내 문구용) */
export const SUPPORTED_KO_COUNT = Object.keys(RAW_MAP).length
