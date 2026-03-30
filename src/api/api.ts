// src/api/api.js

import axios from 'axios'

 const api = axios.create({
   baseURL: 'https://omr-backend-yu0g.onrender.com/'
 })

 export default api

//  const api = axios.create({
//    baseURL: 'http://localhost:8000/api'
//  })

//  export default api