<script setup>
import { ref } from 'vue'

// [핵심] 이 데이터의 주인은 "자식"이다 (props와 반대 방향)
const message = ref('현재 서버 상태 정상')
const userCount = ref(150)
</script>

<template>
  <div class="base-card">
    <h3>하위 컴포넌트 (Child)</h3>
    <!-- [핵심] slot에 : 로 데이터를 실어 보낸다 -> 부모가 받아서 쓸 수 있게 -->
    <!-- text, count 라는 이름으로 포장해서 내보내는 것 -->
    <slot :text="message" :count="userCount">
      <p>부모가 마크업을 주입하지 않았을 때의 디폴트 화면</p>
    </slot>
  </div>
</template>

<style scoped>
.base-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>