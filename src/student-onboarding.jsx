import { useState, useRef } from "react";
import { registerStudent } from '../src/services/api';  // adjust path if needed
/* ─── FONTS ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f0f7fd; font-family: 'Plus Jakarta Sans', sans-serif; }
    @keyframes fadeUp   { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
    @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
    @keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
    @keyframes slideIn  { from { opacity:0; transform:translateX(24px) } to { opacity:1; transform:translateX(0) } }
    @keyframes slideOut { from { opacity:1; transform:translateX(0) } to { opacity:0; transform:translateX(-24px) } }
    input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #f0f7fd inset !important; }
  `}</style>
);

/* ─── BRAND ─── */
const C = {
  blue:      "#033e66",
  blueMid:   "#0a5a96",
  blueLight: "#1a7cc4",
  blueTint:  "#f0f7fd",
  bluePale:  "#e8f3fb",
  green:     "#a3cf3e",
  greenDark: "#7aaa1c",
  greenPale: "#f2f9e0",
  white:     "#ffffff",
  off:       "#f7f8fa",
  border:    "#e4e9ef",
  border2:   "#d0dce8",
  text:      "#0d1b2a",
  muted:     "#5a7491",
  muted2:    "#8fa5bc",
  ink:       "#071220",
  error:     "#dc2626",
  errorPale: "#fef2f2",
};

/* ─── SKILLS for multi-select ─── */
const SKILLS_LIST = [
  "Python","JavaScript","TypeScript","React","Node.js","Flutter","Swift","Kotlin",
  "Java","C++","C#","PHP","Go","Rust","SQL","MongoDB","PostgreSQL","Firebase",
  "Machine Learning","Deep Learning","Computer Vision","NLP","Data Analysis",
  "Arduino","Raspberry Pi","IoT","Embedded Systems","PCB Design","MATLAB",
  "UI/UX Design","Figma","Adobe XD","AutoCAD","SolidWorks","3D Printing",
  "Blockchain","Smart Contracts","Cybersecurity","Cloud (AWS)","Cloud (GCP)","Docker",
  "Business Analysis","Product Management","Digital Marketing","Finance",
];

const UNIVERSITIES = [
  "NED University","FAST-NU Karachi","FAST-NU Lahore","FAST-NU Islamabad","FAST-NU Peshawar",
  "IBA Karachi","LUMS","NUST","UET Lahore","UET Peshawar","COMSATS",
  "University of Karachi","Habib University","Dawood University","Mehran University",
  "GIKI","Air University","Bahria University","PAF-IAST","Other",
];

const DEGREES = [
  "BS Computer Science","BS Software Engineering","BS Artificial Intelligence",
  "BS Data Science","BS Electrical Engineering","BS Electronics Engineering",
  "BS Mechanical Engineering","BS Civil Engineering","BS Business Administration",
  "BS Accounting & Finance","BBA","BS Economics","BS Mathematics","Other",
];

/* ═══════════════════════════════════════════
   REUSABLE FIELD COMPONENTS
═══════════════════════════════════════════ */
function Label({ children, required }) {
  return (
    <label style={{ display:"block", fontSize:"0.8rem", fontWeight:700, color:C.text, marginBottom:6, letterSpacing:"0.01em" }}>
      {children}
      {required && <span style={{ color:C.green, marginLeft:3 }}>*</span>}
    </label>
  );
}

function Input({ label, required, error, hint, type="text", ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom:20 }}>
      {label && <Label required={required}>{label}</Label>}
      <input
        type={type}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          display:"block", width:"100%",
          padding:"11px 14px", fontSize:"0.9rem",
          fontFamily:"'Plus Jakarta Sans',sans-serif",
          background:C.white, color:C.text,
          border:`1.5px solid ${error ? C.error : focus ? C.blue : C.border2}`,
          borderRadius:9, outline:"none",
          transition:"border-color 0.18s, box-shadow 0.18s",
          boxShadow: focus ? `0 0 0 3px ${C.blue}18` : error ? `0 0 0 3px ${C.error}12` : "none",
        }}
        {...props}
      />
      {hint  && !error && <p style={{ fontSize:"0.75rem", color:C.muted, marginTop:5 }}>{hint}</p>}
      {error && <p style={{ fontSize:"0.75rem", color:C.error, marginTop:5, display:"flex", alignItems:"center", gap:4 }}>⚠ {error}</p>}
    </div>
  );
}

