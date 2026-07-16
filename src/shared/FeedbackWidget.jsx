import { useState } from "react";
import { C } from "../assets/tokens.js";
import { submitFeedback } from "../services/feedbackApi.js";
import { Btn, Modal } from "./UI.jsx";

/**
 * Drop anywhere — a footer link or settings-menu item works well:
 *
 *   <FeedbackWidget />
 */
export default function FeedbackWidget({ trigger }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const close = () => { setOpen(false); setTimeout(() => { setMessage(""); setSent(false); setError(""); }, 200); };

  const submit = async () => {
    if (!message.trim()) { setError("Write a quick note first."); return; }
    setLoading(true); setError("");
    try {
      await submitFeedback(message.trim());
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't send that. Try again?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>{trigger}</span>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.81rem", color: C.muted, fontFamily: "'Inter', sans-serif", textDecoration: "underline" }}
        >
          Send Feedback
        </button>
      )}

      {open && (
        <Modal onClose={loading ? () => {} : close} width={420}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>✅</div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: C.navy, marginBottom: 6 }}>Thanks for your feedback!</h3>
              <p style={{ fontSize: "0.83rem", color: C.muted, marginBottom: 20 }}>We read every note.</p>
              <Btn variant="primary" onClick={close} style={{ width: "100%" }}><span style={{ width: "100%", textAlign: "center" }}>Close</span></Btn>
            </div>
          ) : (
            <>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: C.navy, marginBottom: 6 }}>Send Feedback</h3>
              <p style={{ fontSize: "0.82rem", color: C.muted, marginBottom: 16 }}>Bug, idea, complaint — whatever's on your mind.</p>
              {error && <div style={{ fontSize: "0.78rem", color: "#B3261E", marginBottom: 10 }}>{error}</div>}
              <textarea
                autoFocus value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Would love a dark mode option for the dashboard..." rows={5}
                style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 12, fontSize: "0.85rem", fontFamily: "'Inter', sans-serif", color: C.navy, resize: "vertical", outline: "none", marginBottom: 18 }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <Btn variant="ghost" onClick={close} disabled={loading}>Cancel</Btn>
                <Btn variant="gold" onClick={submit} loading={loading}>Send</Btn>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
