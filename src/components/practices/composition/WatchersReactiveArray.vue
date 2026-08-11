<script setup>
import { reactive, ref, watch } from 'vue'

// [실무] 날씨 앱의 즐겨찾기 도시 리스트를 가정
const cityList = reactive(['서울', '수원'])

const logAuto = ref('대기 중...')
const logCopy = ref('대기 중...')

// 1) 변수명 그대로 감시 -> push/pop 등 배열 변동은 감지되지만
// [주의] newArr와 oldArr가 같은 배열을 가리켜서 이전 상태를 알 수 없다
watch(cityList, (newArr, oldArr) => {
  logAuto.value = `[자동 감시] 배열 변동! 옛날길이인척하는:${oldArr.length} / 현재길이:${newArr.length}`
})

// 2) [해결책] 스프레드로 복사본(스냅샷)을 만들어 감시
watch(
  () => [...cityList], // [문법] ...(스프레드) -> 배열을 펼쳐서 새 배열로 복사
  (newArr, oldArr) => {
    // [핵심] 매번 새 배열이 만들어지므로 과거 배열이 그대로 보존된다
    logCopy.value = `[스냅샷 감시] 진짜 과거 길이:${oldArr.length} (데이터: ${oldArr}) -> 바뀐 길이:${newArr.length}`
  },
)
</script>

<template>
  <div class="practice-section">
    <h2>reactive() 배열의 특정 인덱스/요소 감시하기</h2>
    <h3>즐겨찾기 도시 목록 (reactive 배열)</h3>
    <p>
      현재 등록된 도시: <strong>{{ cityList }}</strong>
    </p>

    <!-- [문법] push -> 뒤에 추가 / pop -> 뒤에서 제거 -->
    <button @click="cityList.push('부산')">부산 추가 (push)</button> &nbsp;
    <button @click="cityList.pop()">최근 도시 삭제 (pop)</button>

    <div class="monitor auto">
      <h3>1) cityList 변수명 그대로 감시</h3>
      <p>{{ logAuto }}</p>
      <small>※ 주의: 이전 배열과 현재 배열이 똑같이 동기화되어 버립니다.</small>
    </div>

    <div class="monitor target">
      <h3>2) () =&gt; [...cityList] 복사본 감시</h3>
      <p>{{ logCopy }}</p>
      <small>※ 성공: 과거 배열 내용물이 정상 대조됩니다.</small>
    </div>
  </div>
</template>

<style scoped>
.monitor {
  font-weight: bold;
}
.auto {
  border-color: #ff7675;
  background: #fff5f5;
  color: #c0392b;
}
.target {
  border-color: #00b894;
  background: #e8f5e9;
  color: #27ae60;
}
</style>
