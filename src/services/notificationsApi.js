import apiClient, { unwrap } from "./apiClient.js";

export const getNotifications = ({ limit, before } = {}) =>
  unwrap(apiClient.get("/notifications", { params: { limit, before } }));

export const getUnreadCount = () =>
  unwrap(apiClient.get("/notifications/unread-count"));

export const markNotificationRead = (notificationId) =>
  unwrap(apiClient.put(`/notifications/${notificationId}/read`));

export const markAllNotificationsRead = () =>
  unwrap(apiClient.put("/notifications/read-all"));

/**
 * type → where a click should route the user.
 * Deep-linking needs chat_room_id/project_id, which the notification body
 * doesn't include (a known v1 backend simplification per the guide) — so
 * this just tells you which SCREEN to open, not which specific record.
 * Wire `screen` to your actual routes.
 */
export const NOTIFICATION_ROUTES = {
  access_request_received: { screen: "access-requests" },
  access_request_responded: { screen: "access-requests" },
  proposal_received: { screen: "proposals" },
  proposal_responded: { screen: "proposals" },
  project_approved: { screen: "my-projects" },
  project_rejected: { screen: "my-projects" },
  company_verified: { screen: "profile" },
  company_rejected: { screen: "profile" },
  message_received: { screen: "chat" },
  team_invite_accepted: { screen: "team" },
  agreement_proposed: { screen: "chat" },
  agreement_accepted: { screen: "chat" },
  agreement_rejected: { screen: "chat" },
  completion_requested: { screen: "chat" },
  deal_completed: { screen: "chat" },
};
