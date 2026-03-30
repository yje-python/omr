<template>
  <div v-if="exam" class="page">
    <h2 class="title">오답노트</h2>

    <!-- 🔹 상단 버튼 -->
    <div class="actions">
      <button class="btn save" @click="saveAll">저장</button>
      <button class="btn back" @click="goBack">뒤로가기</button>
    </div>

    <!-- 🔹 과목 탭 -->
    <div class="tabs">
      <button
        v-for="(s, i) in exam.subjects"
        :key="s.id"
        :class="{ active: currentIndex === i }"
        @click="currentIndex = i"
      >
        {{ s.subject_name }}
      </button>
    </div>

    <!-- 🔹 태그 생성 -->
    <div class="tag-create">
      <input
        v-model="newTag"
        placeholder="새 태그 입력"
        @keyup.enter="createTag"
      />
      <button @click="createTag">추가</button>
    </div>

    <!-- 🔹 전체 태그 목록 (삭제 포함) -->
    <div class="tag-list">
      <span
        v-for="tag in tags"
        :key="tag.id"
        class="tag"
        :style="{ backgroundColor: getTagColor(tag.id) }"
      >
        {{ tag.name }}
        <span class="tag-delete" @click="deleteTag(tag.id)">×</span>
      </span>
    </div>

    <!-- 🔹 오답 테이블 -->
    <table class="table">
      <thead>
        <tr>
          <th>번호</th>
          <th>내 답</th>
          <th>정답</th>
          <th>메모</th>
          <th>태그</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="w in currentWrongNotes" :key="w.id">
          <td>
            <span class="chip number-chip">
              {{ w.question_number }}
            </span>
          </td>

          <td>
            <span class="chip wrong-chip">
              {{ w.user_answer }}
            </span>
          </td>

          <td>
            <span class="chip correct-chip">
              {{ w.correct_answer }}
            </span>
          </td>

          <td>
            <textarea
              v-model="w.memo"
              class="auto-textarea"
              @input="autoResize($event)"
            ></textarea>
          </td>

          <!-- 🔥 태그 버튼 UI -->
          <td class="tag-cell">
            <!-- 🔹 선택된 태그 -->
            <div class="tag-display">
              <span
                v-for="tagId in w.tags || []"
                :key="tagId"
                class="tag-chip"
                :style="{ backgroundColor: getTagColor(tagId) }"
                @click="removeTag(w, tagId)"
              >
                {{ getTagName(tagId) }} ✕
              </span>

              <!-- 🔥 + 태그 선택 -->
              <span class="tag-add" @click="toggleDropdown(w)">
                + 태그 선택
              </span>
            </div>

            <!-- 🔹 드롭다운 -->
            <div v-if="w.showDropdown" class="dropdown">
              <div
                v-for="tag in tags"
                :key="tag.id"
                class="dropdown-item"
                @click="toggleTag(w, tag.id)"
              >
                {{ tag.name }}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/api/api'

const route = useRoute()
const router = useRouter()

const examId = route.params.id

const exam = ref(null)
const tags = ref([])

const currentIndex = ref(0)
const newTag = ref('')

// 🔹 초기 로드
onMounted(async () => {
  const res = await axios.get(`/exams/${examId}/`)
  exam.value = res.data

  const tagRes = await axios.get('/tags/')
  tags.value = tagRes.data
})

// 🔹 현재 오답
const currentWrongNotes = computed(() => {
  if (!exam.value) return []
  return exam.value.subjects[currentIndex.value].wrong_notes || []
})

// 🔹 메모 저장
const saveAll = async () => {
  for (const w of currentWrongNotes.value) {
    await axios.patch(`/wrong-notes/update/${w.id}/`, {
      memo: w.memo
    })
  }
  alert('저장 완료')
}

