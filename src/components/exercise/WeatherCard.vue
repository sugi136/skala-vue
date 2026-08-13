<script setup>
// ============================================
// src/components/exercise/WeatherCard.vue
//
// [레이아웃] 가로 한 줄에서 세로 3단으로 변경
//   1단  지역명 + 상태 배지 + 즐겨찾기 별
//   2단  날씨 설명
//   3단  아이콘 + 기온 + 상세보기
//   4단  기온 배지
//
//   [이유] 가로 배치는 카드 폭이 좁아지면 날씨 설명이
//          글자 단위로 쪼개져 읽기 어려웠다.
//          세로로 나누면 각 줄이 카드 폭을 온전히 쓸 수 있다.
// ============================================
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore.js'
import { useFavoriteStore } from '@/stores/favoriteStore.js'
import { useWeatherStore } from '@/stores/weatherStore.js'
import { getIconUrl } from '@/api/weatherApi.js'
// [Element Plus] 아이콘은 컴포넌트로 제공되므로 개별 import 가 필요하다
import { Star, StarFilled } from '@element-plus/icons-vue'

const props = defineProps({
  city: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])

const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()
const weatherStore = useWeatherStore()

// --------------------------------------------
// 단위 변환
//
// [주의] script 안에서는 props.city 로 접근한다 (template 에서는 city 로 바로).
// [핵심] configStore.unit 이 바뀌면 이 computed 가 자동 재계산되어
//        화면의 모든 카드 온도가 한꺼번에 바뀐다.
// --------------------------------------------
const displayTemp = computed(() => configStore.convertTemp(props.city.temp))

// 더움/선선함 판정은 항상 섭씨 원본으로 한다.
// [주의] 화씨로 변환된 값(82 등)으로 25 와 비교하면 전부 "더움"이 된다.
const isHot = computed(() => props.city.temp >= 25)

// 기상특보 발효 여부 — 카드에는 배지만 표시하고
// 자세한 내용은 상세 페이지에서 확인하도록 한다
const hasWeatherAlert = computed(() => weatherStore.findAlerts(props.city.id).length > 0)

const isFavorite = computed(() => favoriteStore.isFavorite(props.city.id))

// 별 클릭 — store 의 action 을 직접 호출
// [핵심] 부모에게 emit 하지 않는다. 전역 상태이므로 어느 컴포넌트에서 바꾸든
//        같은 store 를 보는 모든 화면이 함께 갱신된다.
const handleToggleFavorite = () => {
  // 검색으로 추가된 도시는 regionList 에 없으므로 객체를 통째로 넘긴다
  favoriteStore.toggleFavorite(props.city)
}
</script>

<template>
  <div
    class="weather-card"
    :class="{ 'is-selected': isSelected }"
    @click="emit('select-card', city)"
  >
    <!-- 1단 — 지역명 + 상태 배지 + 즐겨찾기 -->
    <div class="card-head">
      <h4 class="card-name">{{ city.name }}</h4>

      <div class="card-tags">
        <span v-if="city.isCurrentLocation" class="mini-badge location" title="현재 위치">📍</span>
        <span v-if="city.isSearched" class="mini-badge searched" title="검색으로 추가됨">검색</span>
        <el-tag v-if="hasWeatherAlert" type="warning" size="small" effect="light" round>
          ⚠️ 특보
        </el-tag>
      </div>

      <!-- [Element Plus] link 속성으로 배경 없는 아이콘 버튼을 만든다 -->
      <el-button
        class="btn-star"
        :class="{ active: isFavorite }"
        link
        :title="isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'"
        @click.stop="handleToggleFavorite"
      >
        <el-icon :size="20">
          <StarFilled v-if="isFavorite" />
          <Star v-else />
        </el-icon>
      </el-button>
    </div>

    <!-- 2단 — 날씨 설명 -->
    <p class="card-status">{{ city.status }}</p>

    <!-- 3단 — 아이콘 + 기온 + 상세보기 -->
    <div class="card-body">
      <img class="card-icon" :src="getIconUrl(city.icon)" :alt="city.status" />

      <p class="card-temp">
        {{ displayTemp }}<span class="temp-unit">{{ configStore.unitSymbol }}</span>
      </p>

      <!-- [Element Plus] el-button — hover·active·disabled 상태가 기본 제공된다 -->
      <el-button type="primary" size="small" @click.stop="emit('click-detail', city)">
        상세보기
      </el-button>
    </div>

    <!-- 4단 — 기온 배지 -->
    <span v-if="isHot" class="badge hot">🔥 {{ configStore.hotLabel }}</span>
    <span v-else class="badge cool">❄️ {{ configStore.coolLabel }}</span>
  </div>
</template>

<style scoped>
.weather-card {
  padding: 16px 18px;
  background: #fbfcff;
  border: 1px solid #e6edf9;
  border-radius: 14px;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
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

/* ===== 1단 — 헤더 ===== */
.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-name {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.3px;
  /* 이름은 줄이지 않는다 */
  flex-shrink: 0;
}

.card-tags {
  display: flex;
  align-items: center;
  gap: 5px;
  /* 남는 공간을 차지해 별을 오른쪽 끝으로 밀어낸다 */
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.mini-badge {
  flex-shrink: 0;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.mini-badge.location {
  color: #2e6fbf;
  background: #e6f0fe;
}

.mini-badge.searched {
  color: #5f6b7c;
  background: #eef1f6;
}

:deep(.btn-star) {
  flex-shrink: 0;
  color: #c3ccda;
  transition:
    color 0.15s ease,
    transform 0.15s ease;
}

:deep(.btn-star:hover) {
  color: #f5b731;
  transform: scale(1.15);
}

:deep(.btn-star.active) {
  color: #f5b731;
}

/* ===== 2단 — 날씨 설명 ===== */
/* 카드 폭을 온전히 쓰므로 '약간의 구름이 낀 하늘' 같은 긴 문구도
   자연스럽게 한 줄에 들어간다. 그래도 넘치면 말줄임 처리. */
.card-status {
  margin: 3px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #7b8a9f;
}

/* ===== 3단 — 아이콘 + 기온 + 버튼 ===== */
.card-body {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.card-icon {
  width: 54px;
  height: 54px;
  flex-shrink: 0;
}

.card-temp {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -1px;
  color: #253858;
  /* 남는 공간을 차지해 버튼을 오른쪽 끝으로 민다 */
  flex: 1;
}

.temp-unit {
  margin-left: 1px;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0;
}

/* el-button 의 모서리를 카드 톤에 맞춘다 */
:deep(.el-button) {
  border-radius: 9px;
  font-weight: 600;
}

/* ===== 4단 — 기온 배지 ===== */
.badge {
  display: inline-block;
  margin-top: 8px;
  padding: 5px 12px;
  /* 상세보기 버튼과 모서리 곡률을 맞춘다 */
  border-radius: 9px;
  font-size: 12px;
  font-weight: 600;
  /* 좁은 폭에서 글자가 쪼개지지 않도록 */
  white-space: nowrap;
}

.badge.hot {
  background: #fff0ec;
  color: #e0603a;
}

.badge.cool {
  background: #eaf3ff;
  color: #3a7ad4;
}
</style>
