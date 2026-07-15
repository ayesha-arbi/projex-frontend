import axios from "axios";

/**
 * Admin API client.
 *
 * Kept intentionally separate from the student/company `api.js` because the
 * admin panel uses its own token (`admin_token`) so a founder logged into
 * the admin panel in one tab doesn't clash with a student/company session
 * in another tab of the same browser.
 *
 * If your existing `src/services/api.js` already exports a shared axios
 * instance + base URL, swap `BASE_URL` below for that constant so both
 * files stay in sync.
 */

const BASE_URL = "http://localhost:5000/api/admin";
const TOKEN_KEY = "admin_token";
const ADMIN_KEY = "admin_info";

const adminApi = axios.create({ baseURL: BASE_URL });

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ADMIN_KEY);
    }
    return Promise.reject(err);
  }
);

function unwrap(promise) {
  return promise.then((r) => r.data);
}

/* ─── Session helpers ─── */
export const adminSession = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getAdmin: () => {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_KEY) || "null");
    } catch {
      return null;
    }
  },
  save: (token, admin) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  },
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
};

/* ─── Auth ─── */
export const registerAdmin = (payload) => unwrap(adminApi.post("/register", payload));
export const loginAdmin = (payload) => unwrap(adminApi.post("/login", payload));

/* ─── Stats ─── */
export const getStats = () => unwrap(adminApi.get("/stats"));

/* ─── Companies ─── */
export const getPendingCompanies = () => unwrap(adminApi.get("/companies/pending"));
export const approveCompany = (companyId) =>
  unwrap(adminApi.put(`/companies/${companyId}/approve`));
export const rejectCompany = (companyId, reason) =>
  unwrap(adminApi.put(`/companies/${companyId}/reject`, { reason }));
export const suspendCompany = (companyId, reason) =>
  unwrap(adminApi.put(`/companies/${companyId}/suspend`, { reason }));

/* ─── Academic Projects ─── */
export const getPendingProjects = () => unwrap(adminApi.get("/projects/pending"));
export const approveProject = (projectId) =>
  unwrap(adminApi.put(`/projects/${projectId}/approve`));
export const rejectProject = (projectId, reason) =>
  unwrap(adminApi.put(`/projects/${projectId}/reject`, { reason }));

/* ─── Students ─── */
export const getStudents = (params = {}) =>
  unwrap(adminApi.get("/students", { params }));
export const deactivateStudent = (studentId, reason) =>
  unwrap(adminApi.put(`/students/${studentId}/deactivate`, { reason }));

export default adminApi;
