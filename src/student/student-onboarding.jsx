import { useState, useRef } from "react";
import { registerStudent, loginStudent } from '../services/api';
import { C, fonts } from '../assets/tokens.js';
import {
  GraduationCap, Building2, Sparkles, Eye, EyeOff, Camera,
  Check, Loader2, Lock, Mail, Landmark, ArrowLeft, ArrowRight,
} from "lucide-react";

/* ─── FONTS ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${C.cream}; font-family: 'Inter', sans-serif; }
    @keyframes fadeUp   { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
    @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
    @keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
    @keyframes slideIn  { from { opacity:0; transform:translateX(24px) } to { opacity:1; transform:translateX(0) } }
    @keyframes slideOut { from { opacity:1; transform:translateX(0) } to { opacity:0; transform:translateX(-24px) } }
    @keyframes spin     { to { transform: rotate(360deg) } }
    input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px ${C.cream} inset !important; }
  `}</style>
);

const error = "#dc2626";
const errorPale = "#fef2f2";

/* ─── SKILLS for multi-select ─── */
const SKILLS_LIST = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js", "Flutter", "Swift", "Kotlin",
  "Java", "C++", "C#", "PHP", "Go", "Rust", "SQL", "MongoDB", "PostgreSQL", "Firebase",
  "Machine Learning", "Deep Learning", "Computer Vision", "NLP", "Data Analysis",
  "Arduino", "Raspberry Pi", "IoT", "Embedded Systems", "PCB Design", "MATLAB",
  "UI/UX Design", "Figma", "Adobe XD", "AutoCAD", "SolidWorks", "3D Printing",
  "Blockchain", "Smart Contracts", "Cybersecurity", "Cloud (AWS)", "Cloud (GCP)", "Docker",
  "Business Analysis", "Product Management", "Digital Marketing", "Finance",
];

const UNIVERSITIES = [
  "NED University", "FAST-NU Karachi", "FAST-NU Lahore", "FAST-NU Islamabad", "FAST-NU Peshawar",
  "IBA Karachi", "LUMS", "NUST", "UET Lahore", "UET Peshawar", "COMSATS",
  "University of Karachi", "Habib University", "Dawood University", "Mehran University",
  "GIKI", "Air University", "Bahria University", "PAF-IAST", "Other",
];

const DEGREES = [
  "BS Computer Science", "BS Software Engineering", "BS Artificial Intelligence",
  "BS Data Science", "BS Electrical Engineering", "BS Electronics Engineering",
  "BS Mechanical Engineering", "BS Civil Engineering", "BS Business Administration",
  "BS Accounting & Finance", "BBA", "BS Economics", "BS Mathematics", "Other",
];

/* ═══════════════════════════════════════════
   REUSABLE FIELD COMPONENTS
═══════════════════════════════════════════ */
function Label({ children, required }) {
  return (
    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: C.text, marginBottom: 6, letterSpacing: "0.01em", fontFamily: fonts.body }}>
      {children}
      {required && <span style={{ color: C.gold, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function Input({ label, required, error: err, hint, type = "text", ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <Label required={required}>{label}</Label>}
      <input
        type={type}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          display: "block", width: "100%",
          padding: "11px 14px", fontSize: "0.9rem",
          fontFamily: fonts.body,
          background: C.white, color: C.text,
          border: `1.5px solid ${err ? error : focus ? C.gold : C.border}`,
          borderRadius: 9, outline: "none",
          transition: "border-color 0.18s, box-shadow 0.18s",
          boxShadow: focus ? `0 0 0 3px ${C.gold}18` : err ? `0 0 0 3px ${error}12` : "none",
        }}
        {...props}
      />
      {hint && !err && <p style={{ fontSize: "0.75rem", color: C.muted, marginTop: 5, fontFamily: fonts.body }}>{hint}</p>}
      {err && <p style={{ fontSize: "0.75rem", color: error, marginTop: 5, display: "flex", alignItems: "center", gap: 4, fontFamily: fonts.body }}>⚠ {err}</p>}
    </div>
  );
}

