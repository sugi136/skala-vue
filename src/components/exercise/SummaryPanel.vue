<script setup>
// ============================================
// 4장 Hands on : SummaryPanel.vue
// 본인 Mockup 부분에서 추가로 분리한 컴포넌트
// [역할] 우측 "오늘의 요약" 목록을 표시
// [핵심] 계산은 부모(computed)가 하고, 이 컴포넌트는 결과만 받아 그린다.
//        -> 표시 책임과 계산 책임의 분리
// ============================================

defineProps({
  // [{ id, icon, label, value, sub, tone }] 형태의 배열
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <ul class="summary-list">
    <li v-for="item in items" :key="item.id" class="summary-row">
      <!-- [문법] :class 배열 형식 — 고정 클래스 + 동적으로 조립한 클래스 -->
      <span class="summary-badge" :class="['tone-' + item.tone]">{{ item.icon }}</span>
      <div class="summary-text">
        <p class="summary-label">{{ item.label }}</p>
        <p class="summary-value">{{ item.value }}</p>
        <p class="summary-sub">{{ item.sub }}</p>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.summary-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.summary-row {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 13px 0;
  border-bottom: 1px solid #f0f4fa;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 11px;
  font-size: 17px;
}

/* 항목별 배경색 */
.tone-hot {
  background: #fff0ec;
}
.tone-cold {
  background: #eaf3ff;
}
.tone-avg {
  background: #f0edff;
}
.tone-count {
  background: #fff0ec;
}
.tone-gap {
  background: #f3f0ff;
}
.tone-rain {
  background: #e6f3ff;
}

.summary-text {
  line-height: 1.32;
}

.summary-label {
  margin: 0;
  font-size: 12px;
  color: #8899ad;
}

.summary-value {
  margin: 2px 0;
  font-size: 20px;
  font-weight: 800;
}

.summary-sub {
  margin: 0;
  font-size: 12px;
  color: #8899ad;
}
</style>
