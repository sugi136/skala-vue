<script setup>
// ============================================
// src/components/exercise/UnitToggler.vue
//
// [변경] Element Plus 적용
//   직접 만든 버튼 그룹 -> <el-radio-group> + <el-radio-button>
//
//   라디오 그룹은 "여러 선택지 중 하나"라는 의미가 마크업에 드러난다.
//   버튼 두 개를 나열하는 것보다 접근성 면에서도 낫다.
//
// [핵심] 이 컴포넌트는 props 를 하나도 받지 않는다.
//        store 에서 직접 읽고 직접 변경하므로 부모를 거칠 필요가 없다.
// ============================================
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/configStore.js'

const configStore = useConfigStore()

// [핵심] state 와 getters 는 storeToRefs 로 꺼내야 반응성이 유지된다.
const { unit, unitSymbol, unitLabel } = storeToRefs(configStore)

// --------------------------------------------
// el-radio-group 은 v-model 로 값을 주고받는다.
// store 값을 직접 바꾸면 안 되므로 computed 의 get/set 을 쓴다.
//
// [문법] computed 에 getter 만 주면 읽기 전용이지만,
//        { get, set } 객체를 주면 쓰기도 가능해진다.
//        v-model 과 store 를 잇는 표준 패턴이다.
// --------------------------------------------
const selectedUnit = computed({
  get: () => unit.value,
  set: (value) => configStore.setUnit(value),
})
</script>

<template>
  <div class="unit-toggler">
    <span class="toggler-label">단위</span>

    <el-radio-group v-model="selectedUnit" size="small">
      <el-radio-button value="celsius">℃</el-radio-button>
      <el-radio-button value="fahrenheit">℉</el-radio-button>
    </el-radio-group>

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
