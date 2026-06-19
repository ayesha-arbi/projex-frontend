import { useState, useRef } from "react";
import { registerCompany } from '../services/api';
import { C, fonts } from '../assets/tokens.js';
import {
  Building2, Target, Search, ShieldCheck, Eye, EyeOff, Building,
  FileText, FolderOpen, Check, X, Loader2, Mail, Lock, Landmark,
  Clock, AlertTriangle, ArrowLeft, ArrowRight,
} from "lucide-react";
const logo = "./logo.png"

/* ─── FONTS ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${C.cream}; font-family: 'Inter', sans-serif; }
    @keyframes fadeUp  { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
    @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
    @keyframes slideIn { from { opacity:0; transform:translateX(24px) } to { opacity:1; transform:translateX(0) } }
    @keyframes spin    { to { transform: rotate(360deg) } }
  `}</style>
);

const error = "#dc2626";
const errorPale = "#fef2f2";
const amber = "#d97706";
const amberPale = "#fffbeb";

/* ─── DATA LISTS ─── */
const INDUSTRIES     = ["Technology","Finance","Healthcare","Education","E-Commerce","Telecom","Manufacturing","Media","Consulting","Other"];
const SIZES          = ["1–10 employees","11–50 employees","51–200 employees","201–500 employees","500+ employees"];
const CITIES         = ["Karachi","Lahore","Islamabad","Peshawar","Quetta","Multan","Faisalabad","Other"];
const LOOKING_FOR    = ["Hiring Interns","Full-Time Hiring","Project Collaboration","Investing / Funding","Mentoring Students","Beta Testing / Research"];
const TECH_CATS      = ["AI/ML","Web Development","Mobile Apps","IoT","Blockchain","Data Analytics","Cybersecurity","Cloud","AR/VR"];
const PREF_INDUSTRIES    = [...INDUSTRIES];
const UNIVERSITIES       = ["FAST-NU","LUMS","NUST","IBA","NED","COMSATS","UET","GIKI","Habib University","Other"];
const DOC_TYPES          = ["SECP Registration Certificate","NTN Certificate","Company Letterhead"];

/* ═══════════════════════════════════════════
   SHARED FIELD COMPONENTS
═══════════════════════════════════════════ */
function Label({ children, required }) {
  return (
    <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:C.text, marginBottom:6, letterSpacing:"0.01em", fontFamily:fonts.body }}>
      {children}{required && <span style={{ color:C.gold, marginLeft:3 }}>*</span>}
    </label>
  );
}

function Input({ label, required, error: err, hint, type="text", ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom:18 }}>
      {label && <Label required={required}>{label}</Label>}
      <input type={type}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          display:"block", width:"100%", padding:"11px 14px",
          fontSize:"0.9rem", fontFamily:fonts.body,
          background:C.white, color:C.text,
          border:`1.5px solid ${err?error:focus?C.gold:C.border}`,
          borderRadius:9, outline:"none", transition:"border-color 0.18s, box-shadow 0.18s",
          boxShadow: focus?`0 0 0 3px ${C.gold}18`:err?`0 0 0 3px ${error}12`:"none",
        }}
        {...props}
      />
      {hint && !err && <p style={{ fontSize:"0.75rem", color:C.muted, marginTop:5, fontFamily:fonts.body }}>{hint}</p>}
      {err && <p style={{ fontSize:"0.75rem", color:error, marginTop:5, fontFamily:fonts.body }}>⚠ {err}</p>}
    </div>
  );
}

function Select({ label, required, error: err, children, value, onChange }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom:18 }}>
      {label && <Label required={required}>{label}</Label>}
      <select value={value} onChange={onChange}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          display:"block", width:"100%", padding:"11px 14px",
          fontSize:"0.9rem", fontFamily:fonts.body,
          background:C.white,
          color: value ? C.text : C.muted2,
          border:`1.5px solid ${err?error:focus?C.gold:C.border}`,
          borderRadius:9, outline:"none", cursor:"pointer", appearance:"none",
          transition:"border-color 0.18s, box-shadow 0.18s",
          boxShadow: focus?`0 0 0 3px ${C.gold}18`:"none",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235F5E5A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center",
        }}
      >
        {children}
      </select>
      {err && <p style={{ fontSize:"0.75rem", color:error, marginTop:5, fontFamily:fonts.body }}>⚠ {err}</p>}
    </div>
  );
}