function Select({ label, required, error, children, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom:20 }}>
      {label && <Label required={required}>{label}</Label>}
      <select
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          display:"block", width:"100%",
          padding:"11px 14px", fontSize:"0.9rem",
          fontFamily:"'Plus Jakarta Sans',sans-serif",
          background:C.white, color:C.text,
          border:`1.5px solid ${error ? C.error : focus ? C.blue : C.border2}`,
          borderRadius:9, outline:"none", cursor:"pointer",
          transition:"border-color 0.18s, box-shadow 0.18s",
          boxShadow: focus ? `0 0 0 3px ${C.blue}18` : "none",
          appearance:"none",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235a7491' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center",
        }}
        {...props}
      >
        {children}
      </select>
      {error && <p style={{ fontSize:"0.75rem", color:C.error, marginTop:5 }}>⚠ {error}</p>}
    </div>
  );
}

function Textarea({ label, required, error, maxChars, value, onChange, ...props }) {
  return (
    <div style={{ marginBottom:20 }}>
      {label && <Label required={required}>{label}</Label>}
      <div style={{ position:"relative" }}>
        <textarea
          value={value}
          onChange={onChange}
          style={{
            display:"block", width:"100%",
            padding:"11px 14px", fontSize:"0.9rem",
            fontFamily:"'Plus Jakarta Sans',sans-serif",
            background:C.white, color:C.text,
            border:`1.5px solid ${error ? C.error : C.border2}`,
            borderRadius:9, outline:"none", resize:"vertical",
            minHeight:100, lineHeight:1.6,
            transition:"border-color 0.18s",
          }}
          onFocus={e => e.target.style.borderColor=C.blue}
          onBlur={e => e.target.style.borderColor=error?C.error:C.border2}
          {...props}
        />
        {maxChars && (
          <span style={{ position:"absolute", bottom:10, right:12, fontSize:"0.72rem", color: value.length > maxChars*0.9 ? C.error : C.muted2 }}>
            {value.length}/{maxChars}
          </span>
        )}
      </div>
      {error && <p style={{ fontSize:"0.75rem", color:C.error, marginTop:5 }}>⚠ {error}</p>}
    </div>
  );
}

