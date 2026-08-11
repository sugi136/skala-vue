<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const dummy = ref(0) // [핵심] computed와 아무 관계 없는 변수 (비교용)

// [비교대상 1] 일반 함수
// 화면이 리렌더링될 때마다 무조건 다시 실행된다 -> 비효율
const getMethodResult = () => {
  console.log('❌ 일반 함수 실행됨!') // dummy를 눌러도 찍힌다
  return count.value * 2
}

// [비교대상 2] computed
// [핵심] 의존하는 값(count)이 바뀔 때만 재연산. 아니면 캐시된 결과 재사용
const doubleCount = computed(() => {
  console.log('✅ Computed 연산 실행됨!') // dummy를 눌러도 안 찍힌다
  return count.value * 2
})
// [주의] computed는 읽기 전용. doubleCount.value = 10 처럼 직접 대입 불가
</script>

<template>
  <div class="practice-section">
    <h2>computed() 캐싱 동작 비교</h2>
    <p>count: {{ count }} | dummy: {{ dummy }}</p>

    <button @click="count++">count 증가 (의존성 변경)</button>
    <button @click="dummy++">dummy 증가 (무관한 변경)</button>

    <!-- [주의] 함수는 () 를 붙여 호출해야 한다 -->
    <p>일반 함수 결과: {{ getMethodResult() }}</p>
    <!-- [주의] computed는 변수처럼 쓴다. () 를 붙이지 않는다 -->
    <p>Computed 결과: {{ doubleCount }}</p>
  </div>
</template>
