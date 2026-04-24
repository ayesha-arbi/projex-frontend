import { useState } from "react";
import { Send, Clock, CheckCircle, Lock } from "lucide-react";
import { C } from "../assets/tokens";

const API_BASE = import.meta.env?.VITE_API_URL || "/api";

/**
 * RequestAccessButton
 * 
 * Props:
 *   projectId       – string  (required)
 *   initialStatus   – "NONE" | "PENDING" | "APPROVED" | "REJECTED" (default "NONE")
 *   onSuccess       – optional callback(newStatus)
 */
export default function RequestAccessButton({ projectId, initialStatus = "NONE", onSuccess }) {
  const [status, setStatus]   = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/access/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ project_id: projectId, message: message.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setError("You already have a pending request for this project.");
        else if (res.status === 403) setError("Your company must be verified to send requests.");
        else setError(data.message || "Something went wrong.");
        return;
      }
      setStatus("PENDING");
      setShowModal(false);
      setMessage("");
      onSuccess?.("PENDING");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ─── Status variants ─── */
  if (status === "PENDING") {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700, color: "#92400e", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        <Clock size={12} color="#f59e0b" /> Request Pending
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <a
        href={`/projects/${projectId}`}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", background: C.greenPale, border: `1px solid ${C.greenDark}44`, borderRadius: 8, fontSize: "0.75rem", fontWeight: 700, color: C.greenDark, fontFamily: "'Plus Jakarta Sans',sans-serif", textDecoration: "none", transition: "all 0.15s" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = C.greenDark; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = C.greenPale; e.currentTarget.style.color = C.greenDark; }}
      >
        <CheckCircle size={12} /> View Full Details
      </a>
    );
  }

  /* NONE or REJECTED — show Request button */
  return (
    <>
      <button
        onClick={() => { setShowModal(true); setError(""); setMessage(""); }}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", background: C.ink, color: "#fff", border: "none", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: "pointer", transition: "opacity 0.15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <Lock size={12} /> {status === "REJECTED" ? "Re-request Access" : "Request Access"}
      </button>

      {/* ─── Modal ─── */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(7,18,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{ background: C.white, borderRadius: 16, padding: "28px 28px 24px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(3,62,102,0.18)", animation: "fadeUp 0.18s ease both" }}>
            {/* Modal header */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.bluePale, border: `1.5px solid ${C.border2}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Lock size={16} color={C.blue} />
              </div>
              <h3 style={{ fontSize: "0.96rem", fontWeight: 800, color: C.ink, margin: "0 0 4px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Request Project Access
              </h3>
              <p style={{ fontSize: "0.78rem", color: C.muted, margin: 0, lineHeight: 1.5 }}>
                The project lead will review your request and grant or deny access to the full project details.
              </p>
            </div>

            {/* Message textarea */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: "0.76rem", fontWeight: 700, color: C.ink, display: "block", marginBottom: 6, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Message <span style={{ color: C.muted, fontWeight: 500 }}>(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => { setMessage(e.target.value); setError(""); }}
                placeholder="e.g. We're a fintech startup interested in mentoring and potentially hiring from this project…"
                rows={3}
                style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${error ? "#fca5a5" : C.border2}`, borderRadius: 8, fontSize: "0.82rem", fontFamily: "'Plus Jakarta Sans',sans-serif", color: C.ink, outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box", background: C.white }}
              />
              {error && (
                <p style={{ fontSize: "0.74rem", color: C.error, margin: "5px 0 0", fontWeight: 600 }}>{error}</p>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: "8px 16px", background: "transparent", color: C.muted, border: `1.5px solid ${C.border2}`, borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", background: C.ink, color: "#fff", border: "none", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, transition: "opacity 0.15s" }}
              >
                {loading
                  ? <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  : <Send size={12} />}
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}