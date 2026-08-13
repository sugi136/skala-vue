<script setup>
// ============================================
// src/components/exercise/KoreaMap.vue
//
// [역할] 전국 지역의 현재 날씨를 지도 위에 표시하고,
//        선택한 지역의 카드를 지도 옆에 연결선과 함께 띄운다.
//
// [원리] OpenWeather 응답에 좌표(lat/lon)가 들어 있으므로
//        별도 지도 라이브러리 없이 SVG 에 직접 투영한다.
//        한반도 정도의 좁은 범위에서는 선형 변환으로 충분하다.
//
//          x = (경도 - 최소경도) / 경도폭 * 화면 너비
//          y = (최대위도 - 위도) / 위도폭 * 화면 높이
//
//        [주의] y 는 뒤집는다. 위도는 위로 갈수록 커지지만
//               SVG 좌표는 아래로 갈수록 커지기 때문이다.
// ============================================
import { computed } from 'vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { useConfigStore } from '@/stores/configStore.js'
import { useFavoriteStore } from '@/stores/favoriteStore.js'
import { getIconUrl } from '@/api/weatherApi.js'

const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()

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

const emit = defineEmits(['select-city', 'click-detail'])

// --------------------------------------------
// 투영 설정 — 남한이 화면에 꽉 차도록 잡은 좌표 범위
// --------------------------------------------
const BOUNDS = { minLon: 125.5, maxLon: 130.0, minLat: 33.0, maxLat: 38.7 }
const SIZE = { width: 520, height: 690 }

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

// 선택된 지역의 마커 정보 (카드 위치 계산에 사용)
const selectedMarker = computed(() =>
  markers.value.find((marker) => marker.id === props.selectedId),
)

// --------------------------------------------
// 카드 배치
//
// [설계] 마커가 지도 중앙보다 왼쪽이면 카드를 왼쪽 여백에,
//        오른쪽이면 오른쪽 여백에 띄운다.
//        마커와 카드가 겹치지 않고, 시선 이동이 자연스럽다.
// --------------------------------------------
const cardSide = computed(() => {
  if (!selectedMarker.value) return 'right'
  return selectedMarker.value.x < SIZE.width / 2 ? 'left' : 'right'
})

// [핵심] 위치를 % 로 계산해야 지도가 축소돼도 카드가 마커를 따라간다.
//        px 로 잡으면 반응형에서 어긋난다.
const cardTopPercent = computed(() => {
  if (!selectedMarker.value) return 50
  return (selectedMarker.value.y / SIZE.height) * 100
})

// 연결선 — 마커에서 지도 가장자리까지 그린다.
// 카드는 그 가장자리 근처에 붙으므로 선이 이어져 보인다.
const connector = computed(() => {
  if (!selectedMarker.value) return null
  return {
    x1: selectedMarker.value.x,
    y1: selectedMarker.value.y,
    x2: cardSide.value === 'left' ? 0 : SIZE.width,
    y2: selectedMarker.value.y,
  }
})

// --------------------------------------------
// 기온 구간별 색상
// 지도에서 한눈에 더운 곳/서늘한 곳이 구분되도록 5단계로 나눈다
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
  <div class="map-stage">
    <!-- 지도 본체 — 카드는 이 프레임을 기준으로 바깥에 배치된다 -->
    <div class="map-frame">
      <svg :viewBox="`0 0 ${SIZE.width} ${SIZE.height}`" class="korea-map" role="img">
        <!-- 본토 외곽선 -->
        <polygon :points="mainlandPoints" class="land" />

        <!-- 제주도 -->
        <ellipse :cx="jejuPos.x" :cy="jejuPos.y" rx="24" ry="13" class="land" />

        <!-- 선택된 지역과 카드를 잇는 연결선 -->
        <line
          v-if="connector"
          :x1="connector.x1"
          :y1="connector.y1"
          :x2="connector.x2"
          :y2="connector.y2"
          class="connector"
        />

        <!-- 지역 마커 -->
        <g
          v-for="city in markers"
          :key="city.id"
          class="marker"
          :class="{ 'is-selected': city.id === selectedId }"
          @click="emit('select-city', city)"
        >
          <!-- 선택된 지역은 바깥에 링을 하나 더 그린다 -->
          <circle
            v-if="city.id === selectedId"
            :cx="city.x"
            :cy="city.y"
            r="21"
            class="marker-ring"
          />

          <!-- 아이콘 배경 — 흰 원에 기온 색 테두리 -->
          <circle :cx="city.x" :cy="city.y" r="15" class="marker-dot" :class="['t-' + city.tone]" />

          <!-- 날씨 아이콘 -->
          <image
            :href="getIconUrl(city.icon)"
            :x="city.x - 14"
            :y="city.y - 14"
            width="28"
            height="28"
            class="marker-icon"
          />

          <!-- 아이콘 하단에 기온 -->
          <text :x="city.x" :y="city.y + 29" class="marker-temp" :class="['tt-' + city.tone]">
            {{ configStore.convertTemp(city.temp) }}°
          </text>

          <!-- 지역명 -->
          <text :x="city.x" :y="city.y + 42" class="marker-name">{{ city.name }}</text>

          <!-- 즐겨찾기 표시 — 원의 오른쪽 위에 살짝 겹치게 배치한다.
               [문법] SVG 는 나중에 그린 요소가 위에 온다.
                      마커 원보다 뒤에 두어야 별이 가려지지 않는다. -->
          <g v-if="favoriteStore.isFavorite(city.id)" class="marker-fav">
            <circle :cx="city.x + 12" :cy="city.y - 12" r="7" class="fav-bg" />
            <text :x="city.x + 12" :y="city.y - 9" class="fav-star">★</text>
          </g>
        </g>
      </svg>

      <!-- 선택 지역 카드 — 마커와 같은 높이, 지도 바깥 여백에 배치 -->
      <div
        v-if="selectedMarker"
        class="info-card"
        :class="['side-' + cardSide]"
        :style="{ top: cardTopPercent + '%' }"
      >
        <WeatherCard
          :city="selectedMarker"
          is-selected
          @select-card="emit('select-city', selectedMarker)"
          @click-detail="emit('click-detail', selectedMarker)"
        />
      </div>
    </div>

    <!-- 범례 -->
    <div class="legend">
      <span class="legend-title">기온</span>
      <div v-for="item in LEGEND" :key="item.tone" class="legend-item">
        <span class="legend-dot" :class="['t-' + item.tone]"></span>
        <span class="legend-label">{{ item.label }}</span>
      </div>
    </div>

    <p class="map-hint">지도의 지역을 클릭하면 상세 정보가 표시됩니다.</p>
  </div>
