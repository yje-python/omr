<template>
  <div class="page">
    <div class="wrapper">
      
      <!-- 🔥 subject 있을 때만 렌더 -->
      <template v-if="subject">
        <div class="header">
          <button class="submit" @click="finishExam">응시 종료</button>
          <div class="timer">{{ minutes }} : {{ seconds }}</div>
        </div>

        <div class="table">
          <!-- 헤더 -->
          <div class="row header-row">
            <div class="cell number">번호</div>
            <div class="cell" v-for="c in 5" :key="c">{{ c }}</div>
          </div>

          <!-- 문제 -->
          <div
            v-for="q in questionCount"
            :key="q"
            class="row"
            :class="{ even: q % 2 === 0 }"
          >
            <div class="cell number">
              {{ formatNumber(q) }}
            </div>

            <div
              v-for="choice in 5"
              :key="choice"
              class="cell"
              @click="select(q, choice)"
            >
              <div
                class="circle"
                :class="{ selected: subject.answers[q - 1] === choice }"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- 🔥 subject 없을 때 -->
      <template v-else>
        <div class="loading">
          과목 정보를 불러오는 중...
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOmrStore } from '@/stores/omr'

const store = useOmrStore()
const router = useRouter()

// 🔹 현재 시험
const exam = computed(() => store.getCurrentExam())

const subject = computed(() => {
  if (!exam.value) return null
  if (exam.value.subjects.length === 0) return null
  return exam.value.subjects[store.currentSubjectIndex]
})

const questionCount = computed(() => subject.value?.questionCount ?? 0)

const timeLeft = ref(0)

onMounted(() => {
  if (subject.value) {
    timeLeft.value = subject.value.timeLimit * 60
  }
})

// 🔹 답 선택
const select = (q: number, choice: number) => {
  if (!subject.value) return
  subject.value.answers[q - 1] = choice
}

// 🔹 종료
const finishExam = () => {
  router.push('/wait')
}

// 🔹 타이머
let timer: number

onMounted(() => {
  timer = window.setInterval(() => {
    if (timeLeft.value <= 0) {
      clearInterval(timer)
      router.push('/wait')
      return
    }
    timeLeft.value--
  }, 1000)
})

onUnmounted(() => clearInterval(timer))

// 🔹 시간 포맷
const minutes = computed(() =>
  Math.floor(timeLeft.value / 60).toString().padStart(2, '0')
)

const seconds = computed(() =>
  (timeLeft.value % 60).toString().padStart(2, '0')
)

// 🔹 번호 포맷
const formatNumber = (n: number) =>
  n.toString().padStart(2, '0')
</script>

<style scoped>
body {
  margin: 0;
}

.page {
  padding-top: 40px;
}

.header {
  position: fixed;
  top: 0;
  width: 100%;
  height: 40px;
  background: white;

  display: flex;
  align-items: center;
  gap: 20px;
  padding-left: 20px;
  z-index: 1000;
}

.submit {
  padding: 6px 12px;
  font-size: 14px;
}

.timer {
  font-weight: bold;
}

.wrapper {
  width: fit-content;
  margin: 0 auto;
}

.table {
  width: fit-content;
  border: 1px solid #ccc;
  display: inline-block;
}

.row {
  display: grid;
  grid-template-columns: 50px repeat(5, 40px);
}

.header-row {
  background: #eee;
  font-weight: bold;
}

.cell {
  border: 1px solid #ddd;
  height: 35px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.number {
  font-weight: bold;
}

.even {
  background: #fbf8f3;
}

.circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid black;
  background: white;
  cursor: pointer;
}

.circle.selected {
  background: black;
}
</style>