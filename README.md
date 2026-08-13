# skala-vue — Weather Dashboard

SK AX Full-Stack Engineering / Frontend framework: Vue.js 실습 프로젝트

단원별 Hands on 과제를 통해 하나의 날씨 대시보드를 단계적으로 발전시켜 나갑니다.

- **U124 / SKALA 4기 울산 4반**
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
| 4. Vue Components      | Weather Component   | ✅ 완료 |
| 5. Vue Router          | Weather Router      | ✅ 완료 |
| 6. Pinia               | Weather Store       | ✅ 완료 |
| 7. Axios               | Weather Axios       | ✅ 완료 |
| 8. UI Library          | Weather UI Library  | ✅ 완료 |
| 9. Modern JavaScript   | Weather Refinement  | ✅ 완료 |
| 10. Build & Deployment | Weather Deployment  | ✅ 완료 |

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

## 2026-08-12 — 4장 Hands on : Weather Component

**파일:** `src/components/exercise/` 내 5개 컴포넌트

3장까지 한 파일이던 대시보드를 기능 변경 없이 컴포넌트로 분리
화면과 동작은 3장과 완전히 동일하며, 코드 구조만 변경

### 컴포넌트 구성

| 파일                    | 역할                             | 아는 것 / 모르는 것         |
| ----------------------- | -------------------------------- | --------------------------- |
| `WeatherParent.vue`     | 모든 반응형 상태 보유, 자식 조립 | 전부                        |
| `BaseDashboardCard.vue` | 패널 껍데기 (제목 + slot)        | 날씨를 전혀 모름            |
| `SearchBar.vue`         | 검색 입력창 + 상태 안내          | 무엇을 검색하는지 모름      |
| `WeatherCard.vue`       | 도시 1개의 날씨 카드             | 다른 도시가 몇 개인지 모름  |
| `SummaryPanel.vue`      | 오늘의 요약 목록                 | 값이 어떻게 계산됐는지 모름 |

분리 기준 : **각 컴포넌트가 알아야 할 최소한의 정보**
`BaseDashboardCard`가 날씨를 전혀 모르기 때문에, 이후 상세 페이지와 즐겨찾기 페이지에서도 그대로 재사용 가능

### Props / Emits 설계

| 컴포넌트            | Props (부모 → 자식)    | Emits (자식 → 부모)           |
| ------------------- | ---------------------- | ----------------------------- |
| `BaseDashboardCard` | `title`, `icon`        | —                             |
| `SearchBar`         | `query`, `resultCount` | `update-query`                |
| `WeatherCard`       | `city`, `isSelected`   | `select-card`, `click-detail` |
| `SummaryPanel`      | `items`                | —                             |

자식은 상태를 직접 변경하지 않음. `emit`으로 "이런 일이 있었다"고 알리기만 하고,
`searchQuery.value = ...` 같은 실제 변경은 전부 `WeatherParent`의 핸들러에서 수행

```
사용자 입력
  → SearchBar : emit('update-query', 값)     "이렇게 바꿔주세요"
  → WeatherParent : searchQuery.value = 값    실제 변경
  → props 로 다시 내려감
  → SearchBar 화면 갱신
```

### 적용한 4장 문법

| 문법                | 적용 위치                                                              |
| ------------------- | ---------------------------------------------------------------------- |
| `defineProps`       | 4개 자식 컴포넌트 전부 (import 없이 사용하는 컴파일러 매크로)          |
| `defineEmits`       | `SearchBar`, `WeatherCard`                                             |
| props 타입 검증     | `type`, `required`, `default` 옵션 지정                                |
| `<slot>` + fallback | `BaseDashboardCard` — 부모가 내용을 안 넣으면 기본 문구 표시           |
| 네이밍 규칙         | 자식은 camelCase(`isSelected`), 부모 태그는 kebab-case(`:is-selected`) |
| 지역 등록           | 사용하는 곳에서 `import` 후 태그로 배치                                |
| `<style scoped>`    | 각 컴포넌트가 자기 스타일을 소유                                       |

### Customization

- **`SummaryPanel.vue` 추가 분리** (요구사항 7) — 요구사항의 4개 외에 요약 패널을 별도 컴포넌트로 분리. 계산은 부모의 `computed`가 하고 이 컴포넌트는 결과 배열만 받아 렌더링하도록 하여, 계산 책임과 표시 책임을 분리
- **`isSelected`를 boolean으로 내려줌** — `WeatherCard`에 `selectedCityId` 전체를 넘기지 않고 "내가 선택됐는지"만 알려줌. 선택 로직이 바뀌어도 카드 컴포넌트는 수정할 필요가 없음
- **`emit`을 두 개로 분리** — `select-card`와 `click-detail`을 하나로 합치고 인자로 구분할 수도 있으나, 이벤트 이름 자체가 의미를 드러내도록 분리
- **CSS 변수는 부모에 유지** — `scoped`는 선택자를 격리할 뿐 CSS 변수 상속은 막지 않는다는 점을 이용해, 테마 색상 세트(`--sky-top`, `--accent`)를 `WeatherParent`에 두고 자식들이 `var()`로 공유
- **외부 `exercise.css` 의존 제거** — 요구사항 5번에 맞춰 App.vue의 `@import`를 제거하고, 모든 스타일을 각 컴포넌트의 `<style scoped>`로 이동

### 설계 판단 기록

- **레이아웃은 부모, 부품 디자인은 자식** — `WeatherParent`에는 그리드·그라데이션·테마만 남기고, 카드 모양·입력창·요약 행 스타일은 각 컴포넌트로 이동
- **`BaseDashboardCard`를 데이터로부터 완전히 분리** — 날씨 전용 컴포넌트로 만들지 않고 제목과 slot만 받도록 설계. 실제로 이후 상세 페이지와 즐겨찾기 페이지에서 수정 없이 재사용됨

### 배운 점 / 확인한 것

- `BaseDashboardCard` 안에 배치한 `SearchBar`의 `@update-query`가 중계 없이 `WeatherParent`에 직접 연결. slot 내용은 자식 안에 렌더링되지만 부모 스코프에서 컴파일되기 때문
- `defineProps` / `defineEmits`는 `import` 없이 쓸 수 있음. 런타임 함수가 아니라 빌드 시점에 컴파일러가 변환하는 매크로이기 때문
- 분리 후 화면과 동작이 3장과 완전히 동일한 것을 확인 (초성 검색, 카드 선택, 테마 전환, 상세보기 alert, 콘솔 로그)

---

## 2026-08-12 — 5장 Hands on : Weather Router

