import { useEffect, useState, useCallback } from "react";
import { C } from "../assets/tokens.js";
import { browseProjects, getRecommendedProjects } from "../services/discoveryApi.js";
import { Spinner, EmptyState, ErrorBanner, Card, Tag, InfoBanner } from "../shared/UI.jsx";

/**
 * Mount in the company dashboard. `renderAction` lets you plug in your
 * existing RequestAccessButton.jsx without this file needing to know its
 * exact props:
 *
 *   <DiscoverProjectsTab renderAction={(project) => (
 *     <RequestAccessButton projectId={project.project_id} />
 *   )} />
 *
 * If you don't pass `renderAction`, cards just show a "View on Projex.pk"
 * link stub so the tab is still usable standalone.
 */
export default function DiscoverProjectsTab({ renderAction }) {
  const [mode, setMode] = useState("recommended");
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState("");
  const [matched, setMatched] = useState(true);
  const [filters, setFilters] = useState({ project_type: "", tech_tags: "", university: "" });

  const load = useCallback(async () => {
    setError("");
    try {
      if (mode === "recommended") {
        const data = await getRecommendedProjects();
        setProjects(data.projects || []);
        setMatched(data.matched);
      } else {
        const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
        const data = await browseProjects(cleanFilters);
        setProjects(data.projects || []);
        setMatched(true);
      }
    } catch (err) {
      setError("Couldn't load projects.");
    }
  }, [mode, filters]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.35rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.02em" }}>Discover Projects</h2>
      <p style={{ fontSize: "0.85rem", color: C.muted, marginTop: 4, marginBottom: 20 }}>Browse approved student projects across Pakistan's universities.</p>

      <div style={{ display: "flex", gap: 6, background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, marginBottom: 18, width: "fit-content" }}>
        {[{ key: "recommended", label: "Recommended" }, { key: "browse", label: "Browse all" }].map((t) => (
          <button key={t.key} onClick={() => setMode(t.key)}
            style={{ border: "none", cursor: "pointer", padding: "7px 16px", borderRadius: 7, fontSize: "0.8rem", fontWeight: 600, fontFamily: "'Inter', sans-serif", background: mode === t.key ? "#fff" : "transparent", color: mode === t.key ? C.navy : C.muted, boxShadow: mode === t.key ? "0 1px 3px rgba(12,35,64,0.1)" : "none" }}>
            {t.label}
          </button>
        ))}
      </div>

      {mode === "recommended" && !matched && projects?.length > 0 && (
        <InfoBanner tone="navy">
          Set your preferred tech, industry, and universities on your company profile to unlock personalized matches — showing all approved projects for now.
        </InfoBanner>
      )}

      {mode === "browse" && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
          <select value={filters.project_type} onChange={(e) => setFilters((f) => ({ ...f, project_type: e.target.value }))} style={filterInputStyle}>
            <option value="">Type: any</option>
            <option value="FYP">FYP</option>
            <option value="Academic">Academic</option>
          </select>
          <input placeholder="Tech tags (comma separated)" value={filters.tech_tags} onChange={(e) => setFilters((f) => ({ ...f, tech_tags: e.target.value }))} style={{ ...filterInputStyle, minWidth: 200 }} />
          <input placeholder="University" value={filters.university} onChange={(e) => setFilters((f) => ({ ...f, university: e.target.value }))} style={filterInputStyle} />
        </div>
      )}

      <ErrorBanner message={error} onRetry={load} />

      {!projects && !error && <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Spinner size={26} /></div>}

      {projects && projects.length === 0 && (
        <EmptyState icon="🎓" title="No projects found" desc="Try adjusting your filters, or check back as more get approved." />
      )}

      {projects && projects.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {projects.map((p) => <ProjectCard key={p.project_id} project={p} renderAction={renderAction} showScore={mode === "recommended" && matched} />)}
        </div>
      )}
    </div>
  );
}

const filterInputStyle = { border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: "0.83rem", fontFamily: "'Inter', sans-serif", color: C.navy, background: "#fff", minWidth: 140 };

function ProjectCard({ project, renderAction, showScore }) {
  const tech = (project.tech_tags || "").split(",").map((s) => s.trim()).filter(Boolean);
  return (
    <Card>
      {project.poster && (
        <img src={project.poster} alt="" style={{ width: "100%", height: 130, borderRadius: 10, objectFit: "cover", border: `1px solid ${C.border}`, marginBottom: 12 }} />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "0.92rem", color: C.navy }}>{project.title}</div>
        {showScore && project.match_score > 0 && <span style={{ fontSize: "0.66rem", fontWeight: 700, color: C.gold, whiteSpace: "nowrap" }}>★ Strong match</span>}
      </div>
      <div style={{ fontSize: "0.76rem", color: C.muted, marginBottom: 10 }}>{project.university} · {project.project_type} · {project.project_status}</div>

      <p style={{ fontSize: "0.8rem", color: C.muted, lineHeight: 1.55, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {project.short_description}
      </p>

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
        {tech.slice(0, 4).map((t) => <Tag key={t}>{t}</Tag>)}
        {project.looking_for && <Tag>Wants: {project.looking_for}</Tag>}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {renderAction ? renderAction(project) : (
          <span style={{ fontSize: "0.76rem", color: C.muted }}>👁 {project.view_count ?? 0} views</span>
        )}
      </div>
    </Card>
  );
}
