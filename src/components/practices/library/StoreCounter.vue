<script setup>
// ============================================
// 6장 Code Challenge : StoreCounter.vue
// 위치: src/components/practices/library/StoreCounter.vue
//
// [핵심] Store 사용 3단계
//   1. store 파일을 import
//   2. use~Store() 를 호출해 인스턴스 확보
//   3. 인스턴스를 통해 state / getters / actions 접근
// ============================================

// 1. 정의한 카운터 스토어 import
import { useCounterStore } from '@/stores/counter.js'

// [Customization] 반응성 유실 실험용
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

// 2. 인스턴스 가동 (전역 저장소 포인터 확보)
//    [주의] <script setup> 최상단에서 호출한다.
//           함수 안에서 호출하면 Pinia 인스턴스를 못 찾는 경우가 있다.
const counterStore = useCounterStore()

// --------------------------------------------
// [핵심 / 6장 최대 함정] 구조분해할당 시 반응성 유실
//
// const { count } = counterStore   ← 이렇게 하면 화면이 갱신되지 않는다.
//   count 는 그 순간의 "숫자 값"만 복사되어 원본과의 연결이 끊긴다.
//
// 해결: storeToRefs() 로 감싸면 ref 를 유지한 채 꺼낼 수 있다.
// --------------------------------------------

// ❌ 잘못된 방법 (실험용 - 화면이 안 바뀌는 것을 확인)
const { count: brokenCount } = counterStore

// ✅ 올바른 방법 — state 와 getters 는 storeToRefs 로
const { count: liveCount, doubleCount } = storeToRefs(counterStore)

// ✅ actions(함수)는 반응성과 무관하므로 그냥 구조분해해도 된다
const { increment } = counterStore

// 비교용 로컬 변수
const localCount = ref(0)
</script>

<template>
  <div class="practice-section">
    <h2>Counter Store 활용 실습</h2>

    <h3>1) 기본 사용 — 인스턴스를 통해 접근</h3>
    <p>
      원본 카운트 데이터(state): <strong>{{ counterStore.count }}</strong>
    </p>
    <p>
      2배 연산 데이터(getters): <span>{{ counterStore.doubleCount }}</span>
    </p>
    <button @click="counterStore.increment">숫자 1 증가 (actions)</button>

    <h3>2) 구조분해할당 비교 ★ 6장 핵심</h3>
    <p>
      ❌ 그냥 구조분해: <strong class="broken">{{ brokenCount }}</strong>
      <small>(버튼을 눌러도 0에서 멈춰 있음)</small>
    </p>
    <p>
      ✅ storeToRefs: <strong class="live">{{ liveCount }}</strong>
      <small>(정상적으로 갱신됨)</small>
    </p>
    <p>
      ✅ storeToRefs (getters): <strong class="live">{{ doubleCount }}</strong>
    </p>
    <button @click="increment">increment (구조분해한 action)</button>

    <h3>3) 전역 상태 vs 지역 상태</h3>
    <p>
      이 컴포넌트만의 로컬 카운트: <strong>{{ localCount }}</strong>
    </p>
    <button @click="localCount++">로컬 카운트 증가</button>
    <p class="hint">
      ※ Store 값은 다른 컴포넌트·페이지에서도 같은 값이 보이지만,<br />
      로컬 값은 이 컴포넌트가 사라지면 함께 초기화된다.
    </p>
  </div>
</template>

<style scoped>
.broken {
  color: #d94f4f;
}
.live {
  color: #2e9e63;
}
small {
  margin-left: 6px;
  color: #8899ad;
  font-size: 12px;
}
.hint {
  margin-top: 12px;
  font-size: 12px;
  line-height: 1.6;
  color: #8899ad;
}
</style>