function Textarea({ label, required, error: err, maxChars, value, onChange, ...props }) {
  return (
    <div style={{ marginBottom:18 }}>
      {label && <Label required={required}>{label}</Label>}
      <div style={{ position:"relative" }}>
        <textarea value={value} onChange={onChange}
          style={{ display:"block", width:"100%", padding:"11px 14px", fontSize:"0.9rem", fontFamily:fonts.body, background:C.white, color:C.text, border:`1.5px solid ${err?error:C.border}`, borderRadius:9, outline:"none", resize:"vertical", minHeight:90, lineHeight:1.6, transition:"border-color 0.18s" }}
          onFocus={e => e.target.style.borderColor=C.gold}
          onBlur={e => e.target.style.borderColor=err?error:C.border}
          {...props}
        />
        {maxChars && (
          <span style={{ position:"absolute", bottom:10, right:12, fontSize:"0.72rem", color: value.length>maxChars*0.9?error:C.muted2, fontFamily:fonts.body }}>
            {value.length}/{maxChars}
          </span>
        )}
      </div>
      {err && <p style={{ fontSize:"0.75rem", color:error, marginTop:5, fontFamily:fonts.body }}>⚠ {err}</p>}
    </div>
  );
}

function MultiSelect({ label, required, options, selected, onChange, hint }) {
  return (
    <div style={{ marginBottom:18 }}>
      {label && <Label required={required}>{label}</Label>}
      {hint && <p style={{ fontSize:"0.75rem", color:C.muted, marginBottom:8, fontFamily:fonts.body }}>{hint}</p>}
      <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
        {options.map(opt => {
          const on = selected.includes(opt);
          return (
            <button key={opt} type="button"
              onClick={() => onChange(on ? selected.filter(s=>s!==opt) : [...selected, opt])}
              style={{
                padding:"6px 13px", borderRadius:20, fontSize:"0.78rem", fontWeight:600,
                border:`1.5px solid ${on?C.navy:C.border}`,
                background: on?C.navy:C.white, color: on?"#fff":C.muted,
                cursor:"pointer", transition:"all 0.15s",
                fontFamily:fonts.body, display:"inline-flex", alignItems:"center", gap:5,
              }}
            >{on && <Check size={12} strokeWidth={3} />}{opt}</button>
          );
        })}
      </div>
    </div>
  );
}

