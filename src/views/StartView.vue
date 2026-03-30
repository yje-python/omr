<template>
  <div class="container">
    <div class="content">
      <h1 class="title">OMR 시험 시스템</h1>

      <div class="buttons">
        <button @click="startExam">응시하기</button>
        <button @click="goHistory">지난 결과 확인하기</button>
        <button @click="goWrongNote">오답노트 보기</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useOmrStore } from '@/stores/omr'

const router = useRouter()
const store = useOmrStore()

const startExam = () => {
  router.push('/create')
}

const goHistory = () => {
  router.push('/history')
}

const goWrongNote = () => {
  router.push('/wrong-note')
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