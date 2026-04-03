import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach JWT token to every request if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── AUTH ─────────────────────────────────────────────────
export const registerStudent = (formData) => API.post('/auth/register', formData);
export const loginStudent    = (formData) => API.post('/auth/login', formData);
export const forgotPassword  = (email)    => API.post('/auth/forgot-password', { email });
export const resetPassword   = (token, new_password) => API.post(`/auth/reset-password?token=${token}`, { new_password });

export const registerCompany = (formData) =>
  API.post('/auth/company/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const loginCompany = (formData) =>
  API.post('/auth/company/login', formData);

// ─── PROJECTS ─────────────────────────────────────────────
export const registerProject = (formData) =>
  API.post('/projects/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const getMyProject    = ()           => API.get('/projects/my/project');
export const getProjectPublic = (id)        => API.get(`/projects/${id}`);
export const updateProject   = (id, formData) => API.put(`/projects/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const deleteProject   = (id)         => API.delete(`/projects/${id}`);
export const browseProjects  = (filters)    => API.get('/projects', { params: filters });

export default API;