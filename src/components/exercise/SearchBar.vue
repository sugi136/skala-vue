<script setup>
// ============================================
// src/components/exercise/SearchBar.vue
//
// [설계] Element Plus 를 부분 적용한다.
//   버튼·경고는 el-button / el-alert 로 교체했지만,
//   입력창은 네이티브 <input> 을 유지한다.
//
//   [이유] el-input 은 한글 IME 조합이 끝나야 @input 을 발생시킨다.
//          'ㅅ' 만 입력한 시점에는 이벤트가 오지 않아
//          초성 검색이 실시간으로 동작하지 않는다.
//          라이브러리의 편의 기능이 오히려 요구사항과 충돌하는 경우다.
// ============================================

const props = defineProps({
  // 부모가 관리하는 검색어
  query: {
    type: String,
    required: true,
  },
  // 로컬 필터링 결과 건수
  resultCount: {
    type: Number,
    default: 0,
  },
  // API 검색 진행 중 여부
  isSearching: {
    type: Boolean,
    default: false,
  },
  // API 검색 실패 메시지
  searchError: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query', 'search-api'])

// [주의] 네이티브 input 이므로 이벤트 객체가 넘어온다.
//        el-input 이었다면 값(문자열)이 바로 넘어와 시그니처가 다르다.
const handleInput = (event) => {
  emit('update-query', event.target.value)
}

// 엔터를 눌렀을 때도 API 검색이 실행되도록 한다
const handleEnter = () => {
  if (props.query.trim() && props.resultCount === 0) {
    emit('search-api', props.query)
  }
}

const handleSearchClick = () => {
  emit('search-api', props.query)
}
</script>

<template>
  <div class="search-area">
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input
        type="text"
        :value="query"
        placeholder="지역 이름 또는 초성 입력 (예: 서울, ㅅㅇ, 포항)"
        @input="handleInput"
        @keyup.enter="handleEnter"
      />
    </div>

    <!-- 입력 여부에 따라 다른 안내를 보여준다 -->
    <p class="search-status">
      <template v-if="query">
        검색 중인 지역: <strong>{{ query }}</strong>
        <span class="result-count">({{ resultCount }}건)</span>
      </template>
      <template v-else> 지역 이름을 입력하면 목록이 실시간으로 걸러집니다. </template>
    </p>

    <!-- 목록에 없는 도시 — API 로 직접 조회한다 -->
    <div v-if="query && resultCount === 0" class="search-fallback">
      <!-- [Element Plus] loading 속성 하나로 스피너 표시와 클릭 차단을 함께 처리한다 -->
      <el-button type="primary" :loading="isSearching" @click="handleSearchClick">
        '{{ query }}' 를 API 에서 찾기
      </el-button>

      <p class="fallback-hint">
        전국 주요 도시는 한글로 검색됩니다 (예: 포항, 여수, 강릉)<br />
        목록에 없는 지역은 영문명으로도 검색할 수 있습니다.<br />
        추가한 지역은 새로고침하면 사라집니다. ★ 를 눌러 즐겨찾기에 저장하세요.
      </p>
    </div>

    <!-- API 검색 실패 안내 -->
    <el-alert
      v-if="searchError"
      class="search-error"
      type="error"
      :title="searchError"
      :closable="false"
      show-icon
    />
  </div>
</template>

<style scoped>
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

/* ===== API 검색 ===== */
.search-fallback {
  margin-top: 10px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
}

.fallback-hint {
  margin: 9px 0 0;
  font-size: 11.5px;
  line-height: 1.6;
  color: #6b7a90;
}

.search-error {
  margin-top: 10px;
}

/* Element Plus 기본값보다 모서리를 둥글게 맞춘다.
   :deep() 는 scoped 안에서 자식 컴포넌트 내부 요소를 선택할 때 쓴다. */
:deep(.el-alert) {
  border-radius: 12px;
}
</style>
