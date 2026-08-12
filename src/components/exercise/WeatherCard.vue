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
import { hasAlert } from '@/data/weatherMockData.js'

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
const hasWeatherAlert = computed(() => hasAlert(props.city.id))

// 별 클릭 — store 의 action 을 직접 호출
// [핵심] 부모에게 emit 하지 않는다. 전역 상태이므로 어느 컴포넌트에서 바꾸든
//        같은 store 를 보는 모든 화면이 함께 갱신된다.
const handleToggleFavorite = () => {
  favoriteStore.toggleFavorite(props.city.id)
}
</script>

<template>
  <div
    class="weather-card"
    :class="{ 'is-selected': isSelected }"
    @click="emit('select-card', city)"
  >
    <div class="card-icon">{{ city.icon }}</div>

    <div class="card-main">
      <h4 class="card-name">
        {{ city.name }} <span class="card-status">({{ city.status }})</span>
        <!-- 특보가 발효 중일 때만 배지를 붙인다 -->
        <span v-if="hasWeatherAlert" class="alert-badge" title="기상특보 발효 중">⚠️ 특보</span>
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
      <button
        class="btn-star"
        :class="{ active: isFavorite }"
        :title="isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'"
        @click.stop="handleToggleFavorite"
      >
        {{ isFavorite ? '★' : '☆' }}
      </button>

      <button class="btn-detail" @click.stop="emit('click-detail', city)">상세보기</button>
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

.alert-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #a8500f;
  background: #ffeedb;
  vertical-align: middle;
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

.btn-star {
  width: 34px;
  height: 34px;
  font-size: 19px;
  line-height: 1;
  color: #c3ccda;
  background: transparent;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease,
    transform 0.15s ease;
}

.btn-star:hover {
  background: #f2f6fd;
  transform: scale(1.15);
}

.btn-star.active {
  color: #f5b731;
}

.btn-detail {
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
