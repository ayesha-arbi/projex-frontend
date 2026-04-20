import { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle, XCircle, RefreshCw, AlertTriangle, FolderOpen, Filter, University } from "lucide-react";
import { C } from "../../assets/tokens";

const API_BASE = import.meta.env?.VITE_API_URL || "/api";

/* ─── helpers ──────────────────────────────────────────────────── */
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATUS_CONFIG = {
  PENDING:  { color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d", label: "Pending Review", icon: "⏳" },
  APPROVED: { color: C.greenDark, bg: C.greenPale, border: "#b8e060", label: "Access Granted", icon: "✅" },
  REJECTED: { color: C.error, bg: C.errorPale, border: "#fca5a5", label: "Declined", icon: "❌" },
};

/* ─── API ──────────────────────────────────────────────────────── */
async function apiGet(path) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed.");
  return data;
}

/* ─── sub-components ───────────────────────────────────────────── */
function Section({ icon: Icon, title, accent = C.blue, badge, children }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "11px 20px", borderBottom: `1px solid ${C.border}`, background: C.off, display: "flex", alignItems: "center", gap: 10, borderLeft: `3px solid ${accent}` }}>
        {Icon && (
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `${accent}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={12} color={accent} strokeWidth={2.2} />
          </div>
        )}
        <h3 style={{ fontSize: "0.84rem", fontWeight: 800, color: C.ink, margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{title}</h3>
        {badge && <span style={{ fontSize: "0.7rem", color: C.muted2, marginLeft: 2 }}>{badge}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: isError ? "#dc2626" : C.greenDark, color: "#fff", padding: "10px 18px", borderRadius: 9, fontSize: "0.82rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", gap: 8, maxWidth: 360 }}>
      {isError ? <AlertTriangle size={13} /> : "✓"} {toast.msg}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span style={{ fontSize: "0.66rem", fontWeight: 800, padding: "3px 9px", borderRadius: 5, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function FilterBar({ active, onChange }) {
  const filters = ["ALL", "PENDING", "APPROVED", "REJECTED"];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {filters.map((f) => {
        const isActive = active === f;
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            style={{
              padding: "5px 13px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: "pointer", transition: "all 0.15s",
              background: isActive ? C.ink : "transparent",
              color: isActive ? "#fff" : C.muted,
              border: `1.5px solid ${isActive ? C.ink : C.border2}`,
            }}
          >
            {f}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════ */
export default function AccessRequestPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState("ALL");
  const [toast, setToast]       = useState(null);
  const [toastTimer, setToastTimer] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    if (toastTimer) clearTimeout(toastTimer);
    const t = setTimeout(() => setToast(null), 3500);
    setToastTimer(t);
  }, [toastTimer]);

  const loadRequests = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiGet("/access/my");
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const filtered = filter === "ALL" ? requests : requests.filter((r) => r.status === filter);
  const pendingCount  = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;

  /* ─── loading ─── */
  if (loading) {
    return (
      <div style={{ padding: "48px 32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ width: 32, height: 32, border: `3px solid ${C.border2}`, borderTopColor: C.blue, borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
          <p style={{ color: C.muted, marginTop: 14, fontSize: "0.88rem" }}>Loading your requests…</p>
        </div>
      </div>
    );
  }

  /* ─── error ─── */
  if (error) {
    return (
      <div style={{ padding: "32px" }}>
        <div style={{ background: C.errorPale, border: "1px solid #fecaca", borderRadius: 12, padding: "20px 24px", display: "flex", gap: 14, alignItems: "flex-start", maxWidth: 520 }}>
          <AlertTriangle size={18} color={C.error} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: "0.88rem", fontWeight: 700, color: C.error, margin: "0 0 4px" }}>Could not load requests</p>
            <p style={{ fontSize: "0.82rem", color: "#b91c1c", margin: "0 0 14px", lineHeight: 1.6 }}>{error}</p>
            <button onClick={loadRequests} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: C.error, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              <RefreshCw size={12} /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── main UI ─── */
  return (
    <div style={{ padding: "24px 32px", maxWidth: 860, boxSizing: "border-box", animation: "fadeUp 0.22s ease both" }}>
      <Toast toast={toast} />

      {/* Header */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 24px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", boxShadow: "0 2px 12px rgba(3,62,102,0.06)" }}>
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: C.ink, margin: "0 0 4px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            My Access Requests
          </h2>
          <p style={{ fontSize: "0.78rem", color: C.muted, margin: 0 }}>
            Track the status of your project access requests
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 10 }}>
          {pendingCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 9, padding: "6px 12px" }}>
              <Clock size={12} color="#f59e0b" />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#92400e" }}>{pendingCount} pending</span>
            </div>
          )}
          {approvedCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.greenPale, border: `1px solid #b8e060`, borderRadius: 9, padding: "6px 12px" }}>
              <CheckCircle size={12} color={C.greenDark} />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: C.greenDark }}>{approvedCount} approved</span>
            </div>
          )}
        </div>
      </div>

      {/* Requests list */}
      <Section icon={FolderOpen} title="Sent Requests" accent={C.blue} badge={`${filtered.length} shown`}>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, background: C.off }}>
          <FilterBar active={filter} onChange={setFilter} />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.bluePale, border: `1.5px solid ${C.border2}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <FolderOpen size={18} color={C.blue} />
            </div>
            <p style={{ fontSize: "0.84rem", fontWeight: 600, color: C.ink, margin: "0 0 4px" }}>No requests yet</p>
            <p style={{ fontSize: "0.76rem", color: C.muted, margin: 0 }}>
              Browse projects and send access requests to get started
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((req, i) => (
              <div
                key={req.request_id}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.12s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.off)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Project poster / icon */}
                <div style={{ width: 44, height: 44, borderRadius: 10, background: C.bluePale, border: `1.5px solid ${C.border2}`, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {req.project?.poster
                    ? <img src={`${import.meta.env.VITE_API_URL?.replace("/api", "")}/${req.project.poster}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                    : <FolderOpen size={16} color={C.blue} />
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                    <span style={{ fontSize: "0.86rem", fontWeight: 700, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {req.project?.title || req.project_id}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    {req.project?.university && (
                      <span style={{ fontSize: "0.72rem", color: C.muted }}>
                        🎓 {req.project.university}
                      </span>
                    )}
                    {req.project?.project_status && (
                      <span style={{ fontSize: "0.72rem", color: C.muted }}>
                        • {req.project.project_status}
                      </span>
                    )}
                    <span style={{ fontSize: "0.7rem", color: C.muted2 }}>{timeAgo(req.created_at)}</span>
                  </div>

                  {req.message && (
                    <div style={{ marginTop: 6, background: C.off, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", fontSize: "0.75rem", color: C.muted, fontStyle: "italic", lineHeight: 1.5 }}>
                      "{req.message}"
                    </div>
                  )}
                </div>

                {/* Approved CTA */}
                {req.status === "APPROVED" && (
                  <a
                    href={`/projects/${req.project_id}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", background: C.greenPale, color: C.greenDark, border: `1px solid ${C.greenDark}44`, borderRadius: 7, fontSize: "0.75rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", textDecoration: "none", flexShrink: 0, transition: "all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = C.greenDark; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = C.greenPale; e.currentTarget.style.color = C.greenDark; }}
                  >
                    View Details →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Refresh */}
      <button
        onClick={loadRequests}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "transparent", color: C.muted, border: `1.5px solid ${C.border2}`, borderRadius: 8, cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all 0.18s", marginTop: 4 }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.muted; }}
      >
        <RefreshCw size={12} /> Refresh
      </button>
    </div>
  );
}