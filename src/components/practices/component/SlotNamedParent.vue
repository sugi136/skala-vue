<script setup>
import SlotNamedChild from './SlotNamedChild.vue'
</script>

<template>
  <div class="practice-section">
    <h2>Named Slot 주입 실습</h2>
    <SlotNamedChild>
      <!-- [핵심] <template v-slot:이름> 으로 어느 구멍에 넣을지 지정 -->
      <!-- [문법] v-slot:header 는 #header 로 줄여 쓸 수 있다 -->
      <template v-slot:header>
        <h3>Child 주입 제목</h3>
      </template>

      <!-- [핵심] template으로 감싸지 않은 내용은 자동으로 기본 슬롯으로 -->
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </SlotNamedChild>
  </div>
</template>
