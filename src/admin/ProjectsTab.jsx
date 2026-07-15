import { useEffect, useState } from "react";
import { C } from "../assets/tokens.js";
import { getPendingProjects, approveProject, rejectProject } from "../services/adminApi.js";
import {
  PageHeader, ErrorBanner, EmptyState, Spinner, Card, Tag, Btn,
  ConfirmModal, ReasonModal, timeAgo,
} from "./AdminShared.jsx";

export default function ProjectsTab({ onChanged }) {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = async () => {
    setError("");
    try {
      const data = await getPendingProjects();
      setProjects(data.projects || []);
    } catch (err) {
      setError("Couldn't load pending projects.");
    }
  };

  useEffect(() => { load(); }, []);

  const closeModal = () => { setModal(null); setActionError(""); };

  const handleApprove = async () => {
    setBusy(true); setActionError("");
    try {
      await approveProject(modal.project.project_id);
      closeModal();
      load();
      onChanged?.();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Approval failed. Try again.");
    } finally { setBusy(false); }
  };

  const handleReject = async (reason) => {
    setBusy(true); setActionError("");
    try {
      await rejectProject(modal.project.project_id, reason);
      closeModal();
      load();
      onChanged?.();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Rejection failed. Try again.");
    } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader
        title="Academic Projects"
        subtitle="FYP submissions are auto-approved — only academic projects need a manual review. Check the GitHub or demo link before approving."
        badge={projects?.length}
      />
      <ErrorBanner message={error} onRetry={load} />

      {!projects && !error && (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Spinner size={28} /></div>
      )}

      {projects && projects.length === 0 && (
        <EmptyState icon="🎓" title="No projects waiting" desc="New academic project submissions will show up here for review." />
      )}

      {projects && projects.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {projects.map((p) => (
            <ProjectCard key={p.project_id} project={p} onAction={(type) => setModal({ type, project: p })} />
          ))}
        </div>
      )}

      {modal?.type === "approve" && (
        <ConfirmModal
          title={`Approve "${modal.project.title}"?`}
          desc="The project becomes publicly visible and the lead student receives an email."
          confirmLabel="Approve"
          variant="primary"
          loading={busy}
          onConfirm={handleApprove}
          onClose={closeModal}
        />
      )}
      {modal?.type === "reject" && (
        <ReasonModal
          title={`Reject "${modal.project.title}"`}
          desc="Shown to the student in their rejection email and dashboard. If they update the project, it re-enters this queue."
          placeholder="e.g. No working demo or GitHub link provided. Please add a functional demo before resubmitting."
          confirmLabel="Reject"
          loading={busy}
          onConfirm={handleReject}
          onClose={closeModal}
        />
      )}
      {actionError && modal && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#B3261E", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: "0.82rem", zIndex: 1100 }}>
          {actionError}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const tech = (project.tech_tags || "").split(",").map((s) => s.trim()).filter(Boolean);
  const industry = (project.industry_tags || "").split(",").map((s) => s.trim()).filter(Boolean);
  const lead = project.students;

  return (
    <Card>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {project.poster && (
          <img src={project.poster} alt="" style={{ width: 96, height: 96, borderRadius: 10, objectFit: "cover", border: `1px solid ${C.border}`, flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "1rem", color: C.navy, marginBottom: 3 }}>{project.title}</div>
              <div style={{ fontSize: "0.78rem", color: C.muted }}>
                {lead?.full_name ? `${lead.full_name} · ` : ""}{project.university} · {project.degree_program} · {timeAgo(project.created_at)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <Btn size="sm" variant="danger" onClick={() => onAction("reject")}>Reject</Btn>
              <Btn size="sm" variant="primary" onClick={() => onAction("approve")}>Approve</Btn>
            </div>
          </div>

          <p style={{ fontSize: "0.85rem", color: C.muted, lineHeight: 1.6, margin: "10px 0" }}>{project.short_description}</p>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {tech.map((t) => <Tag key={t}>{t}</Tag>)}
            {industry.map((t) => <Tag key={t}>{t}</Tag>)}
            {project.project_status && <Tag>{project.project_status}</Tag>}
            {project.graduation_semester && <Tag>🎓 {project.graduation_semester}</Tag>}
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {project.github_link && (
              <a href={project.github_link} target="_blank" rel="noreferrer" style={{ fontSize: "0.78rem", fontWeight: 700, color: C.navy, textDecoration: "underline" }}>
                GitHub ↗
              </a>
            )}
            {project.demo_link && (
              <a href={project.demo_link} target="_blank" rel="noreferrer" style={{ fontSize: "0.78rem", fontWeight: 700, color: C.gold, textDecoration: "underline" }}>
                Live demo ↗
              </a>
            )}
            <button
              onClick={() => setExpanded((e) => !e)}
              style={{ background: "none", border: "none", color: C.navy, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", marginLeft: "auto" }}
            >
              {expanded ? "Hide details ▲" : "Show full details ▼"}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 14 }}>
          <DetailBlock label="Problem statement" text={project.problem_statement} />
          <DetailBlock label="Proposed solution" text={project.proposed_solution} />
          <DetailBlock label="Detailed description" text={project.detailed_description} />
          {lead && (
            <DetailBlock label="Project lead" text={`${lead.full_name} · ${lead.email} · Semester ${lead.current_semester}`} />
          )}
        </div>
      )}
    </Card>
  );
}

function DetailBlock({ label, text }) {
  if (!text) return null;
  return (
    <div>
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "0.85rem", color: C.navy, lineHeight: 1.65 }}>{text}</div>
    </div>
  );
}
