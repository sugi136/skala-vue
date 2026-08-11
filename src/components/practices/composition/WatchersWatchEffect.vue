<script setup>
import { ref, watchEffect } from 'vue'

const username = ref('홍길동')
const age = ref(20)
const logMessage = ref('대기 중...')

// [핵심] watchEffect는 감시 대상을 지정하는 파라미터가 없다
// -> 콜백 내부에서 사용된 반응형 변수를 Vue가 자동으로 추적한다
watchEffect(() => {
  // 아래 두 줄에서 username, age를 읽었으므로 -> 자동으로 감시 대상 등록
  logMessage.value = `[자동 감지] 이름: ${username.value} / 나이: ${age.value}세`

  // [핵심] watch와 달리 선언 즉시 1회 실행된다
  console.log('watchEffect가 내부 변수 변경을 감지하여 실행되었습니다.')
})
// [주의] 이전 값(oldValue)은 받을 수 없다. 필요하면 watch를 써야 함
</script>

<template>
  <div class="practice-section">
    <h2>자동 감시자 watchEffect()</h2>
    <p>이름: {{ username }} / 나이: {{ age }}세</p>
    <button @click="username = '이순신'">이름을 '이순신'으로 변경</button> &nbsp;
    <button @click="age++">나이 한 살 추가 (age++)</button>

    <div class="monitor">
      <h3>watchEffect 자동 모니터링 시스템</h3>
      <p>{{ logMessage }}</p>
      <small style="color: gray"
        >※ 새로고침하자마자 버튼을 안 눌러도 로그가 이미 찍혀있는 점을 주목하세요!</small
      >
    </div>
  </div>
</template>

<style scoped>
.monitor {
  border-color: #e74c3c;
  background: #fff5f5;
  font-weight: bold;
}
</style>
