<template>
  <div v-if="exam" class="page">

    <h2 class="title">시험 상세 결과</h2>

        <!-- 🔥 비교 선택 -->
      <div class="compare-box">
        <select v-model="selectedCompareExamId">
          <option value="">비교할 시험 선택</option>
          <option
            v-for="e in sameExams"
            :key="e.examId"
            :value="e.examId"
          >
            {{ e.examName }}
          </option>
        </select>

        <button @click="applyCompare">비교하기</button>
      </div>

    <!-- 🔹 과목 선택 (그대로 유지) -->
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



    <!-- 🔹 카드 (완전 동일) -->
<!-- 🔥 카드 영역 -->
<div :class="isCompare ? 'compare-wrapper' : ''">

  <!-- 현재 시험 -->
  <div class="card">
    <h4 class="card-title">{{ exam.examName }}</h4>

    <div>점수: {{ currentSubject.score }} / {{ currentSubject.answers.length }}</div>
    <div>정답: {{ stats.correct }}</div>
    <div>오답: {{ stats.wrong }}</div>
    <div>미응답: {{ stats.unanswered }}</div>
    <div>정답률: {{ stats.accuracy }}%</div>

    <!-- 🔥 입력답안 (기존 유지 그대로) -->
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
        v-for="(ans, i) in currentSubject.answers"
        :key="i"
        class="wrong-item"
      >
        <span class="chip number-chip">{{ Number(i) + 1 }}</span>

        <span
          class="chip"
          :class="getStatus(ans, currentSubject.correctAnswers[i])"
        >
          {{ ans || '-' }}
        </span>

        <span class="chip correct-answer">
          {{ currentSubject.correctAnswers[i] }}
        </span>
      </div>
    </div>
  </div>

  <!-- 🔥 비교 시험 -->
  <div v-if="isCompare && compareSubject" class="card">
    <h4 class="card-title">{{ compareExam?.examName }}</h4>

    <div>점수: {{ compareSubject.score }} / {{ compareSubject.answers.length }}</div>
    <div>정답: {{ compareStats.correct }}</div>
    <div>오답: {{ compareStats.wrong }}</div>
    <div>미응답: {{ compareStats.unanswered }}</div>
    <div>정답률: {{ compareStats.accuracy }}%</div>

    <!-- 🔥 입력답안 (비교용 동일하게) -->
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
        v-for="(ans, i) in compareSubject.answers"
        :key="i"
        class="wrong-item"
      >
        <span class="chip number-chip">{{ Number(i) + 1 }}</span>

        <span
          class="chip"
          :class="getStatus(ans, compareSubject.correctAnswers[i])"
        >
          {{ ans || '-' }}
        </span>

        <span class="chip correct-answer">
          {{ compareSubject.correctAnswers[i] }}
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
          <span v-for="n in regressed" :key="n" class="compare-regressed">{{ n }}</span>
        </div>
      </div>

      <div>
        <b>계속 틀린 문제</b>
        <div class="numbers">
          <span v-for="n in stillWrong" :key="n" class="compare-still-wrong">{{ n }}</span>
        </div>
      </div>

    </div>

    <button class="home-btn" @click="goBack">뒤로가기</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOmrStore } from '@/stores/omr'

const store = useOmrStore()
const route = useRoute()
const router = useRouter()
const showCompareAnswer = ref(false)
// 🔥 핵심: ID로 조회
const exam = computed(() =>
  store.exams.find(e => e.examId === route.params.id)
)

const currentIndex = ref(0)
const showAnswer = ref(false)

const currentSubject = computed(() => {
  if (!exam.value) return null
  return exam.value.subjects[currentIndex.value]
})

const stats = computed(() => {
  if (!currentSubject.value) return {
    correct: 0, wrong: 0, unanswered: 0, accuracy: '0.0'
  }

  let correct = 0
  let wrong = 0
  let unanswered = 0

  currentSubject.value.answers.forEach((ans: number, i: number) => {
    const c = currentSubject.value.correctAnswers[i]

    if (!ans) unanswered++
    else if (ans === c) correct++
    else wrong++
  })

  return {
    correct,
    wrong,
    unanswered,
    accuracy: ((correct / currentSubject.value.answers.length) * 100).toFixed(1)
  }
})

// 🔥 flatMap으로 타입 문제 제거
const wrongNumbers = computed(() => {
  if (!currentSubject.value) return []
  return currentSubject.value.answers.flatMap((ans: number, i: number) => {
    const c = currentSubject.value.correctAnswers[i]
    return ans && ans !== c ? [i + 1] : []
  })
})

const unansweredNumbers = computed(() => {
  if (!currentSubject.value) return []
  return currentSubject.value.answers.flatMap((ans: number, i: number) => {
    return !ans ? [i + 1] : []
  })
})

const getStatus = (ans: number, correct: number) => {
  if (!ans) return 'unanswered'
  if (ans === correct) return 'correct'
  return 'wrong'
}

const formatDate = (date: string) =>
  new Date(date).toLocaleString()

const goBack = () => router.push('/history')

const selectedCompareExamId = ref('')
const isCompare = ref(false)

const isSameTemplate = (a: any, b: any) => {
  if (!a.subjects || !b.subjects) return false

  // 과목 개수 다르면 다른 템플릿
  if (a.subjects.length !== b.subjects.length) return false

  // 과목 이름 동일한지 확인
  return a.subjects.every((s: any, i: number) =>
    s.subjectName === b.subjects[i].subjectName
  )
}

const sameExams = computed(() => {
  if (!exam.value) return []

  return store.exams.filter(e =>
    e.examId !== exam.value.examId &&
    isSameTemplate(e, exam.value)
  )
})

const compareExam = computed(() =>
  store.exams.find(e => e.examId === selectedCompareExamId.value)
)

const compareSubject = computed(() => {
  if (!compareExam.value || !currentSubject.value) return null

  const subject = compareExam.value.subjects.find(
    (s: any) => s.subjectName === currentSubject.value.subjectName
  )

  return subject || null
})

const applyCompare = () => {
  if (!selectedCompareExamId.value) return
  isCompare.value = true
}

const compareStats = computed(() => {
  if (!compareSubject.value) {
    return { correct: 0, wrong: 0, unanswered: 0, accuracy: '0.0' }
  }

  let correct = 0
  let wrong = 0
  let unanswered = 0

  compareSubject.value.answers.forEach((ans: number, i: number) => {
    const c = compareSubject.value.correctAnswers[i]

    if (!ans) unanswered++
    else if (ans === c) correct++
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

  return currentSubject.value.answers.flatMap((ans: number, i: number) => {
    const prev = compareSubject.value.answers[i]
    const c = currentSubject.value.correctAnswers[i]

    return prev === c && ans !== c ? [i + 1] : []
  })
})

const stillWrong = computed(() => {
  if (!compareSubject.value || !currentSubject.value) return []

  return currentSubject.value.answers.flatMap((ans: number, i: number) => {
    const prev = compareSubject.value.answers[i]
    const c = currentSubject.value.correctAnswers[i]

    return prev !== c && ans !== c ? [i + 1] : []
  })
})
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