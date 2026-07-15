import { useState } from "react";
import { C } from "../assets/tokens.js";
import { loginAdmin, adminSession } from "../services/adminApi.js";
import { AdminFontLoader, Btn } from "./AdminShared.jsx";

export default function AdminLogin({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const data = await loginAdmin({ email: email.trim(), password });
      adminSession.save(data.token, data.admin);
      onLoggedIn(data.admin);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 401) setError("Incorrect email or password.");
      else if (status === 403) setError(msg || "This admin account has been deactivated.");
      else setError(msg || "Couldn't log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-scope" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.cream, padding: 20 }}>
      <AdminFontLoader />
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 36 }}>
          <div style={{ width: 36, height: 36, background: C.navy, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: C.gold, borderRadius: "4px 0 0 0" }} />
            <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#fff" }}>Px</span>
          </div>
          <span style={{ fontSize: "1.2rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.03em", fontFamily: "'Sora', sans-serif" }}>
            Projex<span style={{ color: C.gold }}>.pk</span>
          </span>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 18, padding: 36, boxShadow: "0 10px 40px rgba(12,35,64,0.06)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-block", background: C.navy, color: "#fff", fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 100, marginBottom: 14 }}>
              Internal
            </div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.02em" }}>
              Admin sign in
            </h1>
            <p style={{ fontSize: "0.82rem", color: C.muted, marginTop: 6 }}>Founder access only.</p>
          </div>

          {error && (
            <div style={{ background: "#FBE9E7", border: "1px solid #f3c6c1", color: "#B3261E", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", marginBottom: 18 }}>
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <Field label="Email">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@projex.pk" autoFocus
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = C.gold)}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />
            </Field>
            <Field label="Password" style={{ marginTop: 16, marginBottom: 26 }}>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = C.gold)}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />
            </Field>
            <Btn type="submit" variant="primary" loading={loading} style={{ width: "100%" }}>
              <span style={{ width: "100%", textAlign: "center" }}>Sign in</span>
            </Btn>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.76rem", color: C.muted, marginTop: 22 }}>
          No admin account yet?{" "}
          <a href="#register" onClick={(e) => { e.preventDefault(); onLoggedIn(null, true); }} style={{ color: C.navy, fontWeight: 600, textDecoration: "underline" }}>
            Register the first admin
          </a>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children, style = {} }) {
  return (
    <div style={style}>
      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: C.navy, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "11px 14px",
  fontSize: "0.9rem", fontFamily: "'Inter', sans-serif", color: C.navy, outline: "none",
  transition: "border-color 0.15s ease",
};
