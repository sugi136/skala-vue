<script setup>
import { reactive, ref, watch } from 'vue'

const state = reactive({
  productName: '노트북',
  price: 1000,
})

const logAutoDeep = ref('대기 중...')
const logTarget = ref('대기 중...')

// [핵심] reactive 객체는 변수명만 넣어도 자동으로 deep 감시가 된다 (ref와 다른 점)
watch(state, (newVal, oldVal) => {
  // [주의] 여기가 이 파일의 핵심 함정
  // newVal과 oldVal이 "같은 객체"를 가리킨다 -> 이전 값을 알 수 없다
  // 둘 다 현재 가격으로 똑같이 출력된다
  logAutoDeep.value = `[자동 deep] 가격 변동! 이전가격인척하는:${oldVal.price}원 -> 현재가격:${newVal.price}원`
})

// [해결책] getter 함수로 원시값(숫자)을 꺼내 감시
watch(
  () => state.price, // [핵심] 숫자 하나만 감시 -> 값 복사가 일어나 과거 값이 보존됨
  (newPrice, oldPrice) => {
    logTarget.value = `[타겟 조준] 옛날값:${oldPrice}원 -> 바뀐값:${newPrice}원`
  },
)
</script>

<template>
  <div class="practice-section">
    <h2>reactive() 데이터 watch 감시 규칙</h2>
    <h3>상품 정보 관리 (reactive)</h3>
    <p>상품명: {{ state.productName }} / 가격: {{ state.price }}원</p>
    <button @click="state.price += 500">가격 500원 인상</button>

    <div class="monitor auto">
      <p>1) state 변수 통째로 감시 (deep 자동화)</p>
      <p>{{ logAutoDeep }}</p>
      <small>※ 주의: 이전 값과 현재 값이 똑같이 찍힌다.</small>
    </div>

    <div class="monitor target">
      <p>2) () =&gt; state.price 콕 집어 감시 (과거 추적)</p>
      <p>{{ logTarget }}</p>
      <small>※ 성공: 과거의 원본 가격이 보존된다.</small>
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
