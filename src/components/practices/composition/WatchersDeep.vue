<script setup>
import { ref, watch } from 'vue'

const user = ref({
  name: '홍길동',
  age: 20,
})

const logDeep = ref('아직 반응 없음')
const logTarget = ref('아직 반응 없음')

// [주의] 가장 많이 하는 실수
// watch(user, () => { ... })
// -> ref 객체는 "겉껍데기"만 감시한다. 내부 속성(name, age)이 바뀌어도 발동 안 함
// -> 주석을 풀고 직접 실행해보면 로그가 안 찍히는 걸 확인할 수 있다

// [해결책 1] deep: true -> 객체 내부 모든 속성까지 감시
watch(
  user,
  (newVal) => {
    logDeep.value = `[deep 감지] 누군가 변경됨! 현재 이름: ${newVal.name}, 나이: ${newVal.age}`
  },
  { deep: true }, // [핵심] 세 번째 인자가 옵션 객체
)
// [주의] deep은 어떤 속성이 바뀌었는지는 알려주지 않는다. oldVal도 못 씀

// [해결책 2] getter 함수로 특정 속성만 콕 집어 감시
watch(
  () => user.value.age, // [핵심] 화살표 함수로 감싸면 그 값만 감시
  (newAge, oldAge) => {
    // [장점] 이전 값(oldAge)을 정상적으로 받을 수 있다
    logTarget.value = `[타겟 감지] 나이가 ${oldAge}세 -> ${newAge}세로 변경됨!`
  },
)
</script>

<template>
  <div class="practice-section">
    <h2>ref 객체/배열 감시</h2>
    <h3>회원 데이터 조작 panel</h3>
    <p>이름: {{ user.name }} / 나이: {{ user.age }}세</p>

    <!-- 이름 변경 -> deep 모니터만 반응 -->
    <button @click="user.name = '이순신'">이름만 변경</button> &nbsp;
    <!-- 나이 변경 -> deep, target 둘 다 반응 -->
    <button @click="user.age++">나이만 변경 (age++)</button>

    <div class="monitor">
      <p>1) deep: true 모니터 (전체 감시)</p>
      <p>{{ logDeep }}</p>
    </div>

    <div class="monitor target">
      <p>2) 화살표 함수 모니터 (나이만 타겟 감시)</p>
      <p>{{ logTarget }}</p>
    </div>
  </div>
</template>

<style scoped>
.monitor {
  border-color: #0984e3;
  background: #e3fafc;
  font-weight: bold;
}
.target {
  border-color: #6c5ce7;
  background: #efe5ff;
}
</style>
