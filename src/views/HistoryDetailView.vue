<template>
  <div v-if="exam" class="page">

    <h2 class="title">시험 상세 결과</h2>

    <!-- 🔥 비교 선택 -->
    <div class="compare-box">
      <select v-model="selectedCompareExamId">
        <option value="">비교할 시험 선택</option>
        <option
          v-for="e in sameExams"
          :key="e.id"
          :value="e.id"
        >
          {{ e.exam_name }}
        </option>
      </select>

      <button @click="applyCompare">비교하기</button>
    </div>

    <!-- 🔹 과목 선택 -->
    <div class="tabs">
      <button
        v-for="(s, i) in exam.subjects"
        :key="i"
        :class="{ active: currentIndex === i }"
        @click="currentIndex = Number(i)"
      >
        {{ s.subject_name }}
      </button>
    </div>

    <!-- 🔥 카드 영역 -->
    <div :class="isCompare ? 'compare-wrapper' : ''">

      <!-- 현재 시험 -->
      <div class="card">
        <h4 class="card-title">{{ exam.exam_name }}</h4>

        <div>점수: {{ stats.correct }} / {{ currentSubject?.answers.length }}</div>
        <div>푼 문제: {{ stats.solved }}</div>
        <div>정답: {{ stats.correct }}</div>
        <div>오답: {{ stats.wrong }}</div>
        <div>미응답: {{ stats.unanswered }}</div>
        <div>정답률: {{ stats.accuracy }}%</div>

        <!-- 입력답안 -->
        <div class="toggle" @click="showAnswer = !showAnswer">
          입력 답안 {{ showAnswer ? '▲' : '▼' }}
        </div>

        <div v-if="showAnswer" class="wrong-list">
          <div class="wrong-header">
            <span class="chip header-chip">번호</span>
            <span class="chip header-chip">내 답</span>
            <span class="chip header-chip">정답</span>
          </div>

          <div
            v-for="(a, i) in currentSubject?.answers"
            :key="i"
            class="wrong-item"
          >
            <span class="chip number-chip">{{ Number(i) + 1 }}</span>

            <span class="chip" :class="getStatus(a)">
              {{ a.user_answer ?? '-' }}
            </span>

            <span class="chip correct-answer">
              {{ a.correct_answer }}
            </span>
          </div>
        </div>
      </div>

      <!-- 비교 시험 -->
      <div v-if="isCompare && compareSubject" class="card">
        <h4 class="card-title">{{ compareExam?.exam_name }}</h4>

        <div>점수: {{ compareStats.correct }} / {{ compareSubject.answers.length }}</div>
        <div>정답: {{ compareStats.correct }}</div>
        <div>오답: {{ compareStats.wrong }}</div>
        <div>미응답: {{ compareStats.unanswered }}</div>
        <div>정답률: {{ compareStats.accuracy }}%</div>

        <!-- 입력답안 -->
        <div class="toggle" @click="showCompareAnswer = !showCompareAnswer">
          입력 답안 {{ showCompareAnswer ? '▲' : '▼' }}
        </div>

        <div v-if="showCompareAnswer" class="wrong-list">
          <div class="wrong-header">
            <span class="chip header-chip">번호</span>
            <span class="chip header-chip">내 답</span>
            <span class="chip header-chip">정답</span>
          </div>

          <div
            v-for="(a, i) in compareSubject.answers"
            :key="i"
            class="wrong-item"
          >
            <span class="chip number-chip">{{ Number(i) + 1 }}</span>

            <span class="chip" :class="getStatus(a)">
              {{ a.user_answer ?? '-' }}
            </span>

            <span class="chip correct-answer">
              {{ a.correct_answer }}
            </span>
          </div>
        </div>
      </div>

    </div>

    <!-- 비교 분석 -->
    <div v-if="isCompare" class="analysis">

      <div>
        <b>이전엔 맞았는데 이번에 틀린 문제</b>
        <div class="numbers">
          <span v-for="n in regressed" :key="n" class="compare-regressed">
            {{ n }}
          </span>
        </div>
      </div>

      <div>
        <b>계속 틀린 문제</b>
        <div class="numbers">
          <span v-for="n in stillWrong" :key="n" class="compare-still-wrong">
            {{ n }}
          </span>
        </div>
      </div>

    </div>

    <button class="home-btn" @click="goBack">뒤로가기</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/api'

const route = useRoute()
const router = useRouter()

const exam = ref<any>(null)
const allExams = ref<any[]>([])

const currentIndex = ref(0)
const showAnswer = ref(false)
const showCompareAnswer = ref(false)

const selectedCompareExamId = ref<number | null>(null)
const isCompare = ref(false)

onMounted(async () => {
  const examId = route.params.id

  const res = await api.get(`/exams/${examId}/`)
  exam.value = res.data

  const listRes = await api.get('/exams/')
  allExams.value = listRes.data
})

const currentSubject = computed(() => {
  if (!exam.value?.subjects) return null
  return exam.value.subjects[currentIndex.value]
})