function MultiSelect({ label, required, options, selected, onChange, hint }) {
  return (
    <div style={{ marginBottom:20 }}>
      {label && <Label required={required}>{label}</Label>}
      {hint && <p style={{ fontSize:"0.75rem", color:C.muted, marginBottom:8 }}>{hint}</p>}
      <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
        {options.map(opt => {
          const on = selected.includes(opt);
          return (
            <button key={opt} type="button"
              onClick={() => onChange(on ? selected.filter(s=>s!==opt) : [...selected, opt])}
              style={{
                padding:"6px 13px", borderRadius:20,
                fontSize:"0.78rem", fontWeight:600,
                border:`1.5px solid ${on ? C.blue : C.border2}`,
                background: on ? C.blue : C.white,
                color: on ? "#fff" : C.muted,
                cursor:"pointer", transition:"all 0.15s",
                fontFamily:"'Plus Jakarta Sans',sans-serif",
              }}
            >{on && <span style={{ marginRight:4 }}>✓</span>}{opt}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Avatar Upload ─── */
function AvatarUpload({onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handle = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onChange(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ marginBottom:24 }}>
      <Label>Profile Picture <span style={{ fontWeight:400, color:C.muted }}>(optional)</span></Label>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        <div
          onClick={() => inputRef.current.click()}
          style={{
            width:72, height:72, borderRadius:"50%",
            background: preview ? "transparent" : C.blueTint,
            border:`2px dashed ${C.border2}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", overflow:"hidden", flexShrink:0,
            transition:"border-color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor=C.blue}
          onMouseLeave={e => e.currentTarget.style.borderColor=C.border2}
        >
          {preview
            ? <img src={preview} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            : <span style={{ fontSize:"1.5rem" }}>📷</span>
          }
        </div>
        <div>
          <button type="button" onClick={() => inputRef.current.click()}
            style={{ fontSize:"0.82rem", fontWeight:700, color:C.blue, background:"transparent", border:`1.5px solid ${C.border2}`, borderRadius:7, padding:"7px 14px", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.background=C.blueTint; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=C.border2; e.currentTarget.style.background="transparent"; }}
          >
            {preview ? "Change Photo" : "Upload Photo"}
          </button>
          <p style={{ fontSize:"0.72rem", color:C.muted, marginTop:5 }}>JPG or PNG · Max 2MB</p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handle} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP INDICATOR
═══════════════════════════════════════════ */
function StepBar({ current, total, labels }) {
  return (
    <div style={{ marginBottom:36 }}>
      <div style={{ display:"flex", alignItems:"center", gap:0 }}>
        {Array.from({ length: total }, (_, i) => {
          const done    = i < current;
          const active  = i === current;
          const isLast  = i === total - 1;
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", flex: isLast ? "0 0 auto" : 1 }}>
              {/* Circle */}
              <div style={{
                width:32, height:32, borderRadius:"50%", flexShrink:0,
                background: done ? C.green : active ? C.blue : C.white,
                border: `2px solid ${done ? C.green : active ? C.blue : C.border2}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"0.78rem", fontWeight:800,
                color: done ? C.blue : active ? "#fff" : C.muted2,
                transition:"all 0.3s", zIndex:1,
                boxShadow: active ? `0 0 0 4px ${C.blue}20` : "none",
              }}>
                {done ? "✓" : i + 1}
              </div>
              {/* Line */}
              {!isLast && (
                <div style={{ flex:1, height:2, background: done ? C.green : C.border, transition:"background 0.4s", margin:"0 2px" }} />
              )}
            </div>
          );
        })}
      </div>
      {/* Labels */}
      <div style={{ display:"flex", marginTop:8 }}>
        {labels.map((l, i) => {
          const done   = i < current;
          const active = i === current;
          return (
            <div key={i} style={{ flex:1, textAlign: i===0?"left": i===total-1?"right":"center", fontSize:"0.7rem", fontWeight: active?700:500, color: active?C.blue: done?C.greenDark:C.muted2 }}>
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
    <div style={{ animation:"slideIn 0.35s ease both" }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.green, marginBottom:6 }}>Step 1 of 3</div>
        <h2 style={{ fontSize:"1.55rem", fontWeight:800, color:C.ink, letterSpacing:"-0.025em", marginBottom:6 }}>Let's get you set up</h2>
        <p style={{ fontSize:"0.88rem", color:C.muted, lineHeight:1.6 }}>Create your student account. Use your university email to unlock platform access.</p>
      </div>

      <Input label="Full Name" required
        value={data.name} onChange={e => setData({...data, name:e.target.value})}
        placeholder="e.g. Zainab Mirza" error={errors.name}
      />
      <Input label="University Email" required type="email"
        value={data.email} onChange={e => setData({...data, email:e.target.value})}
        placeholder="yourname@university.edu.pk"
        hint="Must be an .edu.pk email address to verify your student status."
        error={errors.email}
      />
      <Input label="Password" required type="password"
        value={data.password} onChange={e => setData({...data, password:e.target.value})}
        placeholder="At least 8 characters"
        hint="Use a mix of letters, numbers & symbols."
        error={errors.password}
      />
      <Input label="Confirm Password" required type="password"
        value={data.confirmPassword} onChange={e => setData({...data, confirmPassword:e.target.value})}
        placeholder="Re-enter your password"
        error={errors.confirmPassword}
      />

      {/* Terms */}
      <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", marginTop:4 }}>
        <input type="checkbox" checked={data.terms} onChange={e => setData({...data, terms:e.target.checked})}
          style={{ marginTop:2, accentColor:C.blue, width:16, height:16, flexShrink:0 }} />
        <span style={{ fontSize:"0.8rem", color:C.muted, lineHeight:1.6 }}>
          I agree to the <a href="#" style={{ color:C.blue, fontWeight:600 }}>Terms of Service</a> and{" "}
          <a href="#" style={{ color:C.blue, fontWeight:600 }}>Privacy Policy</a>
        </span>
      </label>
      {errors.terms && <p style={{ fontSize:"0.75rem", color:C.error, marginTop:4 }}>⚠ {errors.terms}</p>}
    </div>
  );
}

function Step2({ data, setData, errors }) {
  return (
    <div style={{ animation:"slideIn 0.35s ease both" }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.green, marginBottom:6 }}>Step 2 of 3</div>
        <h2 style={{ fontSize:"1.55rem", fontWeight:800, color:C.ink, letterSpacing:"-0.025em", marginBottom:6 }}>Academic Info</h2>
        <p style={{ fontSize:"0.88rem", color:C.muted, lineHeight:1.6 }}>Help companies understand your academic background and timeline.</p>
      </div>

      <Select label="University" required value={data.university} onChange={e => setData({...data, university:e.target.value})} error={errors.university}>
        <option value="">Select your university</option>
        {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
      </Select>

      <Select label="Degree Program" required value={data.degree} onChange={e => setData({...data, degree:e.target.value})} error={errors.degree}>
        <option value="">Select your degree</option>
        {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
      </Select>

      <Input label="Major / Specialization" required
        value={data.major} onChange={e => setData({...data, major:e.target.value})}
        placeholder="e.g. Machine Learning, Embedded Systems, FinTech"
        error={errors.major}
      />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Select label="Current Semester" required value={data.semester} onChange={e => setData({...data, semester:e.target.value})} error={errors.semester}>
          <option value="">Select semester</option>
          {["1st","2nd","3rd","4th","5th","6th","7th","8th"].map(s => <option key={s} value={s}>{s} Semester</option>)}
        </Select>

        <div>
          <Label required>Expected Graduation</Label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <select value={data.gradSemester} onChange={e => setData({...data, gradSemester:e.target.value})}
              style={{ padding:"11px 10px", fontSize:"0.88rem", fontFamily:"'Plus Jakarta Sans',sans-serif", background:C.white, color:C.text, border:`1.5px solid ${errors.gradSemester?C.error:C.border2}`, borderRadius:9, outline:"none", cursor:"pointer", appearance:"none" }}>
              <option value="">Sem</option>
              {["Spring","Fall"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={data.gradYear} onChange={e => setData({...data, gradYear:e.target.value})}
              style={{ padding:"11px 10px", fontSize:"0.88rem", fontFamily:"'Plus Jakarta Sans',sans-serif", background:C.white, color:C.text, border:`1.5px solid ${errors.gradYear?C.error:C.border2}`, borderRadius:9, outline:"none", cursor:"pointer", appearance:"none" }}>
              <option value="">Year</option>
              {[2025,2026,2027,2028,2029].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {(errors.gradSemester||errors.gradYear) && <p style={{ fontSize:"0.75rem", color:C.error, marginTop:4 }}>⚠ Select graduation semester & year</p>}
        </div>
      </div>
    </div>
  );
}

function Step3({ data, setData }) {
  return (
    <div style={{ animation:"slideIn 0.35s ease both" }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.green, marginBottom:6 }}>Step 3 of 3</div>
        <h2 style={{ fontSize:"1.55rem", fontWeight:800, color:C.ink, letterSpacing:"-0.025em", marginBottom:6 }}>Your Profile</h2>
        <p style={{ fontSize:"0.88rem", color:C.muted, lineHeight:1.6 }}>Make a great first impression. All fields on this step are optional.</p>
      </div>

      <AvatarUpload value={data.avatar} onChange={f => setData({...data, avatar:f})} />

      <Input label={<>LinkedIn URL <span style={{ fontWeight:400, color:C.muted }}>(optional)</span></>}
        value={data.linkedin} onChange={e => setData({...data, linkedin:e.target.value})}
        placeholder="https://linkedin.com/in/your-profile"
      />

      <MultiSelect
        label={<>Skills <span style={{ fontWeight:400, color:C.muted }}>(optional)</span></>}
        options={SKILLS_LIST}
        selected={data.skills}
        onChange={s => setData({...data, skills:s})}
        hint="Select all that apply — companies use these to filter projects."
      />

      <Textarea
        label={<>Bio <span style={{ fontWeight:400, color:C.muted }}>(optional)</span></>}
        value={data.bio}
        onChange={e => { if (e.target.value.length <= 300) setData({...data, bio:e.target.value}); }}
        maxChars={300}
        placeholder="Tell companies a little about yourself, your interests, and what makes your work stand out..."
      />
    </div>
  );
}

/* ─── Success Screen ─── */
function SuccessScreen() {
  return (
    <div style={{ textAlign:"center", padding:"20px 0 10px", animation:"fadeUp 0.5s ease both" }}>
      <div style={{
        width:72, height:72, borderRadius:"50%",
        background:C.greenPale, border:`2px solid ${C.green}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"2rem", margin:"0 auto 20px",
        boxShadow:`0 0 0 8px ${C.green}18`,
      }}>✓</div>
      <h2 style={{ fontSize:"1.6rem", fontWeight:800, color:C.ink, marginBottom:10, letterSpacing:"-0.025em" }}>You're in!</h2>
      <p style={{ fontSize:"0.9rem", color:C.muted, lineHeight:1.7, marginBottom:8 }}>
        Your student account has been created. Check your university email to verify your address, then you can post your first project.
      </p>
      <div style={{ display:"inline-block", background:C.blueTint, border:`1px solid ${C.bluePale}`, borderRadius:10, padding:"12px 20px", marginTop:12 }}>
        <p style={{ fontSize:"0.8rem", color:C.blue, fontWeight:600 }}>📧 Verification email sent to your .edu.pk address</p>
      </div>
      <div style={{ marginTop:28 }}>
        <button style={{ background:C.blue, color:"#fff", border:"none", borderRadius:9, padding:"13px 32px", fontSize:"0.95rem", fontWeight:700, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.18s" }}
          onMouseEnter={e => e.currentTarget.style.background=C.blueMid}
          onMouseLeave={e => e.currentTarget.style.background=C.blue}
        >Go to Dashboard →</button>
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
    if (!data.name.trim())                                    errs.name = "Full name is required";
    if (!data.email.trim())                                   errs.email = "Email is required";
    else if (!data.email.toLowerCase().endsWith(".edu.pk"))   errs.email = "Must be a .edu.pk email address";
    if (!data.password)                                       errs.password = "Password is required";
    else if (data.password.length < 8)                        errs.password = "At least 8 characters required";
    if (!data.confirmPassword)                                errs.confirmPassword = "Please confirm your password";
    else if (data.password !== data.confirmPassword)          errs.confirmPassword = "Passwords don't match";
    if (!data.terms)                                          errs.terms = "You must agree to the Terms of Service";
  }
  if (step === 1) {
    if (!data.university)   errs.university = "Select your university";
    if (!data.degree)       errs.degree     = "Select your degree program";
    if (!data.major.trim()) errs.major      = "Enter your major or specialization";
    if (!data.semester)     errs.semester   = "Select your current semester";
    if (!data.gradSemester) errs.gradSemester = "Required";
    if (!data.gradYear)     errs.gradYear   = "Required";
  }
  return errs;
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function StudentOnboarding({ onBack }) {
  const [step, setStep]       = useState(0);
  const [errors, setErrors]   = useState({});
  const [done, setDone]       = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [data, setData] = useState({
    // Step 1
    name:"", email:"", password:"", confirmPassword:"", terms:false,
    // Step 2
    university:"", degree:"", major:"", semester:"", gradSemester:"", gradYear:"",
    // Step 3
    avatar:null, linkedin:"", skills:[], bio:"",
  });

  const STEPS  = ["Basic Info","Academic Info","Profile"];
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

  // Map frontend field names → what backend expects
  const payload = {
    full_name:           data.name,
    email:               data.email,
    password:            data.password,
    university_name:     data.university,
    degree_program:      data.degree,
    major:               data.major,
    current_semester:    parseInt(data.semester),   // "4th" → 4
    graduation_semester: `${data.gradSemester} ${data.gradYear}`,  // "Spring 2028"
    linkedin_url:        data.linkedin,
    skills:              data.skills.join(', '),    // ["React","Node.js"] → "React, Node.js"
    bio:                 data.bio,
  };

  try {
  await registerStudent(payload);
  setDone(true);
  
} catch (err) {
  console.log('Full error:', err.response);  // ← add here
  const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
  setErrors({ submit: msg });
} finally {
  setSubmitting(false);
}
};

  /* ─── Left panel art ─── */
  const panels = [
    { icon:"🎓", title:"Showcase your work", body:"Post your final-year project and let verified companies find you — with your IP fully protected at every step." },
    { icon:"🏫", title:"Academic credibility", body:"Your .edu.pk email ties you to your institution. Companies trust students with verified university affiliations." },
    { icon:"🌟", title:"Stand out from day one", body:"Skills tags, bio, and LinkedIn make your profile pop. The more you fill in, the better your matches." },
  ];

  return (
    <>
      <FontLoader />
      <div style={{ minHeight:"100vh", display:"flex", background:C.off }}>

        {/* ── Left Panel ── */}
        <div style={{
          width:380, flexShrink:0, background:C.blue,
          display:"flex", flexDirection:"column",
          padding:"48px 40px", position:"relative", overflow:"hidden",
        }}>
          {/* decorative */}
          <div style={{ position:"absolute", top:-60, right:-60, width:280, height:280, borderRadius:"50%", background:"rgba(163,207,62,0.08)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-80, left:-40, width:200, height:200, borderRadius:"50%", background:"rgba(163,207,62,0.05)", pointerEvents:"none" }} />
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:`radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
            backgroundSize:"24px 24px", pointerEvents:"none",
          }} />

          {/* Logo */}
          <a href="#" onClick={e => { e.preventDefault(); onBack && onBack(); }} style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none", marginBottom:56, position:"relative", zIndex:1 }}>
            <div style={{ width:32, height:32, background:"rgba(255,255,255,0.12)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", bottom:0, right:0, width:12, height:12, background:C.green, borderRadius:"4px 0 0 0" }} />
              <span style={{ fontSize:"0.7rem", fontWeight:800, color:"#fff", zIndex:1 }}>Px</span>
            </div>
            <span style={{ fontSize:"1.1rem", fontWeight:800, color:"#fff", letterSpacing:"-0.4px" }}>
              Projex<span style={{ color:C.green }}>.pk</span>
            </span>
          </a>

          {/* Dynamic panel card */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", position:"relative", zIndex:1 }}>
            <div key={step} style={{ animation:"fadeIn 0.4s ease both" }}>
              <div style={{ fontSize:"3rem", marginBottom:16 }}>{panels[Math.min(step, panels.length-1)].icon}</div>
              <h3 style={{ fontSize:"1.4rem", fontWeight:800, color:"#fff", letterSpacing:"-0.025em", marginBottom:10, lineHeight:1.2 }}>
                {panels[Math.min(step, panels.length-1)].title}
              </h3>
              <p style={{ fontSize:"0.88rem", color:"rgba(255,255,255,0.55)", lineHeight:1.75 }}>
                {panels[Math.min(step, panels.length-1)].body}
              </p>
            </div>

            {/* step dots */}
            <div style={{ display:"flex", gap:6, marginTop:40 }}>
              {STEPS.map((_,i) => (
                <div key={i} style={{ width: i===step?20:6, height:6, borderRadius:3, background: i===step?C.green:"rgba(255,255,255,0.2)", transition:"all 0.3s" }} />
              ))}
            </div>
          </div>

          {/* bottom note */}
          <p style={{ fontSize:"0.74rem", color:"rgba(255,255,255,0.25)", position:"relative", zIndex:1, marginTop:32 }}>
            <a href="#" onClick={e => { e.preventDefault(); onBack && onBack(); }} style={{ color:"rgba(255,255,255,0.35)", fontWeight:500, textDecoration:"none" }}>← Back to home</a>
            {"  ·  "}
            Already have an account?{" "}
            <a href="#" style={{ color:C.green, fontWeight:600, textDecoration:"none" }}>Sign in</a>
          </p>
        </div>

        {/* ── Right Form Panel ── */}
        <div style={{ flex:1, overflowY:"auto", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"48px 40px" }}>
          <div style={{ width:"100%", maxWidth:520 }}>
            <StepBar current={step} total={STEPS.length} labels={STEPS} />

            <div style={{ background:C.white, borderRadius:16, padding:"36px 36px", border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(3,62,102,0.06)" }}>
              {done
                ? <SuccessScreen />
                : <>
                    {step === 0 && <Step1 data={data} setData={setData} errors={errors} />}
                    {step === 1 && <Step2 data={data} setData={setData} errors={errors} />}
                    {step === 2 && <Step3 data={data} setData={setData} errors={errors} />}

                    {/* Navigation */}
                    <div style={{ display:"flex", gap:12, marginTop:28, paddingTop:24, borderTop:`1px solid ${C.border}` }}>
                      {step > 0 && (
                        <button type="button" onClick={back}
                          style={{ flex:1, padding:"12px", borderRadius:9, fontSize:"0.9rem", fontWeight:700, cursor:"pointer", border:`1.5px solid ${C.border2}`, color:C.blue, background:"transparent", transition:"all 0.18s", fontFamily:"'Plus Jakarta Sans',sans-serif" }}
                          onMouseEnter={e => { e.currentTarget.style.background=C.blueTint; e.currentTarget.style.borderColor=C.blue; }}
                          onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor=C.border2; }}
                        >← Back</button>
                      )}
                      <button type="button" onClick={next} disabled={submitting}
                        style={{ flex:2, padding:"13px", borderRadius:9, fontSize:"0.9rem", fontWeight:700, cursor: submitting?"wait":"pointer", border:"none", background: submitting ? C.muted2 : C.blue, color:"#fff", transition:"all 0.18s", fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
                        onMouseEnter={e => { if (!submitting) e.currentTarget.style.background=C.blueMid; }}
                        onMouseLeave={e => { if (!submitting) e.currentTarget.style.background=C.blue; }}
                      >
                        {submitting
                          ? <><span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} /> Creating account...</>
                          : isLast ? "Create My Account 🎓" : "Continue →"
                        }
                      </button>
                    </div>
                        {errors.submit && (
  <p style={{ textAlign:'center', fontSize:'0.8rem', color:C.error, marginTop:12 }}>
    ⚠ {errors.submit}
  </p>
)}
                    {/* Skip hint for step 3 */}
                    {step === 2 && (
                      <p style={{ textAlign:"center", fontSize:"0.76rem", color:C.muted2, marginTop:12 }}>
                        All fields optional — you can update your profile anytime from settings.
                      </p>
                    )}
                  </>
              }
            </div>

            {step === 0 && !done && (
              <p style={{ textAlign:"center", fontSize:"0.78rem", color:C.muted, marginTop:20 }}>
                Already have an account?{" "}
                <a href="#" style={{ color:C.blue, fontWeight:700, textDecoration:"none" }}>Sign in here</a>
              </p>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
}