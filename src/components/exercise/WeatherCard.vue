<script setup>
// ============================================
// 6장 : WeatherCard.vue
// 단위 설정 변경을 카드에 적용
// 즐겨찾기 store 를 활용한 별 아이콘 추가
// [핵심] 4장에서는 props 만 받는 순수한 표시 컴포넌트였다.
//        이제 store 를 직접 구독하므로 부모가 단위를 내려줄 필요가 없다.
// ============================================
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore.js'
import { useFavoriteStore } from '@/stores/favoriteStore.js'
import { useWeatherStore } from '@/stores/weatherStore.js'
// [Element Plus] 아이콘은 컴포넌트로 제공되므로 개별 import 가 필요하다
import { Star, StarFilled } from '@element-plus/icons-vue'
import { getIconUrl } from '@/api/weatherApi.js'

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
// [주의] script 안에서는 props.city 로 접근한다 (template 에서는 city 로 바로).
// [핵심] configStore.unit 이 바뀌면 이 computed 가 자동 재계산되어
//        화면의 모든 카드 온도가 한꺼번에 바뀐다.
// [설계] 변환 공식을 여기 직접 쓰지 않고 store 의 convertTemp 를 호출한다.
//        메인·상세·요약에서 같은 코드가 중복되는 것을 피하기 위함.
//        (과제 참고사항의 "Composable 로 해결 가능" 부분을 store 로 대체)
// --------------------------------------------
const displayTemp = computed(() => configStore.convertTemp(props.city.temp))

// 더움/선선함 판정은 항상 섭씨 원본으로 한다.
// [주의] 화씨로 변환된 값(82 등)으로 25 와 비교하면 전부 "더움"이 되어버린다.
const isHot = computed(() => props.city.temp >= 25)

// --------------------------------------------
// 즐겨찾기 여부
// getter 가 인자를 받는 형태이므로 함수처럼 호출한다.
// --------------------------------------------
const isFavorite = computed(() => favoriteStore.isFavorite(props.city.id))

// 기상특보 발효 여부 — 카드에는 배지만 표시하고
// 자세한 내용은 상세 페이지에서 확인하도록 한다
const hasWeatherAlert = computed(() => weatherStore.findAlerts(props.city.id).length > 0)

// 별 클릭 — store 의 action 을 직접 호출
// [핵심] 부모에게 emit 하지 않는다. 전역 상태이므로 어느 컴포넌트에서 바꾸든
//        같은 store 를 보는 모든 화면이 함께 갱신된다.
const handleToggleFavorite = () => {
  // [변경] 검색으로 추가된 도시는 regionList 에 없으므로
  //        id 만이 아니라 도시 객체를 통째로 넘긴다
  favoriteStore.toggleFavorite(props.city)
}
</script>

<template>
  <div
    class="weather-card"
    :class="{ 'is-selected': isSelected }"
    @click="emit('select-card', city)"
  >
    <!-- API 응답의 icon 은 '02d' 같은 코드이므로 이미지 URL 로 변환해 표시한다 -->
    <img class="card-icon" :src="getIconUrl(city.icon)" :alt="city.status" />

    <div class="card-main">
      <h4 class="card-name">
        {{ city.name }} <span class="card-status">({{ city.status }})</span>
        <!-- 특보가 발효 중일 때만 배지를 붙인다 -->
        <span v-if="city.isCurrentLocation" class="location-badge" title="현재 위치">📍</span>
        <span v-if="city.isSearched" class="searched-badge" title="검색으로 추가됨">검색</span>
        <!-- [Element Plus] el-tag — 배지 스타일을 직접 만들지 않아도 된다 -->
        <el-tag v-if="hasWeatherAlert" type="warning" size="small" effect="light" round>
          ⚠️ 특보
        </el-tag>
      </h4>
      <p class="card-temp">
        <!-- 변환된 온도 + store 의 단위 기호 -->
        현재 기온: <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
      </p>

      <!-- [Customization] 배지 문구도 단위에 따라 바뀐다.
           섭씨 25도 이상 -> 화씨로 전환하면 "77℉ 이상"으로 표시.
           판정 자체는 아래 isHot(섭씨 원본 기준)이 담당한다. -->
      <span v-if="isHot" class="badge hot">🔥 {{ configStore.hotLabel }}</span>
      <span v-else class="badge cool">❄️ {{ configStore.coolLabel }}</span>
    </div>

    <div class="card-actions">
      <!-- 즐겨찾기 별 아이콘
           [핵심] @click.stop 으로 카드 선택 이벤트가 함께 발생하는 것을 막는다 -->
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

      <!-- [Element Plus] el-button — hover·active·disabled 상태가 기본 제공된다 -->
      <el-button type="primary" size="small" @click.stop="emit('click-detail', city)">
        상세보기
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.weather-card {
  display: flex;
  align-items: center;
  gap: 16px;
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

.card-icon {
  width: 58px;
  height: 58px;
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

.location-badge,
.searched-badge {
  display: inline-block;
  margin-left: 5px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  vertical-align: middle;
}
.location-badge {
  color: #2e6fbf;
  background: #e6f0fe;
}
.searched-badge {
  color: #5f6b7c;
  background: #eef1f6;
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

/* ===== 우측 버튼 영역 ===== */
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

:deep(.btn-star) {
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

/* el-button 의 모서리를 카드 톤에 맞춘다 */
:deep(.el-button) {
  border-radius: 9px;
  font-weight: 600;
}
</style>
