import apiClient, { unwrap } from "./apiClient.js";

/* ─── Student side ─── */
export const browseCompanies = (filters = {}) =>
  unwrap(apiClient.get("/discover/companies", { params: filters }));
export const getRecommendedCompanies = () =>
  unwrap(apiClient.get("/discover/companies/recommended"));

/* ─── Company side ─── */
export const browseProjects = (filters = {}) =>
  unwrap(apiClient.get("/discover/projects", { params: filters }));
export const getRecommendedProjects = () =>
  unwrap(apiClient.get("/discover/projects/recommended"));
