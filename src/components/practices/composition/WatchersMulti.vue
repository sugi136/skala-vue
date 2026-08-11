<script setup>
import { ref, watch } from 'vue'

const city = ref('서울')
const dateType = ref('오늘')
const apiStatus = ref('대기 중...')

// [핵심] 여러 변수를 배열 [] 로 묶으면 동시에 감시 가능
// [핵심] 콜백 인자도 배열로 들어온다. 순서는 감시대상 배열 순서와 동일
watch([city, dateType], ([newCity, newDate], [oldCity, oldDate]) => {
  // [문법] 구조분해할당 -> 배열에서 값을 순서대로 꺼내 변수에 담기
  apiStatus.value = `[변경 감지] ${oldCity}(${oldDate}) -> ${newCity}(${newDate})`

  // [실무] 둘 중 하나만 바뀌어도 한 번만 API를 호출 -> 중복 요청 방지
  console.log(`[통합 API 호출] ${newCity}의 ${newDate} 날씨를 불러옵니다...`)
})
</script>

<template>
  <div class="practice-section">
    <h2>여러 개의 변수 동시 감시 (watch)</h2>
    <h3>날씨 조건 설정</h3>

    <!-- [문법] select의 v-model -> 선택된 option의 value가 들어간다 -->
    <label>도시: </label>
    <select v-model="city">
      <option value="서울">서울</option>
      <option value="수원">수원</option>
      <option value="부산">부산</option>
    </select>

    <br />

    <!-- [문법] radio의 v-model -> 같은 변수를 묶으면 그룹이 된다 -->
    <label>날짜: </label>
    <label><input type="radio" value="오늘" v-model="dateType" /> 오늘</label> &nbsp;
    <label><input type="radio" value="내일" v-model="dateType" /> 내일</label> &nbsp;
    <label><input type="radio" value="주간예보" v-model="dateType" /> 주간예보</label>

    <div class="monitor">
      <h3>통합 모니터링 로그</h3>
      <p>현재 상태: {{ apiStatus }}</p>
    </div>
  </div>
</template>

<style scoped>
.monitor {
  border-color: #00b894;
  background: #e8f5e9;
}
</style>
