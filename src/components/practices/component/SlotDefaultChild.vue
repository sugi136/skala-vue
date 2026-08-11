<!-- [참고] script 블록이 아예 없다. 껍데기만 제공하는 컴포넌트라 로직이 불필요 -->
<template>
  <div class="base-card">
    <!-- [핵심] <slot> = 부모가 넣어줄 HTML이 들어올 자리(구멍) -->
    <slot>
      <!-- [핵심] slot 안에 쓴 내용 = 부모가 아무것도 안 넣었을 때의 기본값(Fallback) -->
      <p>기본 콘텐츠 영역입니다.</p>
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