function Select({ label, required, error: err, children, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <Label required={required}>{label}</Label>}
      <select
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          display: "block", width: "100%",
          padding: "11px 14px", fontSize: "0.9rem",
          fontFamily: fonts.body,
          background: C.white, color: C.text,
          border: `1.5px solid ${err ? error : focus ? C.gold : C.border}`,
          borderRadius: 9, outline: "none", cursor: "pointer",
          transition: "border-color 0.18s, box-shadow 0.18s",
          boxShadow: focus ? `0 0 0 3px ${C.gold}18` : "none",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235F5E5A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
        }}
        {...props}
      >
        {children}
      </select>
      {err && <p style={{ fontSize: "0.75rem", color: error, marginTop: 5, fontFamily: fonts.body }}>⚠ {err}</p>}
    </div>
  );
}

function Textarea({ label, required, error: err, maxChars, value, onChange, ...props }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <Label required={required}>{label}</Label>}
      <div style={{ position: "relative" }}>
        <textarea
          value={value}
          onChange={onChange}
          style={{
            display: "block", width: "100%",
            padding: "11px 14px", fontSize: "0.9rem",
            fontFamily: fonts.body,
            background: C.white, color: C.text,
            border: `1.5px solid ${err ? error : C.border}`,
            borderRadius: 9, outline: "none", resize: "vertical",
            minHeight: 100, lineHeight: 1.6,
            transition: "border-color 0.18s",
          }}
          onFocus={e => e.target.style.borderColor = C.gold}
          onBlur={e => e.target.style.borderColor = err ? error : C.border}
          {...props}
        />
        {maxChars && (
          <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: "0.72rem", color: value.length > maxChars * 0.9 ? error : C.muted2, fontFamily: fonts.body }}>
            {value.length}/{maxChars}
          </span>
        )}
      </div>
      {err && <p style={{ fontSize: "0.75rem", color: error, marginTop: 5, fontFamily: fonts.body }}>⚠ {err}</p>}
    </div>
  );
}

