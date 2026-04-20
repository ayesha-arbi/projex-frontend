import { useState, useEffect } from "react";
import { Building2, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { C } from "../../assets/tokens";

const API_BASE = import.meta.env?.VITE_API_URL || "/api";

const STATUS_CONFIG = {
  NONE:     { label: "Request Access",  icon: Building2, color: C.blue,      bg: C.bluePale,   border: C.blue },
  PENDING:  { label: "Request Pending", icon: Clock,     color: "#f59e0b",   bg: "#fffbeb",    border: "#fcd34d" },
  APPROVED: { label: "Access Granted",  icon: CheckCircle, color: C.greenDark, bg: C.greenPale, border: "#b8e060" },
  REJECTED: { label: "Request Denied",  icon: XCircle,   color: C.error,     bg: C.errorPale,  border: "#fca5a5" },
};

async function apiPost(path, body) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed.");
  return data;
}

export default function RequestAccessButton({ projectId, initialStatus = "NONE", onSuccess }) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NONE;
  const Icon = config.icon;

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleClick = async () => {
    if (status !== "NONE") return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost("/access/request", { project_id: projectId });
      setStatus("PENDING");
      onSuccess?.("PENDING");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "APPROVED") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 7, fontSize: "0.76rem", fontWeight: 700,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        background: config.bg, color: config.color, border: `1px solid ${config.border}`,
      }}>
        <Icon size={12} /> {config.label}
      </span>
    );
  }

  if (status === "REJECTED") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 7, fontSize: "0.76rem", fontWeight: 700,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        background: config.bg, color: config.color, border: `1px solid ${config.border}`,
      }}>
        <Icon size={12} /> {config.label}
      </span>
    );
  }

  return (
    <>
      {error && (
        <div style={{
          background: C.errorPale, border: "1px solid #fecaca", borderRadius: 8,
          padding: "8px 12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8,
        }}>
          <AlertTriangle size={12} color={C.error} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "0.74rem", color: C.error, fontWeight: 600 }}>{error}</span>
        </div>
      )}
      <button
        onClick={handleClick}
        disabled={loading || status !== "NONE"}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: status === "PENDING" ? "6px 12px" : "7px 14px",
          borderRadius: 7, fontSize: "0.78rem", fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          cursor: loading || status !== "NONE" ? "not-allowed" : "pointer",
          border: `1.5px solid ${config.border}`,
          background: loading || status !== "NONE" ? config.bg : config.bg,
          color: config.color,
          opacity: loading || status !== "NONE" ? 0.7 : 1,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!loading && status === "NONE") {
            e.currentTarget.style.background = config.color;
            e.currentTarget.style.color = "#fff";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && status === "NONE") {
            e.currentTarget.style.background = config.bg;
            e.currentTarget.style.color = config.color;
          }
        }}
      >
        {loading ? (
          <span style={{
            width: 12, height: 12,
            border: `2px solid ${status === "PENDING" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.2)"}`,
            borderTopColor: config.color, borderRadius: "50%",
            display: "inline-block", animation: "spin 0.7s linear infinite",
          }} />
        ) : (
          <Icon size={12} />
        )}
        {status === "PENDING" ? "Request Pending..." : config.label}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  );
}
