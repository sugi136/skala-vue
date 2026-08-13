<script setup>
// ============================================
// src/components/exercise/SunArc.vue
//
// [역할] 일출·일몰을 반원 궤도로 그리고, 현재 시각의 해 위치를 표시한다.
//
// [원리] 일출~일몰 사이에서 지금이 몇 %쯤 지났는지 계산하고,
//        그 비율을 반원의 각도(180°→0°)로 변환해 좌표를 구한다.
//
//          x = 중심x + 반지름 × cos(각도)
//          y = 중심y − 반지름 × sin(각도)
//
//        [주의] SVG 는 y 가 아래로 커지므로 sin 값을 빼야 위로 올라간다.
// ============================================
import { computed } from 'vue'

const props = defineProps({
  // 'HH:MM' 형식
  sunrise: {
    type: String,
    required: true,
  },
  sunset: {
    type: String,
    required: true,
  },
})

// --------------------------------------------
// 궤도 설정
// --------------------------------------------
const CX = 110
const CY = 88
const R = 88

// 'HH:MM' -> 자정부터 흐른 분
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// --------------------------------------------
// 현재 진행도 (0 = 일출, 1 = 일몰)
// --------------------------------------------
const progress = computed(() => {
  const rise = toMinutes(props.sunrise)
  const set = toMinutes(props.sunset)

  const now = new Date()
  const current = now.getHours() * 60 + now.getMinutes()

  // 밤에는 궤도 밖이므로 양 끝으로 고정한다
  if (current <= rise) return 0
  if (current >= set) return 1

  return (current - rise) / (set - rise)
})

// 낮인지 여부 — 밤에는 해를 흐리게 표시한다
const isDaytime = computed(() => progress.value > 0 && progress.value < 1)

// --------------------------------------------
// 해의 좌표
// 진행도 0 -> 180°(왼쪽 끝), 진행도 1 -> 0°(오른쪽 끝)
// --------------------------------------------
const sunPos = computed(() => {
  const deg = 180 - progress.value * 180
  const rad = (deg * Math.PI) / 180

  return {
    x: CX + R * Math.cos(rad),
    // SVG 는 y 가 아래로 커지므로 빼준다
    y: CY - R * Math.sin(rad),
  }
})

// --------------------------------------------
// 반원 경로
// [문법] A rx ry 회전 큰호여부 방향 끝x 끝y
//        큰호여부 0 + 방향 1 = 시계 방향의 작은 호(= 반원 위쪽)
// --------------------------------------------
const arcPath = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`

// 지나온 구간만 진하게 칠하기 위한 경로
const passedPath = computed(() => {
  const { x, y } = sunPos.value

  // [주의] large-arc-flag 는 항상 0 이어야 한다.
  //        왼쪽 끝에서 해까지의 각도 차이는 최대 180°(반원)를 넘지 않으므로
  //        1 을 주면 SVG 가 반대쪽 큰 호를 그려 화면 밖으로 튀어나간다.
  return `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${x} ${y}`
})

// 남은 시간 안내
const remainLabel = computed(() => {
  const set = toMinutes(props.sunset)
  const now = new Date()
  const current = now.getHours() * 60 + now.getMinutes()

  if (current >= set) return '일몰 후'
  if (progress.value === 0) return '일출 전'

  const diff = set - current
  const h = Math.floor(diff / 60)
  const m = diff % 60

  return h > 0 ? `일몰까지 ${h}시간 ${m}분` : `일몰까지 ${m}분`
})
</script>

<template>
  <div class="sun-arc">
    <svg viewBox="0 0 220 118" class="arc-svg" role="img">
      <!-- 지평선 -->
      <line :x1="CX - R - 8" :y1="CY" :x2="CX + R + 8" :y2="CY" class="horizon" />

      <!-- 전체 궤도 -->
      <path :d="arcPath" class="arc-track" />

      <!-- 지나온 궤도 -->
      <path :d="passedPath" class="arc-passed" />

      <!-- 해 -->
      <circle :cx="sunPos.x" :cy="sunPos.y" r="9" class="sun" :class="{ 'is-night': !isDaytime }" />
      <circle
        :cx="sunPos.x"
        :cy="sunPos.y"
        r="14"
        class="sun-glow"
        :class="{ 'is-night': !isDaytime }"
      />
    </svg>

    <div class="arc-times">
      <div class="time-item">
        <p class="time-label">🌅 일출</p>
        <p class="time-value">{{ sunrise }}</p>
      </div>

      <p class="remain">{{ remainLabel }}</p>

      <div class="time-item">
        <p class="time-label">🌇 일몰</p>
        <p class="time-value">{{ sunset }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sun-arc {
  display: flex;
  flex-direction: column;
  padding: 14px 12px 12px;
  background: #fbfcff;
  border: 1px solid #e6edf9;
  border-radius: 13px;
}

.arc-svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.horizon {
  stroke: #dbe4f2;
  stroke-width: 1.5;
}

.arc-track {
  fill: none;
  stroke: #e2e9f5;
  stroke-width: 3;
  stroke-dasharray: 4 5;
  stroke-linecap: round;
}

.arc-passed {
  fill: none;
  stroke: #f5b731;
  stroke-width: 3;
  stroke-linecap: round;
}

.sun {
  fill: #f5a623;
}

.sun-glow {
  fill: #f5a623;
  opacity: 0.22;
}

/* 밤에는 해를 흐리게 */
.sun.is-night,
.sun-glow.is-night {
  fill: #9aa8bd;
}

/* ===== 시각 표시 ===== */
.arc-times {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 6px;
  margin-top: 4px;
}

.time-item {
  text-align: center;
}

.time-label {
  margin: 0;
  font-size: 11px;
  color: #8899ad;
}

.time-value {
  margin: 2px 0 0;
  font-size: 16px;
  font-weight: 800;
  color: #253858;
}

.remain {
  margin: 0 0 2px;
  font-size: 11px;
  color: #9aa8bd;
}
</style>
