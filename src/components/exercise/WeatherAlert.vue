<script setup>
// ============================================
// src/components/exercise/WeatherAlert.vue
//
// [변경] 직접 만든 배너 -> <el-alert>
//
//   경고 UI 는 라이브러리가 잘 만들어 둔 대표적인 영역이다.
//   type 속성 하나로 색상·아이콘·접근성 속성이 함께 적용된다.
//     warning(주의보) -> 주황 계열
//     error(경보)     -> 빨강 계열
//
// [핵심] 특보는 평소에 없는 것이 정상이므로,
//        데이터가 없으면 아무것도 렌더링하지 않는다.
//        부모가 v-if 를 쓰지 않아도 되도록 이 컴포넌트가 스스로 판단한다.
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

// level 을 Element Plus 의 type 값으로 변환한다
const toElType = (level) => (level === 'alert' ? 'error' : 'warning')
</script>

<template>
  <div v-if="items.length > 0" class="alert-list">
    <el-alert
      v-for="alert in items"
      :key="alert.id"
      :type="toElType(alert.level)"
      :closable="false"
      show-icon
    >
      <!-- [문법] el-alert 의 title 슬롯 — 문자열 대신 마크업을 넣을 때 사용 -->
      <template #title>
        <div class="alert-head">
          <span class="alert-emoji">{{ getIcon(alert.type) }}</span>
          <strong class="alert-title">{{ alert.title }}</strong>
          <el-tag :type="toElType(alert.level)" size="small" effect="dark" round>
            {{ alert.level === 'alert' ? '경보' : '주의보' }}
          </el-tag>
          <span v-if="alert.issuedAt" class="alert-time">{{ alert.issuedAt }} 발표</span>
        </div>
      </template>

      <p class="alert-message">{{ alert.message }}</p>
    </el-alert>
  </div>
</template>

<style scoped>
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.alert-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.alert-emoji {
  font-size: 17px;
}

.alert-title {
  font-size: 15px;
  font-weight: 800;
}

.alert-time {
  font-size: 12px;
  opacity: 0.75;
}

.alert-message {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

/* Element Plus 기본값보다 여백을 조금 넉넉하게 */
:deep(.el-alert) {
  padding: 14px 18px;
  border-radius: 14px;
}
</style>
