<script setup>
// [문법] ref는 Vue가 제공하는 함수 -> 반드시 import 필요
import { ref } from 'vue'

// [핵심] ref()는 원시타입(숫자/문자/불린) + 객체 + 배열 전부 반응형으로 만든다
const count = ref(0) // 숫자
const name = ref('홍길동') // 문자열
const isActive = ref(true) // 불린
const items = ref(['사과', '배']) // 배열
const user = ref({
  // 객체
  name: '이순신',
  age: 30,
})

const increaseRef = () => {
  // [핵심] script 안에서는 .value를 반드시 붙인다
  count.value++
}
const changeUserName = () => {
  // [주의] 객체는 .value를 거쳐서 속성에 접근 -> user.value.name
  user.value.name = '장보고'
}
</script>

<template>
  <div class="practice-section">
    <h2>반응형 상태 ref() 기초</h2>

    <!-- [핵심] template 안에서는 .value를 붙이지 않는다 (Vue가 자동으로 벗겨줌) -->
    <p>
      Ref 카운트: <strong>{{ count }}</strong>
    </p>

    <!-- [문법] v-model은 입력값을 name 변수와 양방향으로 묶는다 -->
    <p>이름: <input v-model="name" />{{ name }}</p>

    <!-- [문법] {{ }} 안에서는 삼항 연산자 등 JS 표현식 사용 가능 -->
    <p>활성 상태: {{ isActive ? '활성' : '비활성' }}</p>
    <p>과일 목록: {{ items.join(', ') }}</p>
    <p>사용자 정보: 이름 - {{ user.name }}, 나이 - {{ user.age }}</p>

    <button @click="increaseRef">Ref 변수 증가</button>
    <!-- [문법] 인라인 핸들러에서도 .value 불필요 (template이므로) -->
    <button @click="isActive = !isActive">토글</button>
    <!-- [핵심] push 같은 배열 메서드도 반응형으로 감지된다 -->
    <button @click="items.push('귤')">과일 추가</button>
    <button @click="changeUserName">사용자 이름 변경</button>
  </div>
</template>
