import axios from 'axios';

const API = axios.create({
  baseURL: 'https://careerpilot-backend-jq1h.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careerpilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on login/register page, can trigger logout
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register') &&
        window.location.pathname !== '/'
      ) {
        localStorage.removeItem('careerpilot_token');
        localStorage.removeItem('careerpilot_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me'),
  updateProfile: (profileData) => API.put('/auth/profile', profileData),
};

// Job Applications Endpoints
export const applicationApi = {
  getAll: () => API.get('/applications'),
  getById: (id) => API.get(`/applications/${id}`),
  create: (appData) => API.post('/applications', appData),
  update: (id, appData) => API.put(`/applications/${id}`, appData),
  delete: (id) => API.delete(`/applications/${id}`),
};

// Interviews Endpoints
export const interviewApi = {
  create: (interviewData) => API.post('/interviews', interviewData),
  getAll: () => API.get('/interviews'),
  getById: (id) => API.get(`/interviews/${id}`),
};

// AI Endpoints
export const aiApi = {
  generateQuestions: (params) => API.post('/ai/questions', params),
  evaluateAnswer: (params) => API.post('/ai/evaluate', params),
  generateFinalReport: (params) => API.post('/ai/final-report', params),
  generateColdEmail: (params) => API.post('/ai/cold-email', params),
};

// Server Health
export const checkServerHealth = () => API.get('/health');

export default API;
