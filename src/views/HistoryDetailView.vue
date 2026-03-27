<template>
  <div v-if="exam" class="page">

    <h2 class="title">시험 상세 결과</h2>

    <!-- 🔹 비교 선택 -->
    <div class="compare-box">
      <select v-model="selectedCompareExamId">
        <option value="">비교할 시험 선택</option>
        <option
          v-for="e in sameExams"
          :key="e.examId"
          :value="e.examId"
        >
          {{ e.examName }} ({{ formatDate(e.createdAt) }})
        </option>
      </select>

      <button @click="applyCompare">비교하기</button>
    </div>

    <h3 class="exam-name">
      {{ exam.examName }}
    </h3>

    <!-- 🔹 과목 선택 -->
    <div class="tabs">
      <button
        v-for="(s, i) in exam.subjects"
        :key="s.subjectId"
        :class="{ active: currentIndex === i }"
        @click="currentIndex = Number(i)"
      >
        {{ s.subjectName }}
      </button>
    </div>

    <!-- 🔥 항상 기본 결과 표시 -->
    <div class="compare-wrapper">

      <!-- 현재 시험 -->
      <div class="card">
          <h4 class="card-title">
            {{ exam.examName }}
          </h4>
        <div>점수: {{ currentSubject.score }} / {{ currentSubject.answers.length }}</div>
        <div>정답: {{ stats.correct }}</div>
        <div>오답: {{ stats.wrong }}</div>
        <div>미응답: {{ stats.unanswered }}</div>
        <div>정답률: {{ stats.accuracy }}%</div>

        <!-- 🔹 오답노트 -->
        <div class="toggle" @click="showWrongCurrent = !showWrongCurrent">
          오답노트 {{ showWrongCurrent ? '▲' : '▼' }}
        </div>

        <div v-if="showWrongCurrent">
          <div
            v-for="item in wrongDetail"
            :key="item.index"
            class="answer-row"
          >
            <span class="num">{{ item.index }}</span>

            <span class="my">
              {{ item.my }}
            </span>

            <span class="correct">
              {{ item.correct }}
            </span>
          </div>
        </div>
      </div>

      <!-- 🔥 비교 시험 (선택했을 때만) -->
      <div v-if="isCompare && compareSubject" class="card">
          <h4 class="card-title">
            {{ compareExam?.examName }}
          </h4>
        <div>점수: {{ compareSubject.score }} / {{ compareSubject.answers.length }}</div>
        <div>정답: {{ compareStats.correct }}</div>
        <div>오답: {{ compareStats.wrong }}</div>
        <div>미응답: {{ compareStats.unanswered }}</div>
        <div>정답률: {{ compareStats.accuracy }}%</div>

        <!-- 🔹 오답노트 (비교용 따로) -->
        <div class="toggle" @click="showWrongCompare = !showWrongCompare">
          오답노트 {{ showWrongCompare ? '▲' : '▼' }}
        </div>

        <div v-if="showWrongCompare">
          <div
            v-for="item in compareWrongDetail"
            :key="item.index"
            class="answer-row"
          >
            <span class="num">{{ item.index }}</span>

            <span class="my">
              {{ item.my }}
            </span>

            <span class="correct">
              {{ item.correct }}
            </span>
          </div>
        </div>

      </div>

    </div>

    <!-- 🔥 비교 분석 -->
    <div v-if="isCompare" class="analysis">

      <div>
        <b>이전엔 맞았는데 이번에 틀린 문제</b>
        <div class="numbers">
          <span v-for="n in regressed" :key="n">{{ n }}</span>
        </div>
      </div>

      <div>
        <b>계속 틀린 문제</b>
        <div class="numbers">
          <span v-for="n in stillWrong" :key="n">{{ n }}</span>
        </div>
      </div>

    </div>

    <button class="back" @click="goBack">뒤로가기</button>
  </div>
</template>

<script setup lang="ts">

type Stats = {
  correct: number
  wrong: number
  unanswered: number
  accuracy: string
}

import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOmrStore } from '@/stores/omr'

const store = useOmrStore()
const route = useRoute()
const router = useRouter()

const exam = computed(() =>
  store.exams.find(e => e.examId === route.params.id)
)

const currentIndex = ref(0)

// 🔥 오답노트 상태 분리
const showWrongCurrent = ref(false)
const showWrongCompare = ref(false)

// 🔥 비교 상태
const selectedCompareExamId = ref('')
const isCompare = ref(false)

const currentSubject = computed(() => {
  if (!exam.value) return null
  return exam.value.subjects[currentIndex.value]
})

const sameExams = computed(() => {
  if (!exam.value) return []

  return store.exams.filter(
    e =>
      // e.templateId === exam.value.templateId &&
      e.examId !== exam.value.examId
  )
})

