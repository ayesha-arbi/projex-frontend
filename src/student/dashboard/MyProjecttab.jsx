import { useState, useEffect } from "react";
import {
  CheckCircle, Clock, Tag, Building2, Link2, FileText,
  Cpu, Image, Video, Eye, EyeOff, AlertTriangle, RefreshCw, FolderOpen
} from "lucide-react";
import { C } from "../../assets/tokens";
import { EmptyState } from "../../proposals/ProposalUI.jsx";

const API_BASE = import.meta.env?.VITE_API_URL || "/api";

async function fetchMyProject() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated.");

  let res;
  try {
    res = await fetch(`${API_BASE}/projects/my/project`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("Cannot reach server. Is your backend running?");
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Server returned ${res.status}. Check your backend.`);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load projects.");
  
  const allProjects = [];
  if (data.fyp_project) allProjects.push(data.fyp_project);
  if (Array.isArray(data.academic_projects)) {
    allProjects.push(...data.academic_projects);
  }
  return allProjects;
}

/* ── Small reusable bits ── */
function Badge({ children, color = C.navy, bg }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 5, background: bg || `${color}18`, color, border: `1px solid ${color}28`, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Section({ icon: Icon, title, subtitle, children, accent = C.navy }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, background: C.cream, display: "flex", alignItems: "center", gap: 10, borderLeft: `3px solid ${accent}` }}>
        {Icon && (
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `${accent}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={12} color={accent} strokeWidth={2.2} />
          </div>
        )}
        <div>
          <h3 style={{ fontSize: "0.84rem", fontWeight: 800, color: C.navy, margin: 0, fontFamily: "'Sora',sans-serif" }}>{title}</h3>
          {subtitle && (
            <p style={{ fontSize: "0.72rem", color: C.muted2, margin: "2px 0 0" }}>{subtitle}</p>
          )}
        </div>
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 10, fontSize: "0.84rem" }}>
      <span style={{ color: C.muted2, fontWeight: 600, minWidth: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ color: C.text, lineHeight: 1.6 }}>{value}</span>
    </div>
  );
}

