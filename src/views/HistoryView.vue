<template>
  <div class="page">
    <h2 class="title">지난 시험 결과</h2>

    <div v-if="pagedExams.length > 0">
      <div
        v-for="exam in pagedExams"
        :key="exam.examId"
        class="card"
        :style="{ borderLeft: `60px solid ${getTemplateColor(exam.templateId)}` }"
      >
        <div class="card-content" @click="goDetail(exam.examId)">
          <div class="exam-name">{{ exam.examName }}</div>
          <div class="date">{{ formatDate(exam.createdAt) }}</div>
        </div>

        <button class="delete-btn" @click="deleteExam(exam.examId)">
          삭제
        </button>
      </div>
    </div>

    <div v-else>
      <p>저장된 시험 결과가 없습니다.</p>
    </div>

    <!-- 🔹 페이지네이션 -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="prevPage" :disabled="currentPage === 1">
        이전
      </button>

      <span>{{ currentPage }} / {{ totalPages }}</span>

      <button @click="nextPage" :disabled="currentPage === totalPages">
        다음
      </button>
    </div>

    <button class="home-btn" @click="goHome">홈으로</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOmrStore } from '@/stores/omr'

const store = useOmrStore()
const router = useRouter()

// 🔹 페이지 상태
const currentPage = ref(1)
const pageSize = 10

// 🔹 전체 페이지 수
const totalPages = computed(() =>
  Math.ceil(store.exams.length / pageSize)
)

// 🔹 현재 페이지 데이터
const pagedExams = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return store.exams.slice(start, start + pageSize)
})

// 🔹 상세 이동
const goDetail = (examId: string) => {
  router.push(`/history/${examId}`)
}

// 🔹 삭제
const deleteExam = (examId: string) => {
  const confirmDelete = confirm('삭제하시겠습니까?')
  if (!confirmDelete) return

  store.exams = store.exams.filter(e => e.examId !== examId)

  // 페이지 보정
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value || 1
  }
}

// 🔹 페이지 이동
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// 🔹 날짜 포맷
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

const colorPalette = [
  '#E3F2FD', // 블루
  '#FCE4EC', // 핑크
  '#E8F5E9', // 그린
  '#FFF3E0', // 오렌지
  '#F3E5F5', // 퍼플
  '#E0F2F1', // 민트
]

const getTemplateColor = (templateId: number | null) => {
  if (!templateId) return '#F5F5F5'

  const ids = [
    ...new Set(store.exams.map(e => e.templateId).filter(Boolean))
  ]

  const index = ids.indexOf(templateId)

  return colorPalette[index % colorPalette.length]
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.page {
  max-width: 600px;
  margin: 40px auto;
  text-align: center;
}

.title {
  margin-bottom: 30px;
}

.card {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.card-content {
  cursor: pointer;
  text-align: left;
}

.card:hover {
  transform: translateY(-2px);
  filter: brightness(0.97);
}

.exam-name {
  font-weight: bold;
}

.date {
  font-size: 14px;
  color: gray;
}

.delete-btn {
  padding: 5px 10px;
  font-size: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
}

.home-btn {
  margin-top: 20px;
  padding: 10px 20px;
}
</style>