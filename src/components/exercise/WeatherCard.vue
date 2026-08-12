<script setup>
// ============================================
// 4장 Hands on : WeatherCard.vue
//
// [역할] 도시 하나의 날씨를 표시하는 카드
//
// [핵심] 카드는 "표시"와 "알림"만 담당한다.
//        어떤 도시가 선택됐는지, 상세보기를 누르면 무슨 일이 벌어지는지는
//        전부 부모가 결정한다. -> 재사용 가능한 컴포넌트가 된다.
// ============================================

// --------------------------------------------
// [Props] 부모 -> 자식
// --------------------------------------------
defineProps({
  // 도시 객체 하나 { id, name, temp, status, icon }
  city: {
    type: Object,
    required: true,
  },
  // 이 카드가 현재 선택된 상태인지 여부
  isSelected: {
    type: Boolean,
    default: false,
  },
})

// --------------------------------------------
// [Emits] 자식 -> 부모
//   select-card  : 카드 전체 클릭
//   click-detail : 상세보기 버튼 클릭
// --------------------------------------------
const emit = defineEmits(['select-card', 'click-detail'])
</script>

<template>
  <!-- [핵심] :class 객체 바인딩 — 부모가 내려준 isSelected 로 강조 여부 결정 -->
  <div
    class="weather-card"
    :class="{ 'is-selected': isSelected }"
    @click="emit('select-card', city)"
  >
    <div class="card-icon">{{ city.icon }}</div>

    <div class="card-main">
      <h4 class="card-name">
        {{ city.name }} <span class="card-status">({{ city.status }})</span>
      </h4>
      <p class="card-temp">
        현재 기온: <strong>{{ city.temp }}°C</strong>
      </p>

      <!-- [2장 문법 유지] v-if / v-else — 기온에 따라 다른 배지 -->
      <span v-if="city.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
      <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>
    </div>

    <!-- [핵심] @click.stop — 부모 카드의 select-card 까지 함께 발생하는 것을 차단 -->
    <button class="btn-detail" @click.stop="emit('click-detail', city)">상세보기</button>
  </div>
</template>

<style scoped>
/* [요구사항 5] WeatherCard 에 해당하는 디자인만 여기에 격리 */
.weather-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  margin-bottom: 12px;
  background: #fbfcff;
  border: 1px solid #e6edf9;
  border-radius: 14px;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.weather-card:last-child {
  margin-bottom: 0;
}

.weather-card:hover {
  transform: translateY(-2px);
  border-color: #b9d3fb;
  box-shadow: 0 8px 18px rgba(45, 90, 180, 0.14);
}

.weather-card.is-selected {
  border-color: var(--sky-top, #4a90f0);
  background: #fff;
  box-shadow: 0 0 0 2px rgba(74, 144, 240, 0.2);
}

.card-icon {
  font-size: 42px;
  line-height: 1;
  flex-shrink: 0;
}

.card-main {
  flex: 1;
}

.card-name {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.card-status {
  font-size: 13px;
  font-weight: 500;
  color: #7b8a9f;
}

.card-temp {
  margin: 5px 0 10px;
  font-size: 14px;
  color: #5a6b82;
}

.card-temp strong {
  font-size: 20px;
  font-weight: 800;
  color: #253858;
}

.badge {
  display: inline-block;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.badge.hot {
  background: #fff0ec;
  color: #e0603a;
}

.badge.cool {
  background: #eaf3ff;
  color: #3a7ad4;
}

.btn-detail {
  flex-shrink: 0;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: #5b9bf8;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-detail:hover {
  background: #4287ef;
}
</style>
