import { useEffect, useState, useCallback } from "react";
import { C } from "../assets/tokens.js";
import { getStats, adminSession } from "../services/adminApi.js";
import { AdminFontLoader } from "./AdminShared.jsx";
import OverviewTab from "./OverviewTab.jsx";
import CompaniesTab from "./CompaniesTab.jsx";
import ProjectsTab from "./ProjectsTab.jsx";
import StudentsTab from "./StudentsTab.jsx";

const NAV = [
  { key: "overview", label: "Overview", icon: "◆" },
  { key: "companies", label: "Companies", icon: "🏢", badgeKey: "companiesPending" },
  { key: "projects", label: "Projects", icon: "🎓", badgeKey: "projectsPending" },
  { key: "students", label: "Students", icon: "🧑‍🎓" },
];

export default function AdminDashboard({ admin, onLogout }) {
  const [active, setActive] = useState("overview");
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");

  const refreshStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
      setStatsError("");
    } catch (err) {
      setStatsError("Couldn't load stats.");
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const badges = {
    companiesPending: stats?.companies?.pending_approval || 0,
    projectsPending: stats?.projects?.pending_review || 0,
  };

  const logout = () => {
    adminSession.clear();
    onLogout();
  };

  return (
    <div className="admin-scope" style={{ minHeight: "100vh", background: C.cream, display: "flex", fontFamily: "'Inter', sans-serif" }}>
      <AdminFontLoader />

      {/* ─── SIDEBAR ─── */}
      <aside style={{ width: 250, flexShrink: 0, background: C.navy, minHeight: "100vh", display: "flex", flexDirection: "column", padding: "26px 18px", position: "sticky", top: 0, alignSelf: "flex-start", height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 34 }}>
          <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.1)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, background: C.gold, borderRadius: "4px 0 0 0" }} />
            <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#fff" }}>Px</span>
          </div>
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", fontFamily: "'Sora', sans-serif" }}>
              Projex<span style={{ color: C.gold }}>.pk</span>
            </div>
            <div style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV.map((item) => {
            const isActive = active === item.key;
            const count = item.badgeKey ? badges[item.badgeKey] : 0;
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                  padding: "11px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                  fontSize: "0.87rem", fontWeight: isActive ? 700 : 500, fontFamily: "'Inter', sans-serif",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: "0.95rem", width: 18, textAlign: "center" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {count > 0 && (
                  <span style={{ background: C.gold, color: "#fff", fontSize: "0.66rem", fontWeight: 700, minWidth: 18, height: 18, borderRadius: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px", marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {(admin?.full_name || "A").slice(0, 1).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {admin?.full_name || "Admin"}
              </div>
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {admin?.email}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)", borderRadius: 9, padding: "9px 0", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.15s ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
          >
            Log out
          </button>
        </div>
      </aside>

      {/* ─── CONTENT ─── */}
      <main style={{ flex: 1, padding: "40px 48px", minWidth: 0 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          {active === "overview" && <OverviewTab stats={stats} error={statsError} onRetry={refreshStats} />}
          {active === "companies" && <CompaniesTab onChanged={refreshStats} />}
          {active === "projects" && <ProjectsTab onChanged={refreshStats} />}
          {active === "students" && <StudentsTab onChanged={refreshStats} />}
        </div>
      </main>
    </div>
  );
}