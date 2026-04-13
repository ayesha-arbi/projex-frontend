import { useState, useRef } from "react";
import {
  FileText, Layers, Lock, Paperclip, Tag, Building2, Cpu, Link2,
  CheckCircle, XCircle, Eye, ArrowLeft, ChevronRight,
  Rocket, Plus, Briefcase, Handshake, DollarSign, Award,
  Image, Video, ShieldCheck, AlertTriangle, Info,
} from "lucide-react";
import { C } from "../../assets/tokens";
import { TECH_TAGS, INDUSTRY_TAGS, LOOKING_FOR_OPTIONS, STATUS_OPTIONS } from "./constants";

/* ── API ── */
const API_BASE = import.meta.env?.VITE_API_URL || "/api";

async function submitProject(form) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated. Please log in again.");
  const fd = new FormData();
  fd.append("title",             form.title.trim());
  fd.append("short_description", form.short_description.trim());
  fd.append("tech_tags",         form.tech_tags.join(", "));
  if (form.industry_tags.length) fd.append("industry_tags", form.industry_tags.join(", "));
  if (form.custom_tags.trim())   fd.append("custom_tags",   form.custom_tags.trim());
  fd.append("project_status",    form.project_status);
  fd.append("looking_for",       form.looking_for.join(", "));
  if (form.detailed_description.trim()) fd.append("detailed_description", form.detailed_description.trim());
  if (form.problem_statement.trim())    fd.append("problem_statement",    form.problem_statement.trim());
  if (form.proposed_solution.trim())    fd.append("proposed_solution",    form.proposed_solution.trim());
  if (form.tech_stack_details.trim())   fd.append("tech_stack_details",   form.tech_stack_details.trim());
  if (form.github_link.trim())          fd.append("github_link",          form.github_link.trim());
  if (form.demo_link.trim())            fd.append("demo_link",            form.demo_link.trim());
  if (form.poster)   fd.append("poster",   form.poster);
  if (form.video)    fd.append("video",    form.video);
  if (form.document) fd.append("document", form.document);

  let res;
  try {
    res = await fetch(`${API_BASE}/projects/create`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
  } catch (networkErr) {
    throw new Error(`Cannot reach server at ${API_BASE}. Is your backend running?`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Server returned ${res.status} — check that your backend is running and VITE_API_URL is correct (currently: ${API_BASE})`);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.length ? data.errors.map(e => e.msg).join(" • ") : data.message || "Something went wrong.");
  return data;
}

/* ── Shared mini components ── */
function Btn({ children, variant = "primary", size = "sm", onClick, disabled = false, style: ex = {} }) {
  const [hov, setHov] = useState(false);
  const pad = size === "lg" ? "13px 26px" : "8px 16px";
  const fs  = size === "lg" ? "0.9rem" : "0.8rem";
  const base = { display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 8, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", border: "none", whiteSpace: "nowrap", padding: pad, fontSize: fs, transition: "all 0.18s", opacity: disabled ? 0.45 : 1 };
  const v = {
    primary: { background: hov ? C.blueMid : C.blue, color: "#fff", boxShadow: hov ? "0 6px 18px rgba(3,62,102,0.25)" : "none", transform: hov ? "translateY(-1px)" : "none" },
    green:   { background: hov ? "#b8e047" : C.green, color: C.blue, boxShadow: hov ? "0 6px 18px rgba(163,207,62,0.3)" : "none", transform: hov ? "translateY(-1px)" : "none" },
    ghost:   { background: hov ? C.blueTint : "transparent", border: `1.5px solid ${hov ? C.blue : C.border2}`, color: C.blue },
  };
  return <button disabled={disabled} style={{ ...base, ...v[variant], ...ex }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}>{children}</button>;
}

function Badge({ children, color = C.blue, bg }) {
  return <span style={{ display: "inline-flex", alignItems: "center", fontSize: "0.67rem", fontWeight: 700, padding: "3px 9px", borderRadius: 5, background: bg || `${color}18`, color, border: `1px solid ${color}30`, whiteSpace: "nowrap" }}>{children}</span>;
}

function StatusDot({ status }) {
  const color = status === "Completed" ? C.greenDark : "#f59e0b";
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.72rem", fontWeight: 600, color }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />{status}</span>;
}

function TInput({ label, placeholder, value, onChange, required, hint, rows, maxLen }) {
  const [focused, setFocused] = useState(false);
  const len = value?.length || 0;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
        <label style={{ fontSize: "0.72rem", fontWeight: 700, color: C.blue, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
        </label>
        {maxLen && <span style={{ fontSize: "0.65rem", color: len > maxLen * 0.9 ? "#ef4444" : C.muted2 }}>{len}/{maxLen}</span>}
      </div>
      {hint && <p style={{ fontSize: "0.72rem", color: C.muted, margin: "0 0 6px" }}>{hint}</p>}
      {rows ? (
        <textarea rows={rows} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 13px", borderRadius: 9, border: `1.5px solid ${focused ? C.blue : C.border2}`, fontSize: "0.86rem", fontFamily: "'Plus Jakarta Sans',sans-serif", color: C.text, background: focused ? C.blueTint : C.white, outline: "none", resize: "vertical", lineHeight: 1.65, transition: "all 0.18s", boxShadow: focused ? `0 0 0 3px ${C.blue}12` : "none" }} />
      ) : (
        <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 13px", borderRadius: 9, border: `1.5px solid ${focused ? C.blue : C.border2}`, fontSize: "0.86rem", fontFamily: "'Plus Jakarta Sans',sans-serif", color: C.text, background: focused ? C.blueTint : C.white, outline: "none", transition: "all 0.18s", boxShadow: focused ? `0 0 0 3px ${C.blue}12` : "none" }} />
      )}
    </div>
  );
}

function FormSection({ icon: SIcon, title, subtitle, children, accent = C.blue }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16, width: "100%", boxSizing: "border-box" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: C.off, display: "flex", alignItems: "flex-start", gap: 10, borderLeft: `3px solid ${accent}` }}>
        {SIcon && <div style={{ width: 28, height: 28, borderRadius: 7, background: `${accent}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><SIcon size={13} color={accent} strokeWidth={2.2} /></div>}
        <div>
          <h3 style={{ fontSize: "0.86rem", fontWeight: 800, color: C.ink, margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{title}</h3>
          {subtitle && <p style={{ fontSize: "0.72rem", color: C.muted, margin: "2px 0 0" }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

function TagSelector({ options, selected, onChange, color = C.blue }) {
  const toggle = t => onChange(selected.includes(t) ? selected.filter(x => x !== t) : [...selected, t]);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map(t => {
        const on = selected.includes(t);
        return (
          <button key={t} type="button" onClick={() => toggle(t)} style={{ padding: "5px 11px", borderRadius: 6, border: `1.5px solid ${on ? color : C.border2}`, background: on ? `${color}15` : "transparent", color: on ? color : C.muted, fontSize: "0.74rem", fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all 0.14s", display: "flex", alignItems: "center", gap: 5 }}>
            {on && <span style={{ fontSize: "0.68rem" }}>✓</span>}{t}
          </button>
        );
      })}
    </div>
  );
}

function FileZone({ label, accept, hint, value, onChange }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const handleDrop = e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onChange(f); };
  return (
    <div onClick={() => inputRef.current?.click()} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={handleDrop}
      style={{ border: `2px dashed ${drag ? C.blue : value ? C.green : C.border2}`, borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", background: drag ? C.blueTint : value ? C.greenPale : "transparent", transition: "all 0.18s" }}>
      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={e => onChange(e.target.files[0])} />
      {value ? (
        <div>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: C.greenPale, border: `1px solid rgba(122,170,28,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}><CheckCircle size={18} color={C.greenDark} /></div>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: C.greenDark, margin: 0 }}>{value.name}</p>
          <p style={{ fontSize: "0.7rem", color: C.muted, margin: "3px 0 0" }}>{(value.size / 1024 / 1024).toFixed(1)} MB</p>
        </div>
      ) : (
        <div>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: C.off, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}><Paperclip size={18} color={C.muted2} /></div>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: C.muted, margin: 0 }}>{label}</p>
          {hint && <p style={{ fontSize: "0.7rem", color: C.muted2, margin: "4px 0 0" }}>{hint}</p>}
        </div>
      )}
    </div>
  );
}

function Banner({ children, type = "info" }) {
  const map = {
    info:    { bg: C.blueTint,  border: "rgba(3,62,102,0.15)", color: C.blue,    icon: <Info size={14} /> },
    warning: { bg: "#fef3c7",   border: "#fde68a",             color: "#78350f", icon: <Lock size={14} /> },
    error:   { bg: "#fef2f2",   border: "#fecaca",             color: "#dc2626", icon: <AlertTriangle size={14} /> },
  };
  const { bg, border, color, icon } = map[type] || map.info;
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "11px 14px", marginBottom: 16, display: "flex", gap: 9, alignItems: "flex-start", fontSize: "0.82rem", color }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <p style={{ margin: 0, lineHeight: 1.65 }}>{children}</p>
    </div>
  );
}

/* ── Step bar ── */
const STEPS = [
  { n: 1, label: "Basic Info",  Icon: FileText  },
  { n: 2, label: "Details",     Icon: Layers    },
  { n: 3, label: "Private",     Icon: Lock      },
  { n: 4, label: "Files",       Icon: Paperclip },
];

const LOOKING_FOR_ICONS = { Hiring: Briefcase, Collaboration: Handshake, Investment: DollarSign, Mentoring: Award };

const EMPTY_FORM = {
  title: "", short_description: "",
  tech_tags: [], industry_tags: [], custom_tags: "",
  project_status: "In Progress", looking_for: [],
  detailed_description: "", problem_statement: "", proposed_solution: "",
  github_link: "", demo_link: "", tech_stack_details: "",
  poster: null, video: null, document: null,
};

/* ══════════════════════════════════════════
   MAIN EXPORT
   Bug 1 Fix: accept onProjectPosted prop.
   After success → save project_id to localStorage
   and call onProjectPosted() so the dashboard
   switches to the "My Project" tab.
══════════════════════════════════════════ */
export default function UploadProjectTab({ onProjectPosted }) {
  const [step,           setStep]           = useState(1);
  const [submitting,     setSubmitting]     = useState(false);
  const [submitError,    setSubmitError]    = useState(null);
  const [submitted,      setSubmitted]      = useState(false);
  const [createdProject, setCreatedProject] = useState(null);
  const [showPreview,    setShowPreview]    = useState(false);
  const [form,           setForm]           = useState(EMPTY_FORM);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canAdvance = () => {
    if (step === 1) return form.title.trim() && form.short_description.trim() && form.tech_tags.length > 0;
    if (step === 2) return form.project_status && form.looking_for.length > 0;
    return true;
  };

  const handlePost = async () => {
    if (!form.poster) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const r = await submitProject(form);

      // ── Bug 1 Fix: save project_id to localStorage ──
      if (r.project?.project_id) {
        localStorage.setItem("project_id", r.project.project_id);
      }

      setCreatedProject(r.project);
      setSubmitted(true);

      // Notify dashboard to switch to "My Project" tab (after short delay so
      // the success screen is visible first)
      if (onProjectPosted) {
        setTimeout(() => onProjectPosted(r.project), 1800);
      }

    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setStep(1);
    setForm(EMPTY_FORM);
    setCreatedProject(null);
    setSubmitError(null);
  };

  /* ── Success screen ── */
  if (submitted && createdProject) {
    return (
      <div style={{ padding: "32px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "55vh" }}>
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center", animation: "fadeUp 0.5s ease both" }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: `0 8px 24px ${C.green}55` }}>
            <Rocket size={28} color={C.blue} />
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.ink, margin: "0 0 8px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Project Posted!</h2>
          <p style={{ color: C.muted, lineHeight: 1.7, marginBottom: 10, fontSize: "0.88rem" }}>
            <strong style={{ color: C.text }}>{createdProject.title}</strong> is now live on Projex.pk.
          </p>
          <div style={{ background: C.blueTint, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 16px", marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.76rem", color: C.blue, fontWeight: 600 }}>
            <CheckCircle size={13} color={C.greenDark} /> ID: {createdProject.project_id}
          </div>
          <p style={{ fontSize: "0.78rem", color: C.muted, marginBottom: 6 }}>
            Taking you to your project page…
          </p>
          <p style={{ fontSize: "0.82rem", color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>
            Full details stay locked until you approve each company request.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {onProjectPosted && (
              <Btn variant="primary" onClick={() => onProjectPosted(createdProject)}>
                View My Project →
              </Btn>
            )}
            <Btn variant="ghost" onClick={reset}><Plus size={13} /> Post Another</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 32px", width: "100%", boxSizing: "border-box", minWidth: 0 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: C.ink, margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Upload Project</h2>
          <p style={{ fontSize: "0.78rem", color: C.muted, margin: "3px 0 0" }}>Full details stay private — companies only see your teaser until you approve</p>
        </div>
        <Btn variant="ghost" size="sm" onClick={() => setShowPreview(true)}><Eye size={13} /> Preview</Btn>
      </div>

      {/* Step bar */}
      <div style={{ display: "flex", background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "4px", marginBottom: 24, overflow: "hidden" }}>
        {STEPS.map((s, i) => {
          const done = step > s.n, active = step === s.n;
          return (
            <div key={s.n} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <button type="button" onClick={() => done && setStep(s.n)} style={{ flex: 1, padding: "8px 4px", borderRadius: 9, border: "none", cursor: done ? "pointer" : "default", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(0.65rem,1.5vw,0.76rem)", fontWeight: active ? 800 : 500, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: active ? C.blue : done ? C.greenPale : "transparent", color: active ? "#fff" : done ? C.greenDark : C.muted, whiteSpace: "nowrap" }}>
                {done ? <CheckCircle size={12} /> : <s.Icon size={12} strokeWidth={active ? 2.5 : 2} />}
                <span>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div style={{ width: 1, height: 20, background: C.border, flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>

      {/* ── Step 1 ── */}
      {step === 1 && (
        <>
          <FormSection icon={FileText} title="Basic Info" subtitle="Public-facing — what companies will see" accent={C.blue}>
            <TInput label="Project Title" required maxLen={80} placeholder="e.g. AI-Powered Crop Disease Detection System" value={form.title} onChange={v => set("title", v)} />
            <TInput label="Short Description" required rows={3} maxLen={150} placeholder="One punchy sentence about what your project does…" value={form.short_description} onChange={v => set("short_description", v)} hint="Max 150 characters — this is your hook." />
          </FormSection>
          <FormSection icon={Tag} title="Tech Tags" subtitle="Select all technologies used" accent={C.blueMid}>
            <TagSelector options={TECH_TAGS} selected={form.tech_tags} onChange={v => set("tech_tags", v)} color={C.blue} />
            {form.tech_tags.length === 0 && <p style={{ fontSize: "0.73rem", color: "#ef4444", marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}><AlertTriangle size={12} /> At least one tech tag required</p>}
          </FormSection>
          <FormSection icon={Building2} title="Industry Tags" subtitle="Optional" accent={C.greenDark}>
            <TagSelector options={INDUSTRY_TAGS} selected={form.industry_tags} onChange={v => set("industry_tags", v)} color={C.greenDark} />
          </FormSection>
          <FormSection icon={Tag} title="Custom Tags" subtitle="Any other keywords? Comma separated." accent={C.muted}>
            <TInput label="Custom Tags" placeholder="e.g. Smart City, Traffic AI" value={form.custom_tags} onChange={v => set("custom_tags", v)} hint="Free-form tags to help companies find you" />
          </FormSection>
        </>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <FormSection icon={Layers} title="Project Details" subtitle="Visible on your teaser" accent={C.blue}>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: C.blue, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Project Status <span style={{ color: "#ef4444" }}>*</span></label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
              {STATUS_OPTIONS.map(s => {
                const SIcon = s === "In Progress" ? Cpu : CheckCircle, sel = form.project_status === s;
                return <button type="button" key={s} onClick={() => set("project_status", s)} style={{ padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${sel ? C.blue : C.border2}`, background: sel ? C.blueTint : "transparent", color: sel ? C.blue : C.muted, fontWeight: sel ? 800 : 500, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.84rem", transition: "all 0.18s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}><SIcon size={14} />{s}</button>;
              })}
            </div>
          </div>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: C.blue, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 5, display: "block" }}>Looking For <span style={{ color: "#ef4444" }}>*</span></label>
          <p style={{ fontSize: "0.72rem", color: C.muted, margin: "0 0 10px" }}>Select everything that applies</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 9 }}>
            {LOOKING_FOR_OPTIONS.map(o => {
              const sel = form.looking_for.includes(o), LIcon = LOOKING_FOR_ICONS[o] || Briefcase;
              return <button type="button" key={o} onClick={() => set("looking_for", sel ? form.looking_for.filter(x => x !== o) : [...form.looking_for, o])} style={{ padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${sel ? C.green : C.border2}`, background: sel ? C.greenPale : "transparent", color: sel ? C.greenDark : C.muted, fontWeight: sel ? 800 : 500, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.84rem", transition: "all 0.18s", display: "flex", alignItems: "center", gap: 8 }}><LIcon size={14} />{o}{sel && <CheckCircle size={13} style={{ marginLeft: "auto" }} />}</button>;
            })}
          </div>
          {form.looking_for.length === 0 && <p style={{ fontSize: "0.73rem", color: "#ef4444", marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}><AlertTriangle size={12} /> Select at least one</p>}
        </FormSection>
      )}

      {/* ── Step 3 ── */}
      {step === 3 && (
        <>
          <Banner type="warning">Everything here is <strong>completely hidden</strong> from companies until you explicitly approve their request.</Banner>
          <FormSection icon={FileText} title="Detailed Description" subtitle="Private until you share" accent={C.blue}>
            <TInput label="Detailed Description" rows={5} placeholder="Architecture, methodology, what makes it unique…" value={form.detailed_description} onChange={v => set("detailed_description", v)} />
            <TInput label="Problem Statement" rows={3} placeholder="What problem does your project solve?" value={form.problem_statement} onChange={v => set("problem_statement", v)} />
            <TInput label="Proposed Solution" rows={3} placeholder="How does your project solve it?" value={form.proposed_solution} onChange={v => set("proposed_solution", v)} />
          </FormSection>
          <FormSection icon={Cpu} title="Technical Details" accent={C.blueMid}>
            <TInput label="Tech Stack Details" rows={4} placeholder="e.g. YOLOv8 on Raspberry Pi 4, LoRaWAN via Chirpstack v4…" value={form.tech_stack_details} onChange={v => set("tech_stack_details", v)} />
          </FormSection>
          <FormSection icon={Link2} title="Links" subtitle="Shared with approved companies only" accent={C.muted}>
            <TInput label="GitHub Repository" placeholder="https://github.com/username/repo" value={form.github_link} onChange={v => set("github_link", v)} hint="Shared only after approval" />
            <TInput label="Live Demo" placeholder="https://your-demo.vercel.app" value={form.demo_link} onChange={v => set("demo_link", v)} />
          </FormSection>
        </>
      )}

      {/* ── Step 4 ── */}
      {step === 4 && (
        <>
          <Banner type="info">A <strong>project poster is required</strong>. Videos and documents are private — only shared with companies you approve.</Banner>
          <FormSection icon={Image} title="Project Poster" subtitle="Required — shown as your project thumbnail" accent={C.blue}>
            <FileZone label="Click or drag to upload poster" accept="image/png,image/jpeg" hint="JPG or PNG · Max 10MB · Recommended 1200×800px" value={form.poster} onChange={v => set("poster", v)} />
          </FormSection>
          <FormSection icon={Video} title="Demo Video" subtitle="Optional — private until approved" accent={C.greenDark}>
            <FileZone label="Click or drag to upload demo video" accept="video/*" hint="MP4, MOV · Max 10MB" value={form.video} onChange={v => set("video", v)} />
          </FormSection>
          <FormSection icon={FileText} title="Project Document" subtitle="Optional — private until approved" accent={C.muted}>
            <FileZone label="Click or drag to upload document" accept=".pdf,.doc,.docx" hint="PDF, DOC · Max 10MB" value={form.document} onChange={v => set("document", v)} />
          </FormSection>
          {submitError && <Banner type="error">{submitError}</Banner>}
        </>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
        <div>
          {step > 1 && <Btn variant="ghost" size="sm" onClick={() => { setStep(s => s - 1); setSubmitError(null); }}><ArrowLeft size={13} /> Back</Btn>}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: "0.72rem", color: C.muted2 }}>{step} / {STEPS.length}</span>
          {step < 4
            ? <Btn variant="primary" size="sm" disabled={!canAdvance()} onClick={() => setStep(s => s + 1)}>Continue <ChevronRight size={13} /></Btn>
            : <Btn variant="green" size="sm" disabled={!form.poster || submitting} onClick={handlePost}>
                {submitting
                  ? <><span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Posting…</>
                  : <><Rocket size={13} /> Post Project</>
                }
              </Btn>
          }
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div onClick={e => e.target === e.currentTarget && setShowPreview(false)} style={{ position: "fixed", inset: 0, background: "rgba(7,18,32,0.72)", backdropFilter: "blur(6px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(3,62,102,0.3)", animation: "fadeUp 0.3s ease both" }}>
            <div style={{ background: C.blue, padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "18px 18px 0 0", position: "sticky", top: 0 }}>
              <div>
                <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", margin: "0 0 1px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Company Preview</p>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", margin: 0, fontWeight: 600 }}>What companies see before requesting access</p>
              </div>
              <button onClick={() => setShowPreview(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><XCircle size={15} color="#fff" /></button>
            </div>
            <div style={{ padding: "22px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: C.ink, margin: "0 0 10px", fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.3 }}>{form.title || <span style={{ color: C.muted2, fontStyle: "italic", fontWeight: 400 }}>No title yet</span>}</h2>
              {(form.tech_tags.length > 0 || form.industry_tags.length > 0) && (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {form.tech_tags.map(t => <Badge key={t} children={t} color={C.blueMid} />)}
                  {form.industry_tags.map(t => <Badge key={t} children={t} color={C.greenDark} bg={C.greenPale} />)}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: "0.74rem", color: C.muted }}>
                <Building2 size={11} /> University · <StatusDot status={form.project_status} />
              </div>
              <p style={{ fontSize: "0.86rem", color: C.text, lineHeight: 1.7, marginBottom: 14 }}>{form.short_description || <span style={{ color: C.muted2, fontStyle: "italic" }}>No description yet</span>}</p>
              {form.looking_for.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                  {form.looking_for.map(l => { const LIcon = LOOKING_FOR_ICONS[l] || Briefcase; return <span key={l} style={{ background: C.greenPale, color: C.greenDark, border: `1px solid rgba(122,170,28,0.3)`, fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 5 }}><LIcon size={10} />{l}</span>; })}
                </div>
              )}
              <div style={{ background: C.off, border: `1px dashed ${C.border2}`, borderRadius: 10, padding: 14, position: "relative", overflow: "hidden", marginBottom: 14 }}>
                <div style={{ fontSize: "0.8rem", lineHeight: 1.6, color: "transparent", textShadow: "0 0 6px rgba(90,116,145,0.5)", filter: "blur(4px)", userSelect: "none" }}>Full technical details, architecture, problem statement, proposed solution and all implementation notes are locked behind your approval.</div>
                <div style={{ position: "absolute", inset: 0, background: "rgba(247,248,250,0.85)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ background: C.blue, color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "8px 16px", borderRadius: 7, display: "flex", alignItems: "center", gap: 7 }}><Lock size={12} /> Full details locked — requires your approval</div>
                </div>
              </div>
              <div style={{ background: C.greenPale, border: `1px solid rgba(122,170,28,0.35)`, borderRadius: 9, padding: "11px 14px", fontSize: "0.78rem", color: C.greenDark, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={14} /> Your IP is protected. Companies must send a formal request first.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}