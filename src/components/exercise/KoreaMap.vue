<script setup>
// ============================================
// src/components/exercise/KoreaMap.vue
//
// [역할] 전국 지역의 현재 기온을 지도 위에 표시한다.
//
// [원리] OpenWeather 응답에 좌표(lat/lon)가 들어 있으므로
//        별도 지도 라이브러리 없이 SVG 에 직접 투영한다.
//
//        한반도 정도의 좁은 범위에서는 선형 변환으로 충분하다.
//        (지구 곡률을 고려한 정식 투영은 대륙 단위에서나 필요하다)
//
//          x = (경도 - 최소경도) / (경도 폭) * 화면 너비
//          y = (최대위도 - 위도) / (위도 폭) * 화면 높이
//
//        [주의] y 는 뒤집는다. 위도는 위로 갈수록 커지지만
//               SVG 좌표는 아래로 갈수록 커지기 때문이다.
// ============================================
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore.js'

const configStore = useConfigStore()

const props = defineProps({
  // [{ id, name, temp, icon, lat, lon, status }] 형태
  cities: {
    type: Array,
    required: true,
  },
  selectedId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['select-city'])

// --------------------------------------------
// 투영 설정
// 남한이 화면에 꽉 차도록 잡은 좌표 범위
// --------------------------------------------
const BOUNDS = { minLon: 125.5, maxLon: 130.0, minLat: 33.0, maxLat: 38.7 }
const SIZE = { width: 420, height: 520 }

const project = (lon, lat) => ({
  x: ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * SIZE.width,
  // 위도는 클수록 북쪽(위) -> SVG y 는 작아야 하므로 뒤집는다
  y: ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * SIZE.height,
})

// --------------------------------------------
// 남한 외곽선 (간략화)
// 실제 행정경계 데이터는 수십 KB 라 무겁다.
// 형태만 알아볼 수 있게 주요 지점만 잡아 다각형으로 그린다.
// --------------------------------------------
const MAINLAND_COORDS = [
  [126.7, 37.95],
  [127.4, 38.3],
  [128.4, 38.6],
  [129.0, 37.5],
  [129.45, 36.0],
  [129.5, 35.5],
  [129.1, 35.05],
  [128.4, 34.85],
  [127.7, 34.7],
  [126.9, 34.3],
  [126.35, 34.6],
  [126.3, 35.5],
  [126.6, 36.0],
  [126.35, 36.75],
  [126.85, 37.35],
  [126.7, 37.95],
]

// [문법] map 으로 각 좌표를 화면 좌표로 바꾸고 join 으로 SVG points 문자열 조립
const mainlandPoints = computed(() =>
  MAINLAND_COORDS.map(([lon, lat]) => {
    const { x, y } = project(lon, lat)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' '),
)

// 제주도 — 본토와 떨어져 있으므로 타원으로 따로 그린다
const jejuPos = computed(() => project(126.55, 33.4))

// --------------------------------------------
// 지역 마커
// [주의] 검색으로 추가한 해외 도시는 좌표가 범위 밖이므로 제외한다
// --------------------------------------------
const markers = computed(() =>
  props.cities
    .filter(
      (city) =>
        city.lon >= BOUNDS.minLon &&
        city.lon <= BOUNDS.maxLon &&
        city.lat >= BOUNDS.minLat &&
        city.lat <= BOUNDS.maxLat,
    )
    .map((city) => ({
      ...city,
      ...project(city.lon, city.lat),
      tone: tempTone(city.temp),
    })),
)

// --------------------------------------------
// 기온 구간별 색상
// 지도에서 한눈에 더운 곳/추운 곳이 구분되도록 5단계로 나눈다
// --------------------------------------------
function tempTone(temp) {
  if (temp >= 30) return 'lv5'
  if (temp >= 27) return 'lv4'
  if (temp >= 24) return 'lv3'
  if (temp >= 20) return 'lv2'
  return 'lv1'
}

const LEGEND = [
  { tone: 'lv1', label: '20°↓' },
  { tone: 'lv2', label: '20°' },
  { tone: 'lv3', label: '24°' },
  { tone: 'lv4', label: '27°' },
  { tone: 'lv5', label: '30°↑' },
]
</script>

<template>
  <div class="map-area">
    <svg :viewBox="`0 0 ${SIZE.width} ${SIZE.height}`" class="korea-map" role="img">
      <!-- 본토 외곽선 -->
      <polygon :points="mainlandPoints" class="land" />

      <!-- 제주도 -->
      <ellipse :cx="jejuPos.x" :cy="jejuPos.y" rx="22" ry="12" class="land" />

      <!-- 지역 마커 -->
      <g
        v-for="city in markers"
        :key="city.id"
        class="marker"
        :class="[{ 'is-selected': city.id === selectedId }]"
        @click="emit('select-city', city)"
      >
        <!-- 선택된 지역은 바깥에 링을 하나 더 그린다 -->
        <circle
          v-if="city.id === selectedId"
          :cx="city.x"
          :cy="city.y"
          r="20"
          class="marker-ring"
        />

        <circle :cx="city.x" :cy="city.y" r="15" class="marker-dot" :class="['t-' + city.tone]" />

        <!-- 기온 숫자 -->
        <text :x="city.x" :y="city.y + 4" class="marker-temp">
          {{ configStore.convertTemp(city.temp) }}
        </text>

        <!-- 지역명 -->
        <text :x="city.x" :y="city.y + 30" class="marker-name">{{ city.name }}</text>
      </g>
    </svg>

    <!-- 범례 -->
    <div class="legend">
      <span class="legend-title">기온</span>
      <div v-for="item in LEGEND" :key="item.tone" class="legend-item">
        <span class="legend-dot" :class="['t-' + item.tone]"></span>
        <span class="legend-label">{{ item.label }}</span>
      </div>
    </div>

    <p class="map-hint">지도의 지역을 클릭하면 해당 지역이 선택됩니다.</p>
  </div>
</template>

<style scoped>
.map-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.korea-map {
  width: 100%;
  max-width: 420px;
  height: auto;
}

/* 육지 */
.land {
  fill: #e8f0fc;
  stroke: #b9d0ee;
  stroke-width: 1.5;
  stroke-linejoin: round;
}

/* ===== 마커 ===== */
.marker {
  cursor: pointer;
}

.marker-dot {
  stroke: #fff;
  stroke-width: 2;
  transition:
    r 0.15s ease,
    filter 0.15s ease;
}

.marker:hover .marker-dot {
  filter: brightness(1.08);
}

.marker-ring {
  fill: none;
  stroke: #2f6fe4;
  stroke-width: 2.5;
  opacity: 0.75;
}

/* 기온 구간별 색 — 파랑(서늘) → 빨강(더움) */
.t-lv1 {
  fill: #7eb3e8;
}
.t-lv2 {
  fill: #8fc9a8;
}
.t-lv3 {
  fill: #f0c65c;
}
.t-lv4 {
  fill: #ef9a5a;
}
.t-lv5 {
  fill: #e2695f;
}

.marker-temp {
  font-size: 12px;
  font-weight: 800;
  fill: #fff;
  text-anchor: middle;
  pointer-events: none;
}

.marker-name {
  font-size: 11px;
  font-weight: 600;
  fill: #4a5b73;
  text-anchor: middle;
  pointer-events: none;
}

/* ===== 범례 ===== */
.legend {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  padding: 8px 14px;
  background: #f7f9fd;
  border-radius: 999px;
}

.legend-title {
  font-size: 11px;
  font-weight: 700;
  color: #8899ad;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

/* SVG 가 아닌 div 이므로 fill 대신 background 를 쓴다 */
.legend-dot.t-lv1 {
  background: #7eb3e8;
}
.legend-dot.t-lv2 {
  background: #8fc9a8;
}
.legend-dot.t-lv3 {
  background: #f0c65c;
}
.legend-dot.t-lv4 {
  background: #ef9a5a;
}
.legend-dot.t-lv5 {
  background: #e2695f;
}

.legend-label {
  font-size: 11px;
  color: #6b7a90;
}

.map-hint {
  margin: 10px 0 0;
  font-size: 12px;
  color: #9aa8bd;
}
</style>