function LogoUpload({ onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [hov, setHov] = useState(false);
  const handle = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onChange(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ marginBottom:18 }}>
      <Label>Company Logo <span style={{ fontWeight:400, color:C.muted }}>(optional)</span></Label>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div onClick={() => inputRef.current.click()}
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
          style={{ width:64, height:64, borderRadius:10, background:C.cream, border:`2px dashed ${hov?C.gold:C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", flexShrink:0, transition:"border-color 0.2s" }}
        >
          {preview
            ? <img src="./logo.png" alt="logo" style={{ width:"100%", height:"100%", objectFit:"contain" }} />
            : <Building2 size={22} color={C.muted2} strokeWidth={1.6} />
          }
        </div>
        <div>
          <button type="button" onClick={() => inputRef.current.click()}
            style={{ fontSize:"0.82rem", fontWeight:600, color:C.navy, background:"transparent", border:`1.5px solid ${C.border}`, borderRadius:7, padding:"7px 14px", cursor:"pointer", fontFamily:fonts.body, transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=C.gold; e.currentTarget.style.background=C.cream; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background="transparent"; }}
          >{preview ? "Change Logo" : "Upload Logo"}</button>
          <p style={{ fontSize:"0.72rem", color:C.muted, marginTop:5, fontFamily:fonts.body }}>PNG, JPG, or SVG · Max 2MB</p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handle} />
      </div>
    </div>
  );
}

function DocUpload({ onChange, error: err }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [hov, setHov] = useState(false);
  const handle = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onChange(file);
    setFileName(file.name);
  };
  const borderColor = err ? error : fileName ? C.gold : hov ? C.gold : C.border;
  const bg = fileName ? C.goldPale : err ? errorPale : hov ? C.cream : C.white;
  return (
    <div style={{ marginBottom:18 }}>
      <Label required>Upload Document</Label>
      <div
        onClick={() => inputRef.current.click()}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          border:`2px dashed ${borderColor}`,
          borderRadius:10, padding:"24px 20px", textAlign:"center",
          cursor:"pointer", transition:"all 0.2s", background:bg,
        }}
      >
        <div style={{ display:"flex", justifyContent:"center", marginBottom:8 }}>
          {fileName ? <FileText size={26} color={C.gold} strokeWidth={1.6} /> : <FolderOpen size={26} color={C.muted2} strokeWidth={1.6} />}
        </div>
        {fileName
          ? <p style={{ fontSize:"0.84rem", fontWeight:600, color:"#7A5C25", fontFamily:fonts.body }}>{fileName}</p>
          : <>
              <p style={{ fontSize:"0.84rem", fontWeight:600, color:C.muted, marginBottom:4, fontFamily:fonts.body }}>Click to upload or drag & drop</p>
              <p style={{ fontSize:"0.75rem", color:C.muted2, fontFamily:fonts.body }}>PDF, JPG, or PNG · Max 5MB</p>
            </>
        }
      </div>
      {fileName && (
        <button type="button" onClick={() => { setFileName(null); onChange(null); }}
          style={{ fontSize:"0.74rem", color:error, background:"none", border:"none", cursor:"pointer", marginTop:6, fontFamily:fonts.body, display:"inline-flex", alignItems:"center", gap:4 }}
        ><X size={12} strokeWidth={2.2} /> Remove file</button>
      )}
      {err && <p style={{ fontSize:"0.75rem", color:error, marginTop:5, fontFamily:fonts.body }}>⚠ {err}</p>}
      <input ref={inputRef} type="file" accept=".pdf,image/*" style={{ display:"none" }} onChange={handle} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP INDICATOR
═══════════════════════════════════════════ */
function StepBar({ current, total, labels }) {
  return (
    <div style={{ marginBottom:32 }}>
      <div style={{ display:"flex", alignItems:"center" }}>
        {Array.from({ length: total }, (_, i) => {
          const done   = i < current;
          const active = i === current;
          const isLast = i === total - 1;
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", flex: isLast?"0 0 auto":1 }}>
              <div style={{
                width:30, height:30, borderRadius:"50%", flexShrink:0,
                background: done?C.gold:active?C.navy:C.white,
                border:`2px solid ${done?C.gold:active?C.navy:C.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"0.74rem", fontWeight:700,
                color: done?"#fff":active?"#fff":C.muted2,
                transition:"all 0.3s", zIndex:1,
                boxShadow: active?`0 0 0 4px ${C.navy}1a`:"none",
                fontFamily:fonts.body,
              }}>{done? <Check size={14} strokeWidth={3} /> :i+1}</div>
              {!isLast && <div style={{ flex:1, height:2, background: done?C.gold:C.border, transition:"background 0.4s", margin:"0 2px" }} />}
            </div>
          );
        })}
      </div>
      <div style={{ display:"flex", marginTop:8 }}>
        {labels.map((l, i) => (
          <div key={i} style={{ flex:1, textAlign: i===0?"left":i===total-1?"right":"center", fontSize:"0.67rem", fontWeight: i===current?700:500, color: i===current?C.navy:i<current?C.gold:C.muted2, fontFamily:fonts.body }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP PANELS
═══════════════════════════════════════════ */
function Step1({ data, setData, errors, onSwitchToLogin }) {
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)               s++;
    if (/[A-Z]/.test(pw))             s++;
    if (/[0-9]/.test(pw))             s++;
    if (/[^A-Za-z0-9]/.test(pw))      s++;
    return s;
  };
  const pw = data.password;
  const s  = strength(pw);
  const strengthLabel = ["","Weak","Fair","Good","Strong"][s];
  const strengthColor = ["",error,amber,C.navyMid || "#2563eb",C.gold][s];

  return (
    <div style={{ animation:"slideIn 0.35s ease both" }}>
      <div style={{ marginBottom:26 }}>
        <div style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.gold, marginBottom:6, fontFamily:fonts.body }}>Step 1 of 4</div>
        <h2 style={{ fontSize:"1.5rem", fontWeight:700, color:C.navy, letterSpacing:"-0.025em", marginBottom:6, fontFamily:fonts.display }}>Create your account</h2>
        <p style={{ fontSize:"0.86rem", color:C.muted, lineHeight:1.6, fontFamily:fonts.body }}>
          Start with your company name and email address.{" "}
          Already registered?{" "}
          <a href="#" onClick={e => { e.preventDefault(); onSwitchToLogin && onSwitchToLogin(); }}
            style={{ color:C.navy, fontWeight:700, textDecoration:"none" }}>Sign in →</a>
        </p>
      </div>

      <Input label="Company Name" required
        value={data.companyName} onChange={e => setData({...data, companyName:e.target.value})}
        placeholder="e.g. TechFarm Solutions Pvt. Ltd."
        error={errors.companyName}
      />
      <Input label="Work Email" required type="email"
        value={data.email} onChange={e => setData({...data, email:e.target.value})}
        placeholder="yourname@company.com"
        error={errors.email}
      />

      <div style={{ marginBottom:18 }}>
        <Label required>Password</Label>
        <div style={{ position:"relative" }}>
          <input type={showPass?"text":"password"}
            value={data.password}
            onChange={e => setData({...data, password:e.target.value})}
            placeholder="At least 8 characters"
            style={{ display:"block", width:"100%", padding:"11px 42px 11px 14px", fontSize:"0.9rem", fontFamily:fonts.body, background:C.white, color:C.text, border:`1.5px solid ${errors.password?error:C.border}`, borderRadius:9, outline:"none" }}
            onFocus={e => e.target.style.borderColor=C.gold}
            onBlur={e => e.target.style.borderColor=errors.password?error:C.border}
          />
          <button type="button" onClick={() => setShowPass(v=>!v)}
            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.muted, display:"flex" }}
          >{showPass? <EyeOff size={16} strokeWidth={1.7} /> : <Eye size={16} strokeWidth={1.7} />}</button>
        </div>
        {pw && (
          <div style={{ marginTop:6 }}>
            <div style={{ display:"flex", gap:3, marginBottom:4 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<=s ? strengthColor : C.border, transition:"background 0.2s" }} />
              ))}
            </div>
            <span style={{ fontSize:"0.73rem", color:strengthColor, fontWeight:600, fontFamily:fonts.body }}>{strengthLabel}</span>
          </div>
        )}
        {errors.password && <p style={{ fontSize:"0.75rem", color:error, marginTop:4, fontFamily:fonts.body }}>⚠ {errors.password}</p>}
      </div>

      <div style={{ marginBottom:18, position:"relative" }}>
        <Label required>Confirm Password</Label>
        <div style={{ position:"relative" }}>
          <input type={showConfirm?"text":"password"}
            value={data.confirmPassword}
            onChange={e => setData({...data, confirmPassword:e.target.value})}
            placeholder="Re-enter your password"
            style={{ display:"block", width:"100%", padding:"11px 42px 11px 14px", fontSize:"0.9rem", fontFamily:fonts.body, background:C.white, color:C.text, border:`1.5px solid ${errors.confirmPassword?error:C.border}`, borderRadius:9, outline:"none" }}
            onFocus={e => e.target.style.borderColor=C.gold}
            onBlur={e => e.target.style.borderColor=errors.confirmPassword?error:C.border}
          />
          <button type="button" onClick={() => setShowConfirm(v=>!v)}
            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.muted, display:"flex" }}
          >{showConfirm? <EyeOff size={16} strokeWidth={1.7} /> : <Eye size={16} strokeWidth={1.7} />}</button>
        </div>
        {errors.confirmPassword && <p style={{ fontSize:"0.75rem", color:error, marginTop:4, fontFamily:fonts.body }}>⚠ {errors.confirmPassword}</p>}
      </div>

      <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", marginTop:4 }}>
        <input type="checkbox" checked={data.terms} onChange={e => setData({...data, terms:e.target.checked})}
          style={{ marginTop:2, accentColor:C.navy, width:16, height:16, flexShrink:0 }} />
        <span style={{ fontSize:"0.8rem", color:C.muted, lineHeight:1.6, fontFamily:fonts.body }}>
          I agree to the <a href="#" style={{ color:C.navy, fontWeight:600 }}>Terms of Service</a> and{" "}
          <a href="#" style={{ color:C.navy, fontWeight:600 }}>Privacy Policy</a>
        </span>
      </label>
      {errors.terms && <p style={{ fontSize:"0.75rem", color:error, marginTop:4, fontFamily:fonts.body }}>⚠ {errors.terms}</p>}
    </div>
  );
}

