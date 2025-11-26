import axios from 'axios'

const api = axios.create({
  // O Vite vai redirecionar isso para http://localhost:3000
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor: Antes de cada requisição, insere o token se ele existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('horaga_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api