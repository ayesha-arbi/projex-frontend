import { useEffect, useState, useCallback } from "react";
import { C } from "../../assets/tokens.js";
import {
  proposeAgreement, respondToAgreement, getRoomAgreements, getAgreement,
  requestCompletion, confirmCompletion, disputeDeal, OWNERSHIP_RULES,
} from "../../services/agreementsApi.js";
import {
  Spinner, StatusPill, ErrorBanner, Card, Btn, Modal, Toast, InfoBanner, formatDate,
} from "../../shared/UI.jsx";

const COLLAB_TYPES = ["Mentorship", "Partnership", "Investment"];

/**
 * Sits in the chat sidebar for one room.
 *   <AgreementPanel chatRoomId={room.chat_room_id} viewerSide={...} canPropose={...} />
 */
export default function AgreementPanel({ chatRoomId, viewerSide, canPropose }) {
  const [history, setHistory] = useState(null);
  const [activeAgreement, setActiveAgreement] = useState(null);
  const [error, setError] = useState("");
  const [showPropose, setShowPropose] = useState(false);
  const [showRecord, setShowRecord] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getRoomAgreements(chatRoomId);
      setHistory(data);
      if (data.active_agreement_id) {
        const full = await getAgreement(data.active_agreement_id);
        setActiveAgreement(full.agreement);
      } else {
        setActiveAgreement(null);
      }
    } catch (err) {
      setError("Couldn't load agreement info.");
    }
  }, [chatRoomId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!history && !error) {
    return <div style={{ display: "flex", justifyContent: "center", padding: "30px 0" }}><Spinner size={22} /></div>;
  }

  const pending = history?.agreements?.find((a) => a.status === "PENDING");
  const roomLocked = history?.deal_status === "CLOSED";
  const rejected = history?.agreements?.filter((a) => a.status === "REJECTED") || [];

  return (
    <div>
      <div style={{
        fontSize: "0.72rem", fontWeight: 800, color: C.muted, textTransform: "uppercase",
        letterSpacing: "0.07em", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.border}`,
      }}>
        Agreement
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {pending && (
        <PendingAgreementCard
          agreement={pending}
          viewerSide={viewerSide}
          canPropose={canPropose}
          onChanged={() => { load(); setToast("Response recorded."); }}
        />
      )}

      {!pending && activeAgreement && (
        <ActiveDealCard
          agreement={activeAgreement}
          viewerSide={viewerSide}
          canPropose={canPropose}
          onChanged={load}
          onToast={setToast}
          onViewRecord={() => setShowRecord(true)}
        />
      )}

      {!pending && !activeAgreement && !roomLocked && (
        canPropose ? (
          <Btn variant="gold" size="sm" onClick={() => setShowPropose(true)} style={{ width: "100%" }}>
            <span style={{ width: "100%", textAlign: "center" }}>Propose Agreement</span>
          </Btn>
        ) : (
          <InfoBanner tone="navy">Only the lead or the company can propose an agreement.</InfoBanner>
        )
      )}

      {rejected.length > 0 && (
        <details style={{ marginTop: 18 }}>
          <summary style={{ fontSize: "0.78rem", fontWeight: 700, color: C.navy, cursor: "pointer" }}>
            Earlier attempts ({rejected.length})
          </summary>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {rejected.map((a) => (
              <div key={a.agreement_id} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: "0.78rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <strong style={{ color: C.navy }}>{a.collaboration_type}</strong>
                  <StatusPill status="REJECTED" />
                </div>
                <div style={{ color: C.muted }}>Student {a.student_ownership_pct}% / Company {a.company_ownership_pct}%</div>
                {a.response_note && <div style={{ color: C.muted, marginTop: 4, fontStyle: "italic" }}>"{a.response_note}"</div>}
              </div>
            ))}
          </div>
        </details>
      )}

      {showPropose && (
        <ProposeModal
          chatRoomId={chatRoomId}
          onClose={() => setShowPropose(false)}
          onProposed={() => { setShowPropose(false); load(); setToast("Proposal sent."); }}
        />
      )}

      {showRecord && activeAgreement && (
        <FormalRecordModal agreement={activeAgreement} onClose={() => setShowRecord(false)} />
      )}

      <Toast message={toast} tone="success" />
    </div>
  );
}

/* Pending proposal — awaiting accept/reject */
function PendingAgreementCard({ agreement, viewerSide, canPropose, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showReject, setShowReject] = useState(false);
  const isMine = agreement.proposed_by === viewerSide;

  const accept = async () => {
    setBusy(true); setError("");
    try {
      await respondToAgreement(agreement.agreement_id, { action: "ACCEPT" });
      onChanged();
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't accept. Try again.");
    } finally { setBusy(false); }
  };

  const reject = async (note) => {
    setBusy(true); setError("");
    try {
      await respondToAgreement(agreement.agreement_id, { action: "REJECT", note });
      setShowReject(false);
      onChanged();
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't reject. Try again.");
    } finally { setBusy(false); }
  };

  return (
    <Card style={{ borderColor: C.gold, borderWidth: 1.5, marginBottom: 16, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <strong style={{ color: C.navy, fontSize: "0.9rem" }}>{agreement.collaboration_type}</strong>
        <StatusPill status="PENDING" />
      </div>
      <OwnershipSummary agreement={agreement} />
      {error && <div style={{ fontSize: "0.78rem", color: "#B3261E", marginTop: 10 }}>{error}</div>}
      <div style={{ marginTop: 14 }}>
        {isMine ? (
          <span style={{ fontSize: "0.78rem", color: C.muted, fontStyle: "italic" }}>Waiting for the other party to respond…</span>
        ) : canPropose ? (
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" variant="outline" onClick={() => setShowReject(true)} disabled={busy}>Reject</Btn>
            <Btn size="sm" variant="primary" onClick={accept} loading={busy}>Accept</Btn>
          </div>
        ) : (
          <span style={{ fontSize: "0.78rem", color: C.muted }}>Only the lead can respond to this.</span>
        )}
      </div>
      {showReject && <RejectModal onClose={() => setShowReject(false)} onConfirm={reject} loading={busy} />}
    </Card>
  );
}

function RejectModal({ onClose, onConfirm, loading }) {
  const [note, setNote] = useState("");
  return (
    <Modal onClose={loading ? () => {} : onClose} width={420}>
      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: C.navy, marginBottom: 10 }}>Reject this proposal?</h3>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note — e.g. what terms you'd prefer instead"
        rows={3}
        style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 12, fontSize: "0.85rem", fontFamily: "'Inter', sans-serif", color: C.navy, resize: "vertical", outline: "none", marginBottom: 18 }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose} disabled={loading}>Cancel</Btn>
        <Btn variant="danger" onClick={() => onConfirm(note.trim() || undefined)} loading={loading}>Reject</Btn>
      </div>
    </Modal>
  );
}

function OwnershipSummary({ agreement }) {
  return (
    <div style={{
      fontSize: "0.8rem", color: C.navy, lineHeight: 1.9, background: C.cream,
      border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px",
    }}>
      <div>Student <strong>{agreement.student_ownership_pct}%</strong> · Company <strong>{agreement.company_ownership_pct}%</strong></div>
      {agreement.investment_amount != null && <div>Investment: <strong>Rs {Number(agreement.investment_amount).toLocaleString()}</strong></div>}
      <div>Starts {formatDate(agreement.start_date)} · {agreement.duration_days} days</div>
    </div>
  );
}

/* Active / accepted deal — deal tracking */
function ActiveDealCard({ agreement, viewerSide, canPropose, onChanged, onToast, onViewRecord }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showDispute, setShowDispute] = useState(false);
  const dealStatus = agreement.deal_status;
  const requestedByMe = agreement.completion_requested_by === viewerSide;
  const requestedByThem = agreement.completion_requested_by && !requestedByMe;

  const doRequestComplete = async () => {
    setBusy(true); setError("");
    try { await requestCompletion(agreement.agreement_id); onChanged(); }
    catch (err) { setError(err?.response?.data?.message || "Couldn't request completion."); }
    finally { setBusy(false); }
  };

  const doConfirmComplete = async () => {
    setBusy(true); setError("");
    try {
      await confirmCompletion(agreement.agreement_id);
      onChanged();
      onToast?.("🎉 Deal marked as complete — verified on Projex.pk!");
    } catch (err) { setError(err?.response?.data?.message || "Couldn't confirm completion."); }
    finally { setBusy(false); }
  };

  const doDispute = async (note) => {
    setBusy(true); setError("");
    try { await disputeDeal(agreement.agreement_id, note); setShowDispute(false); onChanged(); }
    catch (err) { setError(err?.response?.data?.message || "Couldn't file dispute."); }
    finally { setBusy(false); }
  };

  return (
    <Card style={{ marginBottom: 16, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <strong style={{ color: C.navy, fontSize: "0.9rem" }}>{agreement.collaboration_type}</strong>
        <StatusPill status={dealStatus} />
      </div>
      <OwnershipSummary agreement={agreement} />

      {error && <div style={{ fontSize: "0.78rem", color: "#B3261E", marginTop: 10 }}>{error}</div>}

      {dealStatus === "COMPLETED" && (
        <div style={{ marginTop: 14, background: "#DCEFFB", border: "1px solid #b7dcf0", borderRadius: 10, padding: "10px 12px", fontSize: "0.82rem", color: "#1B5E85", fontWeight: 600 }}>
          ✅ Verified Complete — {formatDate(agreement.completed_at)}
        </div>
      )}

      {dealStatus === "DISPUTED" && (
        <div style={{ marginTop: 14, background: "#FBE9E7", border: "1px solid #f3c6c1", borderRadius: 10, padding: "10px 12px", fontSize: "0.82rem", color: "#B3261E" }}>
          🚩 Under review — our team has been notified and will reach out to both parties.
        </div>
      )}

      {dealStatus === "ACTIVE" && (
        <div style={{ marginTop: 14 }}>
          {!agreement.completion_requested_by && (
            <div style={{ display: "flex", gap: 8 }}>
              <Btn size="sm" variant="primary" onClick={doRequestComplete} loading={busy}>Mark as Complete</Btn>
              <Btn size="sm" variant="outline" onClick={() => setShowDispute(true)} disabled={busy}>Dispute</Btn>
            </div>
          )}
          {requestedByMe && (
            <span style={{ fontSize: "0.78rem", color: C.muted, fontStyle: "italic" }}>Waiting for the other party to confirm…</span>
          )}
          {requestedByThem && (
            <div>
              <div style={{ fontSize: "0.78rem", color: C.muted, marginBottom: 8 }}>The other party marked this complete —</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn size="sm" variant="primary" onClick={doConfirmComplete} loading={busy}>Confirm Complete</Btn>
                <Btn size="sm" variant="outline" onClick={() => setShowDispute(true)} disabled={busy}>Dispute</Btn>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
        <button onClick={onViewRecord} style={{ background: "none", border: "none", color: C.navy, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0 }}>
          View formal record
        </button>
      </div>

      {showDispute && <DisputeModal onClose={() => setShowDispute(false)} onConfirm={doDispute} loading={busy} />}
    </Card>
  );
}

function DisputeModal({ onClose, onConfirm, loading }) {
  const [note, setNote] = useState("");
  return (
    <Modal onClose={loading ? () => {} : onClose} width={420}>
      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: C.navy, marginBottom: 6 }}>File a dispute</h3>
      <p style={{ fontSize: "0.8rem", color: C.muted, marginBottom: 14, lineHeight: 1.55 }}>Explain what went wrong — our team will review and reach out to both parties.</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Work was not delivered as described."
        rows={4}
        style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 12, fontSize: "0.85rem", fontFamily: "'Inter', sans-serif", color: C.navy, resize: "vertical", outline: "none", marginBottom: 18 }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose} disabled={loading}>Cancel</Btn>
        <Btn variant="danger" onClick={() => onConfirm(note.trim())} disabled={!note.trim()} loading={loading}>File Dispute</Btn>
      </div>
    </Modal>
  );
}

/* Propose modal */
function ProposeModal({ chatRoomId, onClose, onProposed }) {
  const [collabType, setCollabType] = useState("Mentorship");
  const rule = OWNERSHIP_RULES[collabType];
  const [studentPct, setStudentPct] = useState(rule.fixed ?? rule.min);
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectType = (t) => {
    setCollabType(t);
    const r = OWNERSHIP_RULES[t];
    setStudentPct(r.fixed ?? r.min);
  };

  const submit = async () => {
    setError("");
    if (!startDate) { setError("Pick a start date."); return; }
    if (!duration || duration <= 0) { setError("Duration must be a positive number of days."); return; }
    if (rule.requiresAmount && !amount) { setError("Investment amount is required."); return; }
    if (studentPct < rule.min || studentPct > 100) { setError(`Minimum ${rule.min}% required for ${collabType}.`); return; }

    setLoading(true);
    try {
      const payload = {
        collaboration_type: collabType,
        start_date: startDate,
        duration_days: Number(duration),
      };
      if (collabType !== "Mentorship") payload.student_ownership_pct = Number(studentPct);
      if (collabType === "Investment") payload.investment_amount = Number(amount);

      const data = await proposeAgreement(chatRoomId, payload);
      onProposed(data.agreement);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 409) setError(msg || "A proposal is already waiting for a response in this room.");
      else setError(msg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={loading ? () => {} : onClose} width={460}>
      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: C.navy, marginBottom: 18 }}>Propose an Agreement</h3>

      {error && (
        <div style={{ background: "#FBE9E7", border: "1px solid #f3c6c1", color: "#B3261E", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", marginBottom: 16 }}>{error}</div>
      )}

      <label style={fieldLabel}>Collaboration type</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {COLLAB_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => selectType(t)}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 9, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700,
              fontFamily: "'Inter', sans-serif", border: `1.5px solid ${collabType === t ? C.navy : C.border}`,
              background: collabType === t ? C.navy : "#fff", color: collabType === t ? "#fff" : C.navy,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {collabType === "Mentorship" ? (
        <InfoBanner tone="gold">Mentorship keeps the student team at 100% ownership — no equity split to configure.</InfoBanner>
      ) : (
        <>
          <label style={fieldLabel}>Student ownership: {studentPct}%</label>
          <input type="range" min={rule.min} max={100} value={studentPct} onChange={(e) => setStudentPct(Number(e.target.value))} style={{ width: "100%", marginBottom: 6 }} />
          <div style={{ fontSize: "0.78rem", color: C.muted, marginBottom: 18 }}>
            Company gets the remaining <strong>{100 - studentPct}%</strong>. Minimum {rule.min}% for {collabType}.
          </div>
        </>
      )}

      {rule.requiresAmount && (
        <>
          <label style={fieldLabel}>Investment amount (PKR)</label>
          <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50000" style={inputStyle} />
          <div style={{ marginBottom: 18 }} />
        </>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
        <div style={{ flex: 1 }}>
          <label style={fieldLabel}>Start date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={fieldLabel}>Duration (days)</label>
          <input type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose} disabled={loading}>Cancel</Btn>
        <Btn variant="gold" onClick={submit} loading={loading}>Send Proposal</Btn>
      </div>
    </Modal>
  );
}

const fieldLabel = { display: "block", fontSize: "0.78rem", fontWeight: 600, color: C.navy, marginBottom: 6 };
const inputStyle = { width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", fontSize: "0.85rem", fontFamily: "'Inter', sans-serif", color: C.navy, outline: "none" };

/* Printable formal record */
function FormalRecordModal({ agreement, onClose }) {
  return (
    <Modal onClose={onClose} width={520}>
      <div id="agreement-record">
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: C.navy }}>
            Projex<span style={{ color: C.gold }}>.pk</span> — Agreement Record
          </div>
          <div style={{ fontSize: "0.76rem", color: C.muted, marginTop: 2 }}>Agreement ID: {agreement.agreement_id}</div>
        </div>

        <RecordRow label="Project" value={agreement.projects?.title} />
        <RecordRow label="University" value={agreement.projects?.university} />
        <RecordRow label="Company" value={agreement.companies?.company_name} />
        <RecordRow label="Industry" value={agreement.companies?.industry} />
        <RecordRow label="Collaboration type" value={agreement.collaboration_type} />
        <RecordRow label="Student ownership" value={`${agreement.student_ownership_pct}%`} />
        <RecordRow label="Company ownership" value={`${agreement.company_ownership_pct}%`} />
        {agreement.investment_amount != null && <RecordRow label="Investment amount" value={`Rs ${Number(agreement.investment_amount).toLocaleString()}`} />}
        <RecordRow label="Start date" value={formatDate(agreement.start_date)} />
        <RecordRow label="Duration" value={`${agreement.duration_days} days`} />
        <RecordRow label="Status" value={agreement.status} />
        <RecordRow label="Deal status" value={agreement.deal_status} />
        <RecordRow label="Accepted on" value={formatDate(agreement.responded_at)} />
        {agreement.completed_at && <RecordRow label="Completed on" value={formatDate(agreement.completed_at)} />}

        <p style={{ fontSize: "0.72rem", color: C.muted, lineHeight: 1.6, marginTop: 22, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          This is a documented record of mutual agreement between both parties on Projex.pk, timestamped for reference.
          For legally binding contracts, parties may wish to consult a legal professional.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <Btn variant="ghost" onClick={onClose}>Close</Btn>
        <Btn variant="primary" onClick={() => window.print()}>Print / Save as PDF</Btn>
      </div>
    </Modal>
  );
}

function RecordRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: "0.83rem" }}>
      <span style={{ color: C.muted }}>{label}</span>
      <span style={{ color: C.navy, fontWeight: 600 }}>{value}</span>
    </div>
  );
}