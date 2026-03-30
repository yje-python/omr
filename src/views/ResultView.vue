<template>
  <div v-if="exam" class="page">

    <h2 class="title">채점 결과</h2>

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

    <!-- 🔹 카드 -->
    <div class="card" v-if="currentSubject">

      <!-- 시험 정보 -->
      <div class="info">
        <div>시험명: {{ exam.exam_name }}</div>
        <div>응시시간: {{ formatDate(exam.created_at) }}</div>
      </div>

      <!-- 통계 -->
      <div class="summary">
        <div>점수: {{ stats.correct }} / {{ currentSubject.answers.length }}</div>
        <div>푼 문제: {{ stats.solved }}</div>
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

        <div class="wrong-header">
          <span class="chip header-chip">번호</span>
          <span class="chip header-chip">내 답</span>
          <span class="chip header-chip">정답</span>
          <span class="chip header-chip">저장</span>
        </div>

        <div
          v-for="(a, i) in currentSubject.answers"
          :key="i"
          class="wrong-item"
        >
          <span class="chip number-chip">{{ Number(i) + 1 }}</span>

          <span class="chip my-answer">
            {{ a.user_answer ?? '-' }}
          </span>

          <span class="chip correct-answer">
            {{ a.correct_answer }}
          </span>

          <!-- 🔥 여기 넣어야 함 -->
          <button
            v-if="a.user_answer && a.user_answer !== a.correct_answer"
            @click="saveWrongNote(currentSubject.id, Number(i), a)"
          >
            저장
          </button>
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
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOmrStore } from '@/stores/omr'
import { createWrongNote } from '@/api/exam'

const store = useOmrStore()
const router = useRouter()
const route = useRoute()

const exam = computed(() => store.currentExam)

const currentIndex = ref(0)
const showWrong = ref(false)

onMounted(async () => {
  const id = route.params.id
  if (id) {
    await store.fetchExamFromServer(Number(id))
  }
})

const currentSubject = computed(() => {
  if (!exam.value) return null
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

const wrongNumbers = computed(() => {
  if (!currentSubject.value) return []
  return currentSubject.value.answers
    .map((a: any, i: number) => {
      if (a.user_answer && a.user_answer !== a.correct_answer) return i + 1
      return null
    })
    .filter(Boolean)
})

const unansweredNumbers = computed(() => {
  if (!currentSubject.value) return []
  return currentSubject.value.answers
    .map((a: any, i: number) => (!a.user_answer ? i + 1 : null))
    .filter(Boolean)
})

const wrongDetail = computed(() => {
  if (!currentSubject.value) return []
  return currentSubject.value.answers
    .map((a: any, i: number) => {
      if (a.user_answer && a.user_answer !== a.correct_answer) {
        return { index: i + 1, my: a.user_answer, correct: a.correct_answer }
      }
      return null
    })
    .filter(Boolean)
})

const saveWrongNote = async (subjectId: number, index: number, a: any) => {
  await createWrongNote({
    subject_id: subjectId,
    question_number: index + 1,
    user_answer: a.user_answer,
    correct_answer: a.correct_answer,
    memo: ''
  })

  alert('오답노트 저장 완료')
}

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