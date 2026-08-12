<script setup>
// ============================================
// src/components/exercise/HourlyStrip.vue
// [역할] 24시간 시간대별 예보를 가로 스트립으로 표시 (3시간 간격 8칸)
// [핵심] ForecastStrip 과 마찬가지로 "어느 도시인지" 모른다.
//        배열만 받아 그리므로 어느 페이지에서든 재사용할 수 있다.
// [예정] /forecast 응답의 list 배열 앞 8개를 그대로 넘기면 된다.
//       5일 예보와 달리 날짜별로 묶는 가공이 필요 없다.
// ============================================
import { useConfigStore } from '@/stores/configStore.js'

const configStore = useConfigStore()

defineProps({
  // [{ id, time, icon, temp, pop }] 형태의 배열
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <p v-if="items.length === 0" class="hourly-empty">시간대별 예보를 불러올 수 없습니다.</p>

  <div v-else class="hourly-strip">
    <div v-for="hour in items" :key="hour.id" class="hourly-item">
      <p class="hourly-time">{{ hour.time }}</p>
      <div class="hourly-icon">{{ hour.icon }}</div>
      <!-- store 의 변환 함수를 거쳐 단위 설정을 따른다 -->
      <p class="hourly-temp">{{ configStore.convertTemp(hour.temp) }}°</p>

      <!-- [핵심] 강수확률이 0인 시간은 표시하지 않는다.
           비 올 가능성이 있을 때만 눈에 띄게 하기 위함 -->
      <p v-if="hour.pop > 0" class="hourly-pop">💧 {{ hour.pop }}%</p>
      <p v-else class="hourly-pop placeholder">—</p>
    </div>
  </div>
</template>

<style scoped>
.hourly-strip {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  border: 1px solid #e9eff9;
  border-radius: 12px;
  overflow: hidden;
}

.hourly-item {
  padding: 16px 6px;
  text-align: center;
  background: #fbfcff;
  border-right: 1px solid #eef2f8;
  transition: background 0.15s ease;
}

.hourly-item:last-child {
  border-right: none;
}

.hourly-item:hover {
  background: #f2f6fd;
}

/* 첫 칸(지금)만 강조 */
.hourly-item:first-child {
  background: #eef4ff;
}

.hourly-time {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #5a6b82;
}

.hourly-icon {
  margin: 10px 0 8px;
  font-size: 26px;
  line-height: 1;
}

.hourly-temp {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
}

.hourly-pop {
  margin: 6px 0 0;
  font-size: 11px;
  font-weight: 600;
  color: #4a90e2;
}

/* 강수확률 0%일 때 — 자리만 차지해 높이를 맞춘다 */
.hourly-pop.placeholder {
  color: #d5dde8;
  font-weight: 400;
}

.hourly-empty {
  margin: 0;
  padding: 30px 0;
  text-align: center;
  font-size: 14px;
  color: #94a3b8;
}

@media (max-width: 900px) {
  .hourly-strip {
    grid-template-columns: repeat(4, 1fr);
  }
  .hourly-item:nth-child(n + 5) {
    border-top: 1px solid #eef2f8;
  }
}
</style>
