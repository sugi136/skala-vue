<script setup>
// ============================================
// src/components/exercise/ForecastStrip.vue
//
// [역할] 5일 예보를 가로 스트립으로 표시
//
// [핵심] 이 컴포넌트는 어느 도시의 예보인지 모른다.
//        배열만 받아서 그리므로 메인 화면과 상세 페이지 양쪽에서
//        수정 없이 재사용할 수 있다. (4장 컴포넌트 분리의 효과)
//
// [7장] items 에 들어오는 데이터가 /forecast 응답 가공 결과로 바뀐다.
//       이 컴포넌트 자체는 수정할 필요가 없다.
// ============================================

defineProps({
  // [{ id, day, date, icon, high, low }] 형태의 배열
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <!-- [핵심] 데이터가 없을 때의 처리를 컴포넌트 안에서 담당한다.
       부모가 매번 v-if 를 쓰지 않아도 된다. -->
  <p v-if="items.length === 0" class="forecast-empty">예보 정보를 불러올 수 없습니다.</p>

  <div v-else class="forecast-strip">
    <div v-for="day in items" :key="day.id" class="forecast-item">
      <p class="forecast-day">{{ day.day }}</p>
      <p class="forecast-date">{{ day.date }}</p>
      <div class="forecast-icon">{{ day.icon }}</div>
      <p class="forecast-high">{{ day.high }}°</p>
      <p class="forecast-low">{{ day.low }}°</p>
    </div>
  </div>
</template>

<style scoped>
.forecast-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border: 1px solid #e9eff9;
  border-radius: 12px;
  overflow: hidden;
}

.forecast-item {
  padding: 18px 6px;
  text-align: center;
  background: #fbfcff;
  border-right: 1px solid #eef2f8;
  transition: background 0.15s ease;
}

.forecast-item:last-child {
  border-right: none;
}

.forecast-item:hover {
  background: #f2f6fd;
}

/* 오늘(첫 번째 칸)만 살짝 강조 */
.forecast-item:first-child {
  background: #eef4ff;
}

.forecast-day {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}

.forecast-date {
  margin: 3px 0 0;
  font-size: 11px;
  color: #9aa8bd;
}

.forecast-icon {
  margin: 14px 0 10px;
  font-size: 30px;
  line-height: 1;
}

.forecast-high {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
}

.forecast-low {
  margin: 2px 0 0;
  font-size: 13px;
  color: #6ba4e8;
}

.forecast-empty {
  margin: 0;
  padding: 30px 0;
  text-align: center;
  font-size: 14px;
  color: #94a3b8;
}

@media (max-width: 560px) {
  .forecast-strip {
    grid-template-columns: repeat(3, 1fr);
  }
  .forecast-item:nth-child(n + 4) {
    border-top: 1px solid #eef2f8;
  }
}
</style>