**파일:** `src/router/index.js`, `src/views/` 5개 페이지, `src/data/weatherMockData.js`

단일 화면이던 대시보드를 여러 페이지로 분리하고 라우팅으로 연결했습니다.

### 라우트 구성

| 경로               | 이름                | 컴포넌트            | 비고                   |
| ------------------ | ------------------- | ------------------- | ---------------------- |
| `/`                | `weather-home`      | `WeatherHomeView`   | 메인 대시보드          |
| `/weather/:cityId` | `weather-detail`    | `WeatherDetailView` | 동적 경로 매칭         |
| `/about`           | `weather-about`     | `WeatherAboutView`  | 정적 소개 페이지       |
| `/favorites`       | `weather-favorites` | `FavoriteView`      | 추가 view (요구사항 6) |
| `/:pathMatch(.*)*` | `not-found`         | `NotFoundView`      | Catch-all              |

전 경로에 동적 import를 적용해 Lazy Loading이 동작하도록 했고,
Catch-all 규칙은 반드시 배열 마지막에 배치. 위에 두면 모든 경로를 먼저 낚아채기 때문.

### 적용한 5장 문법

| 문법                                | 적용 위치                                                           |
| ----------------------------------- | ------------------------------------------------------------------- |
| `createRouter` / `createWebHistory` | `router/index.js`                                                   |
| Lazy Loading                        | 전 라우트를 `() => import(...)` 형태로 정의                         |
| Catch-all Route                     | `/:pathMatch(.*)*` → `NotFoundView`                                 |
| `<RouterLink>`                      | App.vue 내비게이션 바, 각 페이지의 홈 복귀 링크                     |
| `<RouterView>`                      | App.vue 메인 콘텐츠 영역                                            |
| Dynamic Route Matching              | `/weather/:cityId` — `route.params.cityId`로 수신                   |
| `useRoute`                          | 상세 페이지의 `params`, 404 페이지의 `fullPath`, 즐겨찾기의 `query` |
| `useRouter`                         | `push`(상세 이동), `replace`(정렬 변경), `back`(뒤로)               |
| Query String                        | `/favorites?sort=temp`                                              |
| Navigation Guard                    | `router.afterEach`로 페이지별 탭 제목 변경                          |
| `onMounted`                         | 상세 페이지에서 Mount 시점에 도시 데이터 조회                       |

### Customization

- **`FavoriteView.vue` 추가** — 즐겨찾기 도시 목록 페이지. `params`(무엇을 볼지)와 `query`(어떻게 볼지)의 차이를 실습하기 위해 정렬 옵션을 Query String으로 구현
  <img width="1497" height="695" alt="스크린샷 2026-08-12 오후 4 30 51" src="https://github.com/user-attachments/assets/15e54895-c57e-4301-a935-60d9e4755e4a" />

- **도시 id를 영문 도시명으로 변경** — `city_01` 대신 `seoul`을 사용. URL이 `/weather/seoul`로 읽기 쉬워지고, OpenWeather 응답의 `data.name`이 영문 도시명으로 오므로 API 연동 시 `?q=seoul`로 그대로 넘길 수 있음
  <img width="579" height="344" alt="스크린샷 2026-08-12 오후 4 36 07" src="https://github.com/user-attachments/assets/b7462b23-e24f-4a51-9b87-2288de6f1bf8" />

- **정렬 변경에 `replace` 사용** — `push`를 쓰면 정렬을 바꿀 때마다 히스토리가 쌓여 뒤로가기를 여러 번 눌러야 이전 페이지로 갈 수 있음. `replace`로 현재 항목을 대체
- **`sortKey`를 `computed`로 관리** — `ref`로 따로 두면 URL과 상태가 이중으로 관리됨. URL을 유일한 기준으로 삼아 뒤로가기로 주소가 바뀌어도 화면이 따라오도록 함
- **`scrollBehavior` 설정** — SPA는 페이지를 교체할 뿐 새로고침이 아니므로 스크롤 위치가 그대로 남음. `scrollBehavior() { return { top: 0 } }`를 추가해 보정
- **`router.afterEach`로 탭 제목 변경** — SPA는 `index.html` 하나만 쓰므로 기본 상태에서는 모든 페이지의 탭 제목이 같음. 라우트마다 `meta.title`을 두고 이동 완료 후 `document.title`에 반영
  <img width="514" height="266" alt="스크린샷 2026-08-12 오후 4 47 47" src="https://github.com/user-attachments/assets/5aa067c1-b304-4d6c-b078-58922c3a18c2" />
  <img width="492" height="237" alt="스크린샷 2026-08-12 오후 4 46 10" src="https://github.com/user-attachments/assets/76032e5f-7b49-460c-955a-1f2d2cd60de6" />
  <img width="905" height="426" alt="스크린샷 2026-08-12 오후 4 46 01" src="https://github.com/user-attachments/assets/e77b264a-3d03-4898-b2d3-37d8f1ec65d3" />
  <img width="526" height="276" alt="스크린샷 2026-08-12 오후 4 48 09" src="https://github.com/user-attachments/assets/b0fbc48b-c2c0-4cb0-a501-8df4ceaa71af" />

- **`router-link-exact-active` 활용** — Vue Router가 현재 경로와 일치하는 링크에 자동으로 붙이는 클래스를 이용해, 별도 로직 없이 CSS만으로 현재 메뉴를 강조
  <img width="552" height="245" alt="스크린샷 2026-08-12 오후 4 48 39" src="https://github.com/user-attachments/assets/bede2643-7784-433a-9f41-a4e757a07921" />
- **상세 페이지 3단 분기** — 로딩 중 / 데이터 있음 / 존재하지 않는 도시 ID를 `v-if`·`v-else-if`·`v-else`로 처리. 잘못된 ID로 접근해도 화면이 깨지지 않음
- **404 페이지에 잘못된 경로 표시** — `route.fullPath`를 출력해 사용자가 오타를 확인할 수 있도록 함
  <img width="1503" height="905" alt="스크린샷 2026-08-12 오후 4 49 56" src="https://github.com/user-attachments/assets/d1b519c0-4ae4-4639-8bf0-9965d09fdb3c" />

- **상세 페이지에 뒤로가기 + 홈 링크 병행** — `router.back()`은 주소창에 URL을 직접 입력해 들어온 경우 돌아갈 히스토리가 없으므로, 홈으로 가는 `RouterLink`도 함께 제공
  <img width="556" height="306" alt="스크린샷 2026-08-12 오후 4 50 42" src="https://github.com/user-attachments/assets/8f02485d-8c3b-426d-b90f-4ab1ac810cbc" />

