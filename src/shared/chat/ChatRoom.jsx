import { useEffect, useState, useRef, useCallback } from "react";
import { C } from "../../assets/tokens.js";
import { getMessages, sendMessage, markRoomRead, flagMessage } from "../../services/chatApi.js";
import { subscribeToChatRoom } from "../../services/supabaseClient.js";
import { Spinner, ErrorBanner, Btn, Modal, Toast, timeAgo } from "../UI.jsx";
import AgreementPanel from "./AgreementPanel.jsx";

/**
 * Full chat room screen. `roomMeta` is the item from ChatInbox's list.
 *   <ChatRoom chatRoomId={id} roomMeta={selectedRoom} onBack={() => setSelected(null)} />
 */
export default function ChatRoom({ chatRoomId, roomMeta, onBack }) {
  const [messages, setMessages] = useState(null);
  const [yourRole, setYourRole] = useState(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");
  const [flagTarget, setFlagTarget] = useState(null);
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getMessages(chatRoomId);
      setMessages(data.messages || []);
      setYourRole(data.your_role);
      markRoomRead(chatRoomId).catch(() => {});
    } catch (err) {
      setError("Couldn't load this conversation.");
    }
  }, [chatRoomId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const unsubscribe = subscribeToChatRoom(chatRoomId, (newMsg) => {
      setMessages((prev) => {
        if (!prev) return prev;
        if (prev.some((m) => m.message_id === newMsg.message_id)) return prev;
        return [...prev, newMsg];
      });
      markRoomRead(chatRoomId).catch(() => {});
    });
    return unsubscribe;
  }, [chatRoomId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages?.length]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const canSend = yourRole === "LEAD" || yourRole === "COMPANY";
  const viewerSide = yourRole === "COMPANY" ? "COMPANY" : "STUDENT";

  const submit = async (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const data = await sendMessage(chatRoomId, content);
      setMessages((prev) => (prev.some((m) => m.message_id === data.data.message_id) ? prev : [...prev, data.data]));
      setDraft("");
      if (data.data.was_filtered) setToast(data.data.notice || "Some contact info was removed from your message.");
    } catch (err) {
      setToast(err?.response?.data?.message || "Couldn't send that message.");
    } finally {
      setSending(false);
    }
  };

  const headerName = roomMeta?.companies?.company_name || roomMeta?.projects?.title || "Conversation";
  const headerSub = roomMeta?.companies
    ? [roomMeta.companies.industry].filter(Boolean).join(" · ")
    : roomMeta?.projects
    ? [roomMeta.projects.project_type].filter(Boolean).join(" · ")
    : "";
  const headerImg = roomMeta?.companies?.logo || roomMeta?.projects?.poster;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, height: "100%", minHeight: 0 }}>
      <div style={{
        display: "flex", flexDirection: "column", border: `1px solid ${C.border}`,
        borderRadius: 16, background: "#fff", overflow: "hidden", minHeight: 0,
        boxShadow: "0 1px 6px rgba(12,35,64,0.04)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: C.cream }}>
          {onBack && (
            <button onClick={onBack} style={{
              background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8,
              width: 30, height: 30, cursor: "pointer", fontSize: "1rem", color: C.navy,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              ←
            </button>
          )}
          {headerImg ? (
            <img src={headerImg} alt="" style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover", border: `1px solid ${C.border}` }} />
          ) : (
            <div style={{ width: 38, height: 38, borderRadius: 10, background: C.navyPale, border: `1px solid ${C.border}` }} />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "0.92rem", color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {headerName}
            </div>
            {headerSub && <div style={{ fontSize: "0.74rem", color: C.muted }}>{headerSub}</div>}
          </div>
          {roomMeta?.deal_status === "CLOSED" && (
            <span style={{ marginLeft: "auto", background: C.goldPale, color: "#7A5C25", fontSize: "0.68rem", fontWeight: 700, padding: "3px 10px", borderRadius: 100, flexShrink: 0 }}>
              Deal Active
            </span>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
          <ErrorBanner message={error} onRetry={load} />
          {!messages && !error && (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
              <Spinner size={24} />
            </div>
          )}
          {messages && messages.length === 0 && (
            <div style={{ textAlign: "center", color: C.muted, fontSize: "0.85rem", padding: "40px 0" }}>
              No messages yet — say hello 👋
            </div>
          )}
          {messages?.map((m) => (
            <MessageBubble key={m.message_id} message={m} mine={m.sender_type === viewerSide} onFlag={() => setFlagTarget(m)} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: 16, background: "#fff" }}>
          {canSend ? (
            <form onSubmit={submit} style={{ display: "flex", gap: 10 }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message... (no phone numbers, emails, or links)"
                style={{
                  flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "11px 16px",
                  fontSize: "0.87rem", fontFamily: "'Inter', sans-serif", color: C.navy, outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = C.navy)}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />
              <Btn type="submit" variant="primary" loading={sending} disabled={!draft.trim()}>Send</Btn>
            </form>
          ) : (
            <div style={{ textAlign: "center", fontSize: "0.8rem", color: C.muted, padding: "6px 0" }}>
              Only the project lead or the company can send messages here. You have read access as a team member.
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div style={{
        border: `1px solid ${C.border}`, borderRadius: 16, background: "#fff",
        padding: 20, alignSelf: "start", boxShadow: "0 1px 6px rgba(12,35,64,0.04)",
      }}>
        {yourRole && (
          <AgreementPanel chatRoomId={chatRoomId} viewerSide={viewerSide} canPropose={canSend} />
        )}
      </div>

      {flagTarget && (
        <FlagModal
          message={flagTarget}
          onClose={() => setFlagTarget(null)}
          onFlagged={() => setToast("Message reported — our team will review it.")}
        />
      )}
      <Toast message={toast} tone={toast?.startsWith("🎉") ? "success" : "error"} />
    </div>
  );
}

function MessageBubble({ message, mine, onFlag }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}
    >
      {hov && (
        <button onClick={onFlag} title="Report message" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: C.muted2, order: mine ? -1 : 1 }}>
          🚩
        </button>
      )}
      <div style={{ maxWidth: "70%" }}>
        <div style={{
          background: mine ? C.navy : C.cream, color: mine ? "#fff" : C.navy,
          borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          padding: "10px 15px", fontSize: "0.86rem", lineHeight: 1.55, wordBreak: "break-word",
        }}>
          {message.content}
        </div>
        <div style={{ fontSize: "0.68rem", color: C.muted2, marginTop: 4, textAlign: mine ? "right" : "left" }}>
          {timeAgo(message.created_at)}{message.was_filtered ? " · filtered" : ""}
        </div>
      </div>
    </div>
  );
}

function FlagModal({ message, onClose, onFlagged }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!reason.trim()) { setError("Tell us what felt off about this message."); return; }
    setLoading(true); setError("");
    try {
      await flagMessage(message.message_id, reason.trim());
      onFlagged();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't submit the report.");
      setLoading(false);
    }
  };

  return (
    <Modal onClose={loading ? () => {} : onClose} width={420}>
      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: C.navy, marginBottom: 10 }}>Report this message</h3>
      <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", color: C.navy, marginBottom: 14 }}>
        "{message.content}"
      </div>
      {error && <div style={{ fontSize: "0.78rem", color: "#B3261E", marginBottom: 10 }}>{error}</div>}
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="What felt inappropriate about this?"
        rows={3}
        style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 12, fontSize: "0.85rem", fontFamily: "'Inter', sans-serif", color: C.navy, resize: "vertical", outline: "none", marginBottom: 18 }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose} disabled={loading}>Cancel</Btn>
        <Btn variant="danger" onClick={submit} loading={loading}>Report</Btn>
      </div>
    </Modal>
  );
}