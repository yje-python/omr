<template>
  <div class="page">
    <h2 class="title">오답노트 목록</h2>
    <div class="actions">
      <button class="btn home" @click="goHome">홈으로</button>
      <button class="btn create" @click="showCreateModal = true">오답노트 생성</button>
    </div>

    <div v-if="exams.length > 0">
      <div
        v-for="exam in exams"
        :key="exam.id"
        class="card"
        :style="{
          borderLeft: `8px solid ${getTemplateColor(exam.template_id)}`,
          backgroundColor: `${getTemplateColor(exam.template_id)}20`
        }"
        @click="goDetail(exam.id)"
      >
        <div class="card-content">
          <div class="exam-name">{{ exam.exam_name }}</div>
          <div class="date">{{ formatDate(exam.created_at) }}</div>
        </div>

        <button class="delete-btn" @click.stop="deleteExam(exam.id)">
          삭제
        </button>
      </div>

    </div>

    <div v-else>
      오답노트가 없습니다.
    </div>
    <div v-if="showCreateModal" class="modal-overlay">
    <div class="modal">

      <!-- 🔹 닫기 버튼 -->
      <div class="modal-header">
        <span>시험 선택</span>
        <button @click="showCreateModal = false">✕</button>
      </div>

      <!-- 🔹 기존 WrongNoteCreateView 내용 -->
      <div class="modal-content">
        <div
          v-for="exam in allExams"
          :key="exam.id"
          class="card"
          @click="selectExam(exam.id)"
          :style="{
            borderLeft: `8px solid ${getTemplateColor(exam.template_id)}`,
            backgroundColor: `${getTemplateColor(exam.template_id)}20`
          }"
        >
          <div>{{ exam.exam_name }}</div>
          <div>{{ formatDate(exam.created_at) }}</div>
        </div>
      </div>

      <!-- 🔹 이동 버튼 -->
      <div class="modal-footer">
        <button @click="() => goDetail()">선택</button>
      </div>

    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/api/api'

// 🔹 타입 정의
interface Exam {
  id: number
  exam_name: string
  created_at: string
  template_id: number
}

const router = useRouter()

// 🔹 상태
const exams = ref<Exam[]>([])        // 오답 있는 시험
const allExams = ref<Exam[]>([])     // 전체 시험
const showCreateModal = ref<boolean>(false)
const selectedExamId = ref<number | null>(null)

// 🔹 데이터 로드
onMounted(async () => {
  const res = await axios.get('/exams/wrong/')
  exams.value = res.data

  const all = await axios.get('/exams/')
  allExams.value = all.data
})

// 🔹 삭제
const deleteExam = async (examId: number) => {
  if (!confirm('오답노트를 삭제하시겠습니까?')) return

  await axios.delete(`/wrong-notes/delete/${examId}/`)
  exams.value = exams.value.filter(e => e.id !== examId)
}

// 🔹 선택
const selectExam = (id: number) => {
  selectedExamId.value = id
}

// 🔹 이동
const goDetail = (id?: number) => {
  const targetId = id ?? selectedExamId.value

  if (!targetId) {
    alert('시험 선택하세요')
    return
  }

  router.push(`/wrong-note/${targetId}`)
  showCreateModal.value = false
}

// 🔹 날짜 포맷
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

// 🔹 홈 이동
const goHome = () => {
  router.push('/')
}

// 🔥 색상 팔레트 (다른 페이지와 동일하게 맞춤)
const colorPalette: string[] = [
  '#E3F2FD',
  '#FCE4EC',
  '#E8F5E9',
  '#FFF3E0',
  '#F3E5F5',
  '#E0F2F1',
]

// 🔥 핵심: template_id 기준 색상
const getTemplateColor = (templateId: number) => {
  const index = Math.abs(templateId) % colorPalette.length
  return colorPalette[index]
}
</script>

<style scoped>
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

.card {
  border: 1px solid #ccc;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exam-name {
  font-weight: bold;
}

.date {
  font-size: 12px;
  color: gray;
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
  cursor: pointer;
  background: #42b883;
  color: white;
  font-size: 14px;
}

.btn.home {
  background: #888;
}

.btn.create {
  background: #42b883;
}

.delete-btn {
  background: #d63031;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.delete-btn:hover {
  background: #b71c1c;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  width: 500px;
  max-height: 80vh;
  background: white;
  border-radius: 10px;
  padding: 20px;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.modal-content {
  max-height: 300px;
  overflow-y: auto;
}

.modal-footer {
  margin-top: 10px;
  text-align: right;
}
</style>