- **5일 예보 섹션 추가** — 목업 단계에서 설계했다가 API 제약 확인을 위해 보류했으나, OpenWeather 무료 티어 `/forecast`로 구현 가능함을 확인하고 재도입. 무료 티어 상한이 5일이므로 카드 수를 5개로 맞춤
  <img width="1410" height="371" alt="스크린샷 2026-08-12 오후 4 51 10" src="https://github.com/user-attachments/assets/8ea3e765-f348-49dd-bb94-e74f1194cd34" />

- **`ForecastStrip.vue`를 재사용 컴포넌트로 분리** — 배열만 받아 렌더링하므로 메인 화면과 상세 페이지 양쪽에서 수정 없이 사용
- **예보 기준 도시의 우선순위 설계** — ① 사용자가 선택한 도시 ② 현재 위치 기반 도시 ③ 위치 조회 실패 시 기본값(서울). 현재는 API 미연동이므로 기본값을 사용하되, `currentLocationCityId`를 별도 상태로 두어 `navigator.geolocation` 연동 시 해당 값만 채우면 되도록 구조를 마련

### 설계 판단 기록

- **`window.alert()` → `router.push()` 대체** (요구사항 3) — 경로 문자열 대신 `{ name: 'weather-detail', params: { cityId } }` 형태로 지정. 이름 기반이므로 나중에 경로 규칙이 바뀌어도 호출부를 수정할 필요가 없음
- **`src/data/weatherMockData.js`로 공통 데이터 분리** — 라우터로 페이지가 나뉘면서 `HomeView`의 지역 상태를 `DetailView`가 참조할 수 없게 됨. 우선 공통 모듈로 해결했으나 이는 읽기 전용 상수에만 유효한 임시 방편. 상태를 공유하고 변경까지 하려면 전역 상태 관리가 필요하다는 점을 확인 (6장 Pinia로 전환)
- **`createWebHistory(import.meta.env.BASE_URL)`** — 배포 기준 경로를 Vite가 주입하도록 하여, 서브 경로에 배포해도 라우팅이 정상 동작하도록 대비
- **`index.html`의 `<title>` 유지** — `document.title` 교체는 JS 실행 후에 동작하므로, 초기 로딩 중과 검색엔진·SNS 미리보기에는 HTML의 `<title>`이 사용됨. 라우터 기본값과 동일한 문구로 맞춤
- **4장 컴포넌트를 그대로 재사용** — `BaseDashboardCard`는 상세·즐겨찾기 페이지에서, `WeatherCard`는 즐겨찾기 페이지에서 수정 없이 사용. 컴포넌트 분리의 효과를 확인

### 배운 점 / 확인한 것

- `<a href>`를 쓰면 브라우저가 강제 새로고침되어 메모리의 모든 반응형 상태가 초기화됨. SPA에서는 반드시 `<RouterLink>`를 사용해야 함
- F12 → Network 탭에서 각 페이지를 처음 방문할 때마다 JS 청크가 새로 로드되는 것을 확인 (Lazy Loading 동작 검증)
- `useRoute`와 `useRouter`는 이름이 한 글자 차이지만 역할이 다름. 전자는 현재 주소를 읽고, 후자는 페이지를 이동시킴
- 같은 모듈에서 여러 항목을 가져올 때 import 문을 두 줄로 나누면 `Identifier has already been declared` 오류가 발생함. 하나의 중괄호 안에 나열해야 함

---

## 2026-08-12 — 6장 Hands on : Weather Store

**파일:** `src/stores/configStore.js`, `favoriteStore.js`, `src/components/exercise/UnitToggler.vue`

5장에서 확인한 "페이지 간 상태 공유 불가" 문제를 Pinia로 해결.

### Store 구성

**`configStore.js` — 단위 설정 (과제 지정)**

| 구분    | 이름                     | 역할                                       |
| ------- | ------------------------ | ------------------------------------------ |
| state   | `unit`                   | `celsius` / `fahrenheit` (초기값 celsius)  |
| state   | `useWeatherTheme`        | 날씨별 화면 테마 사용 여부                 |
| getters | `unitSymbol`             | 현재 단위 기호 (℃ / ℉)                     |
| getters | `unitLabel`              | 단위의 한글 표기 (섭씨 / 화씨)             |
| getters | `isFahrenheit`           | 화씨 모드 여부                             |
| getters | `hotThreshold`           | 현재 단위로 환산한 더움 기준값 (25℃ ↔ 77℉) |
| getters | `hotLabel` / `coolLabel` | 배지에 표시할 문구 전체                    |
| actions | `convertTemp`            | 섭씨 원본값을 현재 단위로 변환             |
| actions | `toggleUnit` / `setUnit` | 단위 토글 / 직접 지정                      |
| actions | `toggleTheme`            | 테마 사용 여부 토글                        |

**`favoriteStore.js` — 즐겨찾기 (요구사항 4, 추가 Store)**

| 구분    | 이름                                             | 역할                                           |
| ------- | ------------------------------------------------ | ---------------------------------------------- |
| state   | `favoriteIds`                                    | 즐겨찾기한 도시 id 목록                        |
| getters | `favoriteCount` / `hasFavorite`                  | 개수 / 존재 여부                               |
| getters | `isFavorite`                                     | 특정 id가 즐겨찾기인지 판별 (인자를 받는 형태) |
| actions | `toggleFavorite` / `removeFavorite` / `clearAll` | 추가·제거·전체 삭제                            |

### 적용한 6장 문법

| 문법                     | 적용 위치                                                   |
| ------------------------ | ----------------------------------------------------------- |
| `defineStore(id, setup)` | 두 store 모두 Composition API 방식으로 작성                 |
| state = `ref()`          | `unit`, `favoriteIds` 등                                    |
| getters = `computed()`   | `unitSymbol`, `favoriteCount` 등                            |
| actions = 일반 함수      | `toggleUnit`, `toggleFavorite` 등                           |
| `storeToRefs`            | `UnitToggler`, `FavoriteView`에서 state·getters 구조분해 시 |
| actions 직접 구조분해    | 함수는 반응성과 무관하므로 `storeToRefs` 없이 꺼냄          |
| 인자를 받는 getter       | `isFavorite`를 함수를 반환하는 `computed`로 구현            |

### Customization

