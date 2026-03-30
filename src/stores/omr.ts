import { defineStore } from 'pinia'
import api from '@/api/api'

type Subject = {
  subjectName: string
  questionCount: number
  timeLimit: number
  answers: number[]
  correctAnswers: number[]
  score: number
}

type Exam = {
  examName: string
  templateId?: number | null
  subjects: Subject[]
}

export const useOmrStore = defineStore('omr', {
  state: () => ({
    exams: [] as any[],
    currentExam: null as any,
    currentSubjectIndex: 0,
  }),

  actions: {
    // 🔹 서버에서 시험 목록 가져오기
    async fetchExamsFromServer() {
      const res = await api.get('/exams/')
      this.exams = res.data
    },

    // 🔹 서버에서 시험 상세 가져오기
    async fetchExamFromServer(id: number) {
      const res = await api.get(`/exams/${id}/`)
      this.currentExam = res.data
    },

    // 🔹 시험 저장 (핵심)
    async saveExamToServer() {
      if (!this.currentExam) return

      const exam = this.currentExam

      const payload = {
        exam_name: exam.examName,
        template_id: exam.templateId,
        subjects: exam.subjects.map((s: Subject) => ({
          subject_name: s.subjectName,
          question_count: s.questionCount,
          time_limit: s.timeLimit,
          answers: s.answers,
          correct_answers: s.correctAnswers,
        }))
      }

      const res = await api.post('/exams/', payload)

      this.currentExam = res.data
      this.exams.unshift(res.data)
      return res.data 
    },

    // 🔹 시험 생성 (프론트 상태용)
    createExam(name: string, templateId?: number | null) {
      this.currentExam = {
        examName: name,
        templateId: templateId ?? null,
        subjects: [],
      }

      this.currentSubjectIndex = 0
    },

    // 🔹 현재 시험
    getCurrentExam() {
      return this.currentExam
    },

    // 🔹 이전 시험 (서버 데이터 기준)
    getPreviousExams() {
      if (!this.currentExam) return []

      return this.exams.filter(e =>
        e.template_id === this.currentExam.templateId
      )
    },

    // 🔹 다음 과목
    nextSubject() {
      const exam = this.currentExam

      if (this.currentSubjectIndex < exam.subjects.length - 1) {
        this.currentSubjectIndex++
        return true
      }

      return false
    },

    // 🔹 과목 추가
    addSubject(subjectName: string, questionCount: number, timeLimit: number) {
      const exam = this.currentExam

      exam.subjects.push({
        subjectName,
        questionCount,
        timeLimit,
        answers: Array(questionCount).fill(null),
        correctAnswers: Array(questionCount).fill(null),
        score: 0,
      })
    },
  },
})