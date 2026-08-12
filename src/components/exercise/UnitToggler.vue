<script setup>
// ============================================
// 6장 Hands on : src/components/exercise/UnitToggler.vue
//
// 단위 설정을 변경하는 UI 버튼과 영역
// Navigation Bar 옆에 배치
//
// [핵심] 이 컴포넌트는 props 를 하나도 받지 않는다.
//        store 에서 직접 상태를 읽고 직접 변경한다.
//        -> props/emit 으로 부모를 거칠 필요가 없다는 것이 store 의 장점
// ============================================
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/configStore.js'

const configStore = useConfigStore()

// [핵심] state 와 getters 는 storeToRefs 로 꺼내야 반응성이 유지된다.
//   const { unit } = configStore  ← 이렇게 하면 값만 복사되어 갱신되지 않는다.
const { unit, unitSymbol, unitLabel } = storeToRefs(configStore)

// [핵심] actions(함수)는 반응성과 무관하므로 그냥 구조분해해도 된다.
const { setUnit } = configStore
</script>

<template>
  <div class="unit-toggler">
    <span class="toggler-label">단위</span>

    <div class="toggler-group">
      <!-- [핵심] :class 객체 바인딩 — 현재 선택된 단위만 강조
           store 의 unit 값이 바뀌면 자동으로 반영된다 -->
      <button
        class="toggler-btn"
        :class="{ active: unit === 'celsius' }"
        @click="setUnit('celsius')"
      >
        ℃
      </button>
      <button
        class="toggler-btn"
        :class="{ active: unit === 'fahrenheit' }"
        @click="setUnit('fahrenheit')"
      >
        ℉
      </button>
    </div>

    <!-- getters 활용 — 현재 상태를 한글로 안내 -->
    <span class="toggler-status">{{ unitLabel }} {{ unitSymbol }}</span>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggler-label {
  font-size: 12px;
  font-weight: 600;
  color: #8899ad;
}

.toggler-group {
  display: flex;
  padding: 3px;
  background: #eef1f6;
  border-radius: 9px;
}

.toggler-btn {
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 700;
  color: #7b8a9f;
  background: transparent;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.toggler-btn:hover {
  color: #2f6fe4;
}

/* 현재 선택된 단위 */
.toggler-btn.active {
  color: #fff;
  background: #5b9bf8;
  box-shadow: 0 1px 3px rgba(45, 90, 180, 0.25);
}

.toggler-status {
  font-size: 12px;
  color: #9aa8bd;
}

@media (max-width: 520px) {
  .toggler-label,
  .toggler-status {
    display: none;
  }
}
</style>