- **`favoriteStore.js` 추가** (요구사항 4) — 5장에서는 즐겨찾기 목록이 `FavoriteView`의 지역 상태여서 대시보드에서 별을 눌러도 반영되지 않았음. store로 옮겨 앱 전체가 같은 목록을 공유하도록 함
- **즐겨찾기 별 아이콘** — `WeatherCard`에 ★/☆ 토글 버튼 추가. `@click.stop`으로 카드 선택 이벤트와 분리
  <img width="1042" height="537" alt="스크린샷 2026-08-12 오후 4 51 34" src="https://github.com/user-attachments/assets/5ba366d4-ff3b-4bec-9079-5e597bc12eaa" />

- **`convertTemp`를 store의 action으로 구현** — 과제 참고사항에 "메인/상세에 유사한 코드가 중복됨 → Composable로 해결 가능(범위 제외)"이라고 명시되어 있어, Composable 대신 store에 변환 함수를 두어 각 컴포넌트가 `configStore.convertTemp(temp)` 한 줄만 쓰도록 해결
- **판정 기준과 표시 단위 분리** — 더움/선선함 판정은 항상 섭씨 원본으로 수행. 화씨로 변환한 값(82 등)을 25와 비교하면 모든 도시가 "더움"이 되기 때문. 표시 문구만 `hotThreshold`로 환산하여 ℃일 때는 "25℃ 이상", ℉일 때는 "77℉ 이상"으로 자동 전환
  <img width="522" height="169" alt="스크린샷 2026-08-12 오후 4 52 03" src="https://github.com/user-attachments/assets/643d864f-a7bd-4bb3-84a0-df2ea03808a0" />
  <img width="545" height="216" alt="스크린샷 2026-08-12 오후 4 51 56" src="https://github.com/user-attachments/assets/b39f8d1f-9f91-4c84-bc95-c66df07415f7" />

- **배지 문구를 store에서 조립** — 카드와 요약 패널이 같은 문구를 사용하므로, 각 컴포넌트에서 문자열을 조립하지 않고 `hotLabel`·`coolLabel` getter로 완성해 내려줌
- **`localStorage` 연동** — Pinia store는 메모리 기반이라 새로고침 시 상태가 초기화됨. 즐겨찾기 목록과 단위 설정을 `watch`로 감시해 자동 저장·복원하도록 구현. 각 action마다 저장 코드를 넣는 대신 한 곳에서 처리해 누락 가능성을 없앰. 저장 값 손상이나 시크릿 모드 등 실패 상황에 대비해 `try/catch`로 감싸고, 실패해도 앱이 멈추지 않도록 함
  <img width="1052" height="497" alt="스크린샷 2026-08-12 오후 4 54 45" src="https://github.com/user-attachments/assets/2b3c350b-f7d5-4966-b9f3-d22baefb05c6" />

- **`FavoriteView`의 카드 클릭 동작 변경** — 5장에서는 카드 클릭이 즐겨찾기 해제였으나, 별 아이콘이 생겼으므로 카드 클릭은 상세 페이지 이동으로 변경. 해제는 별 아이콘이 전담
- **시간대별 예보(24시간) 추가** — `/forecast` 응답이 3시간 간격이므로 앞 8개를 그대로 사용하면 되는 구조. 각 시간의 강수확률(`pop`)을 함께 표시하되, 0%인 시간은 `—`로 처리해 화면이 지저분해지지 않도록 함
  <img width="1399" height="265" alt="스크린샷 2026-08-12 오후 4 55 11" src="https://github.com/user-attachments/assets/4e511dfc-92b3-44ad-9da0-ce5097ef79a8" />
- **상세 관측 항목 11개로 확장** — 기존 8개에 자외선·꽃가루·미세먼지를 추가. 세 항목은 공공데이터포털 API(기상청 생활기상지수 4.0, 꽃가루농도위험지수 3.0, 에어코리아)로 연동 예정이며, 사용 신청 및 승인을 완료함
  <img width="1432" height="438" alt="스크린샷 2026-08-12 오후 4 55 37" src="https://github.com/user-attachments/assets/26045f22-c206-4e2f-b3c5-1c53fa423578" />

- **지수 구간별 색상 강조** — 자외선지수(기상청 기준 3미만 낮음 / 3~5 보통 / 6~7 높음 / 8이상 매우높음)와 미세먼지(에어코리아 PM10 기준 0~30 좋음 / 31~80 보통 / 81이상 나쁨)를 구간에 따라 초록·주황·빨강으로 표시
  <img width="176" height="198" alt="스크린샷 2026-08-12 오후 4 56 05" src="https://github.com/user-attachments/assets/db85b484-e0b6-4a3e-8265-9482bba8a141" />
  <img width="175" height="183" alt="스크린샷 2026-08-12 오후 4 55 54" src="https://github.com/user-attachments/assets/489a8ada-e8ea-4e87-baec-8f5f9ab30348" />
  <img width="150" height="196" alt="스크린샷 2026-08-12 오후 4 56 19" src="https://github.com/user-attachments/assets/1b9c0cad-f259-42e2-8b01-8d62f05a4fa8" />

- **기상특보 배너 추가** — `WeatherAlert.vue`를 만들어 상세 페이지 헤더 아래에 배치. 주의보(주황)와 경보(빨강)를 색으로 구분하고, 메인 카드에는 `⚠️ 특보` 배지만 표시해 카드가 복잡해지지 않도록 함. 특보는 평소에 없는 것이 정상이므로 데이터가 없는 도시는 키 자체를 두지 않고, 컴포넌트가 스스로 판단해 아무것도 렌더링하지 않도록 함
  <img width="1023" height="313" alt="스크린샷 2026-08-12 오후 4 56 44" src="https://github.com/user-attachments/assets/cffadca9-d471-42a3-8631-cda4efafe779" />
  <img width="1444" height="234" alt="스크린샷 2026-08-12 오후 4 56 57" src="https://github.com/user-attachments/assets/bd85f845-56d9-4074-b2c1-dc4c64cdb9be" />

- **검색 매칭 규칙 통일** — 초성 검색은 `startsWith`, 일반 검색은 `includes`로 규칙이 달라 `산` 입력 시 `부산`이 검색되는 등 동작이 일관되지 않았음. 양쪽 모두 `startsWith`로 통일

### 레이아웃 개선

