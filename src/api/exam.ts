// src/api/exam.ts
import api from './api'

export const getExams = () => api.get('/exams/')
export const getExam = (id: number) => api.get(`/exams/${id}/`)
export const createExam = (data: any) => api.post('/exams/', data)
export const deleteExam = (id: number) => api.delete(`/exams/${id}/`)
export const createWrongNote = (data: any) => api.post('/wrong-notes/', data)