import apiClient, { unwrap } from "./apiClient.js";

/* ─── Agreements ─── */
export const proposeAgreement = (chatRoomId, payload) =>
  unwrap(apiClient.post(`/agreements/${chatRoomId}`, payload));

export const respondToAgreement = (agreementId, payload) =>
  unwrap(apiClient.put(`/agreements/${agreementId}/respond`, payload));

export const getRoomAgreements = (chatRoomId) =>
  unwrap(apiClient.get(`/agreements/room/${chatRoomId}`));

export const getAgreement = (agreementId) =>
  unwrap(apiClient.get(`/agreements/${agreementId}`));

/* ─── Deal Tracking ─── */
export const requestCompletion = (agreementId) =>
  unwrap(apiClient.put(`/agreements/${agreementId}/request-complete`));

export const confirmCompletion = (agreementId) =>
  unwrap(apiClient.put(`/agreements/${agreementId}/confirm-complete`));

export const disputeDeal = (agreementId, note) =>
  unwrap(apiClient.put(`/agreements/${agreementId}/dispute`, { note }));

/* ─── Ownership rules (mirrors backend validation for client-side UX) ─── */
export const OWNERSHIP_RULES = {
  Mentorship: { fixed: 100, min: 100 },
  Partnership: { fixed: null, min: 51 },
  Investment: { fixed: null, min: 60, requiresAmount: true },
};