function Step2({ data, setData, errors }) {
  return (
    <div style={{ animation:"slideIn 0.35s ease both" }}>
      <div style={{ marginBottom:26 }}>
        <div style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.gold, marginBottom:6, fontFamily:fonts.body }}>Step 2 of 4</div>
        <h2 style={{ fontSize:"1.5rem", fontWeight:700, color:C.navy, letterSpacing:"-0.025em", marginBottom:6, fontFamily:fonts.display }}>Company Profile</h2>
        <p style={{ fontSize:"0.86rem", color:C.muted, lineHeight:1.6, fontFamily:fonts.body }}>Tell students who you are. A complete profile gets 3× more responses from strong project teams.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Select label="Industry" required value={data.industry} onChange={e => setData({...data, industry:e.target.value})} error={errors.industry}>
          <option value="">Select industry</option>
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </Select>
        <Select label="Company Size" required value={data.size} onChange={e => setData({...data, size:e.target.value})} error={errors.size}>
          <option value="">Select size</option>
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      <Select label="City / Location" required value={data.city} onChange={e => setData({...data, city:e.target.value})} error={errors.city}>
        <option value="">Select city</option>
        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
      </Select>

      <Input
        label={<>Website <span style={{ fontWeight:400, color:C.muted }}>(optional)</span></>}
        value={data.website} onChange={e => setData({...data, website:e.target.value})}
        placeholder="https://yourcompany.com"
      />

      <LogoUpload onChange={f => setData({...data, logo:f})} />

      <Textarea
        label={<>Company Description <span style={{ fontWeight:400, color:C.muted }}>(optional)</span></>}
        value={data.description}
        onChange={e => { if (e.target.value.length <= 500) setData({...data, description:e.target.value}); }}
        maxChars={500}
        placeholder="Briefly describe what your company does, your culture, and what kind of projects or talent you're looking for..."
      />
    </div>
  );
}

