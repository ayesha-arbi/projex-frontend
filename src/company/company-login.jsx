import { useState } from "react";
import { loginCompany } from '../services/api';

/* ─── FONTS ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f0f7fd; font-family: 'Plus Jakarta Sans', sans-serif; }
    @keyframes fadeUp  { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
    @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
    @keyframes slideIn { from { opacity:0; transform:translateX(24px) } to { opacity:1; transform:translateX(0) } }
    @keyframes spin    { to { transform: rotate(360deg) } }
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
  amber:     "#d97706",
  amberPale: "#fffbeb",
};

/* ─── SHARED FIELD COMPONENTS ─── */
function Label({ children, required }) {
  return (
    <label style={{ display:"block", fontSize:"0.8rem", fontWeight:700, color:C.text, marginBottom:6, letterSpacing:"0.01em" }}>
      {children}{required && <span style={{ color:C.green, marginLeft:3 }}>*</span>}
    </label>
  );
}

function Input({ label, required, error, hint, type="text", ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom:18 }}>
      {label && <Label required={required}>{label}</Label>}
      <input
        type={type}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          display:"block", width:"100%", padding:"11px 14px",
          fontSize:"0.9rem", fontFamily:"'Plus Jakarta Sans',sans-serif",
          background:C.white, color:C.text,
          border:`1.5px solid ${error ? C.error : focus ? C.blue : C.border2}`,
          borderRadius:9, outline:"none",
          transition:"border-color 0.18s, box-shadow 0.18s",
          boxShadow: focus ? `0 0 0 3px ${C.blue}18` : error ? `0 0 0 3px ${C.error}12` : "none",
        }}
        {...props}
      />
      {hint && !error && <p style={{ fontSize:"0.75rem", color:C.muted, marginTop:5 }}>{hint}</p>}
      {error && <p style={{ fontSize:"0.75rem", color:C.error, marginTop:5 }}>⚠ {error}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function CompanyLogin({ onBack, onSwitchToRegister, onForgotPassword, onSuccess }) {
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]     = useState({});
  const [form, setForm]         = useState({ email:"", password:"", remember:false });

  const validate = () => {
    const errs = {};
    if (!form.email.trim())    errs.email    = "Email is required";
    else if (!form.email.includes("@") || !form.email.includes("."))
                               errs.email    = "Enter a valid email address";
    if (!form.password)        errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await loginCompany({ email: form.email, password: form.password });
      onSuccess && onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Try again.";
      if (msg.toLowerCase().includes("password")) {
        setErrors({ password: "Incorrect password." });
      } else if (msg.toLowerCase().includes("email") || msg.toLowerCase().includes("not found")) {
        setErrors({ email: "No account found with this email." });
      } else if (msg.toLowerCase().includes("verified") || msg.toLowerCase().includes("pending")) {
        setErrors({ general: "Your account is still under review. You'll be notified once verified." });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <>
      <FontLoader />
      <div style={{ minHeight:"100vh", display:"flex", background:C.off }}>

        {/* ── Left Panel ── */}
        <div style={{ width:380, flexShrink:0, background:C.ink, display:"flex", flexDirection:"column", padding:"48px 40px", position:"relative", overflow:"hidden" }}>
          {/* decorative blobs */}
          <div style={{ position:"absolute", top:-80, right:-60, width:320, height:320, borderRadius:"50%", background:"rgba(3,62,102,0.6)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-60, left:-40, width:220, height:220, borderRadius:"50%", background:"rgba(163,207,62,0.06)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`, backgroundSize:"22px 22px", pointerEvents:"none" }} />

          {/* Logo */}
          <a
            href="#"
            onClick={e => { e.preventDefault(); onBack && onBack(); }}
            style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", marginBottom:56, position:"relative", zIndex:1 }}
          >
            <img src="./logo.png" alt="Projex.pk" style={{ height:36, width:"auto", objectFit:"contain" }} />
          </a>

          {/* Panel body */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", position:"relative", zIndex:1, animation:"fadeIn 0.4s ease both" }}>
            <div style={{ fontSize:"2.8rem", marginBottom:16 }}>👋</div>
            <h3 style={{ fontSize:"1.35rem", fontWeight:800, color:"#fff", letterSpacing:"-0.025em", marginBottom:10, lineHeight:1.2 }}>
              Welcome back
            </h3>
            <p style={{ fontSize:"0.86rem", color:"rgba(255,255,255,0.48)", lineHeight:1.75, marginBottom:40 }}>
              Sign in to your verified company account and pick up right where you left off — browsing projects, managing requests, and connecting with student teams.
            </p>

            {/* What you can do */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                ["🔍", "Browse student projects from 6+ universities"],
                ["📬", "Manage your Interest Requests"],
                ["💬", "Message approved student teams"],
                ["📊", "View your analytics dashboard"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:"0.9rem", flexShrink:0 }}>{icon}</span>
                  <p style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.35)", lineHeight:1.5 }}>{text}</p>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div style={{ marginTop:40, display:"flex", flexDirection:"column", gap:8 }}>
              {["🔒 All data encrypted in transit","✅ Verified companies only","🏛️ Trusted by 6 Karachi universities"].map(t => (
                <div key={t} style={{ fontSize:"0.74rem", color:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", gap:8 }}>{t}</div>
              ))}
            </div>
          </div>

          <p style={{ fontSize:"0.74rem", color:"rgba(255,255,255,0.2)", position:"relative", zIndex:1, marginTop:32 }}>
            <a href="#" onClick={e => { e.preventDefault(); onBack && onBack(); }}
              style={{ color:"rgba(255,255,255,0.3)", fontWeight:500, textDecoration:"none" }}>← Back to home</a>
            {"  ·  "}
            New company?{" "}
            <a href="#" onClick={e => { e.preventDefault(); onSwitchToRegister && onSwitchToRegister(); }}
              style={{ color:C.green, fontWeight:600, textDecoration:"none" }}>Register here</a>
          </p>
        </div>

        {/* ── Right Form Panel ── */}
        <div style={{ flex:1, overflowY:"auto", display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 40px" }}>
          <div style={{ width:"100%", maxWidth:460, animation:"slideIn 0.35s ease both" }}>

            {/* Header */}
            <div style={{ marginBottom:32 }}>
              <div style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.green, marginBottom:6 }}>
                Company Portal
              </div>
              <h2 style={{ fontSize:"1.75rem", fontWeight:800, color:C.ink, letterSpacing:"-0.03em", marginBottom:8 }}>
                Sign in to your account
              </h2>
              <p style={{ fontSize:"0.86rem", color:C.muted, lineHeight:1.6 }}>
                Don't have an account?{" "}
                <a href="#"
                  onClick={e => { e.preventDefault(); onSwitchToRegister && onSwitchToRegister(); }}
                  style={{ color:C.blue, fontWeight:700, textDecoration:"none" }}
                >Register your company →</a>
              </p>
            </div>

            {/* Card */}
            <div style={{ background:C.white, borderRadius:16, padding:"36px", border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(3,62,102,0.06)" }}>

              {/* General error */}
              {errors.general && (
                <div style={{ background:C.errorPale, border:`1px solid #fecaca`, borderLeft:`4px solid ${C.error}`, borderRadius:9, padding:"12px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"flex-start" }}>
                  <span style={{ flexShrink:0, marginTop:1 }}>⚠️</span>
                  <p style={{ fontSize:"0.82rem", color:C.error, fontWeight:600, lineHeight:1.5 }}>{errors.general}</p>
                </div>
              )}

              {/* Pending notice — shown if account not yet verified */}
              {errors.pending && (
                <div style={{ background:C.amberPale, border:`1.5px solid #fde68a`, borderLeft:`4px solid ${C.amber}`, borderRadius:9, padding:"12px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"flex-start" }}>
                  <span style={{ flexShrink:0, marginTop:1 }}>⏳</span>
                  <div>
                    <p style={{ fontSize:"0.82rem", fontWeight:700, color:"#92400e", marginBottom:3 }}>Account under review</p>
                    <p style={{ fontSize:"0.79rem", color:"#b45309", lineHeight:1.55 }}>Your verification document is still being reviewed. You'll receive an email once approved (1–2 business days).</p>
                  </div>
                </div>
              )}

              <Input
                label="Work Email"
                required
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email:e.target.value})}
                onKeyDown={handleKey}
                placeholder="yourname@company.com"
                error={errors.email}
                autoComplete="email"
              />

              {/* Password with show/hide */}
              <div style={{ marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <Label required>Password</Label>
                  <a href="#"
                    onClick={e => { e.preventDefault(); onForgotPassword && onForgotPassword(); }}
                    style={{ fontSize:"0.75rem", color:C.blue, fontWeight:600, textDecoration:"none" }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration="underline"}
                    onMouseLeave={e => e.currentTarget.style.textDecoration="none"}
                  >Forgot password?</a>
                </div>
                <div style={{ position:"relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm({...form, password:e.target.value})}
                    onKeyDown={handleKey}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{
                      display:"block", width:"100%", padding:"11px 42px 11px 14px",
                      fontSize:"0.9rem", fontFamily:"'Plus Jakarta Sans',sans-serif",
                      background:C.white, color:C.text,
                      border:`1.5px solid ${errors.password ? C.error : C.border2}`,
                      borderRadius:9, outline:"none",
                      transition:"border-color 0.18s, box-shadow 0.18s",
                    }}
                    onFocus={e => e.target.style.borderColor = C.blue}
                    onBlur={e => e.target.style.borderColor = errors.password ? C.error : C.border2}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:"1rem", color:C.muted }}
                  >{showPass ? "🙈" : "👁"}</button>
                </div>
                {errors.password && <p style={{ fontSize:"0.75rem", color:C.error, marginTop:5 }}>⚠ {errors.password}</p>}
              </div>

              {/* Remember me */}
              <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginTop:16, marginBottom:24 }}>
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={e => setForm({...form, remember:e.target.checked})}
                  style={{ accentColor:C.blue, width:16, height:16, flexShrink:0 }}
                />
                <span style={{ fontSize:"0.8rem", color:C.muted }}>Keep me signed in for 30 days</span>
              </label>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  width:"100%", padding:"13px",
                  borderRadius:9, fontSize:"0.95rem", fontWeight:700,
                  cursor: submitting ? "wait" : "pointer",
                  border:"none",
                  background: submitting ? C.muted2 : C.blue,
                  color:"#fff",
                  fontFamily:"'Plus Jakarta Sans',sans-serif",
                  transition:"background 0.18s, box-shadow 0.18s, transform 0.18s",
                  boxShadow: submitting ? "none" : "0 4px 14px rgba(3,62,102,0.25)",
                }}
                onMouseEnter={e => { if (!submitting) { e.currentTarget.style.background=C.blueMid; e.currentTarget.style.transform="translateY(-1px)"; } }}
                onMouseLeave={e => { if (!submitting) { e.currentTarget.style.background=C.blue; e.currentTarget.style.transform="none"; } }}
              >
                {submitting
                  ? <><span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} /> Signing in...</>
                  : "Sign In →"
                }
              </button>

              {/* Divider */}
              <div style={{ display:"flex", alignItems:"center", gap:12, margin:"24px 0" }}>
                <div style={{ flex:1, height:1, background:C.border }} />
                <span style={{ fontSize:"0.74rem", color:C.muted2, fontWeight:500 }}>or</span>
                <div style={{ flex:1, height:1, background:C.border }} />
              </div>

              {/* Register CTA */}
              <button
                type="button"
                onClick={() => onSwitchToRegister && onSwitchToRegister()}
                style={{
                  display:"block", width:"100%", padding:"12px",
                  borderRadius:9, fontSize:"0.9rem", fontWeight:700,
                  cursor:"pointer", border:`1.5px solid ${C.border2}`,
                  color:C.blue, background:"transparent",
                  fontFamily:"'Plus Jakarta Sans',sans-serif",
                  transition:"all 0.18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.background=C.blueTint; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=C.border2; e.currentTarget.style.background="transparent"; }}
              >
                🏢 Register a new company
              </button>
            </div>

            {/* Footer note */}
            <p style={{ textAlign:"center", fontSize:"0.75rem", color:C.muted2, marginTop:20, lineHeight:1.6 }}>
              Having trouble?{" "}
              <a href="mailto:support@projex.pk" style={{ color:C.blue, fontWeight:600, textDecoration:"none" }}>Contact support</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}