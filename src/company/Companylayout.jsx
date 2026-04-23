import { useState } from "react";
import {
  Search, Bell, LogOut,
  ChevronLeft, ChevronRight,
  FolderOpen, Inbox, User, Building2,
} from "lucide-react";
import { C } from "../../assets/tokens";

const NAV_ITEMS = [
  { id: "browse",   Icon: Search,     label: "Browse Projects" },
  { id: "requests", Icon: Inbox,      label: "My Requests"     },
  { id: "profile",  Icon: User,       label: "Profile"         },
];

/* ══════════════════════════════════════════
   COMPANY SIDEBAR
══════════════════════════════════════════ */
export function CompanySidebar({ active, onNav, onLogout, collapsed, onToggle, width }) {
  const w = collapsed ? 64 : width;

  let user = {};
  try { user = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}

  const companyName = user.company_name || user.companyName || "Company";
  const initials = companyName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("") || "CO";

  const isVerified = user.verification_status === "VERIFIED";

  return (
    <aside
      style={{
        width: w, minHeight: "100vh",
        background: C.ink,
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, zIndex: 100,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        transition: "width 0.25s ease",
        overflow: "hidden",
      }}
    >
      {/* Logo + toggle */}
      <div style={{ padding: "18px 14px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 64 }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
            <div style={{ width: 30, height: 30, background: C.blue, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: C.green, borderRadius: "4px 0 0 0" }} />
              <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#fff", zIndex: 1 }}>Px</span>
            </div>
            <span style={{ fontSize: "0.98rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.4px", fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: "nowrap" }}>
              Projex<span style={{ color: C.green }}>.pk</span>
            </span>
          </div>
        )}
        {collapsed && (
          <div style={{ width: 30, height: 30, background: C.blue, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", margin: "0 auto" }}>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: C.green, borderRadius: "4px 0 0 0" }} />
            <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#fff", zIndex: 1 }}>Px</span>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "rgba(255,255,255,0.4)", transition: "all 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Role + verification chip */}
      {!collapsed && (
        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(163,207,62,0.12)", border: "1px solid rgba(163,207,62,0.25)", borderRadius: 6, padding: "4px 10px", fontSize: "0.66rem", fontWeight: 700, color: C.green, letterSpacing: "0.06em", width: "fit-content" }}>
            <Building2 size={11} /> COMPANY
          </div>
          {!isVerified && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.3)", borderRadius: 6, padding: "4px 10px", fontSize: "0.63rem", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.04em", width: "fit-content" }}>
              ⏳ PENDING VERIFICATION
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px" }}>
        {NAV_ITEMS.map(({ id, Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              title={collapsed ? label : undefined}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "11px 0" : "10px 12px",
                borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.83rem",
                fontWeight: isActive ? 700 : 500, marginBottom: 3, transition: "all 0.15s",
                background: isActive ? "rgba(3,62,102,0.65)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.42)",
                borderLeft: collapsed ? "none" : isActive ? `2.5px solid ${C.green}` : "2.5px solid transparent",
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {!collapsed && <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap" }}>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User card */}
      <div style={{ padding: collapsed ? "12px 0" : "13px 14px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {collapsed ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              onClick={onLogout}
              title="Logout"
              style={{ width: 32, height: 32, borderRadius: "50%", background: C.blue, border: `2px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "#fff", cursor: "pointer" }}
            >
              {initials}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.blue, border: `2px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{companyName}</div>
              <div style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.32)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.industry || "Company"}</div>
            </div>
            <LogOut
              size={13}
              color="rgba(255,255,255,0.25)"
              style={{ flexShrink: 0, cursor: "pointer" }}
              onClick={onLogout}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
            />
          </div>
        )}
      </div>

      {/* Drag handle */}
      {!collapsed && (
        <div
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startW = w;
            const onMove = (ev) => {
              const newW = Math.min(320, Math.max(180, startW + ev.clientX - startX));
              document.dispatchEvent(new CustomEvent("sidebar-resize", { detail: newW }));
            };
            const onUp = () => {
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          }}
          style={{ position: "absolute", top: 0, right: 0, width: 4, height: "100%", cursor: "col-resize", background: "transparent", transition: "background 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = `${C.green}60`)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        />
      )}
    </aside>
  );
}

/* ══════════════════════════════════════════
   COMPANY TOP BAR
══════════════════════════════════════════ */
export function CompanyTopBar({ title, subtitle }) {
  let user = {};
  try { user = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}

  const companyName = user.company_name || user.companyName || "Company";
  const initials = companyName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("") || "CO";

  const isVerified = user.verification_status === "VERIFIED";

  return (
    <header
      style={{ height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 50 }}
    >
      <div>
        <h1 style={{ fontSize: "1rem", fontWeight: 800, color: C.ink, letterSpacing: "-0.02em", fontFamily: "'Plus Jakarta Sans',sans-serif", margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: "0.72rem", color: C.muted, margin: 0, marginTop: 1 }}>{subtitle}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {!isVerified && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 7, padding: "5px 11px", fontSize: "0.7rem", fontWeight: 700, color: "#92400e" }}>
            ⏳ Pending Verification
          </div>
        )}
        <button style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bell size={15} color={C.muted} />
        </button>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.blue, border: `2px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 800, color: "#fff", cursor: "pointer" }}>
          {initials}
        </div>
      </div>
    </header>
  );
}