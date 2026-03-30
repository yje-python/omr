<template>
  <div class="page">
    <h2 class="title">오답노트 생성</h2>

    <!-- 🔹 상단 버튼 -->
    <div class="actions">
      <button class="btn home" @click="goBack">뒤로가기</button>
    </div>

    <!-- 🔹 시험 리스트 -->
    <div v-if="exams.length > 0">
      <div
        v-for="exam in exams"
        :key="exam.id"
        class="card"
        :class="{ selected: selectedExamId === exam.id }"
        :style="{
          borderLeft: `8px solid ${getTemplateColor(exam.template_id)}`,
          backgroundColor: `${getTemplateColor(exam.template_id)}20`
        }"
        @click="selectExam(exam.id)"
      >
        <div class="exam-name">{{ exam.exam_name }}</div>
        <div class="date">{{ formatDate(exam.created_at) }}</div>
      </div>
    </div>

    <div v-else>
      시험 데이터가 없습니다.
    </div>

    <!-- 🔹 이동 버튼 -->
    <div class="bottom">
      <button class="btn start" @click="goDetail">
        선택한 시험으로 이동
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/api/api'

interface Exam {
  id: number
  exam_name: string
  created_at: string
  template_id: number
}

const router = useRouter()

const exams = ref<Exam[]>([])
const selectedExamId = ref<number | null>(null)

// 🔹 시험 목록 불러오기
onMounted(async () => {
  const res = await axios.get('/exams/')
  exams.value = res.data
})

// 🔹 선택
const selectExam = (id: number) => {
  selectedExamId.value = id
}

// 🔹 이동
const goDetail = () => {
  if (!selectedExamId.value) {
    alert('시험을 선택하세요')
    return
  }

  router.push(`/wrong-note/${selectedExamId.value}`)
}

// 🔹 뒤로가기
const goBack = () => {
  router.push('/wrong-note')
}

// 🔹 날짜 포맷
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

// 🔥 색상 팔레트 (HistoryView랑 동일하게 맞춰라)
const colorPalette = [
  '#E3F2FD',
  '#FCE4EC',
  '#E8F5E9',
  '#FFF3E0',
  '#F3E5F5',
  '#E0F2F1',
]

// 🔥 템플릿 기준 색상 (핵심)
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

.actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.card {
  border: 1px solid #ccc;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.card:hover {
  transform: scale(1.02);
}

.selected {
  outline: 2px solid #42b883;
}

.exam-name {
  font-weight: bold;
}

.date {
  font-size: 12px;
  color: gray;
}

.bottom {
  margin-top: 20px;
  text-align: center;
}

.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: white;
}

.start {
  background: #42b883;
}

.home {
  background: #888;
}
</style>