</template>

<style scoped>
.map-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 지도 프레임 — 카드가 이 요소 기준으로 바깥에 배치된다 */
.map-frame {
  position: relative;
  width: min(680px, 100%);
}

.korea-map {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

/* 육지 */
.land {
  fill: #e8f0fc;
  stroke: #b9d0ee;
  stroke-width: 1.5;
  stroke-linejoin: round;
}

/* ===== 연결선 ===== */
.connector {
  stroke: #5b9bf8;
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
  opacity: 0.7;
}

/* ===== 마커 ===== */
.marker {
  cursor: pointer;
}

.marker-dot {
  fill: #fff;
  stroke-width: 2.5;
  transition: filter 0.15s ease;
}

.marker:hover .marker-dot {
  filter: drop-shadow(0 2px 6px rgba(45, 90, 180, 0.3));
}

.marker-icon {
  pointer-events: none;
}

.marker-ring {
  fill: none;
  stroke: #2f6fe4;
  stroke-width: 2.5;
  opacity: 0.8;
}

/* 기온 구간별 테두리 색 — 파랑(서늘) → 빨강(더움) */
.t-lv1 {
  stroke: #7eb3e8;
}
.t-lv2 {
  stroke: #8fc9a8;
}
.t-lv3 {
  stroke: #f0c65c;
}
.t-lv4 {
  stroke: #ef9a5a;
}
.t-lv5 {
  stroke: #e2695f;
}

/* 기온 글자 색 — 테두리와 같은 계열 */
.marker-temp {
  font-size: 12px;
  font-weight: 800;
  text-anchor: middle;
  pointer-events: none;
}
.tt-lv1 {
  fill: #4a86c4;
}
.tt-lv2 {
  fill: #479c6d;
}
.tt-lv3 {
  fill: #c39320;
}
.tt-lv4 {
  fill: #d1712c;
}
.tt-lv5 {
  fill: #c94a40;
}

.marker-name {
  font-size: 10.5px;
  font-weight: 600;
  fill: #6b7a90;
  text-anchor: middle;
  pointer-events: none;
}

/* ===== 즐겨찾기 별 ===== */
.marker-fav {
  pointer-events: none;
}

.fav-bg {
  fill: #fff;
  stroke: #f5b731;
  stroke-width: 1.5;
}

.fav-star {
  font-size: 9px;
  fill: #f5b731;
  text-anchor: middle;
}

/* ===== 선택 지역 카드 ===== */
.info-card {
  position: absolute;
  width: 240px;
  z-index: 2;
  /* 마커의 세로 중심에 맞춘다 */
  transform: translateY(-50%);
  animation: card-in 0.2s ease;
}

/* [비대칭 배치] 좌우 여건이 다르므로 오프셋을 따로 준다.
   왼쪽 : 패널 바깥으로 잘리므로 지도 위로 100px 겹쳐 안쪽으로 당긴다
   오른쪽 : 요약 패널을 너무 덮지 않도록 지도 위로 40px 겹친다.
            울산 마커는 지도 오른쪽 끝에서 100px 안쪽이라 가려지지 않는다 */
.info-card.side-left {
  right: calc(100% - 118px);
}

.info-card.side-right {
  left: calc(100% - 22px);
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(-50%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
}

/* ===== 범례 ===== */
.legend {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
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

/* SVG 가 아닌 div 이므로 stroke 대신 background 를 쓴다 */
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

/* ===== 반응형 =====
   폭이 좁으면 지도 옆에 카드를 놓을 공간이 없다.
   연결선을 숨기고 카드를 지도 아래로 내린다. */
@media (max-width: 1100px) {
  .info-card,
  .info-card.side-left,
  .info-card.side-right {
    position: static;
    width: min(300px, 100%);
    margin-top: 14px;
    transform: none;
  }

  .connector {
    display: none;
  }

  @keyframes card-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}
</style>
