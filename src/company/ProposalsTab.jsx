import { useEffect, useState, useCallback } from "react";
import { Handshake, Building2 } from "lucide-react";
import { C } from "../assets/tokens.js";
import { getReceivedProposals, respondToProposal } from "../services/proposalsApi.js";
import {
  Spinner, StatusPill, Tag, EmptyState, ErrorBanner, Card, timeAgo,
} from "../proposals/ProposalUI.jsx";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "INTERESTED", label: "Interested" },
  { key: "NOT_INTERESTED", label: "Declined" },
];

/**
 * Mount inside the company dashboard's "Proposals" tab:
 *
 *   <ProposalsTab onOpenChat={(roomId) => ...} />
 */
export default function ProposalsTab({ onOpenChat }) {
  const [proposals, setProposals] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const load = useCallback(async () => {
    setError("");
    setProposals(null);
    try {
      const data = await getReceivedProposals();
      setProposals(data.proposals || []);
    } catch (err) {
      setError("Couldn't load proposals.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = proposals?.filter((p) => filter === "ALL" || p.status === filter) || [];

  return (
    <div style={{ padding: "32px 48px 48px", width: "100%", boxSizing: "border-box", animation: "fadeUp 0.3s ease both" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.35rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.02em" }}>
          Proposals
        </h2>
        <p style={{ fontSize: "0.85rem", color: C.muted, marginTop: 4 }}>
          Student teams that have pitched a collaboration to you.
        </p>
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
          icon={<Handshake size={34} />}
          title={filter === "ALL" ? "No proposals yet" : "Nothing here"}
          desc={filter === "ALL" ? "When a student team pitches you, it'll show up here." : "Try a different filter."}
        />
      )}

      {filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((p) => (
            <ProposalCard key={p.proposal_id} proposal={p} onOpenChat={onOpenChat} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProposalCard({ proposal, onOpenChat, onChanged }) {
  const project = proposal.project;
  const lead = proposal.lead;
  const [showNoteFor, setShowNoteFor] = useState(null); // "INTERESTED" | "NOT_INTERESTED" | null
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function respond(action) {
    setBusy(true); setErr("");
    try {
      await respondToProposal(proposal.proposal_id, { action, note: note.trim() || undefined });
      setShowNoteFor(null);
      setNote("");
      onChanged();
    } catch (e) {
      setErr(e?.response?.data?.message || "Couldn't submit your response.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 14 }}>
          {project?.poster ? (
            <img src={project.poster} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: `1px solid ${C.border}` }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 10, background: C.cream, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>🎓</div>
          )}
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: C.navy }}>{project?.title}</div>
            <div style={{ fontSize: "0.76rem", color: C.muted }}>{[project?.university, lead?.full_name].filter(Boolean).join(" · ")}</div>
          </div>
        </div>
        <StatusPill status={proposal.status} />
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "12px 0" }}>
        <Tag>{proposal.collaboration_type}</Tag>
        <Tag>Sent {timeAgo(proposal.created_at)}</Tag>
      </div>

      <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: "0.84rem", color: C.navy, lineHeight: 1.6, marginBottom: proposal.company_note ? 10 : 0 }}>
        <span style={{ color: C.muted }}>Their message: </span>"{proposal.message}"
      </div>

      {proposal.company_note && (
        <div style={{ fontSize: "0.82rem", color: C.muted, fontStyle: "italic", marginTop: 6 }}>
          Your note: "{proposal.company_note}"
        </div>
      )}

      {err && <div style={{ fontSize: "0.78rem", color: "#B3261E", marginTop: 10 }}>{err}</div>}

      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        {proposal.status === "PENDING" && !showNoteFor && (
          <>
            <button onClick={() => setShowNoteFor("NOT_INTERESTED")} disabled={busy}
              style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
              Not a fit
            </button>
            <button onClick={() => setShowNoteFor("INTERESTED")} disabled={busy}
              style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
              I'm interested
            </button>
          </>
        )}

        {showNoteFor && (
          <div style={{ width: "100%" }}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={showNoteFor === "INTERESTED" ? "Optional note to the team…" : "Optional reason (helps the team improve)…"}
              rows={2}
              style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 8, padding: 10, fontSize: "0.82rem", fontFamily: "'Inter', sans-serif", resize: "vertical", outline: "none", marginBottom: 8, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => { setShowNoteFor(null); setNote(""); }} disabled={busy}
                style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={() => respond(showNoteFor)} disabled={busy}
                style={{ background: showNoteFor === "INTERESTED" ? C.navy : "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: "0.8rem", fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1 }}>
                {busy ? "Sending…" : showNoteFor === "INTERESTED" ? "Confirm interest" : "Confirm decline"}
              </button>
            </div>
          </div>
        )}

        {proposal.status === "INTERESTED" && (
          <button
            onClick={() => onOpenChat ? onOpenChat(proposal.chat_room_id) : null}
            style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
          >
            Open Chat →
          </button>
        )}
      </div>
    </Card>
  );
}