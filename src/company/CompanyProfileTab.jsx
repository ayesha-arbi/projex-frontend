import { useState } from "react";
import { Building2, MapPin, Globe, Mail, CheckCircle, Clock, Tag, Users, Target } from "lucide-react";
import { C } from "../assets/tokens";

function Section({ icon: Icon, title, accent = C.blue, children }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "11px 20px", borderBottom: `1px solid ${C.border}`, background: C.off, display: "flex", alignItems: "center", gap: 10, borderLeft: `3px solid ${accent}` }}>
        {Icon && (
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `${accent}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={12} color={accent} strokeWidth={2.2} />
          </div>
        )}
        <h3 style={{ fontSize: "0.84rem", fontWeight: 800, color: C.ink, margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 20px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: C.bluePale, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={12} color={C.blue} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.7rem", color: C.muted2, fontWeight: 600, marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: "0.84rem", color: C.ink, fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}

function TagChip({ text }) {
  return (
    <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "4px 10px", borderRadius: 5, background: C.bluePale, color: C.blue, border: `1px solid ${C.border2}` }}>
      {text}
    </span>
  );
}

export default function CompanyProfileTab() {
  let user = {};
  try { user = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}

  const companyName   = user.company_name   || user.companyName   || "Your Company";
  const isVerified    = user.verification_status === "VERIFIED";

  const initials = companyName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("") || "CO";

  // Parse comma-separated arrays stored from onboarding
  const lookingFor        = user.looking_for        ? user.looking_for.split(", ").filter(Boolean)        : [];
  const preferredTech     = user.preferred_tech      ? user.preferred_tech.split(", ").filter(Boolean)     : [];
  const prefIndustries    = user.preferred_industry  ? user.preferred_industry.split(", ").filter(Boolean) : [];
  const prefUniversities  = user.preferred_universities ? user.preferred_universities.split(", ").filter(Boolean) : [];

  return (
    <div style={{ padding: "24px 32px", maxWidth: 720, boxSizing: "border-box", animation: "fadeUp 0.22s ease both" }}>

      {/* Header card */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px", marginBottom: 16, boxShadow: "0 2px 12px rgba(3,62,102,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{ width: 60, height: 60, borderRadius: 14, background: C.blue, border: `3px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 800, color: "#fff", flexShrink: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {initials}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: C.ink, margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {companyName}
              </h2>
              {isVerified ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.66rem", fontWeight: 800, padding: "3px 9px", borderRadius: 5, background: C.greenPale, color: C.greenDark, border: `1px solid #b8e060` }}>
                  <CheckCircle size={9} /> VERIFIED
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.66rem", fontWeight: 800, padding: "3px 9px", borderRadius: 5, background: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d" }}>
                  <Clock size={9} /> PENDING VERIFICATION
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {user.industry && (
                <span style={{ fontSize: "0.76rem", color: C.muted, display: "flex", alignItems: "center", gap: 3 }}>
                  <Building2 size={11} /> {user.industry}
                </span>
              )}
              {user.city && (
                <span style={{ fontSize: "0.76rem", color: C.muted, display: "flex", alignItems: "center", gap: 3 }}>
                  <MapPin size={11} /> {user.city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {user.description && (
          <p style={{ fontSize: "0.82rem", color: C.muted, lineHeight: 1.7, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, margin: "16px 0 0" }}>
            {user.description}
          </p>
        )}
      </div>

      {/* Verification notice */}
      {!isVerified && (
        <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderLeft: `4px solid #f59e0b`, borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", gap: 12 }}>
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>⏳</span>
          <div>
            <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#92400e", margin: "0 0 3px" }}>Account under review</p>
            <p style={{ fontSize: "0.78rem", color: "#b45309", margin: 0, lineHeight: 1.6 }}>
              Your verification document is being reviewed. You can browse projects now, but you cannot send access requests until verified (1–2 business days).
            </p>
          </div>
        </div>
      )}

      {/* Company details */}
      <Section icon={Building2} title="Company Details" accent={C.blue}>
        <InfoRow icon={Mail}      label="Email"        value={user.email} />
        <InfoRow icon={Building2} label="Industry"     value={user.industry} />
        <InfoRow icon={Users}     label="Company Size" value={user.company_size || user.size} />
        <InfoRow icon={MapPin}    label="City"         value={user.city} />
        <InfoRow icon={Globe}     label="Website"      value={user.website} />
        <div style={{ padding: "11px 20px" }}>
          <div style={{ fontSize: "0.7rem", color: C.muted2, fontWeight: 600, marginBottom: 1 }}>Verification Status</div>
          <div style={{ fontSize: "0.84rem", fontWeight: 700, color: isVerified ? C.greenDark : "#92400e" }}>
            {isVerified ? "✅ Verified" : "⏳ Pending Review"}
          </div>
        </div>
      </Section>

      {/* What we're looking for */}
      {lookingFor.length > 0 && (
        <Section icon={Target} title="Looking For" accent={C.greenDark}>
          <div style={{ padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {lookingFor.map((item) => (
              <span key={item} style={{ fontSize: "0.74rem", fontWeight: 700, padding: "5px 12px", borderRadius: 20, background: C.greenPale, color: C.greenDark, border: `1px solid #b8e060` }}>
                ✓ {item}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Preferences */}
      {(preferredTech.length > 0 || prefIndustries.length > 0 || prefUniversities.length > 0) && (
        <Section icon={Tag} title="Preferences" accent={C.blue}>
          <div style={{ padding: "8px 0" }}>
            {preferredTech.length > 0 && (
              <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: C.muted2, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Tech Categories</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {preferredTech.map((t) => <TagChip key={t} text={t} />)}
                </div>
              </div>
            )}
            {prefIndustries.length > 0 && (
              <div style={{ padding: "10px 20px", borderBottom: prefUniversities.length > 0 ? `1px solid ${C.border}` : "none" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: C.muted2, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Industries</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {prefIndustries.map((t) => <TagChip key={t} text={t} />)}
                </div>
              </div>
            )}
            {prefUniversities.length > 0 && (
              <div style={{ padding: "10px 20px" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: C.muted2, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Universities</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {prefUniversities.map((t) => <TagChip key={t} text={t} />)}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}