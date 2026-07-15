import axios from "axios";

/**
 * Proposals API client.
 *
 * This feature is used from BOTH the student dashboard (send / view sent
 * proposals) and the company dashboard (view received / respond). Rather
 * than guess which token key your existing `services/api.js` uses, the
 * request interceptor below tries the common conventions in order:
 *
 *   student_token  → company_token  → token
 *
 * If your real token keys are different, change STUDENT_TOKEN_KEY /
 * COMPANY_TOKEN_KEY below to match — or better, delete this file's
 * axios instance entirely and import the shared one from your existing
 * `src/services/api.js` so auth stays perfectly in sync app-wide.
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

const proposalsApi = axios.create({ baseURL: BASE_URL });

proposalsApi.interceptors.request.use((config) => {
  const token = getActiveToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function unwrap(promise) {
  return promise.then((r) => r.data);
}

/* ─── Student (lead) ─── */
export const sendProposal = (payload) => unwrap(proposalsApi.post("/proposals", payload));
export const getMyProposals = (projectId) =>
  unwrap(proposalsApi.get("/proposals/my", { params: { project_id: projectId } }));

/* ─── Company ─── */
export const getReceivedProposals = () => unwrap(proposalsApi.get("/proposals/received"));
export const respondToProposal = (proposalId, payload) =>
  unwrap(proposalsApi.put(`/proposals/${proposalId}/respond`, payload));

/* ─── Shared ─── */
export const getProposal = (proposalId) => unwrap(proposalsApi.get(`/proposals/${proposalId}`));

export default proposalsApi;