- **데스크톱 기준 폭 확대** — 940px에서 `min(1400px, 100%)`로 변경. `vw` 단위는 세로 스크롤바 폭까지 포함해 가로 스크롤을 유발하므로 `min()` + `%` 조합을 사용
- **Vue 기본 템플릿의 `#app` 스타일 제거** — `src/assets/main.css`에 `max-width: 1280px`와 `grid-template-columns: 1fr 1fr`가 정의되어 있어, 화면이 2열로 분할되고 앱이 왼쪽 절반에만 렌더링되고 있었음. 페이지 이동 시 콘텐츠 위치가 달라 보이던 원인
- **카드 목록 반응형 배치** — `repeat(auto-fill, minmax(360px, 1fr))`로 화면 폭에 따라 카드가 1열↔2열로 자동 전환되도록 함. 미디어쿼리로 단계를 일일이 지정할 필요가 없음
- **상세 항목 그리드에 `auto-fit` 적용** — 11개 항목이 폭에 따라 자동으로 열 수를 조정. `auto-fill`은 빈 열을 남기고 `auto-fit`은 남은 항목을 늘려 채우므로, 개수가 고정된 상세 항목에는 `auto-fit`이 적합
- **상세 페이지 헤더 재구성** — 넓은 화면에서 헤더 여백이 과도해 보여, 좌측에 큰 온도와 도시명을, 우측에 핵심 지표 4개(체감·습도·바람·미세먼지)를 배치

### 설계 판단 기록

- **store에 둘 것과 컴포넌트에 남길 것의 구분** — 단위 설정과 즐겨찾기는 여러 페이지가 공유하므로 store로, 검색어·선택된 카드·로딩 상태는 해당 화면에서만 쓰이므로 지역 상태로 유지
- **`UnitToggler`가 props를 받지 않도록 설계** — store에서 직접 읽고 직접 변경하므로 부모를 거칠 필요가 없음. props/emit으로 연결했다면 App.vue → nav → UnitToggler로 값을 중계해야 했을 것
- **`WeatherCard`가 store를 직접 구독** — 4장에서는 props만 받는 순수한 표시 컴포넌트였으나, 단위와 즐겨찾기는 앱 전역 상태이므로 카드가 직접 구독하도록 변경. 덕분에 즐겨찾기 페이지에서도 같은 카드 컴포넌트가 수정 없이 동작

### 배운 점 / 확인한 것

- state와 getters를 그냥 구조분해하면 값만 복사되어 반응성이 끊김. `storeToRefs`로 감싸야 함. actions는 함수이므로 그냥 구조분해해도 무방
- **`use~Store()`와 `useRouter()`의 호출 위치 규칙** — 두 함수 모두 "현재 실행 중인 컴포넌트"를 내부적으로 참조하므로, setup이 실행되는 동안에만 올바르게 동작함. 이벤트 핸들러 같은 함수 내부에서 호출하면 setup이 이미 끝난 뒤라 컴포넌트를 찾지 못함. 파일의 물리적 첫 줄일 필요는 없고 함수 정의보다 앞서기만 하면 되는데, 실제로는 아래 코드가 참조하므로 `const`의 TDZ 때문에 자연스럽게 위쪽에 오게 됨. `watch`, `onMounted` 등 컴포넌트 컨텍스트가 필요한 함수들이 모두 같은 규칙을 따름
- store 파일에서 `export`를 빠뜨리거나 `return` 문에 함수를 담지 않으면 `does not provide an export named` / `is not a function` 오류가 발생함. Pinia는 `return`에 담은 것만 외부에 공개함
- Vue Devtools의 Pinia 탭에서 두 store의 상태가 실시간으로 갱신되는 것을 확인
- ℃/℉ 전환 시 대시보드 카드·요약 패널·시간대별 예보·5일 예보·상세 페이지의 온도가 동시에 바뀌고, 페이지를 이동했다 돌아와도 설정이 유지되는 것을 확인. 5장까지는 불가능했던 동작


## 2026-08-13 — 7장 Hands on : Weather Axios

**파일:** `src/api/weatherApi.js`, `publicDataApi.js`, `api/data-go.js`, `src/stores/weatherStore.js`, `src/data/regionList.js`

목업 데이터를 실제 API 응답으로 전면 교체하고, 대상 지역을 전국 17개 광역시·도로 확장했습니다.

### 요구사항 대조

| 요구사항                               | 구현                                              |
| -------------------------------------- | ------------------------------------------------- |
| 1. OpenWeather로 실제 날씨 데이터 적용 | `/data/2.5/weather` — 17개 지역 현재 날씨         |
| 2. OpenWeather 추가 API로 기능 확장    | `/data/2.5/forecast` — 시간대별(24h) · 5일 예보   |
| 3. 기타 외부 API로 기능 확장           | 공공데이터포털 3종 — 자외선 · 미세먼지 · 기상특보 |

### 연동한 API

| 항목          | 엔드포인트                                   | 비고                                             |
| ------------- | -------------------------------------------- | ------------------------------------------------ |
| 현재 날씨     | OpenWeather `/weather`                       | 기온·체감·습도·바람·구름·가시거리·기압·일출/일몰 |
| 시간대별 예보 | OpenWeather `/forecast`                      | 3시간 간격 앞 8개(24시간), 강수확률 포함         |
| 5일 예보      | OpenWeather `/forecast`                      | 40개 항목을 날짜별로 묶어 최고·최저 산출         |
| 현재 위치     | `navigator.geolocation` + `/weather?lat&lon` | 브라우저 내장 API                                |
| 자외선지수    | 기상청 생활기상지수 조회서비스               | `getUVIdxV5`                                     |
| 미세먼지      | 에어코리아 시도별 실시간 측정정보            | PM10 · PM2.5                                     |
| 기상특보      | 기상청 기상특보 조회서비스                   | 전국 목록을 지역별로 필터링                      |

### 구조

```
컴포넌트
   ↓ (store 만 참조)
weatherStore  ── 캐싱 · 상태 관리
   ↓
weatherApi.js / publicDataApi.js  ── axios 인스턴스 · 응답 변환
   ↓
OpenWeather / 공공데이터포털
```

**`weatherStore` 도입이 이번 단원의 가장 큰 구조 변화**
이전에는 메인·상세·즐겨찾기 페이지가 각각 API를 호출해 같은 데이터를 중복 요청
지역이 17개로 늘어나면서 store에 캐시를 두고 페이지들이 공유하도록 변경

| 경로                             | 네트워크 요청     |
| -------------------------------- | ----------------- |
| 메인 → 부산 상세보기             | 0회 (캐시 사용)   |
| URL로 `/weather/busan` 직접 접근 | 2회 (상세 + 예보) |
| 즐겨찾기 페이지 (기본 지역)      | 0회               |

### 적용한 7장 문법

