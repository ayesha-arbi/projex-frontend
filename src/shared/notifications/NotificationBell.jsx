import { useEffect, useState, useCallback, useRef } from "react";
import { C } from "../../assets/tokens.js";
import {
  getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead,
} from "../../services/notificationsApi.js";
import { subscribeToNotifications } from "../../services/supabaseClient.js";
import { Spinner, EmptyState, timeAgo } from "../UI.jsx";

const ICONS = {
  access_request_received: "📋", access_request_responded: "📋",
  proposal_received: "🤝", proposal_responded: "🤝",
  project_approved: "✅", project_rejected: "❌",
  company_verified: "✅", company_rejected: "❌",
  message_received: "💬", message_flagged: "🚩",
  company_registered: "🏢", project_submitted: "🎓",
  team_invite_accepted: "🧑‍🤝‍🧑",
  agreement_proposed: "📄", agreement_accepted: "📄", agreement_rejected: "📄",
  completion_requested: "⏳", deal_completed: "🎉", deal_disputed: "🚩",
};

/**
 * Drop into any dashboard header/topbar:
 *
 *   <NotificationBell currentUserId={student.student_id} onNavigate={(n) => { ... }} />
 *
 * `currentUserId` is whichever id matches the logged-in token (student_id /
 * company_id / admin_id) — needed for the realtime subscription filter.
 * `onNavigate(notification)` fires when a notification is clicked, after
 * it's marked read — route using `notification.type` (see
 * NOTIFICATION_ROUTES in services/notificationsApi.js) however fits your router.
 */
export default function NotificationBell({ currentUserId, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const boxRef = useRef(null);

  const loadCount = useCallback(async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unread_count || 0);
    } catch { /* silent — bell just won't badge */ }
  }, []);

  const loadList = useCallback(async () => {
    setError("");
    try {
      const data = await getNotifications({ limit: 20 });
      setNotifications(data.notifications || []);
    } catch {
      setError("Couldn't load notifications.");
    }
  }, []);

  useEffect(() => { loadCount(); }, [loadCount]);

  useEffect(() => {
    if (!currentUserId) return;
    const unsubscribe = subscribeToNotifications(currentUserId, () => {
      setUnreadCount((c) => c + 1);
      if (open) loadList();
    });
    return unsubscribe;
  }, [currentUserId, open, loadList]);

  useEffect(() => {
    if (!open) return;
    loadList();
    const onClickOutside = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open, loadList]);

  const handleClick = async (n) => {
    if (!n.is_read) {
      setNotifications((prev) => prev.map((x) => (x.notification_id === n.notification_id ? { ...x, is_read: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      markNotificationRead(n.notification_id).catch(() => {});
    }
    onNavigate?.(n);
    setOpen(false);
  };

  const markAll = async () => {
    setNotifications((prev) => prev.map((x) => ({ ...x, is_read: true })));
    setUnreadCount(0);
    try { await markAllNotificationsRead(); } catch { /* best effort */ }
  };

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        style={{ position: "relative", background: "none", border: "none", cursor: "pointer", fontSize: "1.15rem", color: C.navy, padding: 6 }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{ position: "absolute", top: 2, right: 2, background: C.gold, color: "#fff", fontSize: "0.6rem", fontWeight: 700, minWidth: 15, height: 15, borderRadius: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 340, maxHeight: 420, overflowY: "auto", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: "0 16px 40px rgba(12,35,64,0.15)", zIndex: 500 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: C.navy }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAll} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.74rem", fontWeight: 700, color: C.navy, textDecoration: "underline" }}>
                Mark all read
              </button>
            )}
          </div>

          {!notifications && !error && <div style={{ display: "flex", justifyContent: "center", padding: "30px 0" }}><Spinner size={20} /></div>}
          {error && <div style={{ padding: 16, fontSize: "0.8rem", color: "#B3261E" }}>{error}</div>}
          {notifications && notifications.length === 0 && (
            <div style={{ padding: 20 }}><EmptyState icon="🔔" title="You're all caught up" /></div>
          )}

          {notifications?.map((n) => (
            <button
              key={n.notification_id}
              onClick={() => handleClick(n)}
              style={{
                display: "flex", gap: 10, width: "100%", textAlign: "left", padding: "12px 16px",
                border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                background: n.is_read ? "#fff" : C.goldPale,
              }}
            >
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{ICONS[n.type] || "🔔"}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: n.is_read ? 500 : 700, color: C.navy }}>{n.title}</div>
                <div style={{ fontSize: "0.76rem", color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                <div style={{ fontSize: "0.68rem", color: C.muted, marginTop: 4 }}>{timeAgo(n.created_at)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
