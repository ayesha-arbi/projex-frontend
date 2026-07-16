import apiClient, { unwrap } from "./apiClient.js";

export const getMyChatRooms = () => unwrap(apiClient.get("/chat/my-rooms"));

export const getMessages = (chatRoomId, { limit, before } = {}) =>
  unwrap(apiClient.get(`/chat/${chatRoomId}/messages`, { params: { limit, before } }));

export const sendMessage = (chatRoomId, content) =>
  unwrap(apiClient.post(`/chat/${chatRoomId}/messages`, { content }));

export const markRoomRead = (chatRoomId) =>
  unwrap(apiClient.put(`/chat/${chatRoomId}/read`));

export const flagMessage = (messageId, reason) =>
  unwrap(apiClient.post(`/chat/messages/${messageId}/flag`, { reason }));
