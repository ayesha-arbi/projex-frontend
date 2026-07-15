import { useEffect, useState } from "react";
import { C } from "../assets/tokens.js";
import {
  getPendingCompanies, approveCompany, rejectCompany, suspendCompany,
} from "../services/adminApi.js";
import {
  PageHeader, ErrorBanner, EmptyState, Spinner, Card, Tag, Btn,
  ConfirmModal, ReasonModal, timeAgo,
} from "./AdminShared.jsx";

export default function CompaniesTab({ onChanged }) {
  const [companies, setCompanies] = useState(null);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // { type: 'approve'|'reject'|'suspend', company }
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = async () => {
    setError("");
    try {
      const data = await getPendingCompanies();
      setCompanies(data.companies || []);
    } catch (err) {
      setError("Couldn't load pending companies.");
    }
  };

  useEffect(() => { load(); }, []);

  const closeModal = () => { setModal(null); setActionError(""); };

  const handleApprove = async () => {
    setBusy(true); setActionError("");
    try {
      await approveCompany(modal.company.company_id);
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
      await rejectCompany(modal.company.company_id, reason);
      closeModal();
      load();
      onChanged?.();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Rejection failed. Try again.");
    } finally { setBusy(false); }
  };

  const handleSuspend = async (reason) => {
    setBusy(true); setActionError("");
    try {
      await suspendCompany(modal.company.company_id, reason);
      closeModal();
      load();
      onChanged?.();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Suspension failed. Try again.");
    } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="Verify a company's identity before they can scout student projects. Oldest applications first."
        badge={companies?.length}
      />
      <ErrorBanner message={error} onRetry={load} />

      {!companies && !error && (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Spinner size={28} /></div>
      )}

      {companies && companies.length === 0 && (
        <EmptyState icon="🏢" title="No companies waiting" desc="New company applications will show up here once they've verified their email." />
      )}

      {companies && companies.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {companies.map((c) => (
            <CompanyCard key={c.company_id} company={c} onAction={(type) => setModal({ type, company: c })} />
          ))}
        </div>
      )}

      {modal?.type === "approve" && (
        <ConfirmModal
          title={`Approve ${modal.company.company_name}?`}
          desc="They'll be notified by email and can immediately start sending access requests to students."
          confirmLabel="Approve"
          variant="primary"
          loading={busy}
          onConfirm={handleApprove}
          onClose={closeModal}
        />
      )}
      {modal?.type === "reject" && (
        <ReasonModal
          title={`Reject ${modal.company.company_name}`}
          desc="This reason is sent to the company by email — be specific about what to fix."
          placeholder="e.g. Could not verify the submitted NTN document. Please resubmit with a clearer scan."
          confirmLabel="Reject"
          loading={busy}
          onConfirm={handleReject}
          onClose={closeModal}
        />
      )}
      {modal?.type === "suspend" && (
        <ReasonModal
          title={`Suspend ${modal.company.company_name}`}
          desc="Suspending blocks this company from logging in. This can't be undone from the admin panel."
          placeholder="e.g. Multiple reports of unfair deal attempts with student teams."
          confirmLabel="Suspend"
          loading={busy}
          onConfirm={handleSuspend}
          onClose={closeModal}
        />
      )}
      {(modal?.type === "reject" || modal?.type === "suspend") && actionError && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#B3261E", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: "0.82rem", zIndex: 1100 }}>
          {actionError}
        </div>
      )}
    </div>
  );
}

function CompanyCard({ company, onAction }) {
  const looking = (company.looking_for || "").split(",").map((s) => s.trim()).filter(Boolean);
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {company.logo ? (
            <img src={company.logo} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: `1px solid ${C.border}` }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 10, background: C.cream, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🏢</div>
          )}
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "1rem", color: C.navy }}>{company.company_name}</div>
            <div style={{ fontSize: "0.78rem", color: C.muted }}>{company.email} · {timeAgo(company.created_at)}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn size="sm" variant="danger" onClick={() => onAction("reject")}>Reject</Btn>
          <Btn size="sm" variant="outline" onClick={() => onAction("suspend")}>Suspend</Btn>
          <Btn size="sm" variant="primary" onClick={() => onAction("approve")}>Approve</Btn>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {company.industry && <Tag>{company.industry}</Tag>}
        {company.company_size && <Tag>{company.company_size} employees</Tag>}
        {company.city && <Tag>📍 {company.city}</Tag>}
        {looking.map((l) => <Tag key={l}>{l}</Tag>)}
      </div>

      {company.description && (
        <p style={{ fontSize: "0.85rem", color: C.muted, lineHeight: 1.6, marginBottom: 14 }}>{company.description}</p>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px" }}>
        <span style={{ fontSize: "0.78rem", color: C.muted }}>
          Verification: <strong style={{ color: C.navy }}>{company.verification_doc_type || "—"}</strong>
        </span>
        {company.verification_document && (
          <a href={company.verification_document} target="_blank" rel="noreferrer" style={{ fontSize: "0.78rem", fontWeight: 700, color: C.navy, textDecoration: "underline", marginLeft: "auto" }}>
            Open document ↗
          </a>
        )}
        {company.website && (
          <a href={company.website} target="_blank" rel="noreferrer" style={{ fontSize: "0.78rem", fontWeight: 700, color: C.gold, textDecoration: "underline" }}>
            Website ↗
          </a>
        )}
      </div>
    </Card>
  );
}
