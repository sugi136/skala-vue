<script setup>
// ============================================
// src/components/exercise/WeatherAlert.vue
//
// [역할] 기상특보를 배너 형태로 표시
//
// [핵심] 특보는 평소에 없는 것이 정상이므로,
//        데이터가 없으면 아무것도 렌더링하지 않는다.
//        부모가 v-if 를 쓰지 않아도 되도록 이 컴포넌트가 스스로 판단한다.
//
// [예정] 공공데이터포털 기상청_기상특보 조회서비스 응답으로 대체된다.
// ============================================

defineProps({
  // [{ id, type, level, title, message, issuedAt }] 형태의 배열
  items: {
    type: Array,
    default: () => [],
  },
})

// 특보 종류별 아이콘
// [문법] 객체를 조회 테이블로 쓰면 if 문을 길게 늘어놓지 않아도 된다
const ALERT_ICON = {
  폭염: '🔥',
  한파: '🥶',
  호우: '🌧️',
  대설: '❄️',
  강풍: '💨',
  풍랑: '🌊',
  태풍: '🌀',
  건조: '🍂',
  안개: '🌫️',
  황사: '😷',
  폭풍해일: '🌊',
  지진해일: '🌊',
}

// [문법] ?? — 정의되지 않은 특보 종류는 기본 아이콘 사용
const getIcon = (type) => ALERT_ICON[type] ?? '⚠️'
</script>

<template>
  <!-- 특보가 없으면 이 컴포넌트는 아무것도 그리지 않는다 -->
  <div v-if="items.length > 0" class="alert-list">
    <!-- [문법] :class 배열 — level 에 따라 주의보/경보 색을 다르게 -->
    <div
      v-for="alert in items"
      :key="alert.id"
      class="alert-banner"
      :class="['level-' + alert.level]"
    >
      <span class="alert-icon">{{ getIcon(alert.type) }}</span>

      <div class="alert-body">
        <div class="alert-head">
          <strong class="alert-title">{{ alert.title }}</strong>
          <span class="alert-badge">{{ alert.level === 'alert' ? '경보' : '주의보' }}</span>
          <span class="alert-time">{{ alert.issuedAt }} 발표</span>
        </div>
        <p class="alert-message">{{ alert.message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.alert-banner {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 14px;
  border-left: 5px solid;
}

/* 주의보 — 주황 계열 */
.alert-banner.level-warning {
  background: #fff7ec;
  border-color: #f0a63c;
  color: #8a5a12;
}

/* 경보 — 빨강 계열 (더 강한 경고) */
.alert-banner.level-alert {
  background: #fdefee;
  border-color: #d94f4f;
  color: #922f2f;
}

.alert-icon {
  font-size: 26px;
  line-height: 1.2;
  flex-shrink: 0;
}

.alert-body {
  flex: 1;
}

.alert-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.alert-title {
  font-size: 16px;
  font-weight: 800;
}

.alert-badge {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
}

.level-warning .alert-badge {
  background: #f0a63c;
}

.level-alert .alert-badge {
  background: #d94f4f;
}

.alert-time {
  font-size: 12px;
  opacity: 0.75;
}

.alert-message {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.92;
}

@media (max-width: 520px) {
  .alert-banner {
    padding: 14px 16px;
  }
  .alert-icon {
    font-size: 22px;
  }
}
</style>
