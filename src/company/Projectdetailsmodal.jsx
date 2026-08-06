import { useEffect, useState } from "react";
import { C } from "../assets/tokens.js";
import { Modal, Spinner, ErrorBanner, Tag } from "../shared/UI.jsx";
import { getProjectFull } from "../services/projectsApi.js";

/**
 * Usage:
 *   const [openProjectId, setOpenProjectId] = useState(null);
 *   ...
 *   <button onClick={() => setOpenProjectId(req.project_id)}>View Details</button>
 *   {openProjectId && (
 *     <ProjectDetailsModal projectId={openProjectId} onClose={() => setOpenProjectId(null)} />
 *   )}
 */
export default function ProjectDetailsModal({ projectId, onClose }) {
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    getProjectFull(projectId)
      .then((p) => { if (alive) setProject(p); })
      .catch((err) => { if (alive) setError(err.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [projectId]);

  const tech = (project?.tech_tags || "").split(",").map((s) => s.trim()).filter(Boolean);
  const industry = (project?.industry_tags || "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <Modal onClose={onClose} width={640}>
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <Spinner size={26} />
        </div>
      )}

      {!loading && error && <ErrorBanner message={error} />}

      {!loading && !error && project && (
        <div>
          {project.poster && (
            <img
              src={project.poster}
              alt=""
              style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 16 }}
            />
          )}

          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.15rem", fontWeight: 800, color: C.navy, margin: "0 0 6px" }}>
            {project.title}
          </h2>
          <div style={{ fontSize: "0.8rem", color: C.muted, marginBottom: 14 }}>
            {project.university} · {project.degree_program} · {project.project_type}
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {tech.map((t) => <Tag key={t}>{t}</Tag>)}
            {industry.map((t) => <Tag key={t}>{t}</Tag>)}
          </div>

          {project.detailed_description && (
            <Section title="Description">{project.detailed_description}</Section>
          )}
          {project.problem_statement && (
            <Section title="Problem Statement">{project.problem_statement}</Section>
          )}
          {project.proposed_solution && (
            <Section title="Proposed Solution">{project.proposed_solution}</Section>
          )}
          {project.tech_stack_details && (
            <Section title="Tech Stack">{project.tech_stack_details}</Section>
          )}

          <div style={{ display: "flex", gap: 14, marginTop: 16, flexWrap: "wrap" }}>
            {project.github_link && (
              <a href={project.github_link} target="_blank" rel="noreferrer" style={linkStyle}>GitHub →</a>
            )}
            {project.demo_link && (
              <a href={project.demo_link} target="_blank" rel="noreferrer" style={linkStyle}>Live Demo →</a>
            )}
            {project.document && (
              <a href={project.document} target="_blank" rel="noreferrer" style={linkStyle}>Document →</a>
            )}
            {project.video && (
              <a href={project.video} target="_blank" rel="noreferrer" style={linkStyle}>Video →</a>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
        {title}
      </div>
      <p style={{ fontSize: "0.84rem", color: C.muted, lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>
        {children}
      </p>
    </div>
  );
}

const linkStyle = { fontSize: "0.8rem", fontWeight: 700, color: C.gold, textDecoration: "none" };