function Step3({ data, setData, errors }) {
  return (
    <div style={{ animation:"slideIn 0.35s ease both" }}>
      <div style={{ marginBottom:26 }}>
        <div style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.gold, marginBottom:6, fontFamily:fonts.body }}>Step 3 of 4</div>
        <h2 style={{ fontSize:"1.5rem", fontWeight:700, color:C.navy, letterSpacing:"-0.025em", marginBottom:6, fontFamily:fonts.display }}>Interest Profile</h2>
        <p style={{ fontSize:"0.86rem", color:C.muted, lineHeight:1.6, fontFamily:fonts.body }}>Help us surface the right projects for you. The more specific you are, the better your matches.</p>
      </div>

      <MultiSelect label="What are you looking for?" required options={LOOKING_FOR} selected={data.lookingFor}
        onChange={s => setData({...data, lookingFor:s})}
        hint="Select all that apply. Students will see these when they review your interest request."
      />
      {errors.lookingFor && <p style={{ fontSize:"0.75rem", color:error, marginTop:-10, marginBottom:14, fontFamily:fonts.body }}>⚠ {errors.lookingFor}</p>}

      <div style={{ height:1, background:C.border, margin:"20px 0" }} />

      <MultiSelect
        label={<>Preferred Tech Categories <span style={{ fontWeight:400, color:C.muted }}>(optional)</span></>}
        options={TECH_CATS} selected={data.techCats}
        onChange={s => setData({...data, techCats:s})}
        hint="Filter project recommendations by technology domain."
      />

      <div style={{ height:1, background:C.border, margin:"20px 0" }} />

      <MultiSelect
        label={<>Preferred Project Industries <span style={{ fontWeight:400, color:C.muted }}>(optional)</span></>}
        options={PREF_INDUSTRIES} selected={data.prefIndustries}
        onChange={s => setData({...data, prefIndustries:s})}
        hint="Narrow your discovery feed to specific industry domains."
      />

      <div style={{ height:1, background:C.border, margin:"20px 0" }} />

      <MultiSelect
        label={<>Preferred Universities <span style={{ fontWeight:400, color:C.muted }}>(optional)</span></>}
        options={UNIVERSITIES} selected={data.prefUniversities}
        onChange={s => setData({...data, prefUniversities:s})}
        hint="Leave blank to browse projects from all universities."
      />
    </div>
  );
}