const stats = computed(() => {
  if (!currentSubject.value) return {}

  let correct = 0
  let wrong = 0
  let unanswered = 0

  currentSubject.value.answers.forEach((a: any) => {
    if (a.user_answer == null) unanswered++
    else if (a.user_answer === a.correct_answer) correct++
    else wrong++
  })

  const solved = correct + wrong

  return {
    correct,
    wrong,
    unanswered,
    solved,
    accuracy: solved === 0 ? '0.0' : ((correct / solved) * 100).toFixed(1)
  }
})

const getStatus = (a: any) => {
  if (a.user_answer == null) return 'unanswered'
  if (a.user_answer === a.correct_answer) return 'correct'
  return 'wrong'
}

const sameExams = computed(() => {
  if (!exam.value) return []

  return allExams.value.filter(e =>
    e.id !== exam.value.id &&
    e.template_id &&
    e.template_id === exam.value.template_id
  )
})

const compareExam = computed(() =>
  allExams.value.find(e => e.id === selectedCompareExamId.value)
)

const compareSubject = computed(() => {
  if (!compareExam.value || !currentSubject.value) return null

  return compareExam.value.subjects?.find(
    (s: any) => s.subject_name === currentSubject.value.subject_name
  )
})

const compareStats = computed(() => {
  if (!compareSubject.value)
    return { correct: 0, wrong: 0, unanswered: 0, accuracy: '0.0' }

  let correct = 0
  let wrong = 0
  let unanswered = 0

  compareSubject.value.answers.forEach((a: any) => {
    if (a.user_answer == null) unanswered++
    else if (a.user_answer === a.correct_answer) correct++
    else wrong++
  })

  return {
    correct,
    wrong,
    unanswered,
    accuracy: ((correct / compareSubject.value.answers.length) * 100).toFixed(1)
  }
})

const regressed = computed(() => {
  if (!compareSubject.value || !currentSubject.value) return []

  return currentSubject.value.answers.flatMap((a: any, i: number) => {
    const prev = compareSubject.value.answers[i]
    return prev.user_answer === prev.correct_answer &&
           a.user_answer !== a.correct_answer
      ? [i + 1]
      : []
  })
})

const stillWrong = computed(() => {
  if (!compareSubject.value || !currentSubject.value) return []

  return currentSubject.value.answers.flatMap((a: any, i: number) => {
    const prev = compareSubject.value.answers[i]
    return prev.user_answer !== prev.correct_answer &&
           a.user_answer !== a.correct_answer
      ? [i + 1]
      : []
  })
})

const applyCompare = () => {
  if (!selectedCompareExamId.value) return
  isCompare.value = true
}

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

/* 🔹 과목 탭 */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tabs button {
  flex: 1;
  padding: 8px;
  border: 1px solid black;
  background: f0f0f0;
}

.tabs .active {
  background: black;
  color: white;
}

/* 🔹 카드 */
.card {
  border: 1px solid #ddd;
  padding: 20px;
  background: white;
    flex: 1;
  min-width: 0;
}

.compare-wrapper {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.card-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
}


/* 🔹 시험 정보 */
.info {
  margin-bottom: 15px;
}

/* 🔹 통계 */
.summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

/* 🔹 박스 영역 */
.box {
  margin-bottom: 15px;
}

.box-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.numbers {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 🔴 오답 */
.wrong-box .numbers span {
  background: #ffe5e5;
  color: red;
  padding: 4px 6px;
  border-radius: 4px;
}

/* ⚪ 미응답 */
.unanswered-box .numbers span {
  background: #eee;
  color: #666;
  padding: 4px 6px;
  border-radius: 4px;
}

/* 🔹 토글 */
.toggle {
  margin-top: 20px;
  cursor: pointer;
  font-weight: bold;
}

/* 🔹 입력답안 리스트 */
.wrong-list {
  margin-top: 10px;
}

/* 🔹 헤더 / 행 */
.wrong-header,
.wrong-item {
  display: grid;
  grid-template-columns: repeat(3, 40px);
  gap: 8px;
  margin-bottom: 6px;
}

/* 🔹 공통 칩 */
.chip {
  width: 40px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
}

/* 🔹 헤더 */
.header-chip {
  background: #ddd;
}

/* 🔹 번호 */
.number-chip {
  background: #eee;
}

/* 🔵 정답 */
.correct-answer {
  background: #e5f0ff;
  color: blue;
}

/* 🔥 입력답안 상태 */
.correct {
  background: #e5f0ff;
  color: blue;
}

.wrong {
  background: #ffe5e5;
  color: red;
}

.unanswered {
  background: #eee;
  color: #666;
}

/* 🔹 버튼 */
.home-btn,
.back {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
}

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

.compare {
  margin-top: 10px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.analysis {
  margin-top: 20px;
}

.analysis b {
  display: block;
  margin-bottom: 5px;
}

/* 🔥 이전엔 맞았는데 이번에 틀림 (강한 경고 → 빨강) */
.compare-regressed {
  background: #ffe5e5;
  color: red;
  padding: 4px 6px;
  border-radius: 4px;
}

/* 🔥 계속 틀림 (덜 강조 → 회색 or 주황 선택 가능) */
.compare-still-wrong {
  background: #fff4e5;
  color: #ff8800;
  padding: 4px 6px;
  border-radius: 4px;
}
</style>