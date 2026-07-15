import { useState } from "react";
import { C } from "../../assets/tokens.js";
import { sendProposal } from "../../services/proposalsApi.js";
import { Btn, Modal, COLLAB_TYPES } from "../../proposals/ProposalUI.jsx";

/**
 * Drop this on any company card/profile the lead is viewing:
 *
 *   <SendProposalButton
 *     project={{ project_id, title, review_status }}
 *     company={{ company_id, company_name, logo }}
 *     existingProposal={proposal}   // optional — pass the NOT_INTERESTED
 *                                    // proposal to pre-fill a revise-&-resend
 *     onSent={(proposal) => ...}    // optional — refresh a list, close a panel, etc.
 *   />
 *
 * Handles the "project must be APPROVED" gate from the guide by disabling
 * itself with an explanatory message instead of letting the API return 403.
 */
export default function SendProposalButton({ project, company, existingProposal, onSent }) {
  const [open, setOpen] = useState(false);

  const isRevise = existingProposal?.status === "NOT_INTERESTED";
  const notApproved = project?.review_status && project.review_status !== "APPROVED";

  if (notApproved) {
    return (
      <div>
        <Btn variant="outline" disabled size="sm">Pitch this company</Btn>
        <p style={{ fontSize: "0.74rem", color: C.muted, marginTop: 6, maxWidth: 260, lineHeight: 1.5 }}>
          {project.review_status === "PENDING"
            ? "Your project is under review. You can send proposals once it's approved."
            : "Your project was not approved. Update your project details and resubmit for review."}
        </p>
      </div>
    );
  }

  return (
    <>
      <Btn variant={isRevise ? "outline" : "gold"} size="sm" onClick={() => setOpen(true)}>
        {isRevise ? "Revise & Re-send" : "🤝 Pitch this company"}
      </Btn>
      {open && (
        <SendProposalModal
          project={project}
          company={company}
          existingProposal={existingProposal}
          onClose={() => setOpen(false)}
          onSent={(p) => { setOpen(false); onSent?.(p); }}
        />
      )}
    </>
  );
}

function SendProposalModal({ project, company, existingProposal, onClose, onSent }) {
  const isRevise = existingProposal?.status === "NOT_INTERESTED";
  const [collabType, setCollabType] = useState(existingProposal?.collaboration_type || COLLAB_TYPES[0]);
  const [message, setMessage] = useState(existingProposal?.message || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!message.trim()) {
      setError("Write a short message before sending.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await sendProposal({
        project_id: project.project_id,
        company_id: company.company_id,
        collaboration_type: collabType,
        message: message.trim(),
      });
      onSent?.(data.proposal);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 409) setError(msg || "A proposal is already waiting for a response from this company.");
      else if (status === 400) setError(msg || "Please select a valid collaboration type.");
      else if (status === 403) setError(msg || "Only the project lead can send proposals.");
      else setError(msg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={loading ? () => {} : onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        {company.logo ? (
          <img src={company.logo} alt="" style={{ width: 42, height: 42, borderRadius: 10, objectFit: "cover", border: `1px solid ${C.border}` }} />
        ) : (
          <div style={{ width: 42, height: 42, borderRadius: 10, background: C.cream, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🏢</div>
        )}
        <div>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: C.navy }}>
            {isRevise ? `Revise your pitch to ${company.company_name}` : `Pitch ${company.company_name}`}
          </h3>
          <p style={{ fontSize: "0.78rem", color: C.muted, marginTop: 2 }}>For "{project.title}"</p>
        </div>
      </div>

      {isRevise && (
        <div style={{ background: C.goldPale, border: `1px solid ${C.gold}44`, color: "#7A5C25", borderRadius: 10, padding: "10px 14px", fontSize: "0.8rem", marginBottom: 18, lineHeight: 1.55 }}>
          This company previously declined. Sending a revised proposal will put it back in front of them.
        </div>
      )}

      {error && (
        <div style={{ background: "#FBE9E7", border: "1px solid #f3c6c1", color: "#B3261E", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", marginBottom: 16 }}>
          {error}
        </div>
      )}

      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: C.navy, marginBottom: 6 }}>Collaboration type</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {COLLAB_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setCollabType(t)}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 9, cursor: "pointer", fontSize: "0.82rem", fontWeight: 700,
              fontFamily: "'Inter', sans-serif", border: `1.5px solid ${collabType === t ? C.navy : C.border}`,
              background: collabType === t ? C.navy : "#fff", color: collabType === t ? "#fff" : C.navy,
              transition: "all 0.15s ease",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: C.navy, marginBottom: 6 }}>Your message</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Explain why this company is a good fit and what you're hoping for from the collaboration..."
        rows={5}
        autoFocus
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
        <Btn variant="gold" onClick={submit} loading={loading}>
          {isRevise ? "Send revised proposal" : "Send proposal"}
        </Btn>
      </div>
    </Modal>
  );
}
