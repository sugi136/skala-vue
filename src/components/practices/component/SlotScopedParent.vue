<script setup>
import SlotScopedChild from './SlotScopedChild.vue'
</script>

<template>
  <div class="practice-section">
    <h2>Scoped Slot 주입 실습</h2>
    <h3>상위 컴포넌트 (Parent)</h3>

    <!-- [핵심] v-slot="변수명" 으로 자식이 보낸 데이터 보따리를 받는다 -->
    <!-- slotBag = { text: '...', count: 150 } 형태의 객체 -->
    <SlotScopedChild v-slot="slotBag">
      <div class="display-panel">
        <!-- [핵심] 자식의 데이터를 부모가 원하는 모양으로 렌더링 -->
        <p>알림 메시지: {{ slotBag.text }}</p>
        <p>접속자 수: {{ slotBag.count }}명</p>
      </div>
    </SlotScopedChild>

    <!-- 비워두면 자식의 기본 화면이 나온다 -->
    <SlotScopedChild> </SlotScopedChild>
  </div>
</template>

<style scoped>
.display-panel {
  background-color: #fdf2e9;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 10px;
}
</style>
