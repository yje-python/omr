<template>
  <div class="page">
    <div class="wrapper">
      <div class="header">
        <button class="submit" @click="finishGrading">채점 완료</button>
      </div>

      <div
        class="table"
        tabindex="0"
        ref="tableRef"
        @keydown="handleKeydown"
      >
        <!-- 🔹 과목 반복 -->
        <div
          v-for="(subject, sIndex) in exam.subjects"
          :key="subject.subjectId"
          class="subject-block"
        >
          <div class="subject-title">
            {{ subject.subjectName }}
          </div>

          <!-- 행 -->
          <div
            v-for="row in getRows(subject.correctAnswers.length)"
            :key="row"
            class="row"
            :class="{ even: row % 2 === 0 }"
          >
            <template v-for="col in 5" :key="col">
              <div
                v-if="getIndex(row, col) < subject.correctAnswers.length"
                class="cell-group"
              >
                <!-- 번호 -->
                <div class="number">
                  {{ formatNumber(getIndex(row, col) + 1) }}
                </div>

                <!-- 입력 칸 -->
                <div
                  class="answer-cell"
                  :class="{
                    active:
                      currentSubjectIndex === sIndex &&
                      currentIndex === getIndex(row, col)
                  }"
                  @click="setCurrent(sIndex, getIndex(row, col))"
                >
                  {{ subject.correctAnswers[getIndex(row, col)] ?? '' }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOmrStore } from '@/stores/omr'
import axios from '@/api/api'

const store = useOmrStore()
const router = useRouter()

const exam = store.getCurrentExam()
onMounted(() => {
  if (!exam) {
    alert('시험 데이터가 없습니다')
    router.push('/')
  }
})

const currentSubjectIndex = ref(0)
const currentIndex = ref(0)

const tableRef = ref(null)

onMounted(() => {
  tableRef.value?.focus()
})

const getRows = (total) => Math.ceil(total / 5)

const getIndex = (row, col) => {
  return (row - 1) * 5 + (col - 1)
}

const setCurrent = (sIndex, index) => {
  currentSubjectIndex.value = sIndex
  currentIndex.value = index
}

const handleKeydown = (e) => {
  const key = e.key
  const subject = exam.subjects[currentSubjectIndex.value]

  if (/^[1-5]$/.test(key)) {
    subject.correctAnswers[currentIndex.value] = Number(key)
    moveNext()
  }

  if (key === 'Backspace') {
    subject.correctAnswers[currentIndex.value] = null

    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  if (key === 'ArrowRight' && currentIndex.value < subject.correctAnswers.length - 1) {
    currentIndex.value++
  }

  if (key === 'ArrowLeft' && currentIndex.value > 0) {
    currentIndex.value--
  }

  if (key === 'ArrowDown' && currentIndex.value + 5 < subject.correctAnswers.length) {
    currentIndex.value += 5
  }

  if (key === 'ArrowUp' && currentIndex.value - 5 >= 0) {
    currentIndex.value -= 5
  }
}

const moveNext = () => {
  const subject = exam.subjects[currentSubjectIndex.value]

  if (currentIndex.value < subject.correctAnswers.length - 1) {
    currentIndex.value++
  } else {
    if (currentSubjectIndex.value < exam.subjects.length - 1) {
      currentSubjectIndex.value++
      currentIndex.value = 0
    }
  }
}

// 🔥 핵심 수정
const finishGrading = async () => {
  // 점수 계산
  exam.subjects.forEach(subject => {
    let correct = 0

    subject.answers.forEach((ans, i) => {
      if (ans === subject.correctAnswers[i]) correct++
    })

    subject.score = correct
  })

  // 시험 저장 (여기서 WrongNote 자동 생성됨)
  const savedExam = await store.saveExamToServer()

  // 이동
  router.push(`/history/${savedExam.id}`)
}

const formatNumber = (n) =>
  n.toString().padStart(2, '0')
</script>

<style scoped>
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
  padding-left: 20px;
  z-index: 1000;
}

.submit {
  padding: 6px 12px;
  font-size: 14px;
}

.wrapper {
  width: fit-content;
  margin: 0 auto;
}

.table {
  width: fit-content;
  border: 1px solid #ccc;
  display: inline-block;
  outline: none;
}

.subject-block {
  margin-bottom: 30px;
}

.subject-title {
  font-weight: bold;
  margin-bottom: 10px;
}

.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}

.even {
  background: #fbf8f3;
}

.cell-group {
  display: flex;
  border: 1px solid #ddd;
  height: 40px;
}

.number {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-right: 1px solid #ddd;
}

.answer-cell {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.answer-cell.active {
  border: 2px solid #42b883;
}
</style>

<style scoped>
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
  padding-left: 20px;
  z-index: 1000;
}

.submit {
  padding: 6px 12px;
  font-size: 14px;
}

.wrapper {
  width: fit-content;
  margin: 0 auto;
}

.table {
  width: fit-content;
  border: 1px solid #ccc;
  display: inline-block;
  outline: none;
}

.subject-block {
  margin-bottom: 30px;
}

.subject-title {
  font-weight: bold;
  margin-bottom: 10px;
}

.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}

.even {
  background: #fbf8f3;
}

.cell-group {
  display: flex;
  border: 1px solid #ddd;
  height: 40px;
}

.number {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-right: 1px solid #ddd;
}

.answer-cell {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.answer-cell.active {
  border: 2px solid #42b883;
}
</style>