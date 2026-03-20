import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useOmrStore } from '@/stores/omr'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const store = useOmrStore()

// 🔹 불러오기
store.loadFromStorage()

// 🔹 자동 저장
watch(
  () => ({
    exams: store.exams,
    currentExamId: store.currentExamId,
  }),
  (val) => {
    localStorage.setItem('omr-data', JSON.stringify(val))
  },
  { deep: true }
)

app.mount('#app')