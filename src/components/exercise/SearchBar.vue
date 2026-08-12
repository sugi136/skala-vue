<script setup>
// ============================================
// 4장 Hands on : SearchBar.vue
//
// [역할] 검색 입력창 + 검색 상태 안내
//
// [핵심] 데이터의 주인은 부모(WeatherParent)다.
//        이 컴포넌트는 값을 "빌려서 표시"하고(props),
//        입력이 생기면 부모에게 "바꿔주세요"라고 요청한다(emits).
// ============================================

// --------------------------------------------
// [Props] 부모 -> 자식 (하행선)
// [주의] props 는 읽기 전용. 자식이 직접 수정할 수 없다.
// --------------------------------------------
defineProps({
  // 부모가 관리하는 검색어
  query: {
    type: String,
    required: true,
  },
  // 필터링 결과 건수 (부모의 computed 결과)
  resultCount: {
    type: Number,
    default: 0,
  },
})

// --------------------------------------------
// [Emits] 자식 -> 부모 (상행선)
// 부모에게 보낼 커스텀 이벤트 이름을 등록한다.
// --------------------------------------------
const emit = defineEmits(['update-query'])

// --------------------------------------------
// [핵심] 입력이 발생하면 값을 직접 바꾸지 않고 부모에게 전달한다.
//
// [Customization] v-model 대신 :value + @input 을 쓰는 이유
//   v-model 은 한글 IME 조합이 끝나야 값이 반영되어
//   'ㅅ' 입력 시점에는 필터가 동작하지 않는다.
//   @input 은 조합 중에도 발생하므로 초성 검색이 실시간으로 동작한다.
// --------------------------------------------
const handleInput = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div class="search-area">
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <!-- [핵심] props(query)를 표시하고, 입력은 emit 으로 부모에게 올려보낸다 -->
      <input
        type="text"
        :value="query"
        @input="handleInput"
        placeholder="도시 이름 또는 초성 입력 (예: 서울, ㅅㅇ)"
      />
    </div>

    <!-- [2장 문법 유지] v-if / v-else 로 입력 여부에 따라 다른 안내 -->
    <p class="search-status">
      <template v-if="query">
        검색 중인 도시: <strong>{{ query }}</strong>
        <span class="result-count">({{ resultCount }}건)</span>
      </template>
      <template v-else> 도시 이름을 입력하면 목록이 실시간으로 걸러집니다. </template>
    </p>
  </div>
</template>

<style scoped>
/* [요구사항 5] SearchBar 에 해당하는 디자인만 여기에 격리 */
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 18px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(30, 70, 150, 0.15);
}

.search-icon {
  font-size: 15px;
  opacity: 0.55;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #253858;
}

.search-box input::placeholder {
  color: #9aa8bd;
}

.search-status {
  margin: 12px 2px 0;
  font-size: 13px;
  color: rgba(30, 55, 95, 0.7);
}

.search-status strong {
  color: #1e375f;
  font-weight: 700;
}

.result-count {
  margin-left: 6px;
  font-size: 12px;
  opacity: 0.85;
}
</style>
