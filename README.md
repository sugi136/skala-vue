# skala-vue — Weather Dashboard

SK AX Full-Stack Engineering / Frontend framework: Vue.js 실습 프로젝트

단원별 Hands on 과제를 통해 하나의 날씨 대시보드를 단계적으로 발전시켜 나갑니다.

- **U124 / SKALA 4기 울산 4반:**
- **개발 환경:** macOS / Node.js v26.5.0 / npm v12.0.1
- **프로젝트 생성:** create-vue 3.22.3 (Router / Pinia / ESLint / Prettier)

## 실행 방법

```bash
npm install
npm run dev      # http://localhost:5173
```

## 진행 현황

| 단원                   | Hands on            | 상태    |
| ---------------------- | ------------------- | ------- |
| 2. Vue Syntax          | Weather Mockup      | ✅ 완료 |
| 3. Composition API     | Weather Composition | ✅ 완료 |
| 4. Vue Components      | Weather Component   | 예정    |
| 5. Vue Router          | Weather Router      | 예정    |
| 6. Pinia               | Weather Store       | 예정    |
| 7. Axios               | Weather Axios       | 예정    |
| 8. UI Library          | Weather UI Library  | 예정    |
| 9. Modern JavaScript   | Weather Refinement  | 예정    |
| 10. Build & Deployment | Weather Deployment  | 예정    |

---

## 2026-08-11 — 2장 Hands on : Weather Mockup

**파일:** `src/components/exercise/WeatherMockup.vue`

API 연동 없이 하드코딩 데이터로 날씨 대시보드의 화면 구조를 구성
일부 레이아웃과 기능을 확장

### 화면 구성

| 영역 | 내용                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| 헤더 | 대시보드 제목, 오늘 날짜, 도시 검색창, 검색어 실시간 표시                      |
| 좌측 | 지역별 날씨 현황 — 도시 카드 5개 (아이콘 / 기온 / 상태 / 기온 배지 / 상세보기) |
| 우측 | 오늘의 요약 — 최고·최저·평균 기온, 더운 도시 수                                |
| 하단 | 상태바 — 선택된 도시 안내                                                      |

<img width="944" height="879" alt="스크린샷 2026-08-11 오후 5 09 04" src="https://github.com/user-attachments/assets/e0164173-64e8-4a29-957d-dbbae957c03c" />

### 적용한 2장 문법

| 문법                | 적용 위치                                                                  |
| ------------------- | -------------------------------------------------------------------------- |
| `ref()`             | `weatherList`, `searchQuery`, `selectedCityInfo`, `summaryList`            |
| `{{ }}` 보간법      | 도시명·기온·요약 값 출력                                                   |
| `v-for` + `:key`    | 도시 카드 반복(`item.id`), 요약 항목 반복(`sum.id`)                        |
| `v-if` / `v-else`   | 25°C 기준 기온 배지 분기, 검색어 입력 여부에 따른 안내 문구 분기           |
| `:class` 객체 형식  | 선택/강조 스타일 토글                                                      |
| `:class` 배열 형식  | `['tone-' + sum.tone]` — 요약 항목별 배경색을 동적으로 조립                |
| `@click`            | 카드 클릭 시 하단 상태바 갱신 (Inline Handler)                             |
| `@click.stop`       | 상세보기 버튼 — 부모 카드로의 버블링 차단                                  |
| `:value` + `@input` | 검색창 단방향 바인딩 + 입력 이벤트 — 한글 IME 조합 중에도 값이 즉시 반영됨 |
| `<style scoped>`    | 컴포넌트 전용 스타일 격리                                                  |

### Customization

추가, 변경사항

- **레이아웃 재구성** — 세로 나열 형태를 헤더 / 좌·우 2단 그리드 / 하단 상태바 구조로 변경
- **오늘의 요약 패널 추가** — 최고·최저·평균 기온과 더운 도시 수를 우측에 배치
- **오늘 날짜 표시** — `toLocaleDateString('ko-KR')`로 "2026년 8월 11일 화요일" 형식 출력
- **검색어 실시간 표시** — `<template v-if>`로 입력 여부에 따라 안내 문구를 분기
- **`icon` 필드 추가** — 날씨 상태를 이모지로 시각화 (7장에서 `data.weather[0].icon` 기반 이미지로 교체 예정)
- **디자인 개선** — 그라데이션 헤더, 카드 hover 시 상승 효과, 기온 배지 pill 형태, 요약 항목별 톤 컬러
- **도시 데이터 추가** — 강사님 예제의 3개 도시(서울·수원·부산)에 제주·강릉을 추가하여 5개로 확장 (과제 요구사항 5번)
- **스타일을 `src/assets/exercise.css`로 분리** — 컴포넌트 파일은 로직과 구조에 집중하고, Hands on 전용 스타일은 별도 관리 (강사님의 `practice.css` 구조와 동일한 방식)

