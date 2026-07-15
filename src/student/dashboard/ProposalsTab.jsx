import { useEffect, useState, useCallback } from "react";
import { C } from "../../assets/tokens.js";
import { getMyProposals } from "../../services/proposalsApi.js";
import {
  Spinner, StatusPill, Tag, EmptyState, ErrorBanner, Card, timeAgo,
} from "../../proposals/ProposalUI.jsx";
import SendProposalButton from "./SendProposalButton.jsx";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "INTERESTED", label: "Interested" },
  { key: "NOT_INTERESTED", label: "Declined" },
];

/**
 * Mount inside the student dashboard for a single project, e.g. as a tab
 * next to MyProjecttab.jsx / Teamtab.jsx:
 *
 *   <ProposalsTab project={{ project_id, title, review_status }} onOpenChat={(id) => ...} />
 */
export default function ProposalsTab({ project, onOpenChat }) {
  const [proposals, setProposals] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const load = useCallback(async () => {
    if (!project?.project_id) return;
    setError("");
    try {
      const data = await getMyProposals(project.project_id);
      setProposals(data.proposals || []);
    } catch (err) {
      setError("Couldn't load your proposals.");
    }
  }, [project?.project_id]);

  useEffect(() => { load(); }, [load]);

  if (!project?.project_id) {
    return <EmptyState icon="🎯" title="Select a project" desc="Choose one of your projects to see the proposals you've sent from it." />;
  }

  const filtered = proposals?.filter((p) => filter === "ALL" || p.status === filter) || [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.35rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.02em" }}>
          Proposals — {project.title}
        </h2>
        <p style={{ fontSize: "0.85rem", color: C.muted, marginTop: 4 }}>Companies you've pitched for this project.</p>
      </div>

      <div style={{ display: "flex", gap: 6, background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, marginBottom: 20, width: "fit-content" }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              border: "none", cursor: "pointer", padding: "7px 14px", borderRadius: 7,
              fontSize: "0.8rem", fontWeight: 600, fontFamily: "'Inter', sans-serif",
              background: filter === f.key ? "#fff" : "transparent",
              color: filter === f.key ? C.navy : C.muted,
              boxShadow: filter === f.key ? "0 1px 3px rgba(12,35,64,0.1)" : "none",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {!proposals && !error && (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Spinner size={26} /></div>
      )}

      {proposals && filtered.length === 0 && (
        <EmptyState
          icon="🤝"
          title={filter === "ALL" ? "No proposals sent yet" : "Nothing here"}
          desc={filter === "ALL" ? "Once your project is approved, pitch companies straight from their profile." : "Try a different filter."}
        />
      )}

      {filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((p) => (
            <ProposalCard key={p.proposal_id} proposal={p} project={project} onOpenChat={onOpenChat} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProposalCard({ proposal, project, onOpenChat, onChanged }) {
  const c = proposal.company;
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 14 }}>
          {c?.logo ? (
            <img src={c.logo} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: `1px solid ${C.border}` }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 10, background: C.cream, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>🏢</div>
          )}
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: C.navy }}>{c?.company_name}</div>
            <div style={{ fontSize: "0.76rem", color: C.muted }}>{[c?.industry, c?.city].filter(Boolean).join(" · ")}</div>
          </div>
        </div>
        <StatusPill status={proposal.status} />
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "12px 0" }}>
        <Tag>{proposal.collaboration_type}</Tag>
        <Tag>Sent {timeAgo(proposal.created_at)}</Tag>
      </div>

      <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: "0.84rem", color: C.navy, lineHeight: 1.6, marginBottom: proposal.company_note ? 10 : 0 }}>
        <span style={{ color: C.muted }}>Your message: </span>"{proposal.message}"
      </div>

      {proposal.company_note && (
        <div style={{ background: proposal.status === "INTERESTED" ? "#EAF3DE" : "#FBE9E7", border: `1px solid ${proposal.status === "INTERESTED" ? "#cfe3ba" : "#f3c6c1"}`, borderRadius: 10, padding: "10px 14px", fontSize: "0.84rem", color: proposal.status === "INTERESTED" ? "#3B6D11" : "#B3261E", lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700 }}>{c?.company_name} says: </span>"{proposal.company_note}"
        </div>
      )}

      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
        {proposal.status === "PENDING" && (
          <span style={{ fontSize: "0.78rem", color: C.muted, fontStyle: "italic" }}>Awaiting response…</span>
        )}
        {proposal.status === "INTERESTED" && (
          <button
            onClick={() => onOpenChat ? onOpenChat(proposal) : (window.location.href = `/chat/${proposal.proposal_id}`)}
            style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
          >
            Open Chat →
          </button>
        )}
        {proposal.status === "NOT_INTERESTED" && (
          <SendProposalButton
            project={project}
            company={{ company_id: proposal.company_id, company_name: c?.company_name, logo: c?.logo }}
            existingProposal={proposal}
            onSent={onChanged}
          />
        )}
      </div>
    </Card>
  );
}
