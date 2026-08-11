<script setup>
import SlotDefaultChild from '@/components/practices/component/SlotDefaultChild.vue'
</script>

<template>
  <div class="practice-section">
    <h2>Default Slot 레이아웃 주입 실습</h2>

    <!-- [핵심] 여는 태그와 닫는 태그 사이에 쓴 내용이 <slot> 자리로 들어간다 -->
    <SlotDefaultChild>
      <p>단순한 텍스트 문장을 주입합니다.</p>
    </SlotDefaultChild>

    <!-- [핵심] 같은 껍데기에 완전히 다른 내용을 넣을 수 있다 = 재사용성 -->
    <SlotDefaultChild>
      <h2 style="color: #e74c3c">경고 상태</h2>
      <button>확인</button>
    </SlotDefaultChild>

    <!-- [핵심] 비워두면 자식이 정의한 기본값이 대신 나온다 -->
    <SlotDefaultChild> </SlotDefaultChild>
  </div>
</template>
ㄴ
