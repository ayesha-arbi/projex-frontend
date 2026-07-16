import { useEffect, useState, useCallback } from "react";
import { C } from "../../assets/tokens.js";
import { browseCompanies, getRecommendedCompanies } from "../../services/discoveryApi.js";
import { Spinner, EmptyState, ErrorBanner, Card, Tag, InfoBanner } from "../../shared/UI.jsx";
import SendProposalButton from "./SendProposalButton.jsx";

const LOOKING_FOR_OPTIONS = ["Mentorship", "Partnership", "Investment"];

/**
 * Mount in the student dashboard, passing the lead's own projects so the
 * "pitch this company" flow knows which project to attach:
 *
 *   <DiscoverCompaniesTab projects={myProjects} />
 *
 * `projects` items need at least { project_id, title, review_status }.
 * Only APPROVED ones are selectable (per the proposals guide's gate).
 */
export default function DiscoverCompaniesTab({ projects = [] }) {
  const approvedProjects = projects.filter((p) => p.review_status === "APPROVED");
  const [activeProjectId, setActiveProjectId] = useState(approvedProjects[0]?.project_id || "");
  const [mode, setMode] = useState(approvedProjects.length ? "recommended" : "browse");
  const [companies, setCompanies] = useState(null);
  const [error, setError] = useState("");
  const [matched, setMatched] = useState(true);
  const [filters, setFilters] = useState({ industry: "", city: "", looking_for: "" });

  const activeProject = approvedProjects.find((p) => p.project_id === activeProjectId) || null;

  const load = useCallback(async () => {
    setError("");
    try {
      if (mode === "recommended") {
        const data = await getRecommendedCompanies();
        setCompanies(data.companies || []);
        setMatched(data.matched);
      } else {
        const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
        const data = await browseCompanies(cleanFilters);
        setCompanies(data.companies || []);
        setMatched(true);
      }
    } catch (err) {
      setError("Couldn't load companies.");
    }
  }, [mode, filters]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.35rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.02em" }}>Discover Companies</h2>
          <p style={{ fontSize: "0.85rem", color: C.muted, marginTop: 4 }}>Find companies to pitch for mentorship, partnership, or investment.</p>
        </div>
        {approvedProjects.length > 0 && (
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: C.muted, marginBottom: 4 }}>Pitching as project</label>
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: "0.83rem", fontFamily: "'Inter', sans-serif", color: C.navy, background: "#fff" }}
            >
              {approvedProjects.map((p) => <option key={p.project_id} value={p.project_id}>{p.title}</option>)}
            </select>
          </div>
        )}
      </div>

      {approvedProjects.length === 0 && (
        <InfoBanner tone="gold">You don't have an approved project yet — you can browse companies, but pitching opens up once a project of yours is approved.</InfoBanner>
      )}

      <div style={{ display: "flex", gap: 6, background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, marginBottom: 18, width: "fit-content" }}>
        {[{ key: "recommended", label: "Recommended" }, { key: "browse", label: "Browse all" }].map((t) => (
          <button key={t.key} onClick={() => setMode(t.key)}
            style={{ border: "none", cursor: "pointer", padding: "7px 16px", borderRadius: 7, fontSize: "0.8rem", fontWeight: 600, fontFamily: "'Inter', sans-serif", background: mode === t.key ? "#fff" : "transparent", color: mode === t.key ? C.navy : C.muted, boxShadow: mode === t.key ? "0 1px 3px rgba(12,35,64,0.1)" : "none" }}>
            {t.label}
          </button>
        ))}
      </div>

      {mode === "recommended" && !matched && companies?.length > 0 && (
        <InfoBanner tone="navy">You don't have an approved project with tags/interests set yet, so these aren't personalized — showing all verified companies instead.</InfoBanner>
      )}

      {mode === "browse" && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
          <input placeholder="Industry" value={filters.industry} onChange={(e) => setFilters((f) => ({ ...f, industry: e.target.value }))} style={filterInputStyle} />
          <input placeholder="City" value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))} style={filterInputStyle} />
          <select value={filters.looking_for} onChange={(e) => setFilters((f) => ({ ...f, looking_for: e.target.value }))} style={filterInputStyle}>
            <option value="">Looking for: any</option>
            {LOOKING_FOR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      )}

      <ErrorBanner message={error} onRetry={load} />

      {!companies && !error && <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Spinner size={26} /></div>}

      {companies && companies.length === 0 && (
        <EmptyState icon="🏢" title="No companies found" desc="Try adjusting your filters, or check back later as more companies join." />
      )}

      {companies && companies.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {companies.map((c) => (
            <CompanyCard key={c.company_id} company={c} project={activeProject} showScore={mode === "recommended" && matched} />
          ))}
        </div>
      )}
    </div>
  );
}

const filterInputStyle = { border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: "0.83rem", fontFamily: "'Inter', sans-serif", color: C.navy, background: "#fff", minWidth: 140 };

function CompanyCard({ company, project, showScore }) {
  const looking = (company.looking_for || "").split(",").map((s) => s.trim()).filter(Boolean);
  return (
    <Card>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        {company.logo ? (
          <img src={company.logo} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: `1px solid ${C.border}` }} />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: 10, background: C.cream, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🏢</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "0.92rem", color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{company.company_name}</div>
            {showScore && company.match_score > 0 && (
              <span style={{ fontSize: "0.66rem", fontWeight: 700, color: C.gold, whiteSpace: "nowrap" }}>★ Strong match</span>
            )}
          </div>
          <div style={{ fontSize: "0.76rem", color: C.muted }}>{[company.industry, company.city].filter(Boolean).join(" · ")}</div>
        </div>
      </div>

      {company.description && (
        <p style={{ fontSize: "0.8rem", color: C.muted, lineHeight: 1.55, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {company.description}
        </p>
      )}

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
        {looking.map((l) => <Tag key={l}>{l}</Tag>)}
        {company.company_size && <Tag>{company.company_size}</Tag>}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        {company.website && (
          <a href={company.website} target="_blank" rel="noreferrer" style={{ fontSize: "0.76rem", color: C.navy, fontWeight: 600, textDecoration: "underline" }}>Website ↗</a>
        )}
        <div style={{ marginLeft: "auto" }}>
          {project ? (
            <SendProposalButton project={project} company={{ company_id: company.company_id, company_name: company.company_name, logo: company.logo }} />
          ) : (
            <span style={{ fontSize: "0.72rem", color: C.muted }}>Select a project to pitch</span>
          )}
        </div>
      </div>
    </Card>
  );
}