function Step4({ data, setData, errors }) {
  return (
    <div style={{ animation:"slideIn 0.35s ease both" }}>
      <div style={{ marginBottom:26 }}>
        <div style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.gold, marginBottom:6, fontFamily:fonts.body }}>Step 4 of 4</div>
        <h2 style={{ fontSize:"1.5rem", fontWeight:700, color:C.navy, letterSpacing:"-0.025em", marginBottom:6, fontFamily:fonts.display }}>Verification Document</h2>
        <p style={{ fontSize:"0.86rem", color:C.muted, lineHeight:1.6, fontFamily:fonts.body }}>We verify every company to protect our student community. Upload a government-issued or legal business document.</p>
      </div>

      <Select label="Document Type" required value={data.docType} onChange={e => setData({...data, docType:e.target.value})} error={errors.docType}>
        <option value="">Select document type</option>
        {DOC_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
      </Select>

      <DocUpload value={data.docFile} onChange={f => setData({...data, docFile:f})} error={errors.docFile} />

      <div style={{ display:"flex", gap:14, alignItems:"flex-start", background:amberPale, border:`1.5px solid #fde68a`, borderLeft:`4px solid ${amber}`, borderRadius:10, padding:"14px 16px", marginTop:8 }}>
        <AlertTriangle size={18} color={amber} strokeWidth={1.8} style={{ flexShrink:0, marginTop:1 }} />
        <div>
          <p style={{ fontSize:"0.82rem", fontWeight:700, color:"#92400e", marginBottom:4, fontFamily:fonts.body }}>Account Pending Review</p>
          <p style={{ fontSize:"0.8rem", color:"#b45309", lineHeight:1.65, fontFamily:fonts.body }}>
            Your account will be reviewed within <strong>1–2 business days</strong>. You can browse projects immediately, but you cannot contact students or send Interest Requests until your account is verified by our team.
          </p>
        </div>
      </div>

      <div style={{ marginTop:20, background:C.cream, border:`1px solid ${C.border}`, borderRadius:10, padding:"16px 18px" }}>
        <p style={{ fontSize:"0.78rem", fontWeight:700, color:C.navy, marginBottom:10, fontFamily:fonts.body }}>What happens after you submit?</p>
        {[
          [Mail, "You'll receive a confirmation email right away."],
          [Search, "Our team reviews your document within 1–2 days."],
          [Check, "Once verified, you can browse & contact student teams."],
        ].map(([Icon, text]) => (
          <div key={text} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:8 }}>
            <Icon size={15} color={C.navy} strokeWidth={1.8} style={{ flexShrink:0, marginTop:1 }} />
            <p style={{ fontSize:"0.79rem", color:C.navy, lineHeight:1.55, fontFamily:fonts.body }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuccessScreen({ companyName, onSwitchToLogin }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ textAlign:"center", padding:"20px 0 10px", animation:"fadeUp 0.5s ease both" }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:amberPale, border:`2px solid ${amber}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", boxShadow:`0 0 0 8px ${amber}18` }}>
        <Clock size={30} color={amber} strokeWidth={1.7} />
      </div>
      <h2 style={{ fontSize:"1.55rem", fontWeight:700, color:C.navy, marginBottom:10, letterSpacing:"-0.025em", fontFamily:fonts.display }}>Application submitted!</h2>
      <p style={{ fontSize:"0.88rem", color:C.muted, lineHeight:1.7, maxWidth:380, margin:"0 auto 16px", fontFamily:fonts.body }}>
        <strong style={{ color:C.text }}>{companyName}</strong> is now under review. You can already explore student projects while we verify your documents.
      </p>
      <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:amberPale, border:`1.5px solid #fde68a`, borderRadius:10, padding:"12px 20px", marginBottom:24 }}>
        <Clock size={14} color="#92400e" strokeWidth={2} />
        <p style={{ fontSize:"0.8rem", color:"#92400e", fontWeight:600, fontFamily:fonts.body }}>Verification usually takes 1–2 business days</p>
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
        <button
          onClick={() => onSwitchToLogin && onSwitchToLogin()}
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
          style={{ background:hov?C.gold:C.navy, color:"#fff", border:"none", borderRadius:50, padding:"13px 28px", fontSize:"0.92rem", fontWeight:600, cursor:"pointer", fontFamily:fonts.body, transition:"all 0.18s", display:"inline-flex", alignItems:"center", gap:8 }}
        >Sign In to Your Account <ArrowRight size={15} strokeWidth={2} /></button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   VALIDATION
═══════════════════════════════════════════ */
function validateStep(step, data) {
  const errs = {};
  if (step === 0) {
    if (!data.companyName.trim()) errs.companyName = "Company name is required";
    if (!data.email.trim()) errs.email = "Email is required";
    else if (!data.email.includes("@") || !data.email.includes(".")) errs.email = "Enter a valid email address";
    if (!data.password)                              errs.password = "Password is required";
    else if (data.password.length < 8)               errs.password = "At least 8 characters required";
    if (!data.confirmPassword)                       errs.confirmPassword = "Please confirm your password";
    else if (data.password !== data.confirmPassword)  errs.confirmPassword = "Passwords don't match";
    if (!data.terms) errs.terms = "You must agree to the Terms of Service";
  }
  if (step === 1) {
    if (!data.industry) errs.industry = "Select your industry";
    if (!data.size)     errs.size     = "Select your company size";
    if (!data.city)     errs.city     = "Select your city";
  }
  if (step === 2) {
    if (!data.lookingFor.length) errs.lookingFor = "Select at least one option";
  }
  if (step === 3) {
    if (!data.docType) errs.docType = "Select the document type";
    if (!data.docFile) errs.docFile = "Please upload your verification document";
  }
  return errs;
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function CompanyOnboarding({ onBack, onSwitchToLogin }) {
  const [step, setStep]             = useState(0);
  const [errors, setErrors]         = useState({});
  const [done, setDone]             = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [backHov, setBackHov]       = useState(false);
  const [nextHov, setNextHov]       = useState(false);

  const [data, setData] = useState({
    companyName:"", email:"", password:"", confirmPassword:"", terms:false,
    industry:"", size:"", city:"", website:"", logo:null, description:"",
    lookingFor:[], techCats:[], prefIndustries:[], prefUniversities:[],
    docType:"", docFile:null,
  });

  const STEPS  = ["Account","Profile","Interests","Verify"];
  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (isLast) { handleSubmit(); return; }
    const errs = validateStep(step, data);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const back = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = async () => {
    const errs = validateStep(3, data);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('company_name',          data.companyName);
      formData.append('email',                 data.email);
      formData.append('password',              data.password);
      formData.append('industry',              data.industry);
      formData.append('company_size',          data.size);
      formData.append('city',                  data.city);
      formData.append('looking_for',           data.lookingFor.join(', '));
      formData.append('verification_doc_type', data.docType);
      formData.append('docFile',               data.docFile);
      if (data.website)                formData.append('website',                 data.website);
      if (data.description)            formData.append('description',             data.description);
      if (data.logo)                   formData.append('logo',                    data.logo);
      if (data.techCats.length)        formData.append('preferred_tech',          data.techCats.join(', '));
      if (data.prefIndustries.length)  formData.append('preferred_industry',      data.prefIndustries.join(', '));
      if (data.prefUniversities.length)formData.append('preferred_universities',  data.prefUniversities.join(', '));

      await registerCompany(formData);
      setDone(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Try again.';
      if (msg.includes('already registered')) {
        setStep(0);
        setErrors({ email: 'This email is already registered.' });
      } else if (msg.includes('work email')) {
        setStep(0);
        setErrors({ email: msg });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const panels = [
    { Icon: Building2,   title:"Built for serious companies", body:"Projex.pk is invitation-and-verification based. Only vetted companies can contact students — keeping your talent pipeline clean and trustworthy." },
    { Icon: Target,       title:"Get matched instantly", body:"A complete company profile gets 3× more project responses. Students choose who they talk to — make your profile count." },
    { Icon: Search,       title:"Precision discovery", body:"Set your interests once and let our matching engine surface relevant final-year projects from Pakistan's top universities — daily." },
    { Icon: ShieldCheck,  title:"Why we verify companies", body:"Student IP is protected on this platform. Verification ensures that only legitimate businesses gain full platform access. It keeps everyone safe." },
  ];
  const p = panels[Math.min(step, panels.length-1)];

  return (
    <>
      <FontLoader />
      <div style={{ minHeight:"100vh", display:"flex", background:C.cream }}>

        {/* ── Left Panel ── */}
        <div style={{ width:380, flexShrink:0, background:C.navy, display:"flex", flexDirection:"column", padding:"48px 40px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-80, right:-60, width:320, height:320, borderRadius:"50%", background:`${C.gold}14`, pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-60, left:-40, width:220, height:220, borderRadius:"50%", background:`${C.gold}0d`, pointerEvents:"none" }} />
          <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`, backgroundSize:"22px 22px", pointerEvents:"none" }} />

          <a href="#" onClick={e => { e.preventDefault(); onBack && onBack(); }}
            style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none", marginBottom:56, position:"relative", zIndex:1 }}
          >
            <div style={{ width:32, height:32, background:"rgba(255,255,255,0.12)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", bottom:0, right:0, width:12, height:12, background:C.gold, borderRadius:"4px 0 0 0" }} />
              <span style={{ fontSize:"0.7rem", fontWeight:800, color:"#fff", zIndex:1, fontFamily:fonts.display }}>Px</span>
            </div>
            <span style={{ fontSize:"1.1rem", fontWeight:700, color:"#fff", letterSpacing:"-0.03em", fontFamily:fonts.display }}>
              Projex<span style={{ color:C.gold }}>.pk</span>
            </span>
          </a>

          <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", position:"relative", zIndex:1 }}>
            <div key={step} style={{ animation:"fadeIn 0.4s ease both" }}>
              <div style={{ width:56, height:56, borderRadius:14, background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
                <p.Icon size={28} color={C.gold} strokeWidth={1.6} />
              </div>
              <h3 style={{ fontSize:"1.35rem", fontWeight:700, color:"#fff", letterSpacing:"-0.025em", marginBottom:10, lineHeight:1.2, fontFamily:fonts.display }}>{p.title}</h3>
              <p style={{ fontSize:"0.86rem", color:"rgba(255,255,255,0.48)", lineHeight:1.75, fontFamily:fonts.body }}>{p.body}</p>
            </div>

            <div style={{ display:"flex", gap:6, marginTop:40 }}>
              {STEPS.map((_,i) => (
                <div key={i} style={{ width: i===step?20:6, height:6, borderRadius:3, background: i===step?C.gold:i<step?`${C.gold}59`:"rgba(255,255,255,0.15)", transition:"all 0.3s" }} />
              ))}
            </div>

            <div style={{ marginTop:36, display:"flex", flexDirection:"column", gap:10 }}>
              {[
                [Lock, "All data encrypted in transit"],
                [Check, "Verified companies only"],
                [Landmark, "Trusted by 6 Karachi universities"],
              ].map(([Icon, t]) => (
                <div key={t} style={{ fontSize:"0.74rem", color:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", gap:8, fontFamily:fonts.body }}>
                  <Icon size={13} strokeWidth={1.8} /> {t}
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize:"0.74rem", color:"rgba(255,255,255,0.2)", position:"relative", zIndex:1, marginTop:32, fontFamily:fonts.body }}>
            <a href="#" onClick={e => { e.preventDefault(); onBack && onBack(); }}
              style={{ color:"rgba(255,255,255,0.3)", fontWeight:500, textDecoration:"none" }}>← Back to home</a>
            {"  ·  "}
            Already registered?{" "}
            <a href="#" onClick={e => { e.preventDefault(); onSwitchToLogin && onSwitchToLogin(); }}
              style={{ color:C.gold, fontWeight:600, textDecoration:"none" }}>Sign in</a>
          </p>
        </div>

        {/* ── Right Form Panel ── */}
        <div style={{ flex:1, overflowY:"auto", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"48px 40px" }}>
          <div style={{ width:"100%", maxWidth:540 }}>
            <StepBar current={step} total={STEPS.length} labels={STEPS} />

            <div style={{ background:C.white, borderRadius:16, padding:"36px 36px", border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(12,35,64,0.06)" }}>
              {done
                ? <SuccessScreen companyName={data.companyName} onSwitchToLogin={onSwitchToLogin} />
                : <>
                    {step === 0 && <Step1 data={data} setData={setData} errors={errors} onSwitchToLogin={onSwitchToLogin} />}
                    {step === 1 && <Step2 data={data} setData={setData} errors={errors} />}
                    {step === 2 && <Step3 data={data} setData={setData} errors={errors} />}
                    {step === 3 && <Step4 data={data} setData={setData} errors={errors} />}

                    {errors.general && (
                      <div style={{ background:errorPale, border:"1px solid #fecaca", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:"0.82rem", color:error, fontWeight:600, fontFamily:fonts.body }}>
                        ⚠ {errors.general}
                      </div>
                    )}

                    <div style={{ display:"flex", gap:12, marginTop:28, paddingTop:24, borderTop:`1px solid ${C.border}` }}>
                      {step > 0 && (
                        <button type="button" onClick={back}
                          onMouseEnter={() => setBackHov(true)} onMouseLeave={() => setBackHov(false)}
                          style={{ flex:1, padding:"12px", borderRadius:50, fontSize:"0.9rem", fontWeight:600, cursor:"pointer", border:`1.5px solid ${backHov?C.gold:C.border}`, color:C.navy, background:backHov?C.cream:"transparent", transition:"all 0.18s", fontFamily:fonts.body, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
                        ><ArrowLeft size={15} strokeWidth={2} /> Back</button>
                      )}
                      <button type="button" onClick={next} disabled={submitting}
                        onMouseEnter={() => setNextHov(true)} onMouseLeave={() => setNextHov(false)}
                        style={{ flex:2, padding:"13px", borderRadius:50, fontSize:"0.9rem", fontWeight:600, cursor: submitting?"wait":"pointer", border:"none", background: submitting?C.disabledText:nextHov?C.gold:C.navy, color:"#fff", transition:"all 0.18s", fontFamily:fonts.body, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
                      >
                        {submitting
                          ? <><Loader2 size={15} style={{ animation:"spin 0.7s linear infinite" }} /> Submitting...</>
                          : isLast ? <>Submit Application <Building2 size={16} strokeWidth={2} /></> : <>Continue <ArrowRight size={15} strokeWidth={2} /></>
                        }
                      </button>
                    </div>
                  </>
              }
            </div>

            {step === 0 && !done && (
              <p style={{ textAlign:"center", fontSize:"0.78rem", color:C.muted, marginTop:20, fontFamily:fonts.body }}>
                Already have an account?{" "}
                <a href="#" onClick={e => { e.preventDefault(); onSwitchToLogin && onSwitchToLogin(); }}
                  style={{ color:C.navy, fontWeight:700, textDecoration:"none" }}>Sign in here</a>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}