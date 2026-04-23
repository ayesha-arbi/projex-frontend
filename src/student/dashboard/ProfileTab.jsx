import { useState, useEffect } from "react";
import {
  Edit2, XCircle, CheckCircle,
  GraduationCap, MapPin, Mail, BookOpen,
  Camera, Link, Cpu, Building2, Calendar,
  Award, User,
} from "lucide-react";
import { C } from "../../assets/tokens";

/* ── Mini components ── */
function Btn({ children, variant = "primary", size = "sm", onClick, disabled = false, style: ex = {} }) {
  const [hov, setHov] = useState(false);
  const pad = size === "lg" ? "13px 26px" : "8px 16px";
  const fs  = size === "lg" ? "0.9rem" : "0.8rem";
  const base = { display:"inline-flex", alignItems:"center", gap:6, borderRadius:8, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, cursor:disabled?"not-allowed":"pointer", border:"none", whiteSpace:"nowrap", padding:pad, fontSize:fs, transition:"all 0.18s", opacity:disabled?0.45:1 };
  const v = {
    primary: { background:hov?C.blueMid:C.blue, color:"#fff", boxShadow:hov?"0 6px 18px rgba(3,62,102,0.25)":"none", transform:hov?"translateY(-1px)":"none" },
    ghost:   { background:hov?C.blueTint:"transparent", border:`1.5px solid ${hov?C.blue:C.border2}`, color:C.blue },
    green:   { background:hov?"#b8e047":C.green, color:C.blue, boxShadow:hov?"0 6px 18px rgba(163,207,62,0.3)":"none" },
  };
  return <button disabled={disabled} style={{ ...base, ...v[variant], ...ex }} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}>{children}</button>;
}

function Badge({ children, color = C.blue }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:"0.67rem", fontWeight:700, padding:"3px 9px", borderRadius:20, background:`${color}15`, color, border:`1px solid ${color}25`, whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}

