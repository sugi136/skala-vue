<script setup>
// [문법] reactive는 ref와 다른 함수 -> 따로 import
import { reactive } from 'vue'

// [핵심] reactive()는 객체/배열/Map/Set만 가능. 숫자나 문자열은 불가
// [핵심] ref와 달리 .value가 없다
const userReactive = reactive({
  name: '이순신',
  age: 30,
})
const celebrateReactive = () => {
  // [핵심] .value 없이 바로 속성 접근
  userReactive.age++
}

// [주의] reactive는 통째로 교체하면 반응성이 끊긴다
// userReactive = { name: '홍길동' }  // 이러면 화면이 안 바뀜
// 반드시 내부 속성만 변경할 것

// 2. 배열형 reactive 상태
const items = reactive(['사과', '바나나'])

const addItem = () => {
  // [문법] 템플릿 리터럴 -> 백틱(`) 안에서 ${변수} 로 값 삽입
  items.push(`과일 ${items.length + 1}`)
}
const removeItem = (index) => {
  // [문법] splice(시작위치, 삭제개수) -> 배열에서 요소 제거
  items.splice(index, 1)
}
</script>

<template>
  <div class="practice-section">
    <h2>반응형 상태 reactive() 특징 및 주의점</h2>
    <h3>1) 객체(Object) reactive</h3>
    <p>이름: {{ userReactive.name }} / 나이: {{ userReactive.age }}세</p>
    <button @click="celebrateReactive">reactive 나이 한 살 추가</button>

    <h3>2) 배열(Array) reactive</h3>
    <ul>
      <!-- [문법] v-for에는 :key 필수. 여기선 index를 썼지만 고유 id가 더 안전 -->
      <li v-for="(item, index) in items" :key="index">
        {{ item }}
        <!-- [문법] 핸들러에 인자 전달 -> 함수명(인자) 형태로 호출 -->
        <button @click="removeItem(index)" style="margin-left: 8px; padding: 2px 6px">삭제</button>
      </li>
    </ul>
    <button @click="addItem">과일 항목 추가</button>
  </div>
</template>
