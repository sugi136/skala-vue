<script setup>
// [핵심] defineProps는 import가 필요 없다 (컴파일러 매크로)
// -> 빌드 시점에 Vue 컴파일러가 변환하기 때문
defineProps({
  parentData: {
    type: String, // [문법] 타입 검증. 다른 타입이 오면 콘솔 경고
    required: true, // [문법] 필수값. 안 넘기면 경고
    // default: '기본값'  // required 대신 default를 줄 수도 있다
  },
})
// [핵심] props는 읽기 전용(Readonly). 자식이 직접 수정하면 안 된다

// [핵심] 부모에게 보낼 이벤트 이름을 등록
const emit = defineEmits(['update-request'])

const sendNotification = () => {
  // [문법] payload = 이벤트와 함께 실어 보내는 데이터
  const payload = 'Child에서 가공한 새로운 데이터'
  // [핵심] emit(이벤트명, 데이터) -> 부모에게 "이거 처리해주세요" 요청
  emit('update-request', payload)
}
</script>

<template>
  <div class="child-container">
    <h2>하위 컴포넌트 (Child)</h2>
    <!-- [핵심] template에서는 props.parentData가 아니라 parentData로 바로 접근 -->
    <p>
      수신된 Props 데이터: <strong>{{ parentData }}</strong>
    </p>
    <br />
    <button @click="sendNotification">상위 컴포넌트로 갱신 요청 (Emit)</button>
  </div>
</template>

<style scoped>
.child-container {
  border: 2px dashed #3498db;
  padding: 20px;
  background-color: #fff;
  border-radius: 6px;
}
</style>
