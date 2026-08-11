<script setup>
import { ref, watch } from 'vue'

// 케이스 1: 문자열(원시값) 배열
const teamMembers = ref(['홍길동', '이순신', '강감찬'])
const logMember = ref('대기 중...')

// 케이스 2: 객체 배열
const cityWeather = ref([
  { name: '서울', temp: 25 },
  { name: '수원', temp: 22 },
  { name: '수원', temp: 25 },
])
const logWeather = ref('대기 중...')

// [핵심] 배열의 특정 인덱스를 감시하려면 getter 함수 사용
watch(
  () => teamMembers.value[0], // 0번 요소는 문자열(원시값)
  (newNames, oldNames) => {
    // [장점] 원시값이라 이전 값이 정상 보존됨
    logMember.value = `[방출/영입] 0번 선수 교체: ${oldNames} -> ${newNames}`
  },
)

// [주의] 0번 요소가 "객체"인 경우
watch(
  () => cityWeather.value[0],
  (newSeoul) => {
    logWeather.value = `[날씨 변동] 서울의 온도가 현재 ${newSeoul.temp}°C 로 변경되었습니다.`
  },
  { deep: true }, // [핵심] 객체 내부(temp)까지 보려면 deep 필수
)
</script>

<template>
  <div class="practice-section">
    <h2>ref 배열의 특정 인덱스/요소 감시하기</h2>

    <h3>1) 문자열 배열: 현재 0번 멤버 [ {{ teamMembers[0] }} ]</h3>
    <!-- 요소를 통째로 교체 -> 감지됨 -->
    <button @click="teamMembers[0] = '손흥민'">0번 멤버를 손흥민으로 교체</button>
    <p class="log text">로그: {{ logMember }}</p>

    <h3>2) 객체형 배열: 현재 {{ cityWeather[0].name }} 기온 [ {{ cityWeather[0].temp }}°C ]</h3>
    <!-- 객체 내부 속성 변경 -> deep이 있어야 감지됨 -->
    <button @click="cityWeather[0].temp++">서울 기온 1도 올리기 (temp++)</button>
    <p class="log object">로그: {{ logWeather }}</p>

    <!-- [문법] shift() -> 배열의 첫 요소 제거. 0번이 바뀌므로 watch가 발동 -->
    <button @click="cityWeather.shift()">첫번째배열제거</button>
  </div>
</template>

<style scoped>
.log {
  margin-top: 10px;
  font-weight: bold;
}
.text {
  color: #0984e3;
}
.object {
  color: #6c5ce7;
}
</style>
