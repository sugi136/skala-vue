<script setup>
import { ref } from 'vue'
// [핵심] 자식 컴포넌트를 import -> 이게 "지역 등록(Local Registration)"
// [문법] @ 는 src/ 를 가리키는 별칭(alias)
import LifecycleChild from '@/components/practices/component/LifecycleChild.vue'

const isShow = ref(true)
</script>

<template>
  <div class="practice-section">
    <h2>Lifecycle Hook</h2>

    <!-- [문법] 삼항 연산자로 버튼 글자를 상태에 따라 바꾼다 -->
    <button @click="isShow = !isShow" class="toggle-btn">
      {{ isShow ? '실습 컴포넌트 파괴하기 (v-if="false")' : '실습 컴포넌트 다시 살리기' }}
    </button>
    <hr />

    <!-- [핵심] v-if로 컴포넌트를 DOM에서 완전히 제거/생성 -> 생명주기 관찰용 -->
    <!-- [주의] v-show를 쓰면 숨겨지기만 하고 onUnmounted가 실행되지 않는다 -->
    <LifecycleChild v-if="isShow" />
  </div>
</template>

<style scoped>
.toggle-btn {
  padding: 10px 15px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  margin-bottom: 15px;
}
</style>