| 문법                                | 적용 위치                                                      |
| ----------------------------------- | -------------------------------------------------------------- |
| `axios.create`                      | `baseURL` · `params`(appid, units, lang) · `timeout` 공통 설정 |
| 응답 인터셉터                       | 401/404/429/타임아웃을 사용자용 메시지로 변환                  |
| `async/await` + `try/catch/finally` | 모든 API 호출. `finally`에서 로딩 해제                         |
| `Promise.all`                       | 상세 페이지의 현재 날씨 + 예보 병렬 조회                       |
| `Promise.allSettled`                | 17개 지역 병렬 조회 — 일부 실패해도 나머지 표시                |
| `onMounted`                         | DOM 부착 직후 초기 데이터 로드                                 |
| 환경변수                            | `import.meta.env.VITE_*`                                       |

### Customization

- **전국 17개 광역시·도로 확장** — 도 단위는 도청소재지를 대표 도시로 사용. `regionList.js`에 `query`(API 조회용) / `enName` / `name`(한글 표시) / `sidoName`(에어코리아) / `areaNo`(기상청)를 함께 관리
- **전국 날씨 지도** — API 응답의 좌표(`lat`/`lon`)를 SVG에 선형 투영. 지도 라이브러리 없이 구현했으며, 마커에 날씨 아이콘·기온·즐겨찾기 별을 표시하고 클릭 시 연결선과 함께 상세 카드를 띄움
  <img width="1435" height="871" alt="스크린샷 2026-08-13 오후 2 45 27" src="https://github.com/user-attachments/assets/4361f85e-f731-48e6-8abf-0eb3afebad87" />
  
- **`query`에 국가코드 `,KR` 부착** — `Gwangju` 같은 도시명은 해외에도 존재해, 국가코드 없이 조회하면 엉뚱한 지역이 반환됨
- **검색 API 연동** — 로컬 필터 결과가 0건일 때 "API에서 찾기" 버튼이 나타나 목록에 없는 도시를 추가. 추가된 도시는 세션 동안만 유지되며, 즐겨찾기에 등록하면 새로고침 후에도 남음
  <img width="1391" height="314" alt="스크린샷 2026-08-13 오후 2 45 47" src="https://github.com/user-attachments/assets/749ac154-5f13-4437-8b53-e3db72ad8fcd" />

- **현재 위치 기반 조회** — `navigator.geolocation`을 Promise로 감싸 `async/await`로 사용. 권한 거부·조회 실패는 정상적인 흐름으로 보고 조용히 기본 도시(서울)로 폴백하며, 사용자에게 에러를 노출하지 않음
<img width="1304" height="357" alt="스크린샷 2026-08-13 오후 2 47 43" src="https://github.com/user-attachments/assets/d336733b-baa3-4837-b056-1d9429592026" />
<img width="1318" height="348" alt="스크린샷 2026-08-13 오후 2 47 27" src="https://github.com/user-attachments/assets/43791d38-3ed9-45d9-8acf-c87ab6285c32" />

- **일출·일몰 반원 그래픽** — `SunArc.vue`. 현재 시각이 일출~일몰 구간에서 몇 %인지 계산해 반원 궤도 위 해의 위치로 표현. 지나온 구간은 실선, 남은 구간은 점선
  <img width="313" height="232" alt="스크린샷 2026-08-13 오후 2 48 05" src="https://github.com/user-attachments/assets/246bee72-4f34-43c6-a823-71548065bd04" />

- **기압을 atm 단위로 표시** — 1 atm = 1013.25 hPa로 환산. 원본 hPa 값은 보조 텍스트로 병기
  <img width="158" height="249" alt="스크린샷 2026-08-13 오후 2 48 42" src="https://github.com/user-attachments/assets/6669cb62-c6f9-4e5a-9af8-be6dbbd51350" />

- **강수확률 표시** — 시간대별·5일 예보에 `pop` 값을 백분율로 변환해 표시. 0%인 시간은 `—`로 처리해 화면이 지저분해지지 않도록 함
  <img width="1433" height="588" alt="스크린샷 2026-08-13 오후 2 49 04" src="https://github.com/user-attachments/assets/f5c2d046-e098-4971-815f-22e1d7cc4d04" />


### 설계 판단 기록

- **응답 변환을 API 계층에서 처리** — `toCityData` / `toDetailData`가 API 응답 구조를 기존 목업과 같은 키(`name` / `temp` / `status`)로 매핑. 덕분에 `<template>`은 한 줄도 수정하지 않고 데이터 소스만 교체할 수 있었음. 2장에서 목업 키를 API 구조에 맞춰 설계해둔 것이 효과를 발휘
- **`Promise.all` vs `allSettled` 구분** — 상세 페이지의 두 요청은 모두 필요하므로 `all`, 17개 지역 조회는 일부 실패를 허용해야 하므로 `allSettled`
- **보조 정보는 화면을 막지 않음** — OpenWeather 데이터는 `await`로 기다리지만, 공공데이터포털은 `await` 없이 진행시켜 도착하는 대로 반영. 공공 API가 느리거나 실패해도 날씨는 정상 표시됨
- **`headerTheme` 판정을 `includes`로 변경** — 목업의 `status`는 '맑음'/'비'로 딱 떨어졌으나, API의 `description`은 '온흐림', '실 비', '튼구름' 등 표현이 다양해 정확히 일치 비교로는 판정이 되지 않음
- **에어코리아 응답 지연 대응** — 미세먼지 API는 타임아웃(504)이 잦다. `numOfRows`를 5로 축소, 재시도 로직, 시간 단위 `localStorage` 캐시(측정값이 1시간마다 갱신되므로)를 적용해 실패 확률을 낮춤. 그럼에도 실패하면 해당 항목만 `—`로 표시되고 나머지는 정상 동작

### 배운 점 / 확인한 것

- axios는 `fetch`와 달리 `.json()` 변환이 필요 없고, 4xx/5xx가 자동으로 `catch`로 들어옴. `fetch`는 404도 성공으로 취급해 `res.ok`를 직접 확인해야 함
- `.env` 파일은 개발 서버 시작 시 한 번만 읽히므로, 수정 후 반드시 재시작해야 함
- macOS는 파일명 대소문자를 구분하지 않아 `Hourlystrip.vue`로 커밋되어 있었음. 배포 환경(Linux)에서는 import 실패로 빌드가 깨지므로 `git mv`를 두 단계로 실행해 수정
- 공공데이터포털은 오류도 HTTP 200으로 응답하는 경우가 있어, `header.resultCode`를 확인해야 "데이터 없음"과 "인증 실패"를 구분할 수 있음
- 인증키는 인코딩/디코딩 두 종류가 제공되는데, axios가 자동으로 인코딩하므로 **디코딩 키**를 써야 함. 인코딩 키를 쓰면 이중 인코딩되어 인증에 실패

---

## 2026-08-13 — 8장 Hands on : Weather UI Library

