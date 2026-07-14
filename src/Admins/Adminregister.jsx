import { useState } from "react";
import { C } from "../assets/tokens.js";
import { registerAdmin } from "../services/adminApi.js";
import { AdminFontLoader, Btn } from "./AdminShared.jsx";

const inputStyle = {
  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "11px 14px",
  fontSize: "0.9rem", fontFamily: "'Inter', sans-serif", color: C.navy, outline: "none",
  transition: "border-color 0.15s ease",
};

function Field({ label, children, style = {} }) {
  return (
    <div style={style}>
      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: C.navy, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

/**
 * One-time setup screen for founders. Requires the ADMIN_SECRET from the
 * backend's .env — anyone without it cannot create an admin account, so
 * this screen is safe to leave reachable without its own auth gate.
 */
export default function AdminRegister({ onRegistered, onBackToLogin }) {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", admin_secret: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const passwordOk = (pw) => pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.full_name.trim() || !form.email.trim() || !form.password || !form.admin_secret) {
      setError("All fields are required.");
      return;
    }
    if (!passwordOk(form.password)) {
      setError("Password needs at least 8 characters, one uppercase letter, and one number.");
      return;
    }
    setLoading(true);
    try {
      await registerAdmin(form);
      setSuccess(true);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 403) setError("Incorrect admin secret.");
      else if (status === 409) setError("An admin with this email already exists.");
      else setError(msg || "Registration failed. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-scope" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.cream, padding: 20 }}>
      <AdminFontLoader />
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 18, padding: 36, boxShadow: "0 10px 40px rgba(12,35,64,0.06)" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>✅</div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.2rem", fontWeight: 700, color: C.navy, marginBottom: 8 }}>
                Admin account created
              </h2>
              <p style={{ fontSize: "0.85rem", color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>
                You can now sign in with your email and password.
              </p>
              <Btn variant="primary" onClick={onBackToLogin} style={{ width: "100%" }}>
                <span style={{ width: "100%", textAlign: "center" }}>Go to sign in</span>
              </Btn>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 26 }}>
                <div style={{ display: "inline-block", background: C.gold, color: "#fff", fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 100, marginBottom: 14 }}>
                  One-time setup
                </div>
                <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.3rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.02em" }}>
                  Register the first admin
                </h1>
                <p style={{ fontSize: "0.8rem", color: C.muted, marginTop: 6, lineHeight: 1.6 }}>
                  Needs the <code style={{ background: C.cream, padding: "1px 5px", borderRadius: 4 }}>ADMIN_SECRET</code> from the server's .env file.
                </p>
              </div>

              {error && (
                <div style={{ background: "#FBE9E7", border: "1px solid #f3c6c1", color: "#B3261E", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", marginBottom: 18 }}>
                  {error}
                </div>
              )}

              <form onSubmit={submit}>
                <Field label="Full name" style={{ marginBottom: 16 }}>
                  <input style={inputStyle} value={form.full_name} onChange={set("full_name")} placeholder="Ayesha Khan"
                    onFocus={(e) => (e.target.style.borderColor = C.gold)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
                </Field>
                <Field label="Email" style={{ marginBottom: 16 }}>
                  <input type="email" style={inputStyle} value={form.email} onChange={set("email")} placeholder="admin@projex.pk"
                    onFocus={(e) => (e.target.style.borderColor = C.gold)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
                </Field>
                <Field label="Password" style={{ marginBottom: 16 }}>
                  <input type="password" style={inputStyle} value={form.password} onChange={set("password")} placeholder="Min 8 chars, 1 uppercase, 1 number"
                    onFocus={(e) => (e.target.style.borderColor = C.gold)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
                </Field>
                <Field label="Admin secret" style={{ marginBottom: 24 }}>
                  <input type="password" style={inputStyle} value={form.admin_secret} onChange={set("admin_secret")} placeholder="From your .env file"
                    onFocus={(e) => (e.target.style.borderColor = C.gold)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
                </Field>
                <Btn type="submit" variant="gold" loading={loading} style={{ width: "100%" }}>
                  <span style={{ width: "100%", textAlign: "center" }}>Create admin account</span>
                </Btn>
              </form>

              <p style={{ textAlign: "center", fontSize: "0.78rem", color: C.muted, marginTop: 20 }}>
                Already registered?{" "}
                <a href="#login" onClick={(e) => { e.preventDefault(); onBackToLogin(); }} style={{ color: C.navy, fontWeight: 600, textDecoration: "underline" }}>
                  Sign in instead
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}