/* ── Bento card wrapper ── */
function BentoCard({ children, style: s = {}, accent }) {
  return (
    <div style={{
      background:C.white,
      border:`1px solid ${C.border}`,
      borderRadius:16,
      overflow:"hidden",
      position:"relative",
      ...(accent ? { borderTop:`3px solid ${accent}` } : {}),
      ...s,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, icon: Icon, accent = C.blue }) {
  return (
    <div style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}`, background:C.off, display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ width:26, height:26, borderRadius:7, background:`${accent}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon size={13} color={accent} strokeWidth={2.2}/>
      </div>
      <h3 style={{ fontSize:"0.84rem", fontWeight:800, color:C.ink, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{title}</h3>
    </div>
  );
}

function InfoRow({ label, value, editing, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
      <span style={{ fontSize:"0.7rem", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", width:110, flexShrink:0 }}>{label}</span>
      {editing ? (
        <input defaultValue={value} onChange={e=>onChange?.(e.target.value)}
          style={{ flex:1, padding:"5px 8px", border:`1.5px solid ${C.border2}`, borderRadius:7, fontSize:"0.83rem", fontFamily:"'Plus Jakarta Sans',sans-serif", color:C.text, outline:"none", background:C.white }}
          onFocus={e=>e.target.style.borderColor=C.blue}
          onBlur={e=>e.target.style.borderColor=C.border2}
        />
      ) : (
        <span style={{ flex:1, fontSize:"0.84rem", color:value?C.text:C.muted2, fontStyle:value?"normal":"italic" }}>{value||"Not set"}</span>
      )}
    </div>
  );
}

function calcPct(form) {
  const fields = ["full_name","university_name","degree_program","major","current_semester","graduation_semester","city","linkedin_url","bio","skills"];
  return Math.round(fields.filter(k=>form[k]?.trim()).length / fields.length * 100);
}

/* ══════════════════════════════════════════
   PROFILE TAB — Bento Grid Layout
══════════════════════════════════════════ */
export default function ProfileTab() {
  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Re-read localStorage when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setRefreshKey(k => k + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  let raw = {};
  try { raw = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}

  const [form, setForm] = useState({
    full_name:           raw.full_name           || "",
    university_name:     raw.university_name     || "",
    degree_program:      raw.degree_program      || "",
    major:               raw.major               || "",
    current_semester:    String(raw.current_semester || ""),
    graduation_semester: raw.graduation_semester || "",
    city:                raw.city                || "",
    linkedin_url:        raw.linkedin_url        || "",
    bio:                 raw.bio                 || "",
    skills:              raw.skills              || "",
  });

  // Sync form with localStorage when refreshKey changes (tab switch back)
  useEffect(() => {
    let fresh = {};
    try { fresh = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}
    setForm({
      full_name:           fresh.full_name           || "",
      university_name:     fresh.university_name     || "",
      degree_program:      fresh.degree_program      || "",
      major:               fresh.major               || "",
      current_semester:    String(fresh.current_semester || ""),
      graduation_semester: fresh.graduation_semester || "",
      city:                fresh.city                || "",
      linkedin_url:        fresh.linkedin_url        || "",
      bio:                 fresh.bio                 || "",
      skills:              fresh.skills              || "",
    });
  }, [refreshKey]);

  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const pct  = calcPct(form);
  const initials = form.full_name.split(" ").slice(0,2).map(n=>n[0]?.toUpperCase()).join("") || "ST";

  const handleSave = () => {
    // TODO: PATCH /students/profile
    setSaved(true); setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ padding:"32px 48px 48px", width:"100%", boxSizing:"border-box", animation:"fadeUp 0.3s ease both" }}>

      {/* ── Page header ── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:"1.1rem", fontWeight:800, color:C.ink, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Profile</h2>
          <p style={{ fontSize:"0.78rem", color:C.muted, margin:"3px 0 0" }}>Your public student profile visible to companies</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {editing ? (
            <>
              <Btn variant="ghost"   size="sm" onClick={()=>setEditing(false)}><XCircle size={13}/> Cancel</Btn>
              <Btn variant="primary" size="sm" onClick={handleSave}><CheckCircle size={13}/> Save Changes</Btn>
            </>
          ) : (
            <Btn variant="ghost" size="sm" onClick={()=>setEditing(true)}><Edit2 size={13}/> Edit Profile</Btn>
          )}
        </div>
      </div>

      {/* ── Saved toast ── */}
      {saved && (
        <div style={{ background:C.greenPale, border:`1px solid rgba(122,170,28,0.35)`, borderRadius:10, padding:"10px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:8, fontSize:"0.82rem", color:C.greenDark, fontWeight:600, animation:"fadeUp 0.3s ease both" }}>
          <CheckCircle size={14}/> Profile updated successfully.
        </div>
      )}

      {/* ══════════════════════════════════════════
          BENTO GRID
          Row 1: [Hero card — 2 cols] [Completeness — 1 col]
          Row 2: [Academic — 1 col]   [Bio — 1 col]           [Skills — 1 col]
          Row 3: [Links — full width]
      ══════════════════════════════════════════ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>

        {/* ── Hero card (spans 2 cols) ── */}
        <BentoCard style={{ gridColumn:"span 2", padding:"24px" }} accent={C.blue}>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>

            {/* Avatar */}
            <div style={{ position:"relative", flexShrink:0 }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg,${C.blue},${C.blueMid})`, border:`3px solid ${C.green}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", fontWeight:800, color:"#fff", letterSpacing:"-1px", boxShadow:`0 0 0 4px ${C.green}30` }}>
                {initials}
              </div>
              {editing && (
                <button style={{ position:"absolute", bottom:0, right:0, width:24, height:24, borderRadius:"50%", background:C.blue, border:`2px solid ${C.white}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(3,62,102,0.3)" }}>
                  <Camera size={11} color="#fff"/>
                </button>
              )}
            </div>

            {/* Name, email, badges */}
            <div style={{ flex:1, minWidth:0 }}>
              {editing ? (
                <input value={form.full_name} onChange={e=>set("full_name",e.target.value)}
                  style={{ fontSize:"1.2rem", fontWeight:800, color:C.ink, fontFamily:"'Plus Jakarta Sans',sans-serif", border:`1.5px solid ${C.border2}`, borderRadius:8, padding:"6px 10px", outline:"none", width:"100%", marginBottom:8, background:C.white, boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor=C.blue}
                  onBlur={e=>e.target.style.borderColor=C.border2}
                />
              ) : (
                <h3 style={{ fontSize:"1.2rem", fontWeight:800, color:C.ink, margin:"0 0 5px", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  {form.full_name || "Your Name"}
                </h3>
              )}
              <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"0.78rem", color:C.muted, marginBottom:10 }}>
                <Mail size={12} color={C.muted}/>
                {raw.email || "email@university.edu.pk"}
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <Badge color={C.blue}><GraduationCap size={10}/>Student</Badge>
                {form.degree_program && <Badge color={C.blueMid}><Cpu size={10}/>{form.degree_program.replace("BS ","")}</Badge>}
                {form.city && <Badge color={C.muted}><MapPin size={10}/>{form.city}</Badge>}
                {form.university_name && <Badge color={C.muted}><Building2 size={10}/>{form.university_name.split(" ").slice(0,2).join(" ")}</Badge>}
              </div>
            </div>
          </div>
        </BentoCard>

        {/* ── Completeness card (1 col) ── */}
        <BentoCard style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 20px", textAlign:"center" }} accent={C.green}>
          {/* Circular progress */}
          <div style={{ position:"relative", width:80, height:80, marginBottom:12 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke={C.border} strokeWidth="6"/>
              <circle cx="40" cy="40" r="34" fill="none" stroke={C.green} strokeWidth="6"
                strokeDasharray={`${2*Math.PI*34}`}
                strokeDashoffset={`${2*Math.PI*34*(1-pct/100)}`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                style={{ transition:"stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:"1.1rem", fontWeight:800, color:C.ink, lineHeight:1, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{pct}%</span>
            </div>
          </div>
          <div style={{ fontSize:"0.82rem", fontWeight:700, color:C.text, marginBottom:4 }}>Profile Complete</div>
          <div style={{ fontSize:"0.72rem", color:C.muted, lineHeight:1.5 }}>
            {pct < 100 ? `${10 - Math.round(pct/10)} fields missing` : "All fields filled!"}
          </div>
          {pct < 100 && !editing && (
            <button onClick={()=>setEditing(true)} style={{ marginTop:12, fontSize:"0.72rem", fontWeight:700, color:C.blue, background:C.blueTint, border:`1px solid ${C.border2}`, borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              Complete Profile
            </button>
          )}
        </BentoCard>

        {/* ── Academic Info (1 col) ── */}
        <BentoCard>
          <CardHeader title="Academic Info" icon={Building2} accent={C.blue}/>
          <div style={{ padding:"14px 18px" }}>
            <InfoRow label="University"  value={form.university_name}     editing={editing} onChange={v=>set("university_name",v)}/>
            <InfoRow label="Degree"      value={form.degree_program}      editing={editing} onChange={v=>set("degree_program",v)}/>
            <InfoRow label="Major"       value={form.major}               editing={editing} onChange={v=>set("major",v)}/>
            <InfoRow label="Semester"    value={form.current_semester ? `${form.current_semester} Sem` : ""} editing={editing} onChange={v=>set("current_semester",v)}/>
            <InfoRow label="Graduating"  value={form.graduation_semester} editing={editing} onChange={v=>set("graduation_semester",v)}/>
            <InfoRow label="City"        value={form.city}                editing={editing} onChange={v=>set("city",v)}/>
          </div>
        </BentoCard>

        {/* ── Bio (1 col) ── */}
        <BentoCard>
          <CardHeader title="Bio" icon={User} accent={C.greenDark}/>
          <div style={{ padding:"14px 18px" }}>
            {editing ? (
              <div style={{ position:"relative" }}>
                <textarea rows={6} value={form.bio}
                  onChange={e=>{ if(e.target.value.length<=300) set("bio",e.target.value); }}
                  placeholder="Tell companies about yourself, your interests, and what makes your work stand out…"
                  style={{ width:"100%", boxSizing:"border-box", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${C.border2}`, fontSize:"0.84rem", fontFamily:"'Plus Jakarta Sans',sans-serif", color:C.text, background:C.white, outline:"none", resize:"none", lineHeight:1.65 }}
                  onFocus={e=>e.target.style.borderColor=C.blue}
                  onBlur={e=>e.target.style.borderColor=C.border2}
                />
                <span style={{ position:"absolute", bottom:10, right:10, fontSize:"0.66rem", color:form.bio.length>270?C.error:C.muted2 }}>{form.bio.length}/300</span>
              </div>
            ) : (
              <p style={{ fontSize:"0.84rem", color:form.bio?C.text:C.muted2, lineHeight:1.75, margin:0, fontStyle:form.bio?"normal":"italic", minHeight:80 }}>
                {form.bio || "No bio yet. Click Edit Profile to add one."}
              </p>
            )}
          </div>
        </BentoCard>

        {/* ── Skills (1 col) ── */}
        <BentoCard>
          <CardHeader title="Skills" icon={Award} accent={C.blueMid}/>
          <div style={{ padding:"14px 18px" }}>
            {editing ? (
              <div>
                <input value={form.skills} onChange={e=>set("skills",e.target.value)}
                  placeholder="e.g. Python, React, Machine Learning"
                  style={{ width:"100%", boxSizing:"border-box", padding:"9px 12px", borderRadius:9, border:`1.5px solid ${C.border2}`, fontSize:"0.84rem", fontFamily:"'Plus Jakarta Sans',sans-serif", color:C.text, background:C.white, outline:"none", marginBottom:8 }}
                  onFocus={e=>e.target.style.borderColor=C.blue}
                  onBlur={e=>e.target.style.borderColor=C.border2}
                />
                <p style={{ fontSize:"0.7rem", color:C.muted, margin:0 }}>Separate with commas</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {form.skills
                  ? form.skills.split(",").map(s=>s.trim()).filter(Boolean).map(sk=>(
                      <Badge key={sk} color={C.blueMid}><BookOpen size={9}/>{sk}</Badge>
                    ))
                  : <p style={{ fontSize:"0.82rem", color:C.muted2, fontStyle:"italic", margin:0 }}>No skills added yet.</p>
                }
              </div>
            )}
          </div>
        </BentoCard>

        {/* ── Links (full width) ── */}
        <BentoCard style={{ gridColumn:"span 3" }}>
          <CardHeader title="Links" icon={Link} accent={C.muted}/>
          <div style={{ padding:"14px 18px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <label style={{ fontSize:"0.7rem", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>LinkedIn</label>
              {editing ? (
                <input defaultValue={form.linkedin_url} onChange={e=>set("linkedin_url",e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  style={{ width:"100%", boxSizing:"border-box", padding:"9px 12px", borderRadius:9, border:`1.5px solid ${C.border2}`, fontSize:"0.84rem", fontFamily:"'Plus Jakarta Sans',sans-serif", color:C.text, background:C.white, outline:"none" }}
                  onFocus={e=>e.target.style.borderColor=C.blue}
                  onBlur={e=>e.target.style.borderColor=C.border2}
                />
              ) : (
                <p style={{ fontSize:"0.84rem", color:form.linkedin_url?C.blue:C.muted2, fontStyle:form.linkedin_url?"normal":"italic", margin:0 }}>
                  {form.linkedin_url || "Not added"}
                </p>
              )}
            </div>
            <div>
              <label style={{ fontSize:"0.7rem", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Graduation</label>
              <p style={{ fontSize:"0.84rem", color:form.graduation_semester?C.text:C.muted2, fontStyle:form.graduation_semester?"normal":"italic", margin:0, display:"flex", alignItems:"center", gap:6 }}>
                <Calendar size={13} color={C.muted}/>
                {form.graduation_semester || "Not set"}
              </p>
            </div>
          </div>
        </BentoCard>

      </div>
    </div>
  );
}