const autoResize = (e) => {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

// 🔹 태그 생성
const createTag = async () => {
  if (!newTag.value.trim()) return

  const res = await axios.post('/tags/', {
    name: newTag.value
  })

  tags.value.push(res.data)
  newTag.value = ''
}

// 🔹 태그 삭제
const deleteTag = async (tagId) => {
  try {
    await axios.delete(`/tags/${tagId}/`)
    tags.value = tags.value.filter(t => t.id !== tagId)
  } catch (e) {
    console.error(e)
    alert('태그 삭제 실패')
  }
}

// 🔹 체크 여부
const isChecked = (w, tagId) => {
  return w.tags?.includes(tagId)
}

// 🔹 태그 토글
const toggleTag = async (w, tagId) => {
  if (!w.tags) w.tags = []

  if (w.tags.includes(tagId)) {
    w.tags = w.tags.filter(t => t !== tagId)
  } else {
    w.tags.push(tagId)
  }

  await axios.post('/wrong-note-tags/', {
    wrong_note: w.id,
    tags: w.tags
  })

  // 🔥 핵심: 선택 후 닫기
  w.showDropdown = false
}

const handleClickOutside = (e) => {
  currentWrongNotes.value.forEach(w => {
    if (!e.target.closest('.tag-cell')) {
      w.showDropdown = false
    }
  })
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const removeTag = async (w, tagId) => {
  if (!w.tags) return

  w.tags = w.tags.filter(t => t !== tagId)

  await axios.post('/wrong-note-tags/', {
    wrong_note: w.id,
    tags: w.tags
  })
}

const toggleDropdown = (w) => {
  w.showDropdown = !w.showDropdown
}

const getTagName = (tagId) => {
  return tags.value.find(t => t.id === tagId)?.name || ''
}

// 🔹 뒤로가기
const goBack = () => {
  router.push('/wrong-note')
}

// 🔹 태그 색상 팔레트
const palette = [
  '#6c5ce7',  // 보라
  '#0984e3',  // 파랑
  '#00b894',  // 초록
  '#e17055',  // 주황
  '#d63031'   // 빨강
]

const getTagColor = (id) => {
  return palette[id % palette.length]
}
</script>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}

.save {
  background: #42b883;
}

.back {
  background: #888;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tabs .active {
  background: #42b883;
  color: white;
}

.tag {
  padding: 4px 8px;
  border-radius: 6px;
  margin-right: 5px;
  color: white;
}

.tag-create {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;   /* 🔥 핵심 */
  gap: 6px;
  margin-bottom: 20px;
}

.tag-delete {
  margin-left: 5px;
  cursor: pointer;
}

.table {
  width: 100%;
  border-collapse: separate;   /* 🔥 중요 */
  border-spacing: 0 14px;      /* 🔥 행 간 간격 */
}

.table th,
.table td {
  padding: 10px 12px;
  text-align: center;
  vertical-align: top;
}

.table th {
  border-bottom: 2px solid #ccc;
}

.table td {
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

/* 양쪽 끝 둥글게 */
.table td:first-child {
  border-left: 1px solid #eee;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.table td:last-child {
  border-right: 1px solid #eee;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

.table tbody tr {
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border-radius: 10px;
}

.table tbody tr:hover {
  background: #fafafa;
}

/* 번호/답 칸 좁히기 */
.table td:nth-child(1),
.table td:nth-child(2),
.table td:nth-child(3) {
  width: 60px;
}

.wrong {
  color: red;
}

.correct {
  color: blue;
}

textarea {
  width: 100%;
  height: 60px;
}

.tag-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag-btn {
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  opacity: 0.5;
}

.tag-btn.selected {
  opacity: 1;
  border: 2px solid black;
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  border-radius: 16px;
  font-weight: bold;
  font-size: 14px;
}

/* 번호 */
.number-chip {
  background: #eee;
  color: black;
}

/* 내 답 */
.wrong-chip {
  background: #ffe0e0;
  color: red;
}

/* 정답 */
.correct-chip {
  background: #e0e7ff;
  color: blue;
}

.auto-textarea {
  width: 100%;
  min-height: 32px;
  resize: none;
  overflow: hidden;
  padding: 6px;
  font-size: 14px;

  margin-right: 12px;   /* 🔥 핵심 */
  box-sizing: border-box;
}

.selected-tags {
  min-height: 36px;
  border: 1px solid #ccc;
  padding: 4px;
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.empty {
  color: #aaa;
  font-size: 13px;
}

.dropdown {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  margin-top: 4px;
  z-index: 10;
  padding: 6px;
  border-radius: 6px;
}

.dropdown-item {
  padding: 4px 8px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f0f0f0;
}

.tag-cell {
  position: relative;
}

/* 태그 + 버튼 영역 */
.tag-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

/* 선택된 태그 */
.tag-chip {
  padding: 4px 8px;
  border-radius: 6px;
  color: white;
  font-size: 13px;
}

/* + 태그 선택 */
.tag-add {
  color: #888;
  cursor: pointer;
  font-size: 13px;
}

.tag-add:hover {
  text-decoration: underline;
}

/* 드롭다운 */
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-top: 4px;
  padding: 6px;
  z-index: 100;
  min-width: 120px;
}

/* 항목 */
.dropdown-item {
  padding: 5px 8px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f2f2f2;
}
</style>