# skala-vue

SK AX Full-Stack Engineering — Frontend framework: Vue.js 실습 저장소

- **U124 / SKALA 4기 울산캠퍼스:**
- **개발 환경:** macOS / Node.js v26.5.0 / npm v12.0.1
- **프로젝트 생성:** create-vue 3.22.3

## 실행 방법

```bash
npm install      # 의존성 설치
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 배포용 빌드 (dist/ 생성)
npm run lint     # ESLint 검사
npm run format   # Prettier 포맷팅
```

---

# 실습 기록

## 2026-08-10 (월)

**단원:** 1. Getting Started with Vue.js / 2. Vue Syntax

### 환경 구성 및 저장소 세팅

### 1. 로컬 개발 환경 구성

- Node.js 설치 및 확인 (v26.5.0 / npm 12.0.1)
- VS Code 확장 설치: Vue (Official), ESLint, Prettier
- Git 사용자 정보 설정

### 2. GitHub 연동

- SSH 키 생성 후 GitHub 계정 등록, `ssh -T git@github.com` 인증 확인
- 제출용 Public 저장소 `sugi136/skala-vue` 생성

### 3. Project Scaffolding

`npm create vue@3.22.3` 로 생성. 선택 옵션:

| 항목                               | 선택 |
| ---------------------------------- | ---- |
| TypeScript / JSX                   | X    |
| Router (SPA development)           | V    |
| Pinia (state management)           | V    |
| Vitest / E2E Testing               | X    |
| Linter (ESLint)                    | V    |
| Formatter (Prettier)               | V    |
| Experimental (Oxfmt, Vue 3.6 beta) | X    |
| Skip all example code              | No   |

### 4. 실행 및 구조 확인

- `npm install` → `npm run dev` → localhost:5173 정상 구동
- `src/components`(HelloWorld, TheWelcome, WelcomeItem), `src/views`(HomeView, AboutView) 확인
- Vue Devtools 접속 확인

### 5. 원격 저장소 연동

```bash
git init && git add . && git commit -m "chore: chore: init skala-vue project"
git branch -M main
git remote add origin git@github.com:sugi136/skala-vue.git
git push -u origin main
```

시크릿 창에서 로그인 없이 접근 가능 확인 완료

### 2장 실습

### 1. 학습환경 구성

`src/components/practices/basic/` 폴더를 만들고, 공통 스타일 `src/assets/practice.css`를 App.vue에 전역 등록 (`scoped` 없이 `@import` — 모든 실습 컴포넌트가 공유하는 클래스라서)

| 파일            | 학습 내용                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| `SampleOne.vue` | 일반 변수와 `ref()` 비교. 일반 변수는 값이 변해도 화면이 갱신되지 않고, 반응형 변수가 바뀌는 순간 함께 반영 |
| `SampleTwo.vue` | Text Interpolation `{{ }}` 안에서 `toUpperCase()`, `Math.random()` 등 JavaScript 표현식이 그대로 동작       |

### 2. Vue Directive

| 파일                   | 학습 내용                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `VueHtml.vue`          | `v-html`은 문자열을 실제 HTML 엘리먼트로 해석해 주입 / `{{ }}`는 태그를 문자 그대로 출력                              |
| `VueHtmlXss.vue`       | 사용자 입력을 `v-html`에 넣으면 태그가 실행되는 XSS 위험을 직접 재현                                                  |
| `VueText.vue`          | `v-text`는 텍스트로만 출력 / `{{ }}`, `v-html`과 3자 비교                                                             |
| `VueBind.vue`          | `:href`, `:src`, `:disabled`로 HTML 속성을 동적 바인딩                                                                |
| `VueBindClass.vue`     | 클래스 바인딩 — 객체 형식(조건부 토글)과 배열 형식(다중 클래스 조립)                                                  |
| `VueBindStyle.vue`     | 인라인 스타일 바인딩 / CSS의 `background-color`가 JS에서는 `backgroundColor`(camelCase)임을 확인                      |
| `VueBindShorthand.vue` | 변수명과 속성명이 같을 때 값을 생략하는 same-name shorthand (`:id`, `:src`)                                           |
| `VueIf.vue`            | `v-if` / `v-else-if` / `v-else`로 로그인 상태 분기와 점수별 학점 등급 다중 분기 구현                                  |
| `VueShow.vue`          | `v-show` 토글. 개발자도구 Elements 탭에서 **v-if는 DOM에서 제거되고 v-show는 `display:none`만 붙는** 차이를 직접 확인 |
| `VueFor.vue`           | 배열 / 객체 / 배열 내 객체 반복 렌더링 / 객체 인자 순서 `(value, key, index)`, `:key`는 가능한 고유 id 사용           |
| `VuePre.vue`           | 템플릿 구문을 해석하지 않고 원본 그대로 출력                                                                          |
| `VueCloak.vue`         | 렌더링 전 깜빡임 방지 / `[v-cloak] { display: none }` CSS가 반드시 함께 필요                                          |
| `VueOnce.vue`          | 최초 1회만 렌더링하고 이후 데이터가 바뀌어도 갱신되지 않음                                                            |
| `VueMemo.vue`          | 지정한 의존값이 바뀔 때만 갱신 / `age`만 올리면 화면이 그대로, `name`이 바뀌는 순간 함께 반영됨                       |

### 3. Vue Event Handling

| 파일                | 학습 내용                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `EventBasic.vue`    | Inline Handler(`@click="count++"`)와 Method Handler(`@click="showAlert"`) 두 방식 비교                                |
| `EventObject.vue`   | 이벤트 객체 수신 2가지 패턴 — 인자가 없으면 자동 전달, 인자가 있으면 `$event`를 명시적으로 전달                       |
| `EventModifier.vue` | `.prevent`로 링크 기본 동작 차단, `.stop`으로 버블링 차단 / 수식어 없는 버튼은 자식·부모 alert가 두 번 뜨는 것을 확인 |

### 4. Form Data Binding

| 파일                | 학습 내용                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `ModelBasic.vue`    | `v-model`의 정체가 `:value` + `@input`의 축약형임을 두 입력창을 나란히 두고 확인                                          |
| `ModelForm.vue`     | 요소별 v-model 매핑 — textarea/radio/select는 String, 단일 checkbox는 Boolean, **다중 checkbox는 반드시 배열(`ref([])`)** |
| `ModelModifier.vue` | `.lazy`(change 시점 반영), `.number`(숫자 형변환), `.trim`(공백 제거)과 `.trim.number` 체이닝. `typeof`로 타입 변화 확인  |

### 5. Vue Style

| 파일              | 학습 내용                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `StyleScoped.vue` | `<style scoped>`는 해당 컴포넌트에만 적용되고, 전역 `practice.css`의 클래스는 어디서든 사용 가능함을 비교 |

### 오늘의 Customization / 메모

- 강사님 저장소를 ZIP으로 받아 폴더명 변경 후 진행 -> 경험 및 커밋 히스토리 목적으로 직접 생성
- 받아둔 코드는 원 이름으로 되돌린 후 별도 보관
