import axios from 'axios'

const api = axios.create({
  baseURL: 'https://prepmate-ai-d7n6.onrender.com'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const register = (email, password) =>
  api.post('/auth/register', { email, password })

export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const uploadResume = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/resume/upload', formData)
}

export const startInterview = () =>
  api.post('/interview/start')

export const submitAnswer = (session_id, answer) =>
  api.post('/interview/answer', { session_id, answer })

export const endInterview = (session_id) =>
  api.post('/interview/end', { session_id })

export const getSessions = () =>
  api.get('/interview/sessions')

export const getSessionDetail = (session_id) =>
  api.get(`/interview/sessions/${session_id}`)