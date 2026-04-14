import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 globally — clear stale tokens
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
};

export const resumeAPI = {
    upload: (formData) => api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getDiagnosis: () => api.get('/resume/diagnosis'),
};

export const interviewAPI = {
    start: (data) => api.post('/interview/start', data),
    evaluate: (data) => api.post('/interview/evaluate', data),
    submit: (data) => api.post('/interview/submit', data),
    history: () => api.get('/interview/history'),
};

export const careerAPI = {
    getAdvice: () => api.get('/career/advice'),
    getAdviceByBranch: (branch, skills = []) => api.post('/career/advice/branch', { branch, skills }),
    getAnalytics: () => api.get('/career/analytics'),
};

export default api;