**라이브러리:** Element Plus 2.14 + `@element-plus/icons-vue`

```js
// main.js
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ko from 'element-plus/es/locale/lang/ko'

app.use(ElementPlus, { locale: ko })
```

### 교체한 컴포넌트

| 대상                      | Element Plus                    | 얻은 것                                          |
| ------------------------- | ------------------------------- | ------------------------------------------------ |
| 상세보기 · API 검색 버튼  | `el-button`                     | hover/active/disabled 상태, `loading` 속성       |
| 단위 토글 · 즐겨찾기 정렬 | `el-radio-group`                | "여러 선택지 중 하나"라는 의미가 마크업에 드러남 |
| 기상특보 배너 · API 에러  | `el-alert`                      | `type` 하나로 색상·아이콘·접근성 속성 일괄 적용  |
| 특보 배지                 | `el-tag`                        | 배지 스타일을 직접 만들 필요 없음                |
| 로딩 상태                 | `el-skeleton`                   | 텍스트 안내보다 레이아웃 변동이 적음             |
| 검색 결과 알림            | `ElMessage`                     | 조작을 막지 않고 자동으로 사라지는 토스트        |
| 즐겨찾기 별               | `el-icon` + `Star`/`StarFilled` | 이모지 대신 벡터 아이콘                          |

### 의도적으로 교체하지 않은 것

- **검색 입력창** — `el-input`은 한글 IME 조합이 끝나야 `@input`을 발생시킨다. `ㅅ`을 입력한 시점에는 이벤트가 오지 않아 초성 검색이 동작하지 않으므로, 조합 중에도 값을 받는 네이티브 `<input>`을 유지했다. **라이브러리의 편의 기능이 요구사항과 충돌하는 사례**
- **카드 레이아웃 · 그라데이션 헤더 · 지도 · 예보 스트립** — `el-card`로 바꾸면 직접 설계한 날씨별 테마와 반응형 구조가 무너진다. 라이브러리로 대체할 이점이 없는 영역

### 배운 점 / 확인한 것

- `el-input`의 `@input`은 이벤트 객체가 아니라 값(문자열)을 넘긴다. 네이티브 `<input>`과 시그니처가 달라 `e.target.value`를 쓰면 `undefined`가 됨
- `app.use(ElementPlus)`와 CSS import 중 하나라도 빠지면 `<el-*>` 태그가 일반 텍스트로 렌더링됨. 버튼 색이 사라지고 라디오가 붙어 나오는 증상이 모두 같은 원인이었음
- `:deep()`를 써야 `scoped` 안에서 자식 컴포넌트 내부 요소의 스타일을 덮어쓸 수 있음
- 라이브러리는 "전부 쓰거나 안 쓰거나"가 아니라 **필요한 부분만 골라 쓰는 것**이 적절하다는 사실을 경험

---

## 2026-08-13 — 9장 Hands on : Weather Refinement

### 1. Composable 분리

`src/composables/useCitySearch.js` 신규 생성.

초성 추출 배열(19개)과 유니코드 연산이 `WeatherHomeView.vue` 섞여 있음
-> 화면 컴포넌트와 한글 생성 책임 분리

```js
// 변경 전 — 화면 컴포넌트 안에 CHOSUNG 배열 + getChosung + filter 로직
// 변경 후 — 한 줄<img width="533" height="317" alt="스크린샷 2026-08-13 오후 2 53 41" src="https://github.com/user-attachments/assets/97ffe4b4-df25-4dfa-a11d-8f2f2ba0ab39" />

const { filteredCities: filteredWeatherList } = useCitySearch(cities, searchQuery)
```

Composable은 Mixin과 달리 어떤 값이 어디서 왔는지 호출부에 드러나므로 이름 충돌이나 출처 불명 문제가 없습니다.
`unref`를 써서 호출부가 `ref`를 넘기든 배열을 넘기든 동작하도록 했습니다.

### 2. 죽은 코드 정리

| 파일                          | 처리 | 사유                                                    |
| ----------------------------- | ---- | ------------------------------------------------------- |
| `src/data/weatherMockData.js` | 삭제 | 기상특보까지 API 전환되어 참조처 없음                   |
| `src/assets/exercise.css`     | 삭제 | 4장에서 스타일을 각 컴포넌트로 이관한 뒤 미사용         |
| `WeatherParent.vue` 등        | 유지 | 단계별 산출물. import되지 않으므로 번들에 포함되지 않음 |

`grep -rn`으로 참조처 확인 후 삭제

### 3. 스타일 다듬기

- **카드 레이아웃을 세로 4단으로 재구성** — 가로 배치는 카드 폭이 좁아지면 날씨 설명이 글자 단위로 쪼개졌다. 지역명 → 설명 → 아이콘·기온·버튼 → 배지 순으로 나누어 각 줄이 카드 폭을 온전히 쓰도록 함. 결과적으로 최소 폭이 340px → 280px로 줄어 같은 화면에 더 많은 카드가 들어감
  <img width="518" height="273" alt="스크린샷 2026-08-13 오후 2 55 22" src="https://github.com/user-attachments/assets/82549f8a-23b4-4077-950e-3a8fb2b0b594" />

- **`min-width: 0` 적용** — flex 자식은 기본 `min-width: auto`라 내용보다 작아지지 않는다. 0으로 낮춰야 `text-overflow: ellipsis`가 동작함
- **배지 모서리를 버튼과 통일** — `border-radius: 999px` → `9px`
- **지도 카드 배치를 비대칭으로** — 왼쪽은 패널 밖으로 잘리지 않도록 지도 위로 겹치고, 오른쪽은 마커를 가리지 않도록 여백을 둠
  <img width="970" height="799" alt="스크린샷 2026-08-13 오후 2 56 01" src="https://github.com/user-attachments/assets/4316c417-83dd-42c4-a892-c342a3a86da0" />
<img width="925" height="838" alt="스크린샷 2026-08-13 오후 2 55 44" src="https://github.com/user-attachments/assets/4c99f07f-e806-4950-bc1f-c7cbcb98fe3f" />

- **요약 패널 항목 재구성** — "더운 지역" 절대 개수는 17개 기준에서 의미가 약해 비율(`12 / 17`)로 변경하고, 기온 차·비 오는 지역을 추가
  <img width="346" height="610" alt="스크린샷 2026-08-13 오후 2 56 36" src="https://github.com/user-attachments/assets/65f3851c-e2be-43a3-9d1d-47daae821e04" />


### 설계 판단 기록

