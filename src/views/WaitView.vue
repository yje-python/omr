<template>
  <div class="container">
    <div class="content">
      <h1 class="title">시간 종료</h1>

      <div class="buttons">
        <!-- 🔹 다음 과목이 있을 때만 표시 -->
        <button v-if="hasNextSubject" @click="next">
          다음 과목
        </button>

        <!-- 🔹 채점하기는 항상 표시 -->
        <button @click="goGrading">채점하기</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOmrStore } from '@/stores/omr'

const router = useRouter()
const store = useOmrStore()

// 🔹 현재 시험
const currentExam = computed(() => store.getCurrentExam())

// 🔹 다음 과목 존재 여부
const hasNextSubject = computed(() => {
  if (!currentExam.value) return false

  return (
    store.currentSubjectIndex <
    currentExam.value.subjects.length - 1
  )
})

// 🔹 다음 과목 이동
const next = () => {
  const hasNext = store.nextSubject()

  if (hasNext) {
    router.push('/exam')
  } else {
    router.push('/grade')
  }
}

// 🔹 채점 페이지 이동
const goGrading = () => {
  router.push('/grade')
}
</script>

<style scoped>
.container {
  height: 100vh;
  position: relative;
}

.content {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.title {
  font-size: 48px;
  margin-bottom: 40px;
}

.buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>