### 향후 확장을 고려한 설계

- **강사님 예제의 데이터 키 구조를 그대로 유지** — `name` / `temp` / `status`가 OpenWeather 응답(`data.name`, `data.main.temp`, `data.weather[0].description`)과 1:1로 대응. 7장에서 `<template>` 수정 없이 데이터 소스만 교체할 수 있음
- **추가한 `icon` 필드도 API 대응 가능한 자리로 설정** — `data.weather[0].icon`
- **요약 값을 전부 `weatherList`에서 도출 가능한 항목으로 구성** — 최고/최저는 `Math.max`/`Math.min`, 평균은 `reduce`, 더운 도시 수는 `filter().length`. 3장에서 `computed`로 전환 예정

### 배운 점 / 해결한 문제

- `App.vue`의 태그 짝이 맞지 않아 `Invalid end tag` 오류 발생 → 닫는 태그 확인으로 해결
- 자식 컴포넌트 파일에 `import` 구문을 잘못 작성해 `Failed to resolve import` 오류 발생 → **부모(App.vue)만 컴포넌트를 import하고, 자식은 자기 내용만 갖는다**는 구조를 이해
- `@click.stop`을 제거해 보며 이벤트 버블링을 직접 확인 — 상세보기 버튼 클릭이 부모 카드의 클릭 핸들러까지 함께 실행시키는 현상 관찰

## 2026-08-11 — 3장 Hands on : Weather Composition

**파일:** `src/components/exercise/WeatherComposition.vue`

2장 Mockup에 하드코딩되어 있던 값들을 Composition API로 전환했습니다.
화면 구조는 그대로 두고, 데이터가 계산되는 방식만 바꾸는 것이 이번 단원의 목표입니다.

### 2장 → 3장 변화

| 항목      | 2장 Mockup             | 3장 Composition                                 |
| --------- | ---------------------- | ----------------------------------------------- |
| 검색창    | 입력값을 화면에 표시만 | `computed`로 목록을 실제 필터링, 결과 건수 표시 |
| 요약 패널 | 값을 직접 적어둔 배열  | `computed`로 `weatherList`에서 자동 계산        |
| 헤더 색상 | 고정                   | `computed`로 선택 도시의 날씨에 따라 변경       |
| 변화 추적 | 없음                   | `watch` 2개 + `watchEffect` 1개                 |
| 빈 결과   | 처리 없음              | 안내 문구 출력                                  |

<img width="922" height="882" alt="스크린샷 2026-08-11 오후 5 10 40" src="https://github.com/user-attachments/assets/ef24e36f-c94c-4a62-bc40-3bae75bc7314" />

### 적용한 3장 문법

| 문법                     | 적용 위치                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `computed` — 필터링      | `filteredList` — 검색어에 따라 목록을 실시간으로 걸러냄                                                                  |
| `computed` — 집계        | `temps`, `hottestCity`, `coldestCity`, `averageTemp`, `hotCityCount`                                                     |
| `computed` — 의존성 체인 | `summaryList`가 위 computed들을 참조해 화면용 배열로 조립                                                                |
| `computed` — 조건 매핑   | `selectedCity`, `headerTheme` — 선택 도시의 status를 CSS 클래스명으로 변환                                               |
| `watch`                  | `selectedCityInfo` 변화 로그 (이전 값·새 값 비교), `searchQuery` 변화 시 결과 건수 로그                                  |
| `watchEffect`            | 검색어와 표시 건수를 자동 추적 — 감시 대상을 지정하지 않아도 콜백 내부에서 읽은 값이 자동 등록되고, 선언 즉시 1회 실행됨 |

### 요약 패널 계산식

2장 주석에 (예정)으로 적어둔 계산을 실제로 구현

| 항목      | 계산 방법                                            |
| --------- | ---------------------------------------------------- |
| 최고 기온 | `Math.max(...temps)` 후 `find`로 해당 도시 조회      |
| 최저 기온 | `Math.min(...temps)` 후 `find`로 해당 도시 조회      |
| 평균 기온 | `reduce`로 합계를 구한 뒤 개수로 나누고 `toFixed(1)` |
| 더운 도시 | `filter(item => item.temp >= 25).length`             |

`weatherList`가 바뀌면 요약이 자동으로 다시 계산

### Customization

- **한글 초성 검색 구현** — `getChosung()` 함수로 도시명에서 초성을 추출해 `ㅅㅇ` 같은 입력으로도 검색 가능. 완성형 한글이 유니코드 `0xAC00`부터 `(초성×588)+(중성×28)+종성` 구조로 배열된다는 점을 이용해, `588`로 나눈 몫으로 초성을 판별
  <img width="888" height="742" alt="스크린샷 2026-08-11 오후 5 16 47" src="https://github.com/user-attachments/assets/b9caa919-c739-416c-b534-beeff7cff244" />
