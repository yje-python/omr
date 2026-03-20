<template>
  <div v-if="exam" class="page">

    <h2 class="title">채점 결과</h2>

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

    <!-- 🔹 카드 -->
    <div class="card" v-if="currentSubject">

      <!-- 시험 정보 -->
      <div class="info">
        <div>시험명: {{ exam.examName }}</div>
        <div>응시시간: {{ formatDate(exam.createdAt) }}</div>
      </div>

      <!-- 통계 -->
      <div class="summary">
        <div>점수: {{ currentSubject.score }} / {{ currentSubject.answers.length }}</div>
        <div>정답: {{ stats.correct }}</div>
        <div>오답: {{ stats.wrong }}</div>
        <div>미응답: {{ stats.unanswered }}</div>
        <div>정답률: {{ stats.accuracy }}%</div>
      </div>

      <!-- 오답 -->
      <div class="box wrong-box">
        <div class="box-title">오답 문제</div>
        <div class="numbers">
          <span v-for="n in wrongNumbers" :key="n">{{ n }}</span>
        </div>
      </div>

      <!-- 미응답 -->
      <div class="box unanswered-box">
        <div class="box-title">미응답 문제</div>
        <div class="numbers">
          <span v-for="n in unansweredNumbers" :key="n">{{ n }}</span>
        </div>
      </div>

      <!-- 오답노트 -->
      <div class="toggle" @click="showWrong = !showWrong">
        오답노트 {{ showWrong ? '▲' : '▼' }}
      </div>

      <div v-if="showWrong" class="wrong-list">

        <!-- 헤더 -->
        <div class="wrong-header">
          <span class="chip header-chip">번호</span>
          <span class="chip header-chip">내 답</span>
          <span class="chip header-chip">정답</span>
        </div>

        <!-- 데이터 -->
        <div
          v-for="item in wrongDetail"
          :key="item.index"
          class="wrong-item"
        >
          <span class="chip number-chip">{{ item.index }}</span>
          <span class="chip my-answer">{{ item.my }}</span>
          <span class="chip correct-answer">{{ item.correct }}</span>
        </div>
      </div>

    </div>

    <button class="home-btn" @click="goHome">홈으로</button>
  </div>

  <div v-else>
    <p>결과가 없습니다.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOmrStore } from '@/stores/omr'

const store = useOmrStore()
const router = useRouter()

const exam = computed(() => store.getCurrentExam())

const currentIndex = ref(0)
const showWrong = ref(false)

const currentSubject = computed(() => {
  if (!exam.value) return null
  return exam.value.subjects[currentIndex.value]
})

const stats = computed(() => {
  if (!currentSubject.value) return {}

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

const wrongNumbers = computed(() => {
  if (!currentSubject.value) return []
  return currentSubject.value.answers
    .map((ans: number, i: number) => {
      const c = currentSubject.value.correctAnswers[i]
      if (ans && ans !== c) return i + 1
      return null
    })
    .filter(Boolean)
})

const unansweredNumbers = computed(() => {
  if (!currentSubject.value) return []
  return currentSubject.value.answers
    .map((ans: number, i: number) => (!ans ? i + 1 : null))
    .filter(Boolean)
})

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

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.page {
  max-width: 600px;
  margin: 40px auto;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

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

.card {
  border: 1px solid #ddd;
  padding: 20px;
}

.info {
  margin-bottom: 15px;
}

.summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

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

.numbers span {
  padding: 4px 6px;
  background: #f3f3f3;
  border-radius: 4px;
}

.wrong-box .numbers span {
  background: #ffe5e5;
}

.unanswered-box .numbers span {
  background: #f0f0f0;
}

.toggle {
  margin-top: 20px;
  cursor: pointer;
  font-weight: bold;
}

.wrong-header,
.wrong-item {
  display: grid;
  grid-template-columns: repeat(3, 40px);
  gap: 8px;
  margin-bottom: 6px;
}

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

.header-chip {
  background: #ddd;
}

.number-chip {
  background: #eee;
}

.my-answer {
  background: #ffe5e5;
  color: red;
}

.correct-answer {
  background: #e5f0ff;
  color: blue;
}

.home-btn {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
}
</style>