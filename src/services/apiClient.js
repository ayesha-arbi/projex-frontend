import axios from "axios";

/**
 * One shared axios instance for Discovery / Chat / Notifications /
 * Agreements / Feedback — all live under the same `/api` base URL per the
 * guide, unlike Admin (`/api/admin`) which intentionally keeps its own
 * client and token namespace.
 *
 * Token lookup tries the same fallback chain as proposalsApi.js:
 * student_token → company_token → token. If your real api.js uses
 * different keys, update the three constants below (or just import your
 * existing shared axios instance instead of this one — that's the
 * better long-term fix so auth never drifts out of sync across files).
 */

const BASE_URL = "http://localhost:5000/api";
const STUDENT_TOKEN_KEY = "student_token";
const COMPANY_TOKEN_KEY = "company_token";
const FALLBACK_TOKEN_KEY = "token";

function getActiveToken() {
  return (
    localStorage.getItem(STUDENT_TOKEN_KEY) ||
    localStorage.getItem(COMPANY_TOKEN_KEY) ||
    localStorage.getItem(FALLBACK_TOKEN_KEY)
  );
}

/** Best-effort guess at which side of the platform is logged in, purely
 *  for UI branching (e.g. "which empty-state copy to show"). Not used for
 *  anything security-sensitive — the backend is the source of truth via
 *  `your_role` / response shape differences. */
export function getViewerType() {
  if (localStorage.getItem(STUDENT_TOKEN_KEY)) return "STUDENT";
  if (localStorage.getItem(COMPANY_TOKEN_KEY)) return "COMPANY";
  return null;
}

const apiClient = axios.create({ baseURL: BASE_URL });

apiClient.interceptors.request.use((config) => {
  const token = getActiveToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function unwrap(promise) {
  return promise.then((r) => r.data);
}

export default apiClient;