- **기온 차의 단위 변환** — 화씨 변환은 `×9/5 + 32`이지만, "차이"에는 `+32`를 적용하면 안 된다. 5°C 차이가 41°F 차이가 되어버리므로 `×9/5`만 적용
- **판정 기준과 표시 단위 분리** — 더움/선선함 판정은 항상 섭씨 원본으로 수행하고, 표시 문구만 현재 단위로 환산. 화씨로 변환한 값(82 등)을 25와 비교하면 모든 지역이 "더움"이 됨

---

## 2026-08-13 — 10장 Hands on : Weather Deployment

**배포 주소:** https://skala-vue-h8hk.vercel.app

### 1. ESLint 통과

```bash
npm run lint    # Found 0 warnings and 0 errors
```

수정한 항목 3건.

| 규칙                             | 대상                                   | 조치                                  |
| -------------------------------- | -------------------------------------- | ------------------------------------- |
| `vue/multi-word-component-names` | `Hourlystrip.vue`                      | `HourlyStrip.vue`로 변경              |
| `no-unused-vars`                 | `SampleTwo.vue`의 `ref`                | 미사용 import 제거                    |
| `no-unused-vars`                 | `WeatherHomeView.vue`의 `selectedCity` | `headerCity`로 대체되어 미사용 → 제거 |

### 2. 환경변수 분리

| 파일              | 용도             | Git  |
| ----------------- | ---------------- | ---- |
| `.env`            | 개발용 (실제 키) | 제외 |
| `.env.production` | 배포용 (키 제외) | 제외 |
| `.env.example`    | 견본             | 포함 |

`.gitignore`를 `.env.*` + `!.env.example` 형태로 수정했습니다.
기본값(`.env.local`, `.env.*.local`)만으로는 `.env.production`이 걸러지지 않기 때문입니다.

```json
"build:production": "vite build --mode production"
```

**키의 노출 범위를 접두사로 구분했습니다.**

| 변수                       | 접두사   | 노출                                              |
| -------------------------- | -------- | ------------------------------------------------- |
| `VITE_OPENWEATHER_API_KEY` | 있음     | 클라이언트 번들에 포함                            |
| `DATA_GO_KR_API_KEY`       | **없음** | 서버(프록시)에서만 사용, 브라우저로 전달되지 않음 |

### 3. SPA 라우팅

```json
// vercel.json
{ "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }] }
```

SPA는 실제 파일이 `index.html` 하나뿐이라, `/weather/seoul`로 직접 접속하면 서버가 404를 반환합니다.
모든 경로를 `index.html`로 보내야 Vue Router가 경로를 해석할 수 있습니다.

`(?!api/)`는 "api로 시작하지 않는 경로만"이라는 뜻으로, 서버리스 함수 경로가 가로채이지 않도록 제외했습니다.

### 4. 공공데이터 CORS — 서버리스 함수

배포 후 자외선·미세먼지·기상특보가 전부 실패했습니다.
`vite.config.js`의 프록시는 **개발 서버 기능**이라 빌드 결과물에 포함되지 않기 때문입니다.

Vercel이 루트의 `api/` 폴더를 서버리스 함수로 자동 인식한다는 점을 이용해 프록시를 구현했습니다.

```
개발  브라우저 → Vite 프록시    → data.go.kr
배포  브라우저 → 서버리스 함수  → data.go.kr
```

**양쪽 다 `/api/data-go` 경로를 쓰도록 통일**해, 애플리케이션 코드는 환경을 구분하지 않습니다.
서버 간 통신에는 CORS 제약이 없으므로 이 방식으로 우회됩니다.

부수 효과로 **API 키가 서버에만 머물게 되어 보안이 개선**되었습니다.

### 배포 과정에서 겪은 문제

| 증상                      | 원인                                         | 해결                                            |
| ------------------------- | -------------------------------------------- | ----------------------------------------------- |
| 클로닝 직후 빌드 실패     | `package.json`에 스크립트가 JSON 밖에 추가됨 | 문법 수정                                       |
| 화면은 뜨는데 데이터 없음 | Vercel에 환경변수 미등록                     | 대시보드에 등록 후 재배포                       |
| 서버리스 함수 404         | `src/api/`에 파일을 둠                       | 루트 `api/`로 이동                              |
| 공공데이터 401            | `.env` 키 이름에 `VITE_` 접두사가 남아 있음  | 접두사 제거                                     |
| 공공데이터 504            | 에어코리아 응답 지연                         | 프록시 타임아웃 연장, 요청 개수 축소, 캐시 도입 |

### 배포 후 검증

| 항목                                          | 결과               |
| --------------------------------------------- | ------------------ |
| 17개 지역 데이터 표시                         | ✅                 |
| `/weather/seoul` 직접 접속 (SPA 라우팅)       | ✅ 404 없음        |
| `/abcd` 접속 (Catch-all)                      | ✅ 404 페이지 표시 |
| 새로고침 후 즐겨찾기·단위 유지 (localStorage) | ✅                 |
| 공공데이터 3종 (서버리스 프록시)              | ✅                 |

### 배운 점 / 확인한 것

- 환경변수는 **빌드 시점에 코드로 주입**되므로, 값을 바꾸면 재배포해야 반영됨
- `VITE_` 접두사가 붙은 변수는 클라이언트 번들에 그대로 박힌다. 브라우저에서 소스를 열면 값이 보이므로, 노출되면 안 되는 키는 접두사를 붙이지 않고 서버에서만 다뤄야 함
- 정적 배포본에는 개발 서버의 기능(프록시, HMR)이 포함되지 않는다. 개발 환경에서만 동작하는 코드가 있는지 배포 전에 점검해야 함
- `npm run preview`는 빌드 결과물을 프록시 없이 서빙하므로, 배포 전에 같은 조건으로 미리 확인할 수 있음

---

## 최종 결과

**배포 주소:** [https://skala-vue-sandy-one.vercel.app/]

| 기능                           | 데이터 출처                           |
| ------------------------------ | ------------------------------------- |
| 전국 17개 지역 현재 날씨       | OpenWeather                           |
| 전국 날씨 지도 (SVG 좌표 투영) | OpenWeather 좌표                      |
| 시간대별(24h) · 5일 예보       | OpenWeather `/forecast`               |
| 현재 위치 기반 날씨            | `navigator.geolocation` + OpenWeather |
| 도시 검색 (한글·영문·초성)     | 로컬 필터 + OpenWeather               |
| 자외선지수                     | 기상청 생활기상지수                   |
| 미세먼지 · 초미세먼지          | 에어코리아                            |
| 기상특보                       | 기상청 기상특보                       |
| 즐겨찾기 · 단위 설정           | Pinia + localStorage                  |