function PrivateField({ label, value }) {
  const [show, setShow] = useState(false);
  if (!value) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ background: "none", border: "none", cursor: "pointer", color: C.muted2, display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontFamily: "'Sora',sans-serif" }}>
          {show ? <><EyeOff size={11} /> Hide</> : <><Eye size={11} /> Show</>}
        </button>
      </div>
      {show
        ? <p style={{ fontSize: "0.84rem", color: C.text, lineHeight: 1.7, margin: 0 }}>{value}</p>
        : <div style={{ background: C.cream, border: `1px dashed ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: C.muted2, fontStyle: "italic" }}>Hidden — click Show to reveal</div>
      }
    </div>
  );
}

function ProjectCard({ project }) {
  const reviewColor = project.review_status === 'APPROVED' ? '#15803d' : project.review_status === 'REJECTED' ? '#dc2626' : '#f59e0b';
  const reviewBg    = project.review_status === 'APPROVED' ? '#dcfce7' : project.review_status === 'REJECTED' ? '#fef2f2' : '#fef3c7';

  // project_status badge color (e.g. "Ongoing" / "Completed" / "Paused")
  const statusColor = project.project_status === 'Completed' ? '#15803d'
    : project.project_status === 'Paused' ? '#dc2626'
    : C.navyMid; // default (e.g. "Ongoing")
  const statusBg = `${statusColor}18`;

  // Comma-separated string fields → arrays
  const techTags     = (project.tech_tags     || "").split(",").map(t => t.trim()).filter(Boolean);
  const industryTags = (project.industry_tags || "").split(",").map(t => t.trim()).filter(Boolean);
  const lookingFor   = (project.looking_for   || "").split(",").map(t => t.trim()).filter(Boolean);

  return (
    <div style={{ marginBottom: 40, borderBottom: `1px solid ${C.border}`, paddingBottom: 30 }}>
      {/* Header card */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 24px", marginBottom: 20, boxShadow: "0 2px 12px rgba(12,35,64,0.06)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: C.navy, margin: "0 0 8px", fontFamily: "'Sora',sans-serif", lineHeight: 1.3 }}>
              {project.title}
            </h2>
            <p style={{ fontSize: "0.88rem", color: C.muted, margin: "0 0 14px", lineHeight: 1.6 }}>
              {project.short_description}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.72rem", fontWeight: 700, color: statusColor, background: statusBg, padding: "3px 10px", borderRadius: 6, border: `1px solid ${statusColor}30` }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
                {project.project_status}
              </span>
              {project.review_status && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.72rem", fontWeight: 700, color: reviewColor, background: reviewBg, padding: "3px 10px", borderRadius: 6, border: `1px solid ${reviewColor}30` }}>
                  Review: {project.review_status}
                </span>
              )}
              {project.project_type && (
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: C.navy, background: `${C.navy}12`, padding: "3px 10px", borderRadius: 6, border: `1px solid ${C.navy}20` }}>
                  {project.project_type}
                </span>
              )}
            </div>
          </div>
          {project.poster && (
            <img src={project.poster} alt="Project poster"
              style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 10, border: `1px solid ${C.border}`, flexShrink: 0 }} />
          )}
        </div>
      </div>

      {/* Tags */}
      {(techTags.length > 0 || industryTags.length > 0) && (
        <Section icon={Tag} title="Tags" accent={C.navyMid}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {techTags.map(t => <Badge key={t} color={C.navyMid}>{t}</Badge>)}
            {industryTags.map(t => <Badge key={t} color={C.goldDark} bg={C.goldPale}>{t}</Badge>)}
            {project.custom_tags && project.custom_tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
              <Badge key={t} color={C.muted} bg={C.cream}>{t}</Badge>
            ))}
          </div>
        </Section>
      )}

      {/* Looking For */}
      {lookingFor.length > 0 && (
        <Section icon={CheckCircle} title="Looking For" accent={C.goldDark}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {lookingFor.map(l => <Badge key={l} color={C.goldDark} bg={C.goldPale}>{l}</Badge>)}
          </div>
        </Section>
      )}

      {/* Private details */}
      <Section icon={FileText} title="Private Details" subtitle="Only visible to you and approved companies" accent={C.navy}>
        <PrivateField label="Detailed Description"  value={project.detailed_description} />
        <PrivateField label="Problem Statement"     value={project.problem_statement} />
        <PrivateField label="Proposed Solution"     value={project.proposed_solution} />
        <PrivateField label="Tech Stack Details"    value={project.tech_stack_details} />
      </Section>

      {/* Links */}
      {(project.github_link || project.demo_link) && (
        <Section icon={Link2} title="Links" accent={C.muted}>
          <InfoRow label="GitHub"    value={project.github_link ? <a href={project.github_link} target="_blank" rel="noreferrer" style={{ color: C.navy, fontWeight: 600 }}>{project.github_link}</a> : null} />
          <InfoRow label="Live Demo" value={project.demo_link   ? <a href={project.demo_link}   target="_blank" rel="noreferrer" style={{ color: C.navy, fontWeight: 600 }}>{project.demo_link}</a>   : null} />
        </Section>
      )}

      {/* Files */}
      {(project.video || project.document) && (
        <Section icon={FileText} title="Uploaded Files" accent={C.muted}>
          {project.video && (
            <InfoRow label="Demo Video" value={<a href={project.video} target="_blank" rel="noreferrer" style={{ color: C.navy, fontWeight: 600 }}>View video ↗</a>} />
          )}
          {project.document && (
            <InfoRow label="Document" value={<a href={project.document} target="_blank" rel="noreferrer" style={{ color: C.navy, fontWeight: 600 }}>View document ↗</a>} />
          )}
        </Section>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════ */
export default function MyProjectTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const ps = await fetchMyProject();
      setProjects(ps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ padding: "48px 32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTopColor: C.navy, borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
          <p style={{ color: C.muted, marginTop: 14, fontSize: "0.88rem" }}>Loading your project…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div style={{ padding: "48px 32px", animation: "fadeUp 0.3s ease both" }}>
        <EmptyState
          icon={<AlertTriangle size={34} />}
          title="Could not load project"
          desc={error}
        />
      </div>
    );
  }

  /* ── No projects ── */
  if (!projects || projects.length === 0) {
    return (
      <div style={{ padding: "48px 32px", animation: "fadeUp 0.3s ease both" }}>
        <EmptyState
          icon={<FolderOpen size={34} />}
          title="No projects yet"
          desc="Go to the Upload tab to post your first project."
        />
      </div>
    );
  }

  const selectedProject = projects.find(p => p.project_id === selectedProjectId);

  if (selectedProject) {
    return (
      <div style={{ padding: "32px 48px 48px", width: "100%", boxSizing: "border-box", animation: "fadeUp 0.3s ease both" }}>
        <button onClick={() => setSelectedProjectId(null)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "transparent", color: C.muted, border: `1.5px solid ${C.border}`, borderRadius: 8, cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, fontFamily: "'Sora',sans-serif", transition: "all 0.18s", marginBottom: 20 }}>
          ← Back to projects
        </button>
        <ProjectCard project={selectedProject} />
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 48px 48px", width: "100%", boxSizing: "border-box", animation: "fadeUp 0.3s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: C.navy, margin: "0 0 5px", fontFamily: "'Sora',sans-serif" }}>My Projects</h2>
          <p style={{ fontSize: "0.82rem", color: C.muted, margin: 0 }}>Select a project to view its details.</p>
        </div>
        <button onClick={load}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "transparent", color: C.muted, border: `1.5px solid ${C.border}`, borderRadius: 8, cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, fontFamily: "'Sora',sans-serif", transition: "all 0.18s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.navy; e.currentTarget.style.color = C.navy; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
        >
          <RefreshCw size={12} /> Refresh Projects
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
        {projects.map((proj, idx) => {
          const statusColor = proj.project_status === 'Completed' ? '#15803d' : proj.project_status === 'Paused' ? '#dc2626' : C.navyMid;
          return (
            <div key={proj.project_id || idx} onClick={() => setSelectedProjectId(proj.project_id)} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", display: "flex", flexDirection: "column" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(12,35,64,0.08)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                {proj.poster ? (
                  <img src={proj.poster} alt="" style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }} />
                ) : (
                  <div style={{ width: 64, height: 48, background: C.cream, borderRadius: 8, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}><FolderOpen size={20} color={C.muted} /></div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: C.navy, margin: "0 0 4px", fontFamily: "'Sora',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{proj.title}</h3>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Badge color={statusColor} bg={`${statusColor}18`}>{proj.project_status}</Badge>
                    <Badge color={C.navyMid}>{proj.project_type}</Badge>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "0.8rem", color: C.muted, margin: "0 0 14px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>{proj.short_description}</p>
              <div style={{ fontSize: "0.72rem", color: C.navy, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>
                View Details →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}