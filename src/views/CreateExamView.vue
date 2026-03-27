<template>
  <div class="container">
    <div class="content">
      <h1 class="title">시험 생성</h1>

      <!-- 🔹 템플릿 선택 -->
      <div class="form-group">
        <label>시험 템플릿</label>
        <div class="template-row">
          <select v-model="selectedTemplateId">
            <option value="">직접 생성</option>
            <option
              v-for="t in templates"
              :key="t.id"
              :value="t.id"
            >
              {{ t.name }}
            </option>
          </select>
          <button @click="applyTemplate">불러오기</button>
        </div>

        <div class="template-actions" v-if="selectedTemplateId">
          <button @click="updateTemplate">수정</button>
          <button @click="deleteTemplate">삭제</button>
        </div>
      </div>

      <!-- 시험 이름 -->
      <div class="form-group">
        <label>시험 이름</label>
        <input v-model="examName" type="text" />
      </div>

      <!-- 과목 추가 -->
      <div class="form-group">
        <label>과목 추가</label>

        <div class="subject-input">
          <input v-model="newSubject" type="text" placeholder="과목 이름" />
          <input v-model.number="newQuestionCount" type="number" min="1" placeholder="문제 수" />
          <input v-model.number="newTimeLimit" type="number" min="1" placeholder="시간(분)" />
          <button @click="addSubject">추가</button>
        </div>

        <div class="subject-list">
          <div
            v-for="(s, i) in subjects"
            :key="i"
            class="subject-item"
          >
            {{ s.name }} ({{ s.questionCount }}문제 / {{ s.timeLimit }}분)
            <button @click="removeSubject(i)">삭제</button>
          </div>
        </div>

        <!-- 🔹 템플릿 저장 -->
        <button class="save-btn" @click="saveTemplate">
          현재 구성 저장
        </button>
      </div>

      <!-- 시작 버튼 -->
      <button class="start-btn" @click="startExam">
        시험 시작
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOmrStore } from '@/stores/omr'

const router = useRouter()
const store = useOmrStore()

const examName = ref('')

const subjects = ref<{
  name: string
  questionCount: number
  timeLimit: number
}[]>([])

const newSubject = ref('')
const newQuestionCount = ref(20)
const newTimeLimit = ref(30)

// 🔹 템플릿
const templates = ref<any[]>([])
const selectedTemplateId = ref<number | ''>('')

// 🔹 로드
const loadTemplates = () => {
  const data = localStorage.getItem('examTemplates')
  templates.value = data ? JSON.parse(data) : []
}

// 🔹 저장
const saveTemplate = () => {
  if (subjects.value.length === 0) return

  const name = prompt('템플릿 이름 입력')
  if (!name) return

  const newTemplate = {
    id: Date.now(),
    name,
    subjects: JSON.parse(JSON.stringify(subjects.value)),
  }

  const updated = [...templates.value, newTemplate]
  localStorage.setItem('examTemplates', JSON.stringify(updated))
  templates.value = updated
}

// 🔹 불러오기
const applyTemplate = () => {
  if (!selectedTemplateId.value) return

  const template = templates.value.find(
    t => t.id === selectedTemplateId.value
  )

  if (!template) return

  subjects.value = JSON.parse(JSON.stringify(template.subjects))
}

// 🔹 수정
const updateTemplate = () => {
  if (!selectedTemplateId.value) return

  const idx = templates.value.findIndex(
    t => t.id === selectedTemplateId.value
  )

  if (idx === -1) return

  const newName = prompt('템플릿 이름 수정', templates.value[idx].name)
  if (!newName) return

  templates.value[idx] = {
    ...templates.value[idx],
    name: newName,
    subjects: JSON.parse(JSON.stringify(subjects.value)),
  }

  localStorage.setItem('examTemplates', JSON.stringify(templates.value))
}

// 🔹 삭제
const deleteTemplate = () => {
  if (!selectedTemplateId.value) return

  const confirmDelete = confirm('정말 삭제할까요?')
  if (!confirmDelete) return

  templates.value = templates.value.filter(
    t => t.id !== selectedTemplateId.value
  )

  localStorage.setItem('examTemplates', JSON.stringify(templates.value))

  selectedTemplateId.value = ''
}

// 🔹 과목 추가
const addSubject = () => {
  if (!newSubject.value.trim()) return

  subjects.value.push({
    name: newSubject.value.trim(),
    questionCount: newQuestionCount.value,
    timeLimit: newTimeLimit.value,
  })

  newSubject.value = ''
}

// 🔹 과목 삭제
const removeSubject = (index: number) => {
  subjects.value.splice(index, 1)
}

// 🔹 시험 시작
const startExam = () => {
  if (!examName.value) {
    alert('시험 이름 입력')
    return
  }

  if (subjects.value.length === 0) {
    alert('과목 추가 필요')
    return
  }

  store.createExam(examName.value, selectedTemplateId.value || null)

  subjects.value.forEach(s => {
    store.addSubject(s.name, s.questionCount, s.timeLimit)
  })

  router.push('/exam')
}

onMounted(() => {
  loadTemplates()
})
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
  width: 420px;
}

.title {
  text-align: center;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.template-row {
  display: flex;
  gap: 5px;
}

.template-actions {
  margin-top: 5px;
  display: flex;
  gap: 5px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input,
select {
  padding: 6px;
  box-sizing: border-box;
}

.subject-input {
  display: flex;
  gap: 5px;
}

.subject-input input {
  flex: 1;
}

.subject-list {
  margin-top: 10px;
}

.subject-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.start-btn {
  width: 100%;
  padding: 10px;
  margin-top: 20px;
}

.save-btn {
  width: 100%;
  margin-top: 10px;
}
</style>