import { useEffect, useState, useCallback } from "react";
import { C } from "../../assets/tokens.js";
import { getMyChatRooms } from "../../services/chatApi.js";
import { Spinner, EmptyState, ErrorBanner, timeAgo } from "../UI.jsx";
import ChatRoom from "./ChatRoom.jsx";

/**
 * Self-contained inbox + thread. Mount as a whole "Messages" tab:
 *   <ChatInbox />
 */
export default function ChatInbox({ initialChatRoomId }) {
  const [rooms, setRooms] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getMyChatRooms();
      setRooms(data.chat_rooms || []);
    } catch (err) {
      setError("Couldn't load your conversations.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-select a room passed in from another tab
  useEffect(() => {
    if (initialChatRoomId && rooms && rooms.length > 0) {
      const match = rooms.find((r) => r.chat_room_id === initialChatRoomId);
      if (match) setSelected(match);
    }
  }, [initialChatRoomId, rooms]);

  const closeThread = () => { setSelected(null); load(); };

  return (
    <div style={{ height: "calc(100vh - 160px)", minHeight: 480, padding: "24px 32px 32px", boxSizing: "border-box" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.35rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.02em", margin: 0 }}>
          Messages
        </h2>
        <p style={{ fontSize: "0.82rem", color: C.muted, marginTop: 4 }}>
          Conversations with your matched companies and teams.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "340px 1fr" : "1fr", gap: 20, height: "calc(100% - 68px)", minHeight: 0 }}>
        <div style={{
          border: `1px solid ${C.border}`, borderRadius: 16, background: "#fff",
          overflowY: "auto", boxShadow: "0 1px 6px rgba(12,35,64,0.04)",
        }}>
          <ErrorBanner message={error} onRetry={load} />

          {!rooms && !error && (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <Spinner size={26} />
            </div>
          )}

          {rooms && rooms.length === 0 && (
            <div style={{ padding: 24 }}>
              <EmptyState
                icon="💬"
                title="No conversations yet"
                desc="Chats open automatically once an access request is approved or a proposal is accepted."
              />
            </div>
          )}

          {rooms?.map((room) => (
            <RoomRow
              key={room.chat_room_id}
              room={room}
              active={selected?.chat_room_id === room.chat_room_id}
              onClick={() => setSelected(room)}
            />
          ))}
        </div>

        {selected && (
          <ChatRoom chatRoomId={selected.chat_room_id} roomMeta={selected} onBack={closeThread} />
        )}

        {!selected && rooms && rooms.length > 0 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px dashed ${C.border}`, borderRadius: 16, color: C.muted2,
            fontSize: "0.84rem", background: "#fff",
          }}>
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
}

function RoomRow({ room, active, onClick }) {
  const name = room.companies?.company_name || room.projects?.title || "Conversation";
  const sub = room.companies ? room.companies.industry : room.projects?.project_type;
  const img = room.companies?.logo || room.projects?.poster;
  const unread = room.unread_count || 0;

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
        padding: "14px 16px", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer",
        background: active ? C.cream : "#fff", fontFamily: "'Inter', sans-serif",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#fafafa"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "#fff"; }}
    >
      {img ? (
        <img src={img} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", border: `1px solid ${C.border}`, flexShrink: 0 }} />
      ) : (
        <div style={{ width: 44, height: 44, borderRadius: 12, background: C.navyPale, border: `1px solid ${C.border}`, flexShrink: 0 }} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: "0.87rem", fontWeight: 700, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </span>
          {room.last_message && (
            <span style={{ fontSize: "0.68rem", color: C.muted2, flexShrink: 0 }}>
              {timeAgo(room.last_message.created_at)}
            </span>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 3 }}>
          <span style={{ fontSize: "0.79rem", color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {room.last_message ? room.last_message.content : sub || "No messages yet"}
          </span>
          {unread > 0 && (
            <span style={{
              background: C.gold, color: "#fff", fontSize: "0.66rem", fontWeight: 700,
              minWidth: 18, height: 18, borderRadius: 100, display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0, padding: "0 5px",
            }}>
              {unread}
            </span>
          )}
        </div>
        {room.deal_status === "CLOSED" && (
          <span style={{
            display: "inline-block", marginTop: 6, background: C.goldPale, color: "#7A5C25",
            fontSize: "0.64rem", fontWeight: 700, padding: "2px 8px", borderRadius: 100,
          }}>
            Deal Active
          </span>
        )}
      </div>
    </button>
  );
}