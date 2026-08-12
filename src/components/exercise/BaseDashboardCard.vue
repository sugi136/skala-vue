<script setup>
// ============================================
// 4장 Hands on : BaseDashboardCard.vue
//
// [역할] 검색박스와 리스트박스가 공유하는 "껍데기(패널)" 컴포넌트
//
// [핵심] 이 컴포넌트는 데이터를 전혀 모른다.
//        제목과 아이콘만 props 로 받고, 내용물은 <slot> 으로 부모가 채운다.
//        -> 하나의 디자인을 여러 곳에서 재사용할 수 있다.
// ============================================

// [문법] defineProps 는 import 없이 사용 (컴파일러 매크로)
defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="panel">
    <!-- [핵심] props 는 template 에서 props.title 이 아니라 title 로 바로 접근 -->
    <h3 class="panel-title">
      <span v-if="icon" class="title-icon">{{ icon }}</span> {{ title }}
    </h3>

    <!-- [핵심] <slot> = 부모가 넣어줄 HTML 이 들어올 자리
         부모가 아무것도 안 넣으면 아래 기본 문구가 대신 표시된다 -->
    <slot>
      <p class="slot-empty">표시할 내용이 없습니다.</p>
    </slot>
  </section>
</template>

<style scoped>
/* [요구사항 5] 이 컴포넌트에 해당하는 디자인만 여기에 격리 */
.panel {
  background: #fff;
  border-radius: 16px;
  padding: 20px 22px;
  box-shadow: 0 2px 10px rgba(45, 90, 180, 0.07);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
  /* [참고] --accent 는 부모(.dashboard-wrapper)가 정의한 CSS 변수.
     scoped 는 선택자를 격리할 뿐, 상속되는 CSS 변수는 그대로 사용 가능하다. */
  color: var(--accent, #2f6fe4);
}

.title-icon {
  font-size: 15px;
}

.slot-empty {
  margin: 0;
  font-size: 14px;
  color: #94a3b8;
}
</style>
