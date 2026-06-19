import { useState } from "react";
import { loginCompany } from '../services/api';
import { C, fonts } from '../assets/tokens.js';
import {
  Search, Mail, MessageSquare, BarChart3, Lock, Check, Landmark,
  Eye, EyeOff, AlertTriangle, Clock, Building2, Loader2, ArrowRight,
} from "lucide-react";

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

/* ─── SHARED FIELD COMPONENTS ─── */
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
      <input
        type={type}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          display:"block", width:"100%", padding:"11px 14px",
          fontSize:"0.9rem", fontFamily:fonts.body,
          background:C.white, color:C.text,
          border:`1.5px solid ${err ? error : focus ? C.gold : C.border}`,
          borderRadius:9, outline:"none",
          transition:"border-color 0.18s, box-shadow 0.18s",
          boxShadow: focus ? `0 0 0 3px ${C.gold}18` : err ? `0 0 0 3px ${error}12` : "none",
        }}
        {...props}
      />
      {hint && !err && <p style={{ fontSize:"0.75rem", color:C.muted, marginTop:5, fontFamily:fonts.body }}>{hint}</p>}
      {err && <p style={{ fontSize:"0.75rem", color:error, marginTop:5, fontFamily:fonts.body }}>⚠ {err}</p>}
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
  const [submitHov, setSubmitHov] = useState(false);
  const [regHov, setRegHov] = useState(false);

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
      const res = await loginCompany({ email: form.email, password: form.password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user || res.data.company));
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
      <div style={{ minHeight:"100vh", display:"flex", background:C.cream }}>

        {/* ── Left Panel ── */}
        <div style={{ width:380, flexShrink:0, background:C.navy, display:"flex", flexDirection:"column", padding:"48px 40px", position:"relative", overflow:"hidden" }}>
          {/* decorative blobs */}
          <div style={{ position:"absolute", top:-80, right:-60, width:320, height:320, borderRadius:"50%", background:`${C.gold}14`, pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-60, left:-40, width:220, height:220, borderRadius:"50%", background:`${C.gold}0d`, pointerEvents:"none" }} />
          <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`, backgroundSize:"22px 22px", pointerEvents:"none" }} />

          {/* Logo */}
          <a
            href="#"
            onClick={e => { e.preventDefault(); onBack && onBack(); }}
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

          {/* Panel body */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", position:"relative", zIndex:1, animation:"fadeIn 0.4s ease both" }}>
            <div style={{ width:56, height:56, borderRadius:14, background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
              <Building2 size={28} color={C.gold} strokeWidth={1.6} />
            </div>
            <h3 style={{ fontSize:"1.35rem", fontWeight:700, color:"#fff", letterSpacing:"-0.025em", marginBottom:10, lineHeight:1.2, fontFamily:fonts.display }}>
              Welcome back
            </h3>
            <p style={{ fontSize:"0.86rem", color:"rgba(255,255,255,0.48)", lineHeight:1.75, marginBottom:40, fontFamily:fonts.body }}>
              Sign in to your verified company account and pick up right where you left off — browsing projects, managing requests, and connecting with student teams.
            </p>

            {/* What you can do */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                [Search, "Browse student projects from 6+ universities"],
                [Mail, "Manage your Interest Requests"],
                [MessageSquare, "Message approved student teams"],
                [BarChart3, "View your analytics dashboard"],
              ].map(([Icon, text]) => (
                <div key={text} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <Icon size={15} color={C.gold} strokeWidth={1.7} style={{ flexShrink:0 }} />
                  <p style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.35)", lineHeight:1.5, fontFamily:fonts.body }}>{text}</p>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div style={{ marginTop:40, display:"flex", flexDirection:"column", gap:8 }}>
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
            New company?{" "}
            <a href="#" onClick={e => { e.preventDefault(); onSwitchToRegister && onSwitchToRegister(); }}
              style={{ color:C.gold, fontWeight:600, textDecoration:"none" }}>Register here</a>
          </p>
        </div>

        {/* ── Right Form Panel ── */}
        <div style={{ flex:1, overflowY:"auto", display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 40px" }}>
          <div style={{ width:"100%", minWidth:520, animation:"slideIn 0.35s ease both" }}>

            {/* Header */}
            <div style={{ marginBottom:32 }}>
              <div style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.gold, marginBottom:6, fontFamily:fonts.body }}>
                Company Portal
              </div>
              <h2 style={{ fontSize:"1.75rem", fontWeight:700, color:C.navy, letterSpacing:"-0.03em", marginBottom:8, fontFamily:fonts.display }}>
                Sign in to your account
              </h2>
              <p style={{ fontSize:"0.86rem", color:C.muted, lineHeight:1.6, fontFamily:fonts.body }}>
                Don't have an account?{" "}
                <a href="#"
                  onClick={e => { e.preventDefault(); onSwitchToRegister && onSwitchToRegister(); }}
                  style={{ color:C.navy, fontWeight:700, textDecoration:"none" }}
                >Register your company →</a>
              </p>
            </div>

            {/* Card */}
            <div style={{ background:C.white, borderRadius:16, padding:"36px", border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(12,35,64,0.06)" }}>

              {/* General error */}
              {errors.general && (
                <div style={{ background:errorPale, border:`1px solid #fecaca`, borderLeft:`4px solid ${error}`, borderRadius:9, padding:"12px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"flex-start" }}>
                  <AlertTriangle size={16} color={error} strokeWidth={1.8} style={{ flexShrink:0, marginTop:1 }} />
                  <p style={{ fontSize:"0.82rem", color:error, fontWeight:600, lineHeight:1.5, fontFamily:fonts.body }}>{errors.general}</p>
                </div>
              )}

              {/* Pending notice — shown if account not yet verified */}
              {errors.pending && (
                <div style={{ background:amberPale, border:`1.5px solid #fde68a`, borderLeft:`4px solid ${amber}`, borderRadius:9, padding:"12px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"flex-start" }}>
                  <Clock size={16} color={amber} strokeWidth={1.8} style={{ flexShrink:0, marginTop:1 }} />
                  <div>
                    <p style={{ fontSize:"0.82rem", fontWeight:700, color:"#92400e", marginBottom:3, fontFamily:fonts.body }}>Account under review</p>
                    <p style={{ fontSize:"0.79rem", color:"#b45309", lineHeight:1.55, fontFamily:fonts.body }}>Your verification document is still being reviewed. You'll receive an email once approved (1–2 business days).</p>
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
                    style={{ fontSize:"0.75rem", color:C.navy, fontWeight:600, textDecoration:"none" }}
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
                      fontSize:"0.9rem", fontFamily:fonts.body,
                      background:C.white, color:C.text,
                      border:`1.5px solid ${errors.password ? error : C.border}`,
                      borderRadius:9, outline:"none",
                      transition:"border-color 0.18s, box-shadow 0.18s",
                    }}
                    onFocus={e => e.target.style.borderColor = C.gold}
                    onBlur={e => e.target.style.borderColor = errors.password ? error : C.border}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.muted, display:"flex" }}
                  >{showPass ? <EyeOff size={16} strokeWidth={1.7} /> : <Eye size={16} strokeWidth={1.7} />}</button>
                </div>
                {errors.password && <p style={{ fontSize:"0.75rem", color:error, marginTop:5, fontFamily:fonts.body }}>⚠ {errors.password}</p>}
              </div>

              {/* Remember me */}
              <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginTop:16, marginBottom:24 }}>
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={e => setForm({...form, remember:e.target.checked})}
                  style={{ accentColor:C.navy, width:16, height:16, flexShrink:0 }}
                />
                <span style={{ fontSize:"0.8rem", color:C.muted, fontFamily:fonts.body }}>Keep me signed in for 30 days</span>
              </label>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                onMouseEnter={() => setSubmitHov(true)}
                onMouseLeave={() => setSubmitHov(false)}
                style={{
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  width:"100%", padding:"13px",
                  borderRadius:50, fontSize:"0.95rem", fontWeight:600,
                  cursor: submitting ? "wait" : "pointer",
                  border:"none",
                  background: submitting ? C.disabledText : submitHov ? C.gold : C.navy,
                  color:"#fff",
                  fontFamily:fonts.body,
                  transition:"background 0.18s, box-shadow 0.18s, transform 0.18s",
                  boxShadow: submitting ? "none" : submitHov ? "0 8px 20px rgba(176,141,87,0.3)" : "0 4px 14px rgba(12,35,64,0.2)",
                  transform: submitHov && !submitting ? "translateY(-1px)" : "none",
                }}
              >
                {submitting
                  ? <><Loader2 size={15} style={{ animation:"spin 0.7s linear infinite" }} /> Signing in...</>
                  : <>Sign In <ArrowRight size={15} strokeWidth={2} /></>
                }
              </button>

              {/* Divider */}
              <div style={{ display:"flex", alignItems:"center", gap:12, margin:"24px 0" }}>
                <div style={{ flex:1, height:1, background:C.border }} />
                <span style={{ fontSize:"0.74rem", color:C.muted2, fontWeight:500, fontFamily:fonts.body }}>or</span>
                <div style={{ flex:1, height:1, background:C.border }} />
              </div>

              {/* Register CTA */}
              <button
                type="button"
                onClick={() => onSwitchToRegister && onSwitchToRegister()}
                onMouseEnter={() => setRegHov(true)}
                onMouseLeave={() => setRegHov(false)}
                style={{
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"12px",
                  borderRadius:50, fontSize:"0.9rem", fontWeight:600,
                  cursor:"pointer", border:`1.5px solid ${regHov ? C.gold : C.border}`,
                  color:C.navy, background: regHov ? C.cream : "transparent",
                  fontFamily:fonts.body,
                  transition:"all 0.18s",
                }}
              >
                <Building2 size={15} strokeWidth={2} /> Register a new company
              </button>
            </div>

            {/* Footer note */}
            <p style={{ textAlign:"center", fontSize:"0.75rem", color:C.muted2, marginTop:20, lineHeight:1.6, fontFamily:fonts.body }}>
              Having trouble?{" "}
              <a href="mailto:support@projex.pk" style={{ color:C.navy, fontWeight:600, textDecoration:"none" }}>Contact support</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}