const getStats = (subject: any): Stats => {
  let correct = 0
  let wrong = 0
  let unanswered = 0

  subject.answers.forEach((ans: number, i: number) => {
    const c = subject.correctAnswers[i]

    if (!ans) unanswered++
    else if (ans === c) correct++
    else wrong++
  })

  return {
    correct,
    wrong,
    unanswered,
    accuracy: ((correct / subject.answers.length) * 100).toFixed(1)
  }
}

const stats = computed<Stats>(() => {
  if (!currentSubject.value) {
    return {
      correct: 0,
      wrong: 0,
      unanswered: 0,
      accuracy: '0.0'
    }
  }

  return getStats(currentSubject.value)
})

const compareStats = computed<Stats>(() => {
  if (!compareSubject.value) {
    return {
      correct: 0,
      wrong: 0,
      unanswered: 0,
      accuracy: '0.0'
    }
  }

  return getStats(compareSubject.value)
})

const compareExam = computed(() =>
  store.exams.find(e => e.examId === selectedCompareExamId.value)
)

const compareSubject = computed(() => {
  if (!compareExam.value || !currentSubject.value) return null

  return compareExam.value.subjects.find(
    (s: any) => s.subjectName === currentSubject.value.subjectName
  )
})

const applyCompare = () => {
  if (!selectedCompareExamId.value) return
  isCompare.value = true
}

// 🔹 오답노트
const wrongDetail = computed(() => {
  if (!currentSubject.value) return []

  return currentSubject.value.answers
    .map((ans: number, i: number) => {
      const c = currentSubject.value.correctAnswers[i]
      if (ans && ans !== c) {
        return { index: i + 1, my: ans, correct: c }
      }
      return null
    })
    .filter(Boolean)
})

const compareWrongDetail = computed(() => {
  if (!compareSubject.value) return []

  return compareSubject.value.answers
    .map((ans: number, i: number) => {
      const c = compareSubject.value.correctAnswers[i]
      if (ans && ans !== c) {
        return { index: i + 1, my: ans, correct: c }
      }
      return null
    })
    .filter(Boolean)
})

// 🔹 비교 분석
const regressed = computed(() => {
  if (!compareSubject.value || !currentSubject.value) return []

  return currentSubject.value.answers
    .map((ans: number, i: number) => {
      const prev = compareSubject.value.answers[i]
      const c = currentSubject.value.correctAnswers[i]

      if (prev === c && ans !== c) return i + 1
      return null
    })
    .filter(Boolean)
})

const stillWrong = computed(() => {
  if (!compareSubject.value || !currentSubject.value) return []

  return currentSubject.value.answers
    .map((ans: number, i: number) => {
      const prev = compareSubject.value.answers[i]
      const c = currentSubject.value.correctAnswers[i]

      if (prev !== c && ans !== c) return i + 1
      return null
    })
    .filter(Boolean)
})

const formatDate = (date: string) =>
  new Date(date).toLocaleString()

const goBack = () => router.push('/history')
</script>

<style scoped>
.page {
  max-width: 900px;
  margin: 40px auto;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

.exam-name {
  text-align: center;
  font-size: 18px;   /* title보다 살짝 작게 */
  margin-bottom: 15px;
  font-weight: 500;
}

/* 🔹 비교 영역 */
.compare-box {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.compare-box select {
  flex: 1;
  padding: 8px;
}

.compare-box button {
  padding: 8px 12px;
}

/* 🔹 탭 */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tabs button {
  flex: 1;
  padding: 8px;
}

.tabs .active {
  background: black;
  color: white;
}

/* 🔥 핵심: 카드 레이아웃 */
.compare-wrapper {
  display: flex;
  gap: 20px;
}

/* 기본 카드 */
.card {
  flex: 1;
  border: 1px solid #ddd;
  padding: 20px;
  background: white;
}

.card-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
}

/* 🔹 요약 (기존 유지) */
.card > div {
  margin-bottom: 6px;
}

/* 🔹 오답노트 토글 */
.toggle {
  margin-top: 10px;
  cursor: pointer;
  font-weight: bold;
}

/* 🔥 오답노트 스타일 */
.answer-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}

.num {
  width: 30px;
  font-weight: bold;
}

/* 🔴 내 답 */
.my {
  background: #ffe5e5;
  color: red;
  padding: 4px 10px;
  border-radius: 4px;
}

/* 🔵 정답 */
.correct {
  background: #e5f0ff;
  color: blue;
  padding: 4px 10px;
  border-radius: 4px;
}

/* 🔥 비교 분석 */
.analysis {
  margin-top: 20px;
}

.analysis > div {
  margin-bottom: 10px;
}

.numbers {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 5px;
}

.numbers span {
  background: #f3f3f3;
  padding: 4px 6px;
  border-radius: 4px;
}

/* 버튼 */
.back {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
}
</style>