<script setup>
// ============================================
// 7장 Code Challenge : AxiosJson.vue
// 위치: src/components/practices/library/AxiosJson.vue
//
// [목적] REST API 의 4가지 HTTP Method 를 직접 호출해 본다.
//   GET    조회
//   POST   생성
//   PUT    전체 수정
//   PATCH  일부 수정
//   DELETE 삭제
//
// [JSONPlaceholder] 실습용 가짜 REST API.
//   실제로 서버에 저장되지는 않지만, 저장된 것처럼 응답을 돌려준다.
//   그래서 화면 갱신은 응답을 받아 로컬 배열을 직접 조작해야 한다.
// ============================================
import { ref, onMounted } from 'vue'
import axios from 'axios'

const BASE_URL = 'https://jsonplaceholder.typicode.com/posts'

const items = ref([])
const textInput = ref('')
const isLoading = ref(false)
const logs = ref([])

// 화면에 통신 기록을 남긴다 (콘솔을 안 열어도 흐름이 보이도록)
const addLog = (method, message) => {
  // [문법] unshift — 배열 맨 앞에 추가. 최신 로그가 위로 온다
  logs.value.unshift({
    id: Date.now(),
    method,
    message,
    time: new Date().toLocaleTimeString('ko-KR'),
  })
  // 로그가 무한정 쌓이지 않도록 10개까지만 유지
  if (logs.value.length > 10) logs.value.pop()
}

// ----------------------------------------------------
// [READ] GET — 데이터 조회
// ----------------------------------------------------
const handleRead = async () => {
  isLoading.value = true

  try {
    // [문법] params 로 쿼리스트링을 넘긴다 -> ?_limit=3
    const response = await axios.get(BASE_URL, { params: { _limit: 3 } })

    items.value = response.data
    addLog('GET', `${response.data.length}건 조회 (상태 ${response.status})`)
  } catch (error) {
    addLog('GET', `실패: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

// ----------------------------------------------------
// [CREATE] POST — 데이터 생성
// ----------------------------------------------------
const handleCreate = async () => {
  const text = textInput.value.trim()
  if (!text) return

  try {
    // [핵심] POST 는 (주소, 보낼 데이터) 두 인자를 받는다.
    //        GET 의 params 와 달리 body 에 실려 나간다.
    const payload = { title: text, body: '샘플 내용', userId: 1 }
    const response = await axios.post(BASE_URL, payload)

    // 서버가 저장하지 않으므로 응답을 받아 로컬 배열에 직접 넣는다
    items.value.unshift(response.data)
    textInput.value = ''

    addLog('POST', `id=${response.data.id} 생성 (상태 ${response.status})`)
  } catch (error) {
    addLog('POST', `실패: ${error.message}`)
  }
}

// ----------------------------------------------------
// [UPDATE] PUT — 전체 수정
//
// [주의] PUT 은 리소스를 통째로 교체한다.
//        보내지 않은 필드는 사라지므로 전체 데이터를 넘겨야 한다.
// ----------------------------------------------------
const handleUpdate = async (id) => {
  try {
    const payload = { id, title: '[PUT] 전체 교체된 제목', body: '수정 완료', userId: 1 }
    const response = await axios.put(`${BASE_URL}/${id}`, payload)

    // [문법] findIndex — 조건에 맞는 첫 요소의 인덱스. 없으면 -1
    const index = items.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      items.value[index] = response.data
    }

    addLog('PUT', `id=${id} 전체 수정 (상태 ${response.status})`)
  } catch (error) {
    addLog('PUT', `실패: ${error.message}`)
  }
}

// ----------------------------------------------------
// [UPDATE] PATCH — 일부 수정
//
// [PUT 과의 차이] 보낸 필드만 바꾼다. 나머지는 그대로 유지된다.
// ----------------------------------------------------
const handlePatch = async (id) => {
  try {
    // title 만 넘긴다. body, userId 는 건드리지 않는다
    const response = await axios.patch(`${BASE_URL}/${id}`, {
      title: '[PATCH] 제목만 변경',
    })

    const index = items.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      items.value[index] = response.data
    }

    addLog('PATCH', `id=${id} 일부 수정 (상태 ${response.status})`)
  } catch (error) {
    addLog('PATCH', `실패: ${error.message}`)
  }
}

// ----------------------------------------------------
// [DELETE] DELETE — 삭제
// ----------------------------------------------------
const handleDelete = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`)

    // [문법] filter — 조건에 맞지 않는 것만 남긴 새 배열
    items.value = items.value.filter((item) => item.id !== id)

    addLog('DELETE', `id=${id} 삭제 (상태 ${response.status})`)
  } catch (error) {
    addLog('DELETE', `실패: ${error.message}`)
  }
}

