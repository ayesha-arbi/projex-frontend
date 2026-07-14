import { C } from "../assets/tokens.js";
import { PageHeader, ErrorBanner, Card, Spinner } from "./AdminShared.jsx";

export default function OverviewTab({ stats, error, onRetry }) {
  return (
    <div>
      <PageHeader title="Overview" subtitle="Platform-wide numbers, refreshed every time you open a section." />
      <ErrorBanner message={error} onRetry={onRetry} />

      {!stats && !error && (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Spinner size={28} />
        </div>
      )}

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
          <StatCard
            title="Students"
            primary={stats.students?.total ?? 0}
            primaryLabel="registered"
            rows={[]}
          />
          <StatCard
            title="Companies"
            primary={stats.companies?.total ?? 0}
            primaryLabel="registered"
            rows={[
              { label: "Awaiting approval", value: stats.companies?.pending_approval ?? 0, highlight: (stats.companies?.pending_approval ?? 0) > 0 },
            ]}
          />
          <StatCard
            title="Projects"
            primary={stats.projects?.total ?? 0}
            primaryLabel="total listed"
            rows={[
              { label: "FYP (auto-approved)", value: stats.projects?.fyp ?? 0 },
              { label: "Academic", value: stats.projects?.academic ?? 0 },
              { label: "Awaiting review", value: stats.projects?.pending_review ?? 0, highlight: (stats.projects?.pending_review ?? 0) > 0 },
            ]}
          />
          <StatCard
            title="Proposals"
            primary={stats.proposals?.total ?? 0}
            primaryLabel="sent"
            rows={[
              { label: "Marked interested", value: stats.proposals?.interested ?? 0 },
            ]}
          />
          <StatCard
            title="Access requests"
            primary={stats.access_requests?.total ?? 0}
            primaryLabel="sent"
            rows={[
              { label: "Approved", value: stats.access_requests?.approved ?? 0 },
            ]}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, primary, primaryLabel, rows }) {
  return (
    <Card>
      <div style={{ fontSize: "0.74rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: rows.length ? 18 : 0 }}>
        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "2.3rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {primary}
        </span>
        <span style={{ fontSize: "0.78rem", color: C.muted }}>{primaryLabel}</span>
      </div>
      {rows.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          {rows.map((r) => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
              <span style={{ color: C.muted }}>{r.label}</span>
              <span style={{ fontWeight: 700, color: r.highlight ? C.gold : C.navy }}>{r.value}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}