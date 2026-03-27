import { defineStore } from 'pinia'
type Subject = {
  subjectId: string
  subjectName: string

  questionCount: number
  timeLimit: number

  answers: number[]
  correctAnswers: number[]
  score: number
}

export const useOmrStore = defineStore('omr', {
  state: () => ({
    exams: [] as any[],
    currentExamId: null as string | null,
    currentSubjectIndex: 0,
  }),

  actions: {
    // 🔹 초기 로드 (exams + currentExamId 같이 불러오기)
    loadFromStorage() {
      const saved = localStorage.getItem('omr-data')

      if (saved) {
        const data = JSON.parse(saved)
        this.exams = data.exams || []
        this.currentExamId = data.currentExamId || null
      }
    },

    // 🔹 저장 (exams + currentExamId 같이 저장)
    saveToStorage() {
      const data = {
        exams: this.exams,
        currentExamId: this.currentExamId,
      }

      localStorage.setItem('omr-data', JSON.stringify(data))
    },

    // 🔹 시험 생성
    createExam(name: string, templateId?: number | null) {
      const exam = {
        examId: Date.now().toString(),
        examName: name,
        createdAt: new Date().toISOString(),

        templateId: templateId ?? null, // 🔥 같은 시험 묶는 기준

        subjects: [],
      }

      this.exams.push(exam)
      this.currentExamId = exam.examId
      this.currentSubjectIndex = 0

      this.saveToStorage()
    },

    // 🔹 시험 선택 (history에서 클릭 시 사용)
    selectExam(examId: string) {
      this.currentExamId = examId
      this.saveToStorage()
    },

    // 🔹 현재 시험 가져오기
    getCurrentExam() {
      return this.exams.find(e => e.examId === this.currentExamId)
    },
    
    getPreviousExams() {
      const current = this.getCurrentExam()
      if (!current) return []

      return this.exams
        .filter(e =>
          e.templateId === current.templateId &&
          e.examId !== current.examId
        )
        .sort((a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        )
    },
    
    nextSubject() {
      const exam = this.getCurrentExam()

      if (this.currentSubjectIndex < exam.subjects.length - 1) {
        this.currentSubjectIndex++
        return true // 다음 과목 있음
      }

      return false // 마지막 과목
    },

    addSubject(subjectName: string, questionCount: number, timeLimit: number) {
      const exam = this.getCurrentExam()

      exam.subjects.push({
        subjectId: Date.now().toString() + Math.random(),
        subjectName,

        // 🔥 핵심 추가
        questionCount,
        timeLimit,

        answers: Array(questionCount).fill(null),
        correctAnswers: Array(questionCount).fill(null),
        score: 0,
      })

      this.saveToStorage()
    },
  },
})