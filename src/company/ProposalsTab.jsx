import { useEffect, useState, useCallback } from "react";
import { Inbox } from "lucide-react";
import { C } from "../assets/tokens.js";
import { getReceivedProposals, respondToProposal } from "../services/proposalsApi.js";
import {
  Spinner, StatusPill, Tag, EmptyState, ErrorBanner, InfoBanner, Card, Btn, Modal, Toast, timeAgo,
} from "../proposals/ProposalUI.jsx";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "New" },
  { key: "INTERESTED", label: "Interested" },
  { key: "NOT_INTERESTED", label: "Declined" },
];

/**
 * Mount inside the company dashboard, e.g. as a tab next to
 * Browseprojectstab.jsx / AccessRequestPanel.jsx:
 *
 *   <ProposalsTab onOpenChat={(chatRoomId) => ...} />
 */
export default function ProposalsTab({ onOpenChat }) {
  const [proposals, setProposals] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [respondTarget, setRespondTarget] = useState(null);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getReceivedProposals();
      setProposals(data.proposals || []);
    } catch (err) {
      setError("Couldn't load received proposals.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const pendingCount = proposals?.filter((p) => p.status === "PENDING").length || 0;
  const filtered = proposals?.filter((p) => filter === "ALL" || p.status === filter) || [];

  const handleResponded = (proposalId, updatedProposal, chatRoomId) => {
  setProposals((prev) => prev.map((p) =>
    p.proposal_id === proposalId
      ? { ...p, ...updatedProposal, ...(chatRoomId && { chat_room_id: chatRoomId }) }
      : p
  ));
  setRespondTarget(null);
  setToast(chatRoomId ? "You expressed interest — a chat room is now open." : "Response recorded.");
};

  return (
    <div style={{ padding: "24px 32px", width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.35rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.02em" }}>
          Proposals
        </h2>
        {pendingCount > 0 && (
          <span style={{ background: C.gold, color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: 100 }}>
            {pendingCount} new
          </span>
        )}
      </div>
      <p style={{ fontSize: "0.85rem", color: C.muted, marginBottom: 20 }}>Student teams pitching your company directly.</p>

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
          icon={<Inbox size={34} />}
          title={filter === "ALL" ? "No proposals yet" : "Nothing here"}
          desc={filter === "ALL" ? "When a student team pitches your company, it'll show up here." : "Try a different filter."}
        />
      )}

      {filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((p) => (
            <ReceivedProposalCard
              key={p.proposal_id}
              proposal={p}
              onRespond={() => setRespondTarget(p)}
              onOpenChat={onOpenChat}
            />
          ))}
        </div>
      )}

      {respondTarget && (
        <RespondModal
          proposal={respondTarget}
          onClose={() => setRespondTarget(null)}
          onResponded={handleResponded}
        />
      )}

      <Toast message={toast} tone="success" />
    </div>
  );
}

function ReceivedProposalCard({ proposal, onRespond, onOpenChat }) {
  const project = proposal.project;
  const lead = proposal.lead;
  const isNew = proposal.status === "PENDING";
  return (
    <Card style={isNew ? { borderColor: C.gold } : {}}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {project?.poster && (
          <img src={project.poster} alt="" style={{ width: 84, height: 84, borderRadius: 10, objectFit: "cover", border: `1px solid ${C.border}`, flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "0.98rem", color: C.navy, marginBottom: 3 }}>{project?.title}</div>
              <div style={{ fontSize: "0.78rem", color: C.muted }}>
                {project?.university} · {project?.project_type} · {project?.project_status}
              </div>
              {lead && (
                <div style={{ fontSize: "0.78rem", color: C.muted, marginTop: 2 }}>
                  Lead: <strong style={{ color: C.navy }}>{lead.full_name}</strong> · {lead.degree_program}
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {isNew && <StatusPill status="NEW" label="New" />}
              <StatusPill status={proposal.status} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0" }}>
            {(project?.tech_tags || "").split(",").map((t) => t.trim()).filter(Boolean).map((t) => <Tag key={t}>{t}</Tag>)}
          </div>

          <div style={{ fontSize: "0.83rem", color: C.navy, marginBottom: 6 }}>
            <strong>Collaboration wanted:</strong> {proposal.collaboration_type}
          </div>
          <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: "0.84rem", color: C.navy, lineHeight: 1.6 }}>
            "{proposal.message}"
          </div>

          {proposal.company_note && (
            <div style={{ marginTop: 10, fontSize: "0.8rem", color: C.muted }}>
              Your note: <em>"{proposal.company_note}"</em>
            </div>
          )}

          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            {proposal.status === "PENDING" && (
              <>
                <Btn size="sm" variant="outline" onClick={onRespond}>Not Interested</Btn>
                <Btn size="sm" variant="primary" onClick={onRespond}>Mark Interested</Btn>
              </>
            )}
            {proposal.status === "INTERESTED" && proposal.chat_room_id && (
              <button
                onClick={() => onOpenChat ? onOpenChat(proposal.chat_room_id) : (window.location.href = `/chat/${proposal.chat_room_id}`)}
                style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
              >
                Go to Chat →
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function RespondModal({ proposal, onClose, onResponded }) {
  const [action, setAction] = useState(null); // "INTERESTED" | "NOT_INTERESTED"
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (chosenAction) => {
    setAction(chosenAction);
    setLoading(true);
    setError("");
    try {
      const data = await respondToProposal(proposal.proposal_id, { action: chosenAction, note: note.trim() || undefined });
      onResponded(proposal.proposal_id, data.proposal, data.chat_room_id);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 400) setError(msg || "You have already responded to this proposal.");
      else setError(msg || "Something went wrong. Please try again.");
      setLoading(false);
      setAction(null);
    }
  };

  return (
    <Modal onClose={loading ? () => {} : onClose}>
      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: C.navy, marginBottom: 6 }}>
        Respond to "{proposal.project?.title}"
      </h3>
      <p style={{ fontSize: "0.83rem", color: C.muted, marginBottom: 18, lineHeight: 1.6 }}>
        This can't be undone — pick carefully. If you decline, the team can still revise and re-pitch later.
      </p>

      {error && (
        <div style={{ background: "#FBE9E7", border: "1px solid #f3c6c1", color: "#B3261E", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", marginBottom: 16 }}>
          {error}
        </div>
      )}

      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: C.navy, marginBottom: 6 }}>
        Note to the team <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. This aligns well with our current focus. Let's connect."
        rows={4}
        style={{
          width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 12,
          fontSize: "0.87rem", fontFamily: "'Inter', sans-serif", color: C.navy, resize: "vertical",
          outline: "none", marginBottom: 22,
        }}
        onFocus={(e) => (e.target.style.borderColor = C.gold)}
        onBlur={(e) => (e.target.style.borderColor = C.border)}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose} disabled={loading}>Cancel</Btn>
        <Btn variant="danger" onClick={() => submit("NOT_INTERESTED")} loading={loading && action === "NOT_INTERESTED"} disabled={loading && action !== "NOT_INTERESTED"}>
          Not Interested
        </Btn>
        <Btn variant="primary" onClick={() => submit("INTERESTED")} loading={loading && action === "INTERESTED"} disabled={loading && action !== "INTERESTED"}>
          Mark Interested
        </Btn>
      </div>
    </Modal>
  );
}