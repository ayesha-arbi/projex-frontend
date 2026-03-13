import { useState } from "react";
import { forgotPassword } from './services/api';

/* ─── FONTS ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f0f7fd; font-family: 'Plus Jakarta Sans', sans-serif; }
    @keyframes fadeUp  { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
    @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
    @keyframes spin    { to { transform: rotate(360deg) } }
  `}</style>
);

/* ─── BRAND ─── */
const C = {
  blue:      "#033e66",
  blueMid:   "#0a5a96",
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

/* ─── LABEL ─── */
function Label({ children, required }) {
  return (
    <label style={{ display:"block", fontSize:"0.8rem", fontWeight:700, color:C.text, marginBottom:6, letterSpacing:"0.01em" }}>
      {children}
      {required && <span style={{ color:C.green, marginLeft:3 }}>*</span>}
    </label>
  );
}

/* ─── INPUT ─── */
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
      {error && <p style={{ fontSize:"0.75rem", color:C.error, marginTop:5 }}>⚠ {error}</p>}
    </div>
  );
}

/* ─── SUCCESS SCREEN ─── */
function SuccessScreen({ email, onBackToLogin }) {
  return (
    <div style={{ textAlign:"center", padding:"10px 0", animation:"fadeUp 0.5s ease both" }}>
      <div style={{
        width:72, height:72, borderRadius:"50%",
        background:C.greenPale, border:`2px solid ${C.green}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"2rem", margin:"0 auto 24px",
        boxShadow:`0 0 0 8px ${C.green}18`,
      }}>📧</div>

      <h2 style={{ fontSize:"1.5rem", fontWeight:800, color:C.ink, marginBottom:10, letterSpacing:"-0.025em" }}>
        Check your inbox
      </h2>
      <p style={{ fontSize:"0.88rem", color:C.muted, lineHeight:1.7, marginBottom:4 }}>
        We've sent a password reset link to:
      </p>
      <p style={{ fontSize:"0.92rem", fontWeight:700, color:C.blue, marginBottom:20 }}>
        {email}
      </p>

      <div style={{ background:C.blueTint, border:`1px solid ${C.bluePale}`, borderRadius:10, padding:"14px 18px", marginBottom:28, textAlign:"left" }}>
        <p style={{ fontSize:"0.78rem", color:C.muted, lineHeight:1.7 }}>
          📌 <strong style={{ color:C.text }}>Didn't get it?</strong> Check your spam folder. The link expires in <strong style={{ color:C.text }}>30 minutes</strong>.
        </p>
      </div>

      <button
        onClick={onBackToLogin}
        style={{
          background:C.blue, color:"#fff", border:"none",
          borderRadius:9, padding:"13px 32px",
          fontSize:"0.92rem", fontWeight:700,
          cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif",
          transition:"all 0.18s", width:"100%",
        }}
        onMouseEnter={e => e.currentTarget.style.background=C.blueMid}
        onMouseLeave={e => e.currentTarget.style.background=C.blue}
      >
        ← Back to Sign In
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   Props:
   - onBack            → go back to home/landing
   - onBackToLogin     → go back to login page
═══════════════════════════════════════════ */
export default function ForgotPassword({ onBack, onBackToLogin }) {
  const [email, setEmail]         = useState("");
  const [error, setError]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]           = useState(false);

  const validate = () => {
    if (!email.trim())                              return "Email is required";
    if (!email.toLowerCase().endsWith(".edu.pk"))   return "Must be a .edu.pk email address";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setDone(true);
    } catch (e) {
      const msg = e.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
          <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize:"24px 24px", pointerEvents:"none" }} />

          {/* Logo */}
          <a href="#" onClick={e => { e.preventDefault(); onBack && onBack(); }}
            style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none", marginBottom:56, position:"relative", zIndex:1 }}>
            <div style={{ width:32, height:32, background:"rgba(255,255,255,0.12)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", bottom:0, right:0, width:12, height:12, background:C.green, borderRadius:"4px 0 0 0" }} />
              <span style={{ fontSize:"0.7rem", fontWeight:800, color:"#fff", zIndex:1 }}>Px</span>
            </div>
            <span style={{ fontSize:"1.1rem", fontWeight:800, color:"#fff", letterSpacing:"-0.4px" }}>
              Projex<span style={{ color:C.green }}>.pk</span>
            </span>
          </a>

          {/* Panel content */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", position:"relative", zIndex:1, animation:"fadeIn 0.4s ease both" }}>
            <div style={{ fontSize:"3rem", marginBottom:16 }}>🔑</div>
            <h3 style={{ fontSize:"1.4rem", fontWeight:800, color:"#fff", letterSpacing:"-0.025em", marginBottom:10, lineHeight:1.2 }}>
              Forgot your password?
            </h3>
            <p style={{ fontSize:"0.88rem", color:"rgba(255,255,255,0.55)", lineHeight:1.75 }}>
              No worries — it happens to the best of us. Enter your university email and we'll send you a reset link right away.
            </p>

            <div style={{ marginTop:40, display:"flex", flexDirection:"column", gap:14 }}>
              {["Works for both students & companies", "Link expires in 30 minutes", "No personal data is shared"].map(item => (
                <div key={item} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:C.green, flexShrink:0 }} />
                  <span style={{ fontSize:"0.82rem", color:"rgba(255,255,255,0.5)", fontWeight:500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* bottom note */}
          <p style={{ fontSize:"0.74rem", color:"rgba(255,255,255,0.25)", position:"relative", zIndex:1, marginTop:32 }}>
            <a href="#" onClick={e => { e.preventDefault(); onBack && onBack(); }}
              style={{ color:"rgba(255,255,255,0.35)", fontWeight:500, textDecoration:"none" }}>← Back to home</a>
            {"  ·  "}
            Remember it?{" "}
            <a href="#" onClick={e => { e.preventDefault(); onBackToLogin && onBackToLogin(); }}
              style={{ color:C.green, fontWeight:600, textDecoration:"none" }}>Sign in</a>
          </p>
        </div>

        {/* ── Right Form Panel ── */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 40px" }}>
          <div style={{ width:"100%", maxWidth:460, animation:"fadeUp 0.4s ease both" }}>

            {!done ? (
              <>
                <div style={{ marginBottom:32 }}>
                  <div style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.green, marginBottom:8 }}>Password Reset</div>
                  <h2 style={{ fontSize:"1.7rem", fontWeight:800, color:C.ink, letterSpacing:"-0.03em", marginBottom:8 }}>Reset your password</h2>
                  <p style={{ fontSize:"0.88rem", color:C.muted, lineHeight:1.6 }}>
                    Enter the email address linked to your Projex account and we'll send you a reset link.
                  </p>
                </div>

                <div style={{ background:C.white, borderRadius:16, padding:"36px", border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(3,62,102,0.06)" }}>
                  <Input
                    label="University Email" required type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    placeholder="yourname@university.edu.pk"
                    hint="Enter the .edu.pk email you registered with."
                    error={error}
                  />

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      width:"100%", padding:"13px", borderRadius:9,
                      fontSize:"0.95rem", fontWeight:700,
                      cursor: submitting ? "wait" : "pointer",
                      border:"none",
                      background: submitting ? C.muted2 : C.blue,
                      color:"#fff", transition:"all 0.18s",
                      fontFamily:"'Plus Jakarta Sans',sans-serif",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                      marginTop:4,
                    }}
                    onMouseEnter={e => { if (!submitting) e.currentTarget.style.background=C.blueMid; }}
                    onMouseLeave={e => { if (!submitting) e.currentTarget.style.background=C.blue; }}
                  >
                    {submitting
                      ? <><span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} /> Sending...</>
                      : "Send Reset Link →"
                    }
                  </button>
                </div>

                <p style={{ textAlign:"center", fontSize:"0.78rem", color:C.muted, marginTop:20 }}>
                  Remember your password?{" "}
                  <a href="#" onClick={e => { e.preventDefault(); onBackToLogin && onBackToLogin(); }}
                    style={{ color:C.blue, fontWeight:700, textDecoration:"none" }}>Sign in here</a>
                </p>
              </>
            ) : (
              <div style={{ background:C.white, borderRadius:16, padding:"40px 36px", border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(3,62,102,0.06)" }}>
                <SuccessScreen email={email} onBackToLogin={() => onBackToLogin && onBackToLogin()} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}