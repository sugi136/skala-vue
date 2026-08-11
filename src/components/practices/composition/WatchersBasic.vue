<script setup>
import { ref, watch } from 'vue'

const currentCity = ref('서울')
const logMessage = ref('아직 감시 시스템이 작동하지 않았습니다.')

// [문법] watch(감시대상, 콜백함수)
// [핵심] 값이 바뀌는 "순간"에만 콜백이 실행된다 (선언 시점엔 실행 안 됨)
watch(currentCity, (newValue, oldValue) => {
  // [핵심] 첫 인자 = 바뀐 값, 둘째 인자 = 바뀌기 전 값
  logMessage.value = `감시자 발동! [${oldValue}]에서 [${newValue}]로 변경됨.`

  // [실무] 도시가 바뀌면 그 도시의 날씨 API를 다시 호출 -> 7장에서 실제로 구현
  console.log(`[서버 요청] 기상청 서버에서 ${newValue}의 날씨 API를 다시 조회합니다...`)
})
// [참고] { immediate: true } 옵션을 주면 선언 즉시 1회 실행된다
</script>

<template>
  <div class="practice-section">
    <h2>감시자 watch()의 원리와 실무 활용</h2>
    <h3>지역 선택 제어판</h3>
    <p>현재 선택된 도시: {{ currentCity }}</p>

    <!-- [주의] 같은 값을 다시 선택하면 watch가 발동하지 않는다 (값이 안 바뀌었으므로) -->
    <button @click="currentCity = '서울'">서울 선택</button> &nbsp;
    <button @click="currentCity = '수원'">수원 선택</button> &nbsp;
    <button @click="currentCity = '부산'">부산 선택</button>

    <div class="monitor">
      <h3>파수꾼(watch) 모니터링 시스템</h3>
      <p>{{ logMessage }}</p>
      <small style="color: gray">(버튼을 누른 후 브라우저 콘솔창 F12를 확인해 보세요)</small>
    </div>
  </div>
</template>

<style scoped>
.monitor {
  border-color: #0984e3;
  background: #e3fafc;
}
</style>
