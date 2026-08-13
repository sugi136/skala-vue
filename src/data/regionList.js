// ============================================
// src/data/regionList.js
//
// 전국 광역시·도 17곳의 기준 목록.
//
//   id       URL 과 조회 키로 사용 (소문자 영문)
//   query    OpenWeather 조회용. ',KR' 을 붙여 동명 도시와 구분한다
//   enName   화면 표시용 영문명
//   name     화면 표시용 한글명
//   region   소속 광역자치단체
//   sidoName 에어코리아(미세먼지) 조회용 시도명
//   areaNo   기상청 생활기상지수(자외선) 조회용 행정구역코드 10자리
//
// [주의] areaNo 는 행정구역코드 기준이며, 기상청이 제공하는 지점 목록과
//        다를 수 있다. 조회 결과가 비면 상위 시·도 코드로 대체한다.
// ============================================

export const REGION_LIST = [
  {
    id: 'seoul',
    query: 'Seoul,KR',
    enName: 'Seoul',
    name: '서울',
    region: '서울특별시',
    sidoName: '서울',
    areaNo: '1100000000',
  },
  {
    id: 'busan',
    query: 'Busan,KR',
    enName: 'Busan',
    name: '부산',
    region: '부산광역시',
    sidoName: '부산',
    areaNo: '2600000000',
  },
  {
    id: 'daegu',
    query: 'Daegu,KR',
    enName: 'Daegu',
    name: '대구',
    region: '대구광역시',
    sidoName: '대구',
    areaNo: '2700000000',
  },
  {
    id: 'incheon',
    query: 'Incheon,KR',
    enName: 'Incheon',
    name: '인천',
    region: '인천광역시',
    sidoName: '인천',
    areaNo: '2800000000',
  },
  {
    id: 'gwangju',
    query: 'Gwangju,KR',
    enName: 'Gwangju',
    name: '광주',
    region: '광주광역시',
    sidoName: '광주',
    areaNo: '2900000000',
  },
  {
    id: 'daejeon',
    query: 'Daejeon,KR',
    enName: 'Daejeon',
    name: '대전',
    region: '대전광역시',
    sidoName: '대전',
    areaNo: '3000000000',
  },
  {
    id: 'ulsan',
    query: 'Ulsan,KR',
    enName: 'Ulsan',
    name: '울산',
    region: '울산광역시',
    sidoName: '울산',
    areaNo: '3100000000',
  },
  {
    id: 'sejong',
    query: 'Sejong,KR',
    enName: 'Sejong',
    name: '세종',
    region: '세종특별자치시',
    sidoName: '세종',
    areaNo: '3600000000',
  },
  {
    id: 'suwon',
    query: 'Suwon,KR',
    enName: 'Suwon',
    name: '수원',
    region: '경기도',
    sidoName: '경기',
    areaNo: '4111000000',
  },
  {
    id: 'chuncheon',
    query: 'Chuncheon,KR',
    enName: 'Chuncheon',
    name: '춘천',
    region: '강원특별자치도',
    sidoName: '강원',
    areaNo: '5111000000',
  },
  {
    id: 'cheongju',
    query: 'Cheongju,KR',
    enName: 'Cheongju',
    name: '청주',
    region: '충청북도',
    sidoName: '충북',
    areaNo: '4311000000',
  },
  {
    id: 'cheonan',
    query: 'Cheonan,KR',
    enName: 'Cheonan',
    name: '천안',
    region: '충청남도',
    sidoName: '충남',
    areaNo: '4413000000',
  },
  {
    id: 'jeonju',
    query: 'Jeonju,KR',
    enName: 'Jeonju',
    name: '전주',
    region: '전북특별자치도',
    sidoName: '전북',
    areaNo: '5211000000',
  },
  {
    id: 'mokpo',
    query: 'Mokpo,KR',
    enName: 'Mokpo',
    name: '목포',
    region: '전라남도',
    sidoName: '전남',
    areaNo: '4611000000',
  },
  {
    id: 'andong',
    query: 'Andong,KR',
    enName: 'Andong',
    name: '안동',
    region: '경상북도',
    sidoName: '경북',
    areaNo: '4717000000',
  },
  {
    id: 'changwon',
    query: 'Changwon,KR',
    enName: 'Changwon',
    name: '창원',
    region: '경상남도',
    sidoName: '경남',
    areaNo: '4812000000',
  },
  {
    id: 'jeju',
    query: 'Jeju,KR',
    enName: 'Jeju City',
    name: '제주',
    region: '제주특별자치도',
    sidoName: '제주',
    areaNo: '5011000000',
  },
]

// 현재 위치 조회 실패 시 사용할 기본 도시
export const DEFAULT_CITY_ID = 'seoul'

// id 로 기준 정보를 찾는다. 검색으로 추가된 도시는 여기 없으므로 undefined 를 반환한다.
export const findRegionById = (cityId) => REGION_LIST.find((item) => item.id === cityId)
