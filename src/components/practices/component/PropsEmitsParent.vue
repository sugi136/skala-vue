<script setup>
import { ref } from 'vue'
import PropsEmitsChild from './PropsEmitsChild.vue'

// [핵심] 데이터의 "진짜 주인"은 부모. 자식은 빌려 쓸 뿐이다
const message = ref('Parent 초기 메시지')

// [핵심] 자식이 emit한 이벤트를 받아 처리하는 함수
// 자식이 보낸 payload가 첫 인자로 자동 주입된다
const handleUpdateRequest = (newValue) => {
  message.value = newValue // 실제 데이터 변경은 부모가 수행
}
</script>

<template>
  <div class="practice-section">
    <h2>Props &amp; Emits</h2>
    <div class="parent-container">
      <h2>상위 컴포넌트 (Parent)</h2>
      <p>
        현재 로컬 데이터(State): <strong>{{ message }}</strong>
      </p>
      <br />

      <!-- [핵심] 데이터 내려주기 = : (콜론) / 이벤트 받기 = @ (골뱅이) -->
      <!-- [주의] 자식은 parentData(camelCase), 부모 태그는 :parent-data(kebab-case) -->
      <PropsEmitsChild :parent-data="message" @update-request="handleUpdateRequest" />
    </div>
  </div>
</template>

<style scoped>
.parent-container {
  border: 2px solid #2ecc71;
  padding: 20px;
  background-color: #f8f9fa;
  margin: 0 auto;
  border-radius: 8px;
}
</style>
