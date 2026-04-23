import { useState, useEffect, useCallback } from "react";
import { Send, Users, Clock, RefreshCw, AlertTriangle, X, UserMinus, Shield, Zap } from "lucide-react";
import { C } from "../../assets/tokens";

const API_BASE = import.meta.env?.VITE_API_URL || "/api";

/* ─── helpers ─────────────────────────────────────────────────── */
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

/* ─── Toast ────────────────────────────────────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div style={{
      position: "fixed", top: 24, right: 28, zIndex: 9999,
      background: isErr ? "#dc2626" : C.greenDark,
      color: "#fff", padding: "11px 20px", borderRadius: 10,
      fontSize: "0.82rem", fontWeight: 700,
      fontFamily: "'Plus Jakarta Sans',sans-serif",
      boxShadow: `0 8px 24px ${isErr ? "rgba(220,38,38,0.3)" : "rgba(90,138,20,0.3)"}`,
      display: "flex", alignItems: "center", gap: 9, maxWidth: 380,
      animation: "slideIn 0.2s ease",
    }}>
      {isErr ? <AlertTriangle size={14} /> : "✓"} {toast.msg}
    </div>
  );
}

/* ─── Member Avatar ────────────────────────────────────────────── */
function MemberAvatar({ name, role, size = 40 }) {
  const isLead = role === "LEAD";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: isLead
        ? `linear-gradient(135deg, ${C.blue} 0%, ${C.blueMid} 100%)`
        : `linear-gradient(135deg, ${C.greenDark} 0%, ${C.green} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.3 + "px", fontWeight: 800, color: "#fff",
      boxShadow: isLead
        ? `0 0 0 2px ${C.white}, 0 0 0 4px ${C.blue}44`
        : `0 0 0 2px ${C.white}, 0 0 0 4px ${C.greenDark}44`,
    }}>
      {initials(name)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════ */
export default function TeamTab() {
  const [team, setTeam]                   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [inviteEmail, setInviteEmail]     = useState("");
  const [inviteError, setInviteError]     = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [devToken, setDevToken]           = useState(null);
  const [toast, setToast]                 = useState(null);
  const [toastTimer, setToastTimer]       = useState(null);
  const [removingId, setRemovingId]       = useState(null);
  const [cancellingId, setCancellingId]   = useState(null);

  let currentUser = {};
  try { currentUser = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}
  const projectId = localStorage.getItem("project_id");

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    if (toastTimer) clearTimeout(toastTimer);
    const t = setTimeout(() => setToast(null), 3500);
    setToastTimer(t);
  }, [toastTimer]);

  const loadTeam = useCallback(async () => {
    if (!projectId) {
      setError("No project found. Upload a project first.");
      setLoading(false);
      return;
    }
    setLoading(true); setError(null);
    try { setTeam(await apiGet(`/team/${projectId}`)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { loadTeam(); }, [loadTeam]);

  async function handleSendInvite() {
    setInviteError("");
    if (!inviteEmail.trim()) { setInviteError("Email is required."); return; }
    if (!validateEduPk(inviteEmail)) { setInviteError("Must be a valid .edu.pk address."); return; }
    setInviteLoading(true);
    try {
      const data = await apiPost("/team/invite", { invited_email: inviteEmail, project_id: projectId });
      showToast(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      if (data.invite?.inviteToken) setDevToken(data.invite.inviteToken);
      await loadTeam();
    } catch (err) { setInviteError(err.message); }
    finally { setInviteLoading(false); }
  }

  async function handleCancelInvite(inviteId) {
    setCancellingId(inviteId);
    try {
      await apiDelete(`/team/invite/${inviteId}`);
      showToast("Invite cancelled.", "info");
      await loadTeam();
    } catch (err) { showToast(err.message, "error"); }
    finally { setCancellingId(null); }
  }

  async function handleRemoveMember(studentId) {
    setRemovingId(studentId);
    try {
      await apiDelete(`/team/${projectId}/remove/${studentId}`);
      showToast("Member removed.", "info");
      await loadTeam();
    } catch (err) { showToast(err.message, "error"); }
    finally { setRemovingId(null); }
  }

  const isLead      = team?.members?.find((m) => m.student_id === currentUser?.student_id)?.role === "LEAD";
  const teamSize    = team?.members?.length ?? 0;
  const pendingCount = team?.pending_invites?.length ?? 0;
  const MAX         = 5;
  const spotsLeft   = MAX - teamSize - pendingCount;

  const keyframes = `
    @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideIn { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
  `;

  /* ── Loading ── */
  if (loading) return (
    <>
      <style>{keyframes}</style>
      <div style={{ width:"100%", height:"60vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:40, height:40, border:`3px solid ${C.border2}`, borderTopColor:C.blue, borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 16px" }} />
          <p style={{ color:C.muted, fontSize:"0.88rem", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Loading your team…</p>
        </div>
      </div>
    </>
  );

  /* ── Error ── */
  if (error) return (
    <>
      <style>{keyframes}</style>
      <div style={{ width:"100%", padding:"48px 40px" }}>
        <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:14, padding:"24px 28px", display:"flex", gap:16, alignItems:"flex-start", maxWidth:520 }}>
          <AlertTriangle size={20} color="#dc2626" style={{ flexShrink:0, marginTop:2 }} />
          <div>
            <p style={{ fontSize:"0.9rem", fontWeight:700, color:"#dc2626", margin:"0 0 6px", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Could not load team</p>
            <p style={{ fontSize:"0.83rem", color:"#b91c1c", margin:"0 0 16px", lineHeight:1.6 }}>{error}</p>
            <button onClick={loadTeam} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 18px", background:"#dc2626", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontSize:"0.8rem", fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              <RefreshCw size={13} /> Try Again
            </button>
          </div>
        </div>
      </div>
    </>
  );

  /* ── Main ── */
  return (
    <>
      <style>{keyframes}</style>
      <Toast toast={toast} />

      {/* ══ Body — full width with padding ══ */}
      <div style={{ width:"100%", padding:"32px 48px 48px", boxSizing:"border-box", animation:"fadeUp 0.3s ease both" }}>

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
          {[
            { label:"Team Members",    value:teamSize,      max:MAX,  color:C.blue,        icon:"👤" },
            { label:"Pending Invites", value:pendingCount,  max:null, color:"#f59e0b",     icon:"📨" },
            { label:"Open Slots",      value:spotsLeft,     max:null, color:spotsLeft > 0 ? C.greenDark : "#dc2626", icon:"🔓" },
          ].map(({ label, value, max, color, icon }) => (
            <div key={label} style={{
              background:C.white, border:`1px solid ${C.border}`, borderRadius:14,
              padding:"20px 24px", position:"relative", overflow:"hidden",
              boxShadow:"0 1px 6px rgba(3,62,102,0.05)",
            }}>
              <div style={{ position:"absolute", bottom:-10, right:-6, fontSize:"3.5rem", opacity:0.06, lineHeight:1, pointerEvents:"none" }}>{icon}</div>
              <div style={{ fontSize:"0.72rem", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>{label}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                <span style={{ fontSize:"2rem", fontWeight:800, color, letterSpacing:"-0.04em", lineHeight:1 }}>{value}</span>
                {max && <span style={{ fontSize:"0.88rem", color:C.muted2, fontWeight:500 }}>/ {max}</span>}
              </div>
              {max && (
                <div style={{ marginTop:10, height:4, background:C.off, borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(value/max)*100}%`, background:`linear-gradient(90deg,${C.blue},${C.blueMid})`, borderRadius:4, transition:"width 0.5s ease" }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:20, alignItems:"start" }}>

          {/* ── LEFT: Members + Pending ── */}
          <div>

            {/* Members card */}
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden", marginBottom:20 }}>
              <div style={{ padding:"15px 24px", borderBottom:`1px solid ${C.border}`, background:C.off, display:"flex", alignItems:"center", gap:12, borderLeft:`3px solid ${C.greenDark}` }}>
                <div style={{ width:28, height:28, borderRadius:8, background:`${C.greenDark}14`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Users size={13} color={C.greenDark} strokeWidth={2.2} />
                </div>
                <h3 style={{ fontSize:"0.9rem", fontWeight:800, color:C.ink, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Team Members</h3>
                <span style={{ marginLeft:"auto", fontSize:"0.72rem", fontWeight:700, color:C.greenDark, background:C.greenPale, padding:"3px 10px", borderRadius:20, border:`1px solid ${C.greenDark}30` }}>
                  {teamSize}/{MAX}
                </span>
              </div>

              {team.members.length === 0
                ? <div style={{ padding:"40px 24px", textAlign:"center", color:C.muted, fontSize:"0.85rem" }}>No members yet.</div>
                : team.members.map((m, i) => {
                  const isThisLead = m.role === "LEAD";
                  const isMe       = m.student_id === currentUser?.student_id;
                  const isRemoving = removingId === m.student_id;
                  return (
                    <div key={m.member_id}
                      style={{
                        display:"flex", alignItems:"center", gap:16, padding:"16px 24px",
                        borderBottom: i < team.members.length - 1 ? `1px solid ${C.border}` : "none",
                        transition:"background 0.15s", opacity: isRemoving ? 0.5 : 1,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = C.off}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <MemberAvatar name={m.full_name} role={m.role} size={42} />

                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                          <span style={{ fontSize:"0.88rem", fontWeight:700, color:C.ink }}>{m.full_name}</span>
                          {isMe && (
                            <span style={{ fontSize:"0.64rem", color:C.muted, fontWeight:500, background:C.off, padding:"1px 7px", borderRadius:20, border:`1px solid ${C.border2}` }}>you</span>
                          )}
                        </div>
                        <div style={{ fontSize:"0.74rem", color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.email}</div>
                        <div style={{ fontSize:"0.68rem", color:C.muted2, marginTop:2 }}>
                          Joined {new Date(m.joined_at).toLocaleDateString("en-PK", { day:"numeric", month:"short", year:"numeric" })}
                        </div>
                      </div>

                      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                        <span style={{
                          display:"inline-flex", alignItems:"center", gap:5, fontSize:"0.66rem", fontWeight:800,
                          padding:"4px 10px", borderRadius:20,
                          background: isThisLead ? `${C.blue}10` : C.greenPale,
                          color: isThisLead ? C.blue : C.greenDark,
                          border: `1px solid ${isThisLead ? `${C.blue}25` : `${C.greenDark}30`}`,
                        }}>
                          {isThisLead ? <Shield size={9} /> : <Zap size={9} />}
                          {m.role}
                        </span>
                        {isLead && !isThisLead && (
                          <button onClick={() => handleRemoveMember(m.student_id)} disabled={isRemoving}
                            style={{
                              display:"flex", alignItems:"center", gap:4, padding:"5px 12px",
                              background:"transparent", border:"1px solid #fca5a5", borderRadius:7,
                              color:"#dc2626", fontSize:"0.72rem", fontWeight:700,
                              fontFamily:"'Plus Jakarta Sans',sans-serif", cursor:"pointer", transition:"all 0.15s",
                              opacity: isRemoving ? 0.5 : 1,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background="#fef2f2"; e.currentTarget.style.borderColor="#f87171"; }}
                            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="#fca5a5"; }}
                          >
                            {isRemoving
                              ? <span style={{ width:10, height:10, border:"2px solid #fca5a5", borderTopColor:"#dc2626", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                              : <UserMinus size={11} />
                            }
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              }
            </div>

            {/* Pending Invites card */}
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
              <div style={{ padding:"15px 24px", borderBottom:`1px solid ${C.border}`, background:C.off, display:"flex", alignItems:"center", gap:12, borderLeft:"3px solid #f59e0b" }}>
                <div style={{ width:28, height:28, borderRadius:8, background:"#fffbeb", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Clock size={13} color="#b45309" strokeWidth={2.2} />
                </div>
                <h3 style={{ fontSize:"0.9rem", fontWeight:800, color:C.ink, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Pending Invites</h3>
                {pendingCount > 0 && (
                  <span style={{ marginLeft:"auto", fontSize:"0.72rem", fontWeight:700, color:"#b45309", background:"#fffbeb", padding:"3px 10px", borderRadius:20, border:"1px solid #fcd34d" }}>
                    {pendingCount} awaiting
                  </span>
                )}
              </div>

              {team.pending_invites.length === 0
                ? (
                  <div style={{ padding:"32px 24px", textAlign:"center" }}>
                    <div style={{ fontSize:"1.6rem", marginBottom:8 }}>📭</div>
                    <p style={{ fontSize:"0.82rem", color:C.muted, margin:0 }}>No pending invites right now.</p>
                  </div>
                )
                : team.pending_invites.map((inv, i) => {
                  const isCancelling = cancellingId === inv.invite_id;
                  return (
                    <div key={inv.invite_id}
                      style={{
                        display:"flex", alignItems:"center", gap:16, padding:"16px 24px",
                        borderBottom: i < team.pending_invites.length - 1 ? `1px solid ${C.border}` : "none",
                        opacity: isCancelling ? 0.5 : 1, transition:"opacity 0.2s",
                      }}
                    >
                      <div style={{ width:42, height:42, borderRadius:"50%", background:"#fef3c7", border:"2px solid #fcd34d", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:"0.86rem", fontWeight:600, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:3 }}>{inv.invited_email}</div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:"#f59e0b", display:"inline-block", animation:"pulse 2s ease infinite" }} />
                          <span style={{ fontSize:"0.72rem", color:"#b45309", fontWeight:500 }}>{relTime(inv.expires_at)}</span>
                        </div>
                      </div>
                      {isLead && (
                        <button onClick={() => handleCancelInvite(inv.invite_id)} disabled={isCancelling}
                          style={{
                            display:"flex", alignItems:"center", gap:4, padding:"5px 12px",
                            background:"transparent", border:`1px solid ${C.border2}`, borderRadius:7,
                            color:C.muted2, fontSize:"0.72rem", fontWeight:700,
                            fontFamily:"'Plus Jakarta Sans',sans-serif", cursor:"pointer", transition:"all 0.15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor="#fca5a5"; e.currentTarget.style.color="#dc2626"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor=C.border2; e.currentTarget.style.color=C.muted2; }}
                        >
                          {isCancelling
                            ? <span style={{ width:10, height:10, border:`2px solid ${C.border2}`, borderTopColor:C.muted, borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                            : <X size={11} />
                          }
                          Cancel
                        </button>
                      )}
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* ── RIGHT: Invite panel + rules ── */}
          <div style={{ position:"sticky", top:24 }}>

            {isLead ? (
              <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 4px 20px rgba(3,62,102,0.07)", marginBottom:16 }}>
                {/* dark header */}
                <div style={{
                  padding:"18px 22px", borderBottom:`1px solid ${C.border}`,
                  background:`linear-gradient(135deg,${C.ink} 0%,${C.blue} 100%)`,
                  position:"relative", overflow:"hidden",
                }}>
                  <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, background:`radial-gradient(${C.green}25,transparent 65%)`, pointerEvents:"none" }} />
                  <div style={{ display:"flex", alignItems:"center", gap:10, position:"relative" }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:"rgba(163,207,62,0.2)", border:"1px solid rgba(163,207,62,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Send size={14} color={C.green} />
                    </div>
                    <div>
                      <h3 style={{ fontSize:"0.9rem", fontWeight:800, color:"#fff", margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Invite Teammate</h3>
                      <p style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.45)", margin:0 }}>Send via .edu.pk email</p>
                    </div>
                  </div>
                </div>

                <div style={{ padding:"20px 22px" }}>
                  {/* Capacity bar */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <span style={{ fontSize:"0.72rem", color:C.muted, fontWeight:500 }}>Team capacity</span>
                    <span style={{
                      fontSize:"0.72rem", fontWeight:700, padding:"3px 10px", borderRadius:20,
                      background: spotsLeft > 0 ? C.greenPale : "#fef2f2",
                      color: spotsLeft > 0 ? C.greenDark : "#dc2626",
                      border: `1px solid ${spotsLeft > 0 ? `${C.greenDark}30` : "#fecaca"}`,
                    }}>
                      {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left` : "Team full"}
                    </span>
                  </div>
                  <div style={{ height:5, background:C.off, borderRadius:5, overflow:"hidden", marginBottom:20 }}>
                    <div style={{
                      height:"100%", borderRadius:5, transition:"width 0.5s ease",
                      width:`${((teamSize + pendingCount) / MAX) * 100}%`,
                      background: spotsLeft === 0 ? "linear-gradient(90deg,#dc2626,#f87171)" : `linear-gradient(90deg,${C.blue},${C.green})`,
                    }} />
                  </div>

                  {/* Email input */}
                  <label style={{ display:"block", fontSize:"0.72rem", fontWeight:700, color:C.muted2, marginBottom:7, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                    Email Address
                  </label>
                  <input
                    type="email" value={inviteEmail}
                    onChange={e => { setInviteEmail(e.target.value); setInviteError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleSendInvite()}
                    placeholder="teammate@university.edu.pk"
                    style={{
                      width:"100%", padding:"10px 14px", boxSizing:"border-box",
                      border:`1.5px solid ${inviteError ? "#fca5a5" : C.border2}`,
                      borderRadius:9, fontSize:"0.84rem",
                      fontFamily:"'Plus Jakarta Sans',sans-serif",
                      color:C.ink, outline:"none", background:C.white,
                      transition:"border-color 0.15s", marginBottom:inviteError ? 6 : 14,
                    }}
                    onFocus={e => !inviteError && (e.target.style.borderColor = C.blue)}
                    onBlur={e => !inviteError && (e.target.style.borderColor = C.border2)}
                  />

                  {inviteError && (
                    <p style={{ fontSize:"0.74rem", color:"#dc2626", margin:"0 0 12px", fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
                      <AlertTriangle size={11} /> {inviteError}
                    </p>
                  )}

                  <button onClick={handleSendInvite} disabled={inviteLoading || spotsLeft <= 0}
                    style={{
                      width:"100%", padding:"11px", border:"none",
                      background: spotsLeft <= 0 ? C.muted2 : C.ink,
                      color:"#fff", borderRadius:9, fontSize:"0.84rem", fontWeight:700,
                      fontFamily:"'Plus Jakarta Sans',sans-serif",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                      cursor: inviteLoading || spotsLeft <= 0 ? "not-allowed" : "pointer",
                      transition:"background 0.18s", opacity: inviteLoading ? 0.75 : 1,
                    }}
                    onMouseEnter={e => { if (!inviteLoading && spotsLeft > 0) e.currentTarget.style.background = C.blue; }}
                    onMouseLeave={e => { if (!inviteLoading && spotsLeft > 0) e.currentTarget.style.background = C.ink; }}
                  >
                    {inviteLoading
                      ? <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                      : <Send size={13} />
                    }
                    {inviteLoading ? "Sending…" : "Send Invite"}
                  </button>

                  {devToken && (
                    <div style={{ marginTop:14, background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:8, padding:"10px 12px", fontSize:"0.72rem", color:"#92400e", lineHeight:1.6 }}>
                      <strong>DEV MODE</strong> — token:{" "}
                      <code style={{ fontFamily:"monospace", wordBreak:"break-all", background:"#fef3c7", padding:"1px 4px", borderRadius:3 }}>{devToken}</code>
                      <br />
                      <span style={{ color:"#a16207" }}>URL: <code style={{ fontFamily:"monospace", fontSize:"0.68rem" }}>/team/invite/accept?token=…</code></span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:"28px 22px", marginBottom:16, textAlign:"center" }}>
                <div style={{ fontSize:"2rem", marginBottom:10 }}>👤</div>
                <p style={{ fontSize:"0.83rem", color:C.muted, margin:0, lineHeight:1.6 }}>Only the project lead can invite new teammates.</p>
              </div>
            )}

            {/* Rules card */}
            <div style={{ background:C.off, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px" }}>
              <h4 style={{ fontSize:"0.74rem", fontWeight:800, color:C.ink, margin:"0 0 14px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Team Rules</h4>
              {[
                ["🔒", "Only .edu.pk addresses can join"],
                ["👥", "Maximum 5 members including lead"],
                ["⏱️", "Invites expire after 48 hours"],
                ["🎯", "Each student can be in one FYP team"],
              ].map(([icon, rule]) => (
                <div key={rule} style={{ display:"flex", gap:10, marginBottom:10, fontSize:"0.78rem", color:C.muted, alignItems:"flex-start" }}>
                  <span style={{ fontSize:"0.82rem", flexShrink:0 }}>{icon}</span>
                  <span style={{ lineHeight:1.5 }}>{rule}</span>
                </div>
              ))}
              <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                <button onClick={loadTeam}
                  style={{
                    display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px",
                    background:"transparent", color:C.muted, border:`1.5px solid ${C.border2}`,
                    borderRadius:7, cursor:"pointer", fontSize:"0.76rem", fontWeight:600,
                    fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.18s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.color=C.blue; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=C.border2; e.currentTarget.style.color=C.muted; }}
                >
                  <RefreshCw size={11} /> Refresh
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}