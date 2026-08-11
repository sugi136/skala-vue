<template>
  <div class="base-card">
    <header>
      <!-- [핵심] name을 주면 "이름표가 붙은 구멍"이 된다 -->
      <slot name="header"></slot>
    </header>
    <main>
      <!-- [핵심] name이 없는 slot = 기본 슬롯. 이름표 없는 내용이 여기로 들어온다 -->
      <slot></slot>
    </main>
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