- **초성 매칭을 `startsWith`로 제한** — 처음에는 `includes`를 사용했으나, `ㅅ` 입력 시 `부산`(초성 `ㅂㅅ`)의 두 번째 초성까지 매칭되는 문제를 발견. 앞에서부터 매칭되도록 `startsWith`로 변경
- **`v-model` 대신 `:value` + `@input` 사용** — `v-model`은 한글 IME 조합이 끝나야 값이 반영되어, `ㅅ`을 입력한 시점에는 필터가 동작하지 않음. `@input`은 조합 중에도 발생하므로 초성 입력 즉시 목록이 걸러짐
- **날씨별 헤더 테마** — 선택 도시의 `status`를 `headerTheme` computed로 CSS 클래스명(`clear` / `cloud` / `cloudy` / `rain`)으로 변환하고, CSS 변수로 색상 세트를 교체. `transition`으로 0.6초에 걸쳐 부드럽게 전환
  <img width="910" height="327" alt="스크린샷 2026-08-11 오후 5 17 44" src="https://github.com/user-attachments/assets/4b9fd449-ba29-49fd-b229-61c66be98079" />
  <img width="895" height="388" alt="스크린샷 2026-08-11 오후 5 18 05" src="https://github.com/user-attachments/assets/06b10e91-333d-4628-9bec-e0c776398a0c" />
  <img width="884" height="355" alt="스크린샷 2026-08-11 오후 5 18 22" src="https://github.com/user-attachments/assets/93dfd823-ffef-4d9f-a3e0-9af48ca4c556" />

- **경계선 없는 그라데이션** — 헤더와 본문에 각각 배경을 주면 반드시 이음새가 생기므로, 그라데이션을 `.dashboard-wrapper` 하나에만 적용하고 헤더·본문·상태바의 배경을 제거. 색 정지점을 `%`가 아닌 `px`로 고정해 목록이 길어져도 하늘 영역 비율이 유지되도록 함
- **헤더에 선택 도시 표시** — 날짜 옆에 구분선과 함께 선택된 도시명을 출력 (`v-if`로 선택 전에는 숨김)
  <img width="455" height="122" alt="스크린샷 2026-08-11 오후 5 19 08" src="https://github.com/user-attachments/assets/a544da72-289b-40aa-a154-7edd62697adf" />

- **선택 도시 아이콘 반영** — 헤더 우측 장식 아이콘이 선택 도시의 날씨 아이콘으로 변경 (`selectedCity?.icon ?? '☀️'`)
- **선택 카드 강조** — `:class` 객체 바인딩으로 선택된 카드에 테두리와 그림자 적용
  <img width="553" height="381" alt="스크린샷 2026-08-11 오후 5 19 46" src="https://github.com/user-attachments/assets/d6edb50b-7def-431e-afca-589db09dd1ee" />

- **검색 결과 건수 표시** — 검색 중일 때 `(N건)` 형태로 결과 개수 출력
  <img width="513" height="150" alt="스크린샷 2026-08-11 오후 5 20 10" src="https://github.com/user-attachments/assets/6d2c839a-98bc-45f1-b808-e0e245505863" />

### 설계 판단 기록

- **`selectedCityId`를 별도 상태로 분리** — 기존 `selectedCityInfo`는 상태바용 문자열이라 어떤 도시가 선택됐는지 알 수 없음. id를 따로 관리하고 `selectedCity` computed로 객체를 조회하는 구조로 변경하여, 헤더 테마·아이콘·카드 강조가 모두 하나의 상태를 공유하도록 함
- **요약을 `weatherList` 전체 기준으로 계산** — `filteredList` 기준으로 할 수도 있으나, "오늘의 요약"은 검색 여부와 무관한 전체 현황을 보여주는 것이 자연스럽다고 판단
- **`computed` vs `watch` 사용 구분** — 값을 만들어내는 작업(필터링, 집계, 테마 결정)은 `computed`, 값 변화에 따른 부수효과(로그 출력, 향후 API 호출)는 `watch`로 분리

### 배운 점 / 확인한 것

- `watchEffect`는 새로고침 직후 바로 로그가 찍히고, `watch`는 값이 실제로 바뀔 때만 실행됨
- `computed`는 의존값이 바뀌지 않으면 캐시된 결과를 재사용하므로 매번 실행되는 일반 함수보다 효율적
- `computed` 안에서 다른 `computed`를 참조할 수 있으며, 의존성이 자동으로 연결됨 (`summaryList` → `hottestCity` → `temps` → `weatherList`)
- 한글 검색은 문자열 단위 비교만으로는 초성 검색이 불가능하며, 유니코드 연산이 필요함
