import apiClient, { unwrap } from "./apiClient.js";

export const submitFeedback = (message) =>
  unwrap(apiClient.post("/feedback", { message }));