function MultiSelect({ label, required, options, selected, onChange, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <Label required={required}>{label}</Label>}
      {hint && <p style={{ fontSize: "0.75rem", color: C.muted, marginBottom: 8, fontFamily: fonts.body }}>{hint}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {options.map(opt => {
          const on = selected.includes(opt);
          return (
            <button key={opt} type="button"
              onClick={() => onChange(on ? selected.filter(s => s !== opt) : [...selected, opt])}
              style={{
                padding: "6px 13px", borderRadius: 20,
                fontSize: "0.78rem", fontWeight: 600,
                border: `1.5px solid ${on ? C.navy : C.border}`,
                background: on ? C.navy : C.white,
                color: on ? "#fff" : C.muted,
                cursor: "pointer", transition: "all 0.15s",
                fontFamily: fonts.body,
                display: "inline-flex", alignItems: "center", gap: 5,
              }}
            >{on && <Check size={12} strokeWidth={3} />}{opt}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Avatar Upload ─── */
function AvatarUpload({ onChange }) {
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
    <div style={{ marginBottom: 24 }}>
      <Label>Profile Picture <span style={{ fontWeight: 400, color: C.muted }}>(optional)</span></Label>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          onClick={() => inputRef.current.click()}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: preview ? "transparent" : C.cream,
            border: `2px dashed ${hov ? C.gold : C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", overflow: "hidden", flexShrink: 0,
            transition: "border-color 0.2s",
          }}
        >
          {preview
            ? <img src={preview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <Camera size={24} color={C.muted2} strokeWidth={1.6} />
          }
        </div>
        <div>
          <button type="button" onClick={() => inputRef.current.click()}
            style={{ fontSize: "0.82rem", fontWeight: 600, color: C.navy, background: "transparent", border: `1.5px solid ${C.border}`, borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontFamily: fonts.body, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = C.cream; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "transparent"; }}
          >
            {preview ? "Change Photo" : "Upload Photo"}
          </button>
          <p style={{ fontSize: "0.72rem", color: C.muted, marginTop: 5, fontFamily: fonts.body }}>JPG or PNG · Max 2MB</p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handle} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP INDICATOR
═══════════════════════════════════════════ */
function StepBar({ current, total, labels }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {Array.from({ length: total }, (_, i) => {
          const done = i < current;
          const active = i === current;
          const isLast = i === total - 1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: isLast ? "0 0 auto" : 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: done ? C.gold : active ? C.navy : C.white,
                border: `2px solid ${done ? C.gold : active ? C.navy : C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.78rem", fontWeight: 700,
                color: done ? "#fff" : active ? "#fff" : C.muted2,
                transition: "all 0.3s", zIndex: 1,
                boxShadow: active ? `0 0 0 4px ${C.navy}1a` : "none",
                fontFamily: fonts.body,
              }}>
                {done ? <Check size={15} strokeWidth={3} /> : i + 1}
              </div>
              {!isLast && (
                <div style={{ flex: 1, height: 2, background: done ? C.gold : C.border, transition: "background 0.4s", margin: "0 2px" }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", marginTop: 8 }}>
        {labels.map((l, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={i} style={{ flex: 1, textAlign: i === 0 ? "left" : i === total - 1 ? "right" : "center", fontSize: "0.7rem", fontWeight: active ? 700 : 500, color: active ? C.navy : done ? C.gold : C.muted2, fontFamily: fonts.body }}>
              {l}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP PANELS
═══════════════════════════════════════════ */
function Step1({ data, setData, errors }) {
  return (
    <div style={{ animation: "slideIn 0.35s ease both" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.gold, marginBottom: 6, fontFamily: fonts.body }}>Step 1 of 3</div>
        <h2 style={{ fontSize: "1.55rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.025em", marginBottom: 6, fontFamily: fonts.display }}>Let's get you set up</h2>
        <p style={{ fontSize: "0.88rem", color: C.muted, lineHeight: 1.6, fontFamily: fonts.body }}>Create your student account. Use your university email to unlock platform access.</p>
      </div>
      <Input label="Full Name" required
        value={data.name} onChange={e => setData({ ...data, name: e.target.value })}
        placeholder="e.g. Zainab Mirza" error={errors.name}
      />
      <Input label="University Email" required type="email"
        value={data.email} onChange={e => setData({ ...data, email: e.target.value })}
        placeholder="yourname@university.edu.pk"
        hint="Must be an .edu.pk email address to verify your student status."
        error={errors.email}
      />
      <Input label="Password" required type="password"
        value={data.password} onChange={e => setData({ ...data, password: e.target.value })}
        placeholder="At least 8 characters"
        hint="Min 8 characters, one uppercase letter & one number."
        error={errors.password}
      />
      <Input label="Confirm Password" required type="password"
        value={data.confirmPassword} onChange={e => setData({ ...data, confirmPassword: e.target.value })}
        placeholder="Re-enter your password"
        error={errors.confirmPassword}
      />
      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginTop: 4 }}>
        <input type="checkbox" checked={data.terms} onChange={e => setData({ ...data, terms: e.target.checked })}
          style={{ marginTop: 2, accentColor: C.navy, width: 16, height: 16, flexShrink: 0 }} />
        <span style={{ fontSize: "0.8rem", color: C.muted, lineHeight: 1.6, fontFamily: fonts.body }}>
          I agree to the <a href="#" style={{ color: C.navy, fontWeight: 600 }}>Terms of Service</a> and{" "}
          <a href="#" style={{ color: C.navy, fontWeight: 600 }}>Privacy Policy</a>
        </span>
      </label>
      {errors.terms && <p style={{ fontSize: "0.75rem", color: error, marginTop: 4, fontFamily: fonts.body }}>⚠ {errors.terms}</p>}
    </div>
  );
}

function Step2({ data, setData, errors }) {
  return (
    <div style={{ animation: "slideIn 0.35s ease both" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.gold, marginBottom: 6, fontFamily: fonts.body }}>Step 2 of 3</div>
        <h2 style={{ fontSize: "1.55rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.025em", marginBottom: 6, fontFamily: fonts.display }}>Academic Info</h2>
        <p style={{ fontSize: "0.88rem", color: C.muted, lineHeight: 1.6, fontFamily: fonts.body }}>Help companies understand your academic background and timeline.</p>
      </div>
      <Select label="University" required value={data.university} onChange={e => setData({ ...data, university: e.target.value })} error={errors.university}>
        <option value="">Select your university</option>
        {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
      </Select>
      <Select label="Degree Program" required value={data.degree} onChange={e => setData({ ...data, degree: e.target.value })} error={errors.degree}>
        <option value="">Select your degree</option>
        {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
      </Select>
      <Input label="Major / Specialization" required
        value={data.major} onChange={e => setData({ ...data, major: e.target.value })}
        placeholder="e.g. Machine Learning, Embedded Systems, FinTech"
        error={errors.major}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Select label="Current Semester" required value={data.semester} onChange={e => setData({ ...data, semester: e.target.value })} error={errors.semester}>
          <option value="">Select semester</option>
          {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map(s => <option key={s} value={s}>{s} Semester</option>)}
        </Select>
        <div>
          <Label required>Expected Graduation</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select value={data.gradSemester} onChange={e => setData({ ...data, gradSemester: e.target.value })}
              style={{ padding: "11px 10px", fontSize: "0.88rem", fontFamily: fonts.body, background: C.white, color: C.text, border: `1.5px solid ${errors.gradSemester ? error : C.border}`, borderRadius: 9, outline: "none", cursor: "pointer", appearance: "none" }}>
              <option value="">Sem</option>
              {["Spring", "Fall"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={data.gradYear} onChange={e => setData({ ...data, gradYear: e.target.value })}
              style={{ padding: "11px 10px", fontSize: "0.88rem", fontFamily: fonts.body, background: C.white, color: C.text, border: `1.5px solid ${errors.gradYear ? error : C.border}`, borderRadius: 9, outline: "none", cursor: "pointer", appearance: "none" }}>
              <option value="">Year</option>
              {[2025, 2026, 2027, 2028, 2029].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {(errors.gradSemester || errors.gradYear) && <p style={{ fontSize: "0.75rem", color: error, marginTop: 4, fontFamily: fonts.body }}>⚠ Select graduation semester & year</p>}
        </div>
      </div>
    </div>
  );
}

function Step3({ data, setData }) {
  return (
    <div style={{ animation: "slideIn 0.35s ease both" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.gold, marginBottom: 6, fontFamily: fonts.body }}>Step 3 of 3</div>
        <h2 style={{ fontSize: "1.55rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.025em", marginBottom: 6, fontFamily: fonts.display }}>Your Profile</h2>
        <p style={{ fontSize: "0.88rem", color: C.muted, lineHeight: 1.6, fontFamily: fonts.body }}>Make a great first impression. All fields on this step are optional.</p>
      </div>
      <AvatarUpload value={data.avatar} onChange={f => setData({ ...data, avatar: f })} />
      <Input label={<>LinkedIn URL <span style={{ fontWeight: 400, color: C.muted }}>(optional)</span></>}
        value={data.linkedin} onChange={e => setData({ ...data, linkedin: e.target.value })}
        placeholder="https://linkedin.com/in/your-profile"
      />
      <MultiSelect
        label={<>Skills <span style={{ fontWeight: 400, color: C.muted }}>(optional)</span></>}
        options={SKILLS_LIST}
        selected={data.skills}
        onChange={s => setData({ ...data, skills: s })}
        hint="Select all that apply — companies use these to filter projects."
      />
      <Textarea
        label={<>Bio <span style={{ fontWeight: 400, color: C.muted }}>(optional)</span></>}
        value={data.bio}
        onChange={e => { if (e.target.value.length <= 300) setData({ ...data, bio: e.target.value }); }}
        maxChars={300}
        placeholder="Tell companies a little about yourself, your interests, and what makes your work stand out..."
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   VALIDATION
═══════════════════════════════════════════ */
function validateStep(step, data) {
  const errs = {};
  if (step === 0) {
    if (!data.name.trim()) errs.name = "Full name is required";
    if (!data.email.trim()) errs.email = "Email is required";
    else if (!data.email.toLowerCase().endsWith(".edu.pk")) errs.email = "Must be a .edu.pk email address";
    if (!data.password) errs.password = "Password is required";
    else if (data.password.length < 8) errs.password = "At least 8 characters required";
    else if (!/[A-Z]/.test(data.password)) errs.password = "Must contain at least one uppercase letter";
    else if (!/[0-9]/.test(data.password)) errs.password = "Must contain at least one number";
    if (!data.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (data.password !== data.confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (!data.terms) errs.terms = "You must agree to the Terms of Service";
  }
  if (step === 1) {
    if (!data.university) errs.university = "Select your university";
    if (!data.degree) errs.degree = "Select your degree program";
    if (!data.major.trim()) errs.major = "Enter your major or specialization";
    if (!data.semester) errs.semester = "Select your current semester";
    if (!data.gradSemester) errs.gradSemester = "Required";
    if (!data.gradYear) errs.gradYear = "Required";
  }
  return errs;
}

/* ═══════════════════════════════════════════
   SHARED LEFT PANEL DECORATION
═══════════════════════════════════════════ */
function PanelBg() {
  return (
    <>
      <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: `${C.gold}14`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -40, width: 200, height: 200, borderRadius: "50%", background: `${C.gold}0d`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize: "24px 24px", pointerEvents: "none" }} />
    </>
  );
}

function PanelLogo({ onBack }) {
  return (
    <a href="#" onClick={e => { e.preventDefault(); onBack && onBack(); }}
      style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 56, position: "relative", zIndex: 1 }}>
      <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.12)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, background: C.gold, borderRadius: "4px 0 0 0" }} />
        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#fff", zIndex: 1, fontFamily: fonts.display }}>Px</span>
      </div>
      <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", fontFamily: fonts.display }}>
        Projex<span style={{ color: C.gold }}>.pk</span>
      </span>
    </a>
  );
}

/* ═══════════════════════════════════════════
   LOGIN COMPONENT
═══════════════════════════════════════════ */
export function StudentLogin({ onBack, onSwitchToRegister, onForgotPassword, onSuccess }) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loginHov, setLoginHov] = useState(false);

  const validate = () => {
    const errs = {};
    if (!loginData.email.trim()) errs.email = "Email is required";
    else if (!loginData.email.toLowerCase().endsWith(".edu.pk")) errs.email = "Must be a .edu.pk email";
    if (!loginData.password) errs.password = "Password is required";
    return errs;
  };

  const handleLogin = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await loginStudent({ email: loginData.email, password: loginData.password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onSuccess && onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <FontLoader />
      <div style={{ minHeight: "100vh", display: "flex", background: C.cream }}>

        {/* ── Left Panel ── */}
        <div style={{
          width: 380, flexShrink: 0, background: C.navy,
          display: "flex", flexDirection: "column",
          padding: "48px 40px", position: "relative", overflow: "hidden",
        }}>
          <PanelBg />
          <PanelLogo onBack={onBack} />

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1, animation: "fadeIn 0.4s ease both" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <GraduationCap size={28} color={C.gold} strokeWidth={1.7} />
            </div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.025em", marginBottom: 10, lineHeight: 1.2, fontFamily: fonts.display }}>
              Welcome back
            </h3>
            <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, fontFamily: fonts.body }}>
              Sign in to manage your projects, track company interest, and keep your profile up to date.
            </p>
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["Your IP stays protected", Lock],
                ["Real company connections", Building2],
                ["Student-verified access", GraduationCap],
              ].map(([item, Icon]) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon size={14} color={C.gold} strokeWidth={1.8} />
                  <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", fontWeight: 500, fontFamily: fonts.body }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.25)", position: "relative", zIndex: 1, marginTop: 32, fontFamily: fonts.body }}>
            <a href="#" onClick={e => { e.preventDefault(); onBack && onBack(); }}
              style={{ color: "rgba(255,255,255,0.35)", fontWeight: 500, textDecoration: "none" }}>← Back to home</a>
            {"  ·  "}
            New here?{" "}
            <a href="#" onClick={e => { e.preventDefault(); onSwitchToRegister && onSwitchToRegister(); }}
              style={{ color: C.gold, fontWeight: 600, textDecoration: "none" }}>Create account</a>
          </p>
        </div>

        {/* ── Right Form Panel ── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px" }}>
          <div style={{ width: "100%", maxWidth: 460, animation: "fadeUp 0.4s ease both" }}>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.gold, marginBottom: 8, fontFamily: fonts.body }}>Student Login</div>
              <h2 style={{ fontSize: "1.7rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.03em", marginBottom: 8, fontFamily: fonts.display }}>Sign in to Projex</h2>
              <p style={{ fontSize: "0.88rem", color: C.muted, lineHeight: 1.6, fontFamily: fonts.body }}>Use your university email and password to access your account.</p>
            </div>

            <div style={{ background: C.white, borderRadius: 16, padding: "36px", border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(12,35,64,0.06)" }}>

              <Input
                label="University Email" required type="email"
                value={loginData.email}
                onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="yourname@university.edu.pk"
                error={errors.email}
              />

              <div style={{ marginBottom: 8 }}>
                <Label required>Password</Label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={loginData.password}
                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="Your password"
                    style={{
                      display: "block", width: "100%",
                      padding: "11px 44px 11px 14px", fontSize: "0.9rem",
                      fontFamily: fonts.body,
                      background: C.white, color: C.text,
                      border: `1.5px solid ${errors.password ? error : C.border}`,
                      borderRadius: 9, outline: "none",
                      transition: "border-color 0.18s, box-shadow 0.18s",
                    }}
                    onFocus={e => { e.target.style.borderColor = C.gold; e.target.style.boxShadow = `0 0 0 3px ${C.gold}18`; }}
                    onBlur={e => { e.target.style.borderColor = errors.password ? error : C.border; e.target.style.boxShadow = "none"; }}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted2, padding: 2, display: "flex" }}>
                    {showPass ? <EyeOff size={17} strokeWidth={1.7} /> : <Eye size={17} strokeWidth={1.7} />}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: "0.75rem", color: error, marginTop: 5, fontFamily: fonts.body }}>⚠ {errors.password}</p>}
              </div>

              <div style={{ textAlign: "right", marginBottom: 24, marginTop: 6, fontSize: "0.78rem" }}>
                <a style={{ color: C.navy, fontWeight: 700, textDecoration: "none" }} href="#"
                  onClick={e => { e.preventDefault(); onForgotPassword && onForgotPassword(); }}>
                  Forgot password?
                </a>
              </div>

              {errors.submit && (
                <div style={{ background: errorPale, border: `1px solid ${error}20`, borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
                  <p style={{ fontSize: "0.8rem", color: error, fontWeight: 600, fontFamily: fonts.body }}>⚠ {errors.submit}</p>
                </div>
              )}

              <button type="button" onClick={handleLogin} disabled={submitting}
                onMouseEnter={() => setLoginHov(true)} onMouseLeave={() => setLoginHov(false)}
                style={{
                  width: "100%", padding: "13px", borderRadius: 50,
                  fontSize: "0.95rem", fontWeight: 600,
                  cursor: submitting ? "wait" : "pointer",
                  border: "none",
                  background: submitting ? C.disabledText : loginHov ? C.gold : C.navy,
                  color: "#fff", transition: "all 0.18s",
                  fontFamily: fonts.body,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {submitting
                  ? <><Loader2 size={15} style={{ animation: "spin 0.7s linear infinite" }} /> Signing in...</>
                  : <>Sign In <ArrowRight size={15} strokeWidth={2} /></>
                }
              </button>
            </div>

            <p style={{ textAlign: "center", fontSize: "0.78rem", color: C.muted, marginTop: 20, fontFamily: fonts.body }}>
              Don't have an account?{" "}
              <a href="#" onClick={e => { e.preventDefault(); onSwitchToRegister && onSwitchToRegister(); }}
                style={{ color: C.navy, fontWeight: 700, textDecoration: "none" }}>Register here</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT (StudentOnboarding)
═══════════════════════════════════════════ */
export default function StudentOnboarding({ onBack, onSwitchToLogin, onSuccess }) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [backHov, setBackHov] = useState(false);
  const [nextHov, setNextHov] = useState(false);

  const [data, setData] = useState({
    name: "", email: "", password: "", confirmPassword: "", terms: false,
    university: "", degree: "", major: "", semester: "", gradSemester: "", gradYear: "",
    avatar: null, linkedin: "", skills: [], bio: "",
  });

  const STEPS = ["Basic Info", "Academic Info", "Profile"];
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
    setSubmitting(true);
    setErrors({});

    const payload = {
      full_name: data.name,
      email: data.email,
      password: data.password,
      university_name: data.university,
      degree_program: data.degree,
      major: data.major,
      current_semester: parseInt(data.semester),
      graduation_semester: `${data.gradSemester} ${data.gradYear}`,
      linkedin_url: data.linkedin,
      skills: data.skills.join(', '),
      bio: data.bio,
    };

    try {
      const res = await registerStudent(payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onSuccess && onSuccess();
    } catch (err) {
      console.log('Full error:', err.response);
      if (err.response?.data?.errors?.length > 0) {
        const msg = err.response.data.errors.map(e => e.msg).join(' • ');
        setErrors({ submit: msg });
      } else {
        const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
        setErrors({ submit: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const panels = [
    { Icon: GraduationCap, title: "Showcase your work", body: "Post your final-year project and let verified companies find you — with your IP fully protected at every step." },
    { Icon: Landmark, title: "Academic credibility", body: "Your .edu.pk email ties you to your institution. Companies trust students with verified university affiliations." },
    { Icon: Sparkles, title: "Stand out from day one", body: "Skills tags, bio, and LinkedIn make your profile pop. The more you fill in, the better your matches." },
  ];
  const activePanel = panels[Math.min(step, panels.length - 1)];

  return (
    <>
      <FontLoader />
      <div style={{ minHeight: "100vh", display: "flex", background: C.cream }}>

        {/* ── Left Panel ── */}
        <div style={{
          width: 380, flexShrink: 0, background: C.navy,
          display: "flex", flexDirection: "column",
          padding: "48px 40px", position: "relative", overflow: "hidden",
        }}>
          <PanelBg />
          <PanelLogo onBack={onBack} />

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
            <div key={step} style={{ animation: "fadeIn 0.4s ease both" }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <activePanel.Icon size={28} color={C.gold} strokeWidth={1.7} />
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.025em", marginBottom: 10, lineHeight: 1.2, fontFamily: fonts.display }}>
                {activePanel.title}
              </h3>
              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, fontFamily: fonts.body }}>
                {activePanel.body}
              </p>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 40 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? C.gold : "rgba(255,255,255,0.2)", transition: "all 0.3s" }} />
              ))}
            </div>
          </div>

          <p style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.25)", position: "relative", zIndex: 1, marginTop: 32, fontFamily: fonts.body }}>
            <a href="#" onClick={e => { e.preventDefault(); onBack && onBack(); }}
              style={{ color: "rgba(255,255,255,0.35)", fontWeight: 500, textDecoration: "none" }}>← Back to home</a>
            {"  ·  "}
            Already have an account?{" "}
            <a href="#" onClick={e => { e.preventDefault(); onSwitchToLogin && onSwitchToLogin(); }}
              style={{ color: C.gold, fontWeight: 600, textDecoration: "none" }}>Sign in</a>
          </p>
        </div>

        {/* ── Right Form Panel ── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 40px" }}>
          <div style={{ width: "100%", maxWidth: 520 }}>
            <StepBar current={step} total={STEPS.length} labels={STEPS} />

            <div style={{ background: C.white, borderRadius: 16, padding: "36px 36px", border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(12,35,64,0.06)" }}>
              <>
                {step === 0 && <Step1 data={data} setData={setData} errors={errors} />}
                {step === 1 && <Step2 data={data} setData={setData} errors={errors} />}
                {step === 2 && <Step3 data={data} setData={setData} errors={errors} />}

                <div style={{ display: "flex", gap: 12, marginTop: 28, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
                  {step > 0 && (
                    <button type="button" onClick={back}
                      onMouseEnter={() => setBackHov(true)} onMouseLeave={() => setBackHov(false)}
                      style={{ flex: 1, padding: "12px", borderRadius: 50, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", border: `1.5px solid ${backHov ? C.gold : C.border}`, color: C.navy, background: backHov ? C.cream : "transparent", transition: "all 0.18s", fontFamily: fonts.body, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    ><ArrowLeft size={15} strokeWidth={2} /> Back</button>
                  )}
                  <button type="button" onClick={next} disabled={submitting}
                    onMouseEnter={() => setNextHov(true)} onMouseLeave={() => setNextHov(false)}
                    style={{ flex: 2, padding: "13px", borderRadius: 50, fontSize: "0.9rem", fontWeight: 600, cursor: submitting ? "wait" : "pointer", border: "none", background: submitting ? C.disabledText : nextHov ? C.gold : C.navy, color: "#fff", transition: "all 0.18s", fontFamily: fonts.body, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    {submitting
                      ? <><Loader2 size={15} style={{ animation: "spin 0.7s linear infinite" }} /> Creating account...</>
                      : isLast
                        ? <>Create My Account <GraduationCap size={16} strokeWidth={2} /></>
                        : <>Continue <ArrowRight size={15} strokeWidth={2} /></>
                    }
                  </button>
                </div>

                {errors.submit && (
                  <p style={{ textAlign: 'center', fontSize: '0.8rem', color: error, marginTop: 12, fontFamily: fonts.body }}>
                    ⚠ {errors.submit}
                  </p>
                )}

                {step === 2 && (
                  <p style={{ textAlign: "center", fontSize: "0.76rem", color: C.muted2, marginTop: 12, fontFamily: fonts.body }}>
                    All fields optional — you can update your profile anytime from settings.
                  </p>
                )}
              </>
            </div>

            {step === 0 && (
              <p style={{ textAlign: "center", fontSize: "0.78rem", color: C.muted, marginTop: 20, fontFamily: fonts.body }}>
                Already have an account?{" "}
                <a href="#" onClick={e => { e.preventDefault(); onSwitchToLogin && onSwitchToLogin(); }}
                  style={{ color: C.navy, fontWeight: 700, textDecoration: "none" }}>Sign in here</a>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}