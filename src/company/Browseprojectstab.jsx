import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, AlertTriangle, GraduationCap, MapPin, Tag, ExternalLink } from "lucide-react";
import { C } from "../assets/tokens";
import RequestAccessButton from "./RequestAccessButton";

const API_BASE = import.meta.env?.VITE_API_URL || "/api";

async function apiGet(path) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed.");
  return data;
}

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

export default function BrowseProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");

  const loadProjects = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiGet("/projects");
      const list = data.projects || data || [];
      setProjects(list);
      setFiltered(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  useEffect(() => {
    const q = search.toLowerCase();
    if (!q) { setFiltered(projects); return; }
    setFiltered(
      projects.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.university?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    );
  }, [search, projects]);

  if (loading) {
    return (
      <div style={{ padding: "48px 32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ width: 32, height: 32, border: `3px solid ${C.border2}`, borderTopColor: C.blue, borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
          <p style={{ color: C.muted, marginTop: 14, fontSize: "0.88rem" }}>Loading projects…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "32px" }}>
        <div style={{ background: C.errorPale, border: "1px solid #fecaca", borderRadius: 12, padding: "20px 24px", display: "flex", gap: 14, alignItems: "flex-start", maxWidth: 520 }}>
          <AlertTriangle size={18} color={C.error} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: "0.88rem", fontWeight: 700, color: C.error, margin: "0 0 4px" }}>Could not load projects</p>
            <p style={{ fontSize: "0.82rem", color: "#b91c1c", margin: "0 0 14px", lineHeight: 1.6 }}>{error}</p>
            <button onClick={loadProjects} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: C.error, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              <RefreshCw size={12} /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 960, boxSizing: "border-box", animation: "fadeUp 0.22s ease both" }}>

      {/* Header */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 24px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", boxShadow: "0 2px 12px rgba(3,62,102,0.06)" }}>
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: C.ink, margin: "0 0 4px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Browse Student Projects</h2>
          <p style={{ fontSize: "0.78rem", color: C.muted, margin: 0 }}>Discover final-year projects from Pakistan's top universities</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bluePale, border: `1px solid ${C.border2}`, borderRadius: 9, padding: "6px 12px" }}>
          <GraduationCap size={13} color={C.blue} />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: C.blue }}>{projects.length} projects</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={14} color={C.muted} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, university, or category…"
          style={{ width: "100%", padding: "10px 14px 10px 38px", border: `1.5px solid ${C.border2}`, borderRadius: 9, fontSize: "0.84rem", fontFamily: "'Plus Jakarta Sans',sans-serif", color: C.ink, outline: "none", background: C.white, boxSizing: "border-box" }}
          onFocus={(e) => (e.target.style.borderColor = C.blue)}
          onBlur={(e) => (e.target.style.borderColor = C.border2)}
        />
      </div>

      {/* Project grid */}
      <Section icon={Search} title="Projects" accent={C.blue} badge={`${filtered.length} found`}>
        {filtered.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "0.84rem", fontWeight: 600, color: C.ink, margin: "0 0 4px" }}>No projects found</p>
            <p style={{ fontSize: "0.76rem", color: C.muted, margin: 0 }}>Try a different search term</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 0 }}>
            {filtered.map((project, i) => (
              <ProjectCard key={project.project_id || i} project={project} />
            ))}
          </div>
        )}
      </Section>

      <button
        onClick={loadProjects}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "transparent", color: C.muted, border: `1.5px solid ${C.border2}`, borderRadius: 8, cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all 0.18s", marginTop: 4 }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.muted; }}
      >
        <RefreshCw size={12} /> Refresh
      </button>
    </div>
  );
}

function ProjectCard({ project }) {
  const [reqStatus, setReqStatus] = useState(project.myRequestStatus || "NONE");

  return (
    <div
      style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, transition: "background 0.12s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.off)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Poster */}
      {project.poster && (
        <div style={{ width: "100%", height: 120, borderRadius: 8, overflow: "hidden", marginBottom: 12, background: C.bluePale }}>
          <img
            src={`${import.meta.env.VITE_API_URL?.replace("/api", "")}/${project.poster}`}
            alt={project.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.parentElement.style.display = "none"; }}
          />
        </div>
      )}

      {/* Title */}
      <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: C.ink, margin: "0 0 6px", lineHeight: 1.4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        {project.title || "Untitled Project"}
      </h3>

      {/* Meta */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        {project.university && (
          <span style={{ fontSize: "0.7rem", color: C.muted, display: "flex", alignItems: "center", gap: 3 }}>
            <GraduationCap size={10} /> {project.university}
          </span>
        )}
        {project.city && (
          <span style={{ fontSize: "0.7rem", color: C.muted, display: "flex", alignItems: "center", gap: 3 }}>
            <MapPin size={10} /> {project.city}
          </span>
        )}
        {project.category && (
          <span style={{ fontSize: "0.7rem", color: C.muted, display: "flex", alignItems: "center", gap: 3 }}>
            <Tag size={10} /> {project.category}
          </span>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p style={{ fontSize: "0.78rem", color: C.muted, lineHeight: 1.6, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {project.description}
        </p>
      )}

      {/* Status chip */}
      {project.project_status && (
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: C.bluePale, color: C.blue, border: `1px solid ${C.border2}` }}>
            {project.project_status}
          </span>
        </div>
      )}

      {/* Action */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <RequestAccessButton
          projectId={project.project_id}
          initialStatus={reqStatus}
          onSuccess={setReqStatus}
        />
        {reqStatus === "APPROVED" && (
          <a
            href={`/projects/${project.project_id}/full`}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: C.muted, textDecoration: "none" }}
          >
            <ExternalLink size={11} /> Full details
          </a>
        )}
      </div>
    </div>
  );
}