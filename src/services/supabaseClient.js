import { createClient } from "@supabase/supabase-js";

/**
 * Realtime-only client — never used to hit the DB directly for reads/writes,
 * just to subscribe to `postgres_changes` on `messages` and `notifications`
 * as described in the guide's Realtime Setup section.
 *
 * Needs two env vars from your backend team:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY   (safe to expose — this is the anon key, not the service key)
 *
 * Add them to your `.env`:
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=xxxx
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabaseClient] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — realtime chat/notifications won't connect. Regular polling-based fetches still work fine."
  );
}

export const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "");

/** Subscribe to new messages in one chat room. Returns an unsubscribe fn. */
export function subscribeToChatRoom(chatRoomId, onInsert) {
  const channel = supabase
    .channel(`chat:${chatRoomId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `chat_room_id=eq.${chatRoomId}` },
      (payload) => onInsert(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/** Subscribe to new notifications for the logged-in user. Returns an unsubscribe fn. */
export function subscribeToNotifications(recipientId, onInsert) {
  const channel = supabase
    .channel(`notifications:${recipientId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${recipientId}` },
      (payload) => onInsert(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
