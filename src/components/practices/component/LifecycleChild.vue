<script setup>
// [문법] 생명주기 훅도 vue에서 import
import { ref, onMounted, onUpdated, onUnmounted } from 'vue'

const count = ref(0)
// [주의] timerId는 화면에 표시하지 않으므로 ref가 아닌 일반 변수로 충분
let timerId = null

// [핵심] 1단계 생성(Creation) = <script setup> 본문 그 자체
// 이 시점엔 아직 DOM이 없어서 화면 요소에 접근할 수 없다
console.log('1. [setup] 컴포넌트가 메모리에 생성되었습니다. (DOM 접근 불가능)')

// [핵심] 2단계 부착(Mounting) - 실제 DOM에 붙은 직후
onMounted(() => {
  // [실무] 여기가 백엔드 API를 호출하는 최적 타이밍 -> 7장에서 실제로 사용
  console.log('2. [onMounted] 화면에 완벽히 부착되었습니다! (API 호출/DOM 조작 적기)')

  // [문법] setInterval(함수, 밀리초) -> 3초마다 반복 실행. 실행 ID를 반환
  timerId = setInterval(() => {
    count.value++
  }, 3000)
})

// [핵심] 3단계 갱신(Updating) - 데이터가 바뀌어 화면을 다시 그릴 때마다
onUpdated(() => {
  console.log(
    `3. [onUpdated] 데이터가 변경되어 화면을 새로 그렸습니다. (현재 count: ${count.value})`,
  )
})

// [핵심] 4단계 소멸(Unmounting) - v-if="false" 등으로 컴포넌트가 제거될 때
onUnmounted(() => {
  // [주의] 여기서 타이머를 안 끄면 컴포넌트가 사라져도 백그라운드에서 계속 돈다
  // -> 메모리 누수(memory leak). 실무에서 자주 발생하는 버그
  clearInterval(timerId)
  console.log('4. [onUnmounted] 컴포넌트가 소멸했습니다. 타이머 청소 완료!')
})
</script>

<template>
  <!-- [참고] Vue 3는 최상위 태그가 여러 개여도 된다 (Vue 2는 하나만 허용) -->
  <h3>라이프사이클 훅 흐름 탐색기</h3>
  <div class="counter-display">
    <p>실시간 타이머 카운트: {{ count }}</p>
    <button @click="count++">수동으로 숫자 올리기</button>
  </div>
</template>

<style scoped>
.counter-display {
  background: #e3fafc;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #99e9f2;
  text-align: center;
}
</style>
