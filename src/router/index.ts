import { createRouter, createWebHistory } from 'vue-router'

import StartView from '@/views/StartView.vue'
import ExamView from '@/views/ExamView.vue'
import WaitView from '@/views/WaitView.vue'
import ResultView from '@/views/ResultView.vue'
import HistoryView from '@/views/HistoryView.vue'
import HistoryDetailView from '@/views/HistoryDetailView.vue'
import GradeView from '@/views/GradeView.vue'
import CreateExamView from '@/views/CreateExamView.vue'



const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: StartView }, // 시작 페이지
    { path: '/exam', component: ExamView },
    { path: '/wait', component: WaitView },
    { path: '/result', component: ResultView },
    { path: '/history', component: HistoryView },
    { path: '/history/:id', component: HistoryDetailView },
    { path: '/grade', component: GradeView },
    { path: '/create', component: CreateExamView }
  ]
})

export default router