// ----------------------------------------------------
// [병렬 요청] Promise.all
//
// 여러 요청을 동시에 보낸다. 순차 실행보다 훨씬 빠르다.
// [주의] 하나라도 실패하면 전체가 실패한다.
//        일부 실패를 허용하려면 Promise.allSettled 를 쓴다.
// ----------------------------------------------------
const handleParallel = async () => {
  isLoading.value = true

  try {
    const start = performance.now()

    const [post1, post2, post3] = await Promise.all([
      axios.get(`${BASE_URL}/1`),
      axios.get(`${BASE_URL}/2`),
      axios.get(`${BASE_URL}/3`),
    ])

    const elapsed = Math.round(performance.now() - start)
    items.value = [post1.data, post2.data, post3.data]

    addLog('ALL', `3건 병렬 조회 완료 (${elapsed}ms)`)
  } catch (error) {
    addLog('ALL', `실패: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

// [핵심] onMounted — DOM 부착 직후가 초기 데이터 조회의 적기
onMounted(handleRead)
</script>

<template>
  <div class="practice-section">
    <h2>Axios CRUD 실습</h2>

    <div class="input-zone">
      <input
        v-model="textInput"
        placeholder="저장할 텍스트를 입력하세요"
        @keyup.enter="handleCreate"
      />
      <button class="btn-post" @click="handleCreate">POST</button>
      <button class="btn-get" :disabled="isLoading" @click="handleRead">GET 새로고침</button>
      <button class="btn-all" :disabled="isLoading" @click="handleParallel">병렬 조회</button>
    </div>

    <ul class="item-list">
      <li v-for="item in items" :key="item.id" class="item-card">
        <div class="content">
          <span class="id-tag">ID: {{ item.id }}</span>
          <p class="title-text">{{ item.title }}</p>
        </div>
        <div class="btn-group">
          <button class="btn-put" @click="handleUpdate(item.id)">PUT</button>
          <button class="btn-patch" @click="handlePatch(item.id)">PATCH</button>
          <button class="btn-delete" @click="handleDelete(item.id)">DELETE</button>
        </div>
      </li>
    </ul>

    <p v-if="items.length === 0" class="empty">조회된 데이터가 없습니다.</p>

    <!-- 통신 기록 — 콘솔을 열지 않아도 흐름이 보이도록 -->
    <div class="log-zone">
      <h3>통신 로그</h3>
      <ul>
        <li v-for="log in logs" :key="log.id">
          <span class="log-method" :class="['m-' + log.method.toLowerCase()]">{{
            log.method
          }}</span>
          <span class="log-msg">{{ log.message }}</span>
          <span class="log-time">{{ log.time }}</span>
        </li>
      </ul>
      <p v-if="logs.length === 0" class="empty">아직 기록이 없습니다.</p>
    </div>
  </div>
</template>

<style scoped>
.input-zone {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

input {
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

button {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: bold;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  background: #94a3b8;
  cursor: default;
}

button:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-get {
  background: #0284c7;
}
.btn-post {
  background: #22c55e;
}
.btn-put {
  background: #eab308;
}
.btn-patch {
  background: #f97316;
}
.btn-delete {
  background: #ef4444;
}
.btn-all {
  background: #7c5cd0;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.id-tag {
  font-size: 11px;
  font-weight: bold;
  color: #64748b;
}

.title-text {
  margin: 0;
  font-size: 14px;
  color: #334155;
}

.btn-group {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

/* ===== 통신 로그 ===== */
.log-zone {
  margin-top: 22px;
  padding: 14px 16px;
  background: #1e293b;
  border-radius: 10px;
  color: #e2e8f0;
}

.log-zone h3 {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
}

.log-zone ul {
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
}

.log-zone li {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 0;
}

.log-method {
  min-width: 52px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  color: #0f172a;
}

.m-get {
  background: #7dd3fc;
}
.m-post {
  background: #86efac;
}
.m-put {
  background: #fde047;
}
.m-patch {
  background: #fdba74;
}
.m-delete {
  background: #fca5a5;
}
.m-all {
  background: #c4b5fd;
}

.log-msg {
  flex: 1;
}

.log-time {
  color: #64748b;
  font-size: 11px;
}

.empty {
  color: #94a3b8;
  font-size: 13px;
  text-align: center;
  padding: 16px 0;
  margin: 0;
}
</style>
