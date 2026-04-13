import { useState, useEffect, useCallback } from "react";
import { Send, Users, Clock, RefreshCw, AlertTriangle, X, UserMinus } from "lucide-react";
import { C } from "../../assets/tokens";

const API_BASE = import.meta.env?.VITE_API_URL || "/api";

/* ─── helpers ──────────────────────────────────────────────────── */
function initials(name) {
  return (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("");
}

function relTime(iso) {
  const diff = new Date(iso) - Date.now();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Expires soon";
  if (h < 24) return `Expires in ${h}h`;
  return `Expires in ${Math.floor(h / 24)}d`;
}

function validateEduPk(email) {
  return /^[^\s@]+@[^\s@]+\.edu\.pk$/.test(email);
}

/* ─── API calls ────────────────────────────────────────────────── */
async function apiGet(path) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed.");
  return data;
}

async function apiPost(path, body) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed.");
  return data;
}

async function apiDelete(path) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed.");
  return data;
}

/* ─── sub-components ───────────────────────────────────────────── */
function Section({ icon: Icon, title, accent = C.blue, badge, children }) {
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          padding: "11px 20px",
          borderBottom: `1px solid ${C.border}`,
          background: C.off,
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderLeft: `3px solid ${accent}`,
        }}
      >
        {Icon && (
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: `${accent}14`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={12} color={accent} strokeWidth={2.2} />
          </div>
        )}
        <h3
          style={{
            fontSize: "0.84rem",
            fontWeight: 800,
            color: C.ink,
            margin: 0,
            fontFamily: "'Plus Jakarta Sans',sans-serif",
          }}
        >
          {title}
        </h3>
        {badge && (
          <span
            style={{
              fontSize: "0.7rem",
              color: C.muted2,
              marginLeft: 2,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 24,
        zIndex: 9999,
        background: isError ? "#dc2626" : C.greenDark,
        color: "#fff",
        padding: "10px 18px",
        borderRadius: 9,
        fontSize: "0.82rem",
        fontWeight: 700,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        maxWidth: 360,
      }}
    >
      {isError ? <AlertTriangle size={13} /> : "✓"} {toast.msg}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════ */
export default function TeamTab() {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  // DEV MODE: store returned invite token for easy testing
  const [devToken, setDevToken] = useState(null);

  const [toast, setToast] = useState(null);
  const [toastTimer, setToastTimer] = useState(null);

  // Derive current user's student_id from localStorage
  let currentUser = {};
  try { currentUser = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}
  const projectId = localStorage.getItem("project_id");

  /* ── toast helper ── */
  const showToast = useCallback(
    (msg, type = "success") => {
      setToast({ msg, type });
      if (toastTimer) clearTimeout(toastTimer);
      const t = setTimeout(() => setToast(null), 3500);
      setToastTimer(t);
    },
    [toastTimer]
  );

  /* ── load team ── */
  const loadTeam = useCallback(async () => {
    if (!projectId) {
      setError("No project found. Upload a project first.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet(`/team/${projectId}`);
      setTeam(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  /* ── send invite ── */
  async function handleSendInvite() {
    setInviteError("");
    if (!inviteEmail.trim()) {
      setInviteError("Email is required.");
      return;
    }
    if (!validateEduPk(inviteEmail)) {
      setInviteError("Must be a valid .edu.pk email address.");
      return;
    }
    setInviteLoading(true);
    try {
      const data = await apiPost("/team/invite", {
        invited_email: inviteEmail,
        project_id: projectId,
      });
      showToast(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      // DEV MODE: expose invite token
      if (data.invite?.inviteToken) {
        setDevToken(data.invite.inviteToken);
      }
      await loadTeam();
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  }

  /* ── cancel invite ── */
  async function handleCancelInvite(inviteId) {
    try {
      await apiDelete(`/team/invite/${inviteId}`);
      showToast("Invite cancelled.", "info");
      await loadTeam();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  /* ── remove member ── */
  async function handleRemoveMember(studentId) {
    try {
      await apiDelete(`/team/${projectId}/remove/${studentId}`);
      showToast("Member removed.", "info");
      await loadTeam();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  const isLead =
    team?.members?.find((m) => m.student_id === currentUser?.student_id)
      ?.role === "LEAD";

  const teamSize = team?.members?.length ?? 0;
  const pendingCount = team?.pending_invites?.length ?? 0;
  const MAX = 5;
  const spotsLeft = MAX - teamSize - pendingCount;

  /* ─── loading ─── */
  if (loading) {
    return (
      <div
        style={{
          padding: "48px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              width: 32,
              height: 32,
              border: `3px solid ${C.border2}`,
              borderTopColor: C.blue,
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <p style={{ color: C.muted, marginTop: 14, fontSize: "0.88rem" }}>
            Loading team…
          </p>
        </div>
      </div>
    );
  }

  /* ─── error ─── */
  if (error) {
    return (
      <div style={{ padding: "32px" }}>
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: "20px 24px",
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
            maxWidth: 520,
          }}
        >
          <AlertTriangle
            size={18}
            color="#dc2626"
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <div>
            <p
              style={{
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "#dc2626",
                margin: "0 0 4px",
              }}
            >
              Could not load team
            </p>
            <p
              style={{
                fontSize: "0.82rem",
                color: "#b91c1c",
                margin: "0 0 14px",
                lineHeight: 1.6,
              }}
            >
              {error}
            </p>
            <button
              onClick={loadTeam}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans',sans-serif",
              }}
            >
              <RefreshCw size={12} /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── main UI ─── */
  return (
    <div
      style={{
        padding: "24px 32px",
        maxWidth: 860,
        boxSizing: "border-box",
        animation: "fadeUp 0.22s ease both",
      }}
    >
      <Toast toast={toast} />

      {/* ── Header card ── */}
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          boxShadow: "0 2px 12px rgba(3,62,102,0.06)",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 800,
              color: C.ink,
              margin: "0 0 4px",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}
          >
            Project Team
          </h2>
          <p style={{ fontSize: "0.78rem", color: C.muted, margin: 0 }}>
            Manage your team members and pending invites
          </p>
        </div>

        {/* Member pips */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Array.from({ length: MAX }).map((_, i) => {
            const filled = i < teamSize;
            const pending = !filled && i < teamSize + pendingCount;
            return (
              <div
                key={i}
                title={
                  filled
                    ? team.members[i]?.full_name
                    : pending
                    ? "Invite pending"
                    : "Open"
                }
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: filled
                    ? C.blue
                    : pending
                    ? `${C.green}44`
                    : `${C.border2}55`,
                  border: `2px solid ${
                    filled
                      ? C.greenDark
                      : pending
                      ? C.greenDark
                      : C.border
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  color: filled ? "#fff" : C.muted,
                }}
              >
                {filled ? initials(team.members[i]?.full_name || "") : ""}
              </div>
            );
          })}
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: C.ink,
              marginLeft: 4,
            }}
          >
            {teamSize}/{MAX}
          </span>
        </div>
      </div>

      {/* ── Send Invite (lead only) ── */}
      {isLead && (
        <Section icon={Send} title="Invite Teammate" accent={C.blue}>
          <div style={{ padding: "16px 20px" }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      setInviteError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
                    placeholder="teammate@university.edu.pk"
                    style={{
                      width: "100%",
                      padding: "9px 13px",
                      border: `1.5px solid ${inviteError ? "#fca5a5" : C.border2}`,
                      borderRadius: 8,
                      fontSize: "0.84rem",
                      fontFamily: "'Plus Jakarta Sans',sans-serif",
                      color: C.ink,
                      outline: "none",
                      background: C.white,
                    }}
                  />
                </div>
                {inviteError && (
                  <p
                    style={{
                      fontSize: "0.74rem",
                      color: "#dc2626",
                      margin: "5px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    {inviteError}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: spotsLeft > 0 ? C.greenDark : "#dc2626",
                    background: spotsLeft > 0 ? C.greenPale : "#fef2f2",
                    padding: "3px 9px",
                    borderRadius: 5,
                    border: `1px solid ${spotsLeft > 0 ? "#b8e060" : "#fecaca"}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                </span>

                <button
                  onClick={handleSendInvite}
                  disabled={inviteLoading || spotsLeft <= 0}
                  style={{
                    padding: "9px 18px",
                    background: C.ink,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    opacity: inviteLoading || spotsLeft <= 0 ? 0.5 : 1,
                    cursor:
                      inviteLoading || spotsLeft <= 0
                        ? "not-allowed"
                        : "pointer",
                    transition: "opacity 0.15s",
                  }}
                >
                  {inviteLoading ? (
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                  ) : (
                    <Send size={12} />
                  )}
                  Send Invite
                </button>
              </div>
            </div>

            {/* DEV MODE token display */}
            {devToken && (
              <div
                style={{
                  marginTop: 12,
                  background: "#fffbeb",
                  border: "1px solid #fcd34d",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: "0.75rem",
                  color: "#92400e",
                  lineHeight: 1.6,
                }}
              >
                <strong>DEV MODE</strong> — Copy token to test:{" "}
                <code
                  style={{
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    background: "#fef3c7",
                    padding: "1px 4px",
                    borderRadius: 4,
                  }}
                >
                  {devToken}
                </code>
                <br />
                <span style={{ color: "#a16207" }}>
                  Accept URL:{" "}
                  <code style={{ fontFamily: "monospace" }}>
                    /team/invite/accept?token={devToken}
                  </code>
                </span>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── Current Members ── */}
      <Section
        icon={Users}
        title="Members"
        accent={C.greenDark}
        badge={`${teamSize} member${teamSize !== 1 ? "s" : ""}`}
      >
        <div style={{ padding: "8px 0" }}>
          {team.members.map((m, i) => {
            const isThisLead = m.role === "LEAD";
            const isMe = m.student_id === currentUser?.student_id;
            return (
              <div
                key={m.member_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 20px",
                  borderBottom:
                    i < team.members.length - 1
                      ? `1px solid ${C.border}`
                      : "none",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = C.off)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: isThisLead
                      ? `${C.blue}22`
                      : `${C.greenPale}`,
                    border: `2px solid ${
                      isThisLead ? `${C.blue}55` : `${C.greenDark}44`
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.74rem",
                    fontWeight: 800,
                    color: isThisLead ? C.ink : C.greenDark,
                    flexShrink: 0,
                  }}
                >
                  {initials(m.full_name)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.84rem",
                      fontWeight: 700,
                      color: C.ink,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {m.full_name}
                    {isMe && (
                      <span
                        style={{
                          fontSize: "0.64rem",
                          color: C.muted,
                          fontWeight: 500,
                        }}
                      >
                        (you)
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: C.muted,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {m.email}
                  </div>
                </div>

                {/* Role badge + actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.66rem",
                      fontWeight: 800,
                      padding: "3px 9px",
                      borderRadius: 5,
                      background: isThisLead
                        ? `${C.blue}14`
                        : C.greenPale,
                      color: isThisLead ? C.ink : C.greenDark,
                      border: `1px solid ${
                        isThisLead ? `${C.blue}30` : `${C.greenDark}30`
                      }`,
                    }}
                  >
                    {m.role}
                  </span>
                  {isLead && !isThisLead && (
                    <button
                      onClick={() => handleRemoveMember(m.student_id)}
                      title="Remove member"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 10px",
                        background: "transparent",
                        border: "1px solid #fca5a5",
                        borderRadius: 6,
                        color: "#dc2626",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        cursor: "pointer",
                        transition: "all 0.12s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fef2f2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <UserMinus size={11} /> Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Pending Invites ── */}
      {team.pending_invites.length > 0 ? (
        <Section
          icon={Clock}
          title="Pending Invites"
          accent="#f59e0b"
          badge={`${pendingCount} pending`}
        >
          <div style={{ padding: "8px 0" }}>
            {team.pending_invites.map((inv, i) => (
              <div
                key={inv.invite_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 20px",
                  borderBottom:
                    i < team.pending_invites.length - 1
                      ? `1px solid ${C.border}`
                      : "none",
                }}
              >
                {/* Mail avatar */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#fef3c7",
                    border: "2px solid #fcd34d",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#92400e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.84rem",
                      fontWeight: 600,
                      color: C.ink,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {inv.invited_email}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#b45309" }}>
                    {relTime(inv.expires_at)}
                  </div>
                </div>

                {/* Cancel */}
                {isLead && (
                  <button
                    onClick={() => handleCancelInvite(inv.invite_id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      background: "transparent",
                      border: `1px solid ${C.border2}`,
                      borderRadius: 6,
                      color: C.muted2,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      fontFamily: "'Plus Jakarta Sans',sans-serif",
                      cursor: "pointer",
                      transition: "all 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#fca5a5";
                      e.currentTarget.style.color = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border2;
                      e.currentTarget.style.color = C.muted2;
                    }}
                  >
                    <X size={11} /> Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        </Section>
      ) : (
        <div
          style={{
            background: C.white,
            border: `1px dashed ${C.border2}`,
            borderRadius: 14,
            padding: "20px 24px",
            textAlign: "center",
            color: C.muted,
            fontSize: "0.82rem",
            marginBottom: 16,
          }}
        >
          No pending invites
        </div>
      )}

      {/* Refresh */}
      <button
        onClick={loadTeam}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 16px",
          background: "transparent",
          color: C.muted,
          border: `1.5px solid ${C.border2}`,
          borderRadius: 8,
          cursor: "pointer",
          fontSize: "0.78rem",
          fontWeight: 600,
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          transition: "all 0.18s",
          marginTop: 4,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = C.blue;
          e.currentTarget.style.color = C.blue;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = C.border2;
          e.currentTarget.style.color = C.muted;
        }}
      >
        <RefreshCw size={12} /> Refresh
      </button>
    </div>
  );
}