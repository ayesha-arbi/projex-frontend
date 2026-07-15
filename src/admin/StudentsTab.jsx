import { useEffect, useState, useCallback } from "react";
import { C } from "../assets/tokens.js";
import { getStudents, deactivateStudent } from "../services/adminApi.js";
import {
  PageHeader, ErrorBanner, EmptyState, Spinner, Card, StatusPill, Btn,
  ReasonModal, timeAgo,
} from "./AdminShared.jsx";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "Y", label: "Active" },
  { key: "N", label: "Deactivated" },
];

export default function StudentsTab({ onChanged }) {
  const [students, setStudents] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [modalStudent, setModalStudent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setError("");
    const params = {};
    if (filter !== "all") params.is_active = filter;
    if (debouncedSearch) params.search = debouncedSearch;
    try {
      const data = await getStudents(params);
      setStudents(data.students || []);
    } catch (err) {
      setError("Couldn't load students.");
    }
  }, [filter, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const closeModal = () => { setModalStudent(null); setActionError(""); };

  const handleDeactivate = async (reason) => {
    setBusy(true); setActionError("");
    try {
      await deactivateStudent(modalStudent.student_id, reason);
      closeModal();
      load();
      onChanged?.();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Deactivation failed. Try again.");
    } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader title="Students" subtitle="Search across name, email, and university. Deactivating blocks login only — existing projects stay up." />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or university…"
          style={{
            flex: 1, minWidth: 220, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px",
            fontSize: "0.85rem", fontFamily: "'Inter', sans-serif", color: C.navy, outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.gold)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
        <div style={{ display: "flex", gap: 6, background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4 }}>
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
      </div>

      <ErrorBanner message={error} onRetry={load} />

      {!students && !error && (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Spinner size={28} /></div>
      )}

      {students && students.length === 0 && (
        <EmptyState icon="🔍" title="No students found" desc="Try a different search term or filter." />
      )}

      {students && students.length > 0 && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.6fr 0.9fr 0.8fr 0.9fr", gap: 12, padding: "12px 20px", background: C.cream, borderBottom: `1px solid ${C.border}`, fontSize: "0.7rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <span>Student</span>
            <span>University</span>
            <span>Semester</span>
            <span>Status</span>
            <span style={{ textAlign: "right" }}>Action</span>
          </div>
          {students.map((s, i) => (
            <div
              key={s.student_id}
              style={{ display: "grid", gridTemplateColumns: "2fr 1.6fr 0.9fr 0.8fr 0.9fr", gap: 12, padding: "14px 20px", alignItems: "center", borderBottom: i < students.length - 1 ? `1px solid ${C.border}` : "none" }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.87rem", fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.full_name}</div>
                <div style={{ fontSize: "0.75rem", color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.82rem", color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.university_name}</div>
                <div style={{ fontSize: "0.74rem", color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.degree_program}</div>
              </div>
              <div style={{ fontSize: "0.82rem", color: C.navy }}>{s.current_semester ?? "—"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <StatusPill status={s.is_active === "N" ? "DEACTIVATED" : "ACTIVE"} />
                {s.is_verified === "Y" && <span style={{ fontSize: "0.68rem", color: C.muted }}>✓ verified</span>}
              </div>
              <div style={{ textAlign: "right" }}>
                {s.is_active === "N" ? (
                  <span style={{ fontSize: "0.75rem", color: C.muted }}>{timeAgo(s.created_at)}</span>
                ) : (
                  <Btn size="sm" variant="danger" onClick={() => setModalStudent(s)}>Deactivate</Btn>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      {modalStudent && (
        <ReasonModal
          title={`Deactivate ${modalStudent.full_name}?`}
          desc="Blocks this student from logging in. Their existing projects and data remain untouched."
          placeholder="e.g. Spam activity detected. Account flagged after multiple reports."
          confirmLabel="Deactivate"
          loading={busy}
          onConfirm={handleDeactivate}
          onClose={closeModal}
        />
      )}
      {actionError && modalStudent && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#B3261E", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: "0.82rem", zIndex: 1100 }}>
          {actionError}
        </div>
      )}
    </div>
  );
}
