"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { C } from "./assets/tokens.js";

/* ─── FONTS & GLOBAL STYLES ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #fff; overflow-x: hidden; }
    
    @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    
    /* 3D Tilted Float Animation for Hero */
    @keyframes floatTilted { 
      0%, 100% { transform: perspective(1200px) rotateY(-16deg) rotateX(8deg) rotateZ(2deg) translateY(0px); } 
      50% { transform: perspective(1200px) rotateY(-14deg) rotateX(10deg) rotateZ(1deg) translateY(-12px); } 
    }

    .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-left { opacity: 0; transform: translateX(-32px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
    .reveal-left.visible { opacity: 1; transform: translateX(0); }
    .reveal-right { opacity: 0; transform: translateX(32px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
    .reveal-right.visible { opacity: 1; transform: translateX(0); }
  `}</style>
);

/* ─── SCROLL REVEAL HOOK ─── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

/* ─── ORIGIN BUTTON ─── */
function getCoverDiameter(w, h, x, y) {
  return Math.ceil(2 * Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y)));
}

function OriginBtn({ children, variant = "primary", size = "default", onClick, style: extra = {} }) {
  const btnRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [coverSize, setCoverSize] = useState(0);
  const showFill = hovered || pressed;

  const updateOrigin = useCallback((x, y) => {
    const node = btnRef.current;
    if (!node) return;
    const r = node.getBoundingClientRect();
    setOrigin({ x, y });
    setCoverSize(getCoverDiameter(r.width, r.height, x, y));
  }, []);

  useEffect(() => {
    const node = btnRef.current;
    if (!(node && showFill)) return;
    const measure = () => {
      const r = node.getBoundingClientRect();
      setCoverSize(getCoverDiameter(r.width, r.height, origin.x, origin.y));
    };
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(node);
    return () => obs.disconnect();
  }, [showFill, origin.x, origin.y]);

  const pad = size === "lg" ? "16px 36px" : size === "sm" ? "10px 22px" : "13px 30px";
  const fs = size === "lg" ? "1rem" : size === "sm" ? "0.82rem" : "0.9rem";

  const base = {
    position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 8, overflow: "hidden", borderRadius: "50px", cursor: "pointer", border: "none",
    padding: pad, fontSize: fs, fontFamily: "'Inter', sans-serif", fontWeight: 600,
    letterSpacing: "-0.01em", transition: "transform 0.15s ease, box-shadow 0.15s ease",
    transform: pressed ? "scale(0.975)" : "none", userSelect: "none", ...extra,
  };

  const fillColor = variant === "gold" ? C.navy : variant === "outline" ? C.navy : C.gold;
  const styles = {
    primary: { background: C.navy, color: "#fff", boxShadow: showFill ? "0 8px 24px rgba(12,35,64,0.25)" : "0 1px 3px rgba(12,35,64,0.15)" },
    gold: { background: C.gold, color: "#fff", boxShadow: showFill ? "0 8px 24px rgba(176,141,87,0.35)" : "0 1px 3px rgba(176,141,87,0.2)" },
    outline: { background: "transparent", color: C.navy, border: `1.5px solid ${C.border}`, boxShadow: "none" },
    ghost: { background: "transparent", color: C.gold, border: `1.5px solid ${C.gold}22`, boxShadow: "none" },
  };

  return (
    <button
      ref={btnRef}
      style={{ ...base, ...styles[variant], color: showFill && variant !== "outline" ? "#fff" : styles[variant].color }}
      onPointerEnter={(e) => { const r = e.currentTarget.getBoundingClientRect(); updateOrigin(e.clientX - r.left, e.clientY - r.top); setHovered(true); }}
      onPointerLeave={() => { setHovered(false); setPressed(false); }}
      onPointerDown={(e) => { if (e.button !== 0) return; const r = e.currentTarget.getBoundingClientRect(); updateOrigin(e.clientX - r.left, e.clientY - r.top); setPressed(true); }}
      onPointerUp={() => setPressed(false)}
      onClick={onClick}
    >
      <span
        aria-hidden
        style={{
          position: "absolute", borderRadius: "50%", background: fillColor,
          width: coverSize, height: coverSize, left: origin.x, top: origin.y,
          transform: `translate(-50%, -50%) scale(${showFill && coverSize > 0 ? 1 : 0})`,
          transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
          opacity: variant === "outline" ? 0.08 : 0.15, pointerEvents: "none",
        }}
      />
      <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 8 }}>
        {children}
      </span>
    </button>
  );
}

/* ─── EYEBROW ─── */
const Eyebrow = ({ children }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: C.gold, marginBottom: 16 }}>
    <span style={{ width: 20, height: 1.5, background: C.gold, display: "inline-block", borderRadius: 2 }} />
    {children}
    <span style={{ width: 20, height: 1.5, background: C.gold, display: "inline-block", borderRadius: 2 }} />
  </div>
);

/* ─── NAV ─── */
function Nav({ navigate }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 900, height: 68,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 48px", fontFamily: "'Inter', sans-serif",
      background: scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.85)",
      backdropFilter: "blur(20px)", borderBottom: `1px solid ${scrolled ? C.border : "transparent"}`,
      transition: "all 0.35s ease",
    }}>
      <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{ width: 34, height: 34, background: C.navy, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: C.gold, borderRadius: "4px 0 0 0" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#fff", zIndex: 1, letterSpacing: "-0.5px" }}>Px</span>
        </div>
        <span style={{ fontSize: "1.15rem", fontWeight: 700, color: C.navy, letterSpacing: "-0.03em", fontFamily: "'Sora', sans-serif" }}>
          Projex<span style={{ color: C.gold }}>.pk</span>
        </span>
      </a>
      <ul style={{ display: "flex", gap: 36, listStyle: "none", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
        {["How It Works", "Features", "Stories"].map(l => (
          <li key={l}>
            <a href={`#${l.toLowerCase().replace(/\s/g, "")}`}
              style={{ fontSize: "0.875rem", fontWeight: 500, color: C.muted, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = C.navy}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}
            >{l}</a>
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: 10 }}>
        <OriginBtn variant="outline" size="sm" onClick={() => navigate("company")}>For Companies</OriginBtn>
        <OriginBtn variant="primary" size="sm" onClick={() => navigate("student")}>For Students</OriginBtn>
      </div>
    </nav>
  );
}

/* ─── HERO (Left-Aligned + Tilted Image) ─── */
function Hero({ navigate }) {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      padding: "120px 48px", position: "relative", overflow: "hidden", background: C.white,
    }}>
      {/* Background Gradients */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`, backgroundSize: "48px 48px", opacity: 0.4, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "10%", left: "40%", width: 500, height: 500, background: `radial-gradient(circle, ${C.goldPale} 0%, transparent 60%)`, pointerEvents: "none", opacity: 0.6 }} />

      <div style={{ maxWidth: 1300, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 64, alignItems: "center", position: "relative", zIndex: 2 }}>
        
        {/* Left Side: Copy & CTA */}
        <div style={{ textAlign: "left" }}>
          <div style={{ animation: "fadeUp 0.5s ease both", display: "inline-flex", marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.cream, border: `1px solid ${C.border}`, borderRadius: 100, padding: "6px 16px 6px 8px", fontSize: "0.78rem", fontWeight: 500, color: C.muted, fontFamily: "'Inter', sans-serif" }}>
              <span style={{ background: C.gold, color: "#fff", fontSize: "0.66rem", fontWeight: 700, padding: "2px 8px", borderRadius: 100, letterSpacing: "0.06em", fontFamily: "'Inter', sans-serif" }}>BETA</span>
              Now live in Karachi & Sindh
            </div>
          </div>

          <h1 style={{
            fontSize: "clamp(3rem,4.5vw,4.8rem)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.08,
            color: C.navy, marginBottom: 24, fontFamily: "'Sora', sans-serif",
            animation: "fadeUp 0.55s 0.07s ease both",
          }}>
            Pakistan's best projects<br />
            <span style={{ position: "relative", display: "inline-block", marginTop: 8 }}>
              <span style={{ color: C.gold, fontStyle: "italic" }}>deserve</span> a real audience
              <span style={{ position: "absolute", bottom: 6, left: 0, right: 0, height: 3, background: C.goldPale, borderRadius: 2, zIndex: -1 }} />
            </span>
          </h1>

          <p style={{
            fontSize: "1.08rem", color: C.muted, maxWidth: 500, margin: "0 0 44px", lineHeight: 1.78,
            fontFamily: "'Inter', sans-serif", fontWeight: 400,
            animation: "fadeUp 0.55s 0.14s ease both",
          }}>
            Projex.pk connects final-year university projects with companies seeking fresh ideas and talent — with intellectual property protection built in from day one.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 48, animation: "fadeUp 0.55s 0.21s ease both" }}>
            <OriginBtn variant="primary" size="lg" onClick={() => navigate("student")}>🎓 Post My Project</OriginBtn>
            <OriginBtn variant="gold" size="lg" onClick={() => navigate("company")}>🏢 Scout Talent</OriginBtn>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, animation: "fadeUp 0.55s 0.28s ease both" }}>
            <div style={{ display: "flex" }}>
              {[["AH", C.navy], ["ZM", C.navyMid], ["SF", C.gold]].map(([init, bg], i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: "50%", background: bg, border: "2px solid #fff", marginLeft: i === 0 ? 0 : -12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#fff", zIndex: 3 - i }}>{init}</div>
              ))}
            </div>
            <span style={{ fontSize: "0.85rem", color: C.muted, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
              Trusted by <strong style={{ color: C.navy }}>120+ students</strong>
            </span>
          </div>
        </div>

        {/* Right Side: Tilted Application Image */}
        <div style={{ perspective: "1200px", position: "relative", animation: "fadeUp 0.8s 0.3s ease both" }}>
          {/* Tilted Container */}
          <div style={{ 
            animation: "floatTilted 7s ease-in-out infinite", 
            transformStyle: "preserve-3d",
            boxShadow: "-15px 25px 60px rgba(12,35,64,0.15)",
            borderRadius: 20, background: C.white
          }}>
            <HeroCard />
          </div>
          {/* Decorative Elements around image */}
          <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: `radial-gradient(circle, ${C.goldPale} 0%, transparent 70%)`, zIndex: -1 }} />
        </div>

      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden" }}>
      <div style={{ background: C.cream, borderBottom: `1px solid ${C.border}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        </div>
        <div style={{ flex: 1, background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 12px", fontSize: "0.75rem", color: C.muted, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Inter', sans-serif" }}>
          <span style={{ color: C.gold }}>🔒</span> projex.pk/discover
        </div>
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <MiniProjCard
          title="AI-Powered Crop Disease Detection"
          status="New" statusBg="#EAF3DE" statusColor="#3B6D11"
          tags={["AI/ML", "AgriTech", "IoT"]}
          meta="📍 NED University · FYP 2025 · Team of 3"
          action="TechFarm PK sent a request"
        />
        <MiniProjCard
          title="Smart Water Quality Monitor via LoRaWAN"
          status="3 Requests" statusBg={C.goldPale} statusColor="#7A5C25"
          tags={["IoT", "CleanTech", "Embedded"]}
          meta="📍 FAST-NU KHI · Electrical Engg · Team of 4"
          action="AquaTech Solutions is interested"
          actionGold
        />
      </div>
    </div>
  );
}

function MiniProjCard({ title, status, statusBg, statusColor, tags, meta, action, actionGold }) {
  return (
    <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, textAlign: "left", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
        <div style={{ fontSize: "0.86rem", fontWeight: 600, color: C.navy, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: "0.64rem", fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: statusBg, color: statusColor, whiteSpace: "nowrap", flexShrink: 0 }}>{status}</div>
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
        {tags.map(t => <span key={t} style={{ fontSize: "0.66rem", fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: C.white, color: C.navyMid, border: `1px solid ${C.border}` }}>{t}</span>)}
      </div>
      <div style={{ fontSize: "0.73rem", color: C.muted, marginBottom: 12 }}>{meta}</div>
      <div style={{ background: C.white, border: `1px dashed ${C.border}`, borderRadius: 7, padding: 10, position: "relative", overflow: "hidden", marginBottom: 10 }}>
        <div style={{ fontSize: "0.71rem", lineHeight: 1.5, color: "transparent", textShadow: "0 0 5px rgba(95,94,90,0.5)", filter: "blur(3px)", userSelect: "none" }}>Custom YOLOv8 model trained on 12,000 labeled images from Punjab farms. Edge inference on Raspberry Pi 4...</div>
        <div style={{ position: "absolute", inset: 0, background: "rgba(244,241,236,0.8)", backdropFilter: "blur(1px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.navy, color: "#fff", fontSize: "0.67rem", fontWeight: 700, padding: "4px 12px", borderRadius: 5 }}>🔒 Approve to unlock</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: actionGold ? C.goldPale : "#EBF0F8", borderRadius: 6, padding: "7px 10px", fontSize: "0.71rem", color: actionGold ? "#7A5C25" : C.navyMid, fontWeight: 500 }}>
        <span>{action}</span>
        <button style={{ background: actionGold ? C.gold : C.navy, color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontSize: "0.67rem", fontWeight: 700, cursor: "pointer" }}>Review →</button>
      </div>
    </div>
  );
}

/* ─── UNIVERSITY LOGOS MARQUEE ─── */
function LogoMarquee() {
  const universities = [
    { id: "ned", name: "NED University" },
    { id: "fast", name: "FAST-NU" },
    { id: "iba", name: "IBA Karachi" },
    { id: "ku", name: "Karachi University" },
    { id: "habib", name: "Habib University" },
    { id: "dawood", name: "Dawood University" },
  ];

  return (
    <section style={{ padding: "40px 0", background: C.white, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, overflow: "hidden" }}>
      <p style={{ textAlign: "center", fontSize: "0.75rem", color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 30, fontFamily: "'Inter', sans-serif" }}>
        Scout talent from top institutions
      </p>
      <div style={{ display: "flex", gap: 80, padding: "0 40px", animation: "ticker 35s linear infinite", width: "max-content", alignItems: "center" }}>
        {[...universities, ...universities, ...universities].map((uni, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 140 }}>
            <img 
              src={`./logos/${uni.id}.png`} 
              alt={uni.name} 
              style={{ maxHeight: 100, maxWidth: "100%", objectFit: "contain", transition: "all 0.3s ease", cursor: "pointer" }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextSibling.style.display = 'block';
              }} 
            />
            <span style={{ display: 'none', fontSize: "0.85rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'Inter', sans-serif" }}>
              {uni.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── STATS ─── */
function Stats() {
  const ref = useReveal();
  const data = [
    { n: "500K+", l: "Annual university graduates across Pakistan" },
    { n: "262+", l: "HEC-recognized universities nationwide" },
    { n: "$3.8B", l: "Pakistan IT exports in FY25 and growing" },
    { n: "31%", l: "Graduate unemployment — a solvable problem" },
  ];
  return (
    <section style={{ padding: "100px 48px", textAlign: "center", background: C.cream }}>
      <div ref={ref} className="reveal" style={{ maxWidth: 1160, margin: "0 auto" }}>
        <Eyebrow>The Opportunity</Eyebrow>
        <h2 style={{ fontSize: "clamp(2rem,3.2vw,2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", color: C.navy, marginBottom: 16, fontFamily: "'Sora', sans-serif", lineHeight: 1.1 }}>
          Pakistan's innovation gap is{" "}
          <em style={{ fontStyle: "italic", color: C.gold, fontFamily: "'Sora', sans-serif" }}>real</em>
        </h2>
        <p style={{ fontSize: "1rem", color: C.muted, maxWidth: 480, margin: "0 auto 56px", lineHeight: 1.75, fontFamily: "'Inter', sans-serif" }}>
          Half a million graduates every year. A booming IT sector. And virtually no bridge between them.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: C.border, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}` }}>
          {data.map(({ n, l }, i) => <StatCell key={i} num={n} label={l} />)}
        </div>
      </div>
    </section>
  );
}

function StatCell({ num, label }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? C.cream : C.white, padding: "40px 32px", transition: "all 0.25s ease", cursor: "default" }}>
      <div style={{ fontSize: "2.8rem", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: hov ? C.gold : C.navy, marginBottom: 10, fontFamily: "'Sora', sans-serif", transition: "color 0.25s" }}>{num}</div>
      <div style={{ fontSize: "0.82rem", color: C.muted, lineHeight: 1.55, fontFamily: "'Inter', sans-serif" }}>{label}</div>
    </div>
  );
}

/* ─── HOW IT WORKS ─── */
function HowItWorks() {
  const titleRef = useReveal();
  const leftRef = useReveal();
  const rightRef = useReveal();
  const steps = {
    student: [
      ["Verify & Register", "Sign up with your .edu.pk university email. Your institution is verified instantly."],
      ["Form Your Team", "Invite teammates by username. Build cross-disciplinary teams of up to 5 members."],
      ["Post a Protected Teaser", "Only title, one-liner, and tech tags appear publicly. Technical details stay locked."],
      ["Review Interest Requests", "Companies send formal requests with their verified profile. You decide who gets access."],
    ],
    company: [
      ["Create a Business Profile", "Register with NTN or business email. Specify sector, size, and innovation needs."],
      ["Browse Project Teasers", "Scan high-level overviews of final year projects tailored to your industry filters."],
      ["Send an Interest Request", "Found something promising? Send a formal request — your profile is shared with the team."],
      ["Access Full Details", "Once approved, unlock the complete submission, reports, demos, and code repositories."],
    ],
  };
  return (
    <section id="howitworks" style={{ background: C.white, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "100px 48px" }}>
        <div ref={titleRef} className="reveal" style={{ marginBottom: 56 }}>
          <Eyebrow>Platform Workflow</Eyebrow>
          <h2 style={{ fontSize: "clamp(2rem,3vw,2.7rem)", fontWeight: 700, letterSpacing: "-0.03em", color: C.navy, fontFamily: "'Sora', sans-serif", lineHeight: 1.1 }}>
            Two sides. One <em style={{ fontStyle: "italic", color: C.gold }}>trusted</em> exchange.
          </h2>
          <p style={{ fontSize: "1rem", color: C.muted, maxWidth: 460, marginTop: 12, lineHeight: 1.75, fontFamily: "'Inter', sans-serif" }}>Students keep control. Companies get access. Everyone wins through consent.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
          <div ref={leftRef} className="reveal-left">
            <StepsCol role="Student" color={C.navy} steps={steps.student} />
          </div>
          <div ref={rightRef} className="reveal-right">
            <StepsCol role="Company" color={C.gold} steps={steps.company} />
          </div>
        </div>
      </div>
    </section>
  );
}

function StepsCol({ role, color, steps }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, paddingBottom: 20, borderBottom: `1.5px solid ${C.border}` }}>
        <span style={{ background: color, color: "#fff", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 12px", borderRadius: 5, fontFamily: "'Inter', sans-serif" }}>{role}</span>
        <span style={{ fontSize: "1rem", fontWeight: 600, color: C.navy, fontFamily: "'Inter', sans-serif" }}>For {role}s</span>
      </div>
      {steps.map(([h, p], i) => (
        <div key={i} style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: C.cream, border: `1.5px solid ${C.border}`, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, marginTop: 2, fontFamily: "'Sora', sans-serif" }}>{i + 1}</div>
          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: C.navy, marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>{h}</h4>
            <p style={{ fontSize: "0.83rem", color: C.muted, lineHeight: 1.65, fontFamily: "'Inter', sans-serif" }}>{p}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── IP SECTION ─── */
function IPSection() {
  const leftRef = useReveal();
  const rightRef = useReveal();
  return (
    <section style={{ padding: "100px 48px", background: C.cream, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
        <div ref={leftRef} className="reveal-left">
          <Eyebrow>Intellectual Property</Eyebrow>
          <h2 style={{ fontSize: "clamp(1.9rem,2.7vw,2.5rem)", fontWeight: 700, letterSpacing: "-0.03em", color: C.navy, fontFamily: "'Sora', sans-serif", lineHeight: 1.12, marginBottom: 16 }}>
            Your idea stays yours —<br />until you say <em style={{ color: C.gold, fontStyle: "italic" }}>otherwise.</em>
          </h2>
          <p style={{ fontSize: "0.97rem", color: C.muted, lineHeight: 1.75, marginBottom: 32, fontFamily: "'Inter', sans-serif" }}>
            Unlike open project portals, Projex.pk runs on a consent-first model. Companies never see technical details without your explicit approval.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              ["🔒", "Teaser-Only Public View", "Companies only see your pitch hook — title, one-liner, tags. Full implementation stays locked."],
              ["📋", "NDA Templates Built In", "Download Pakistan-compliant NDA agreements before any disclosure. Legal scaffolding included."],
              ["📊", "Access Logs & Triggers", "Every view of your approved project is tracked directly to a verified company profile."],
            ].map(([icon, h, p]) => <IPFeat key={h} icon={icon} title={h} desc={p} />)}
          </div>
        </div>
        <div ref={rightRef} className="reveal-right">
          <IPCard />
        </div>
      </div>
    </section>
  );
}

function IPFeat({ icon, title, desc }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: 18, borderRadius: 12, border: `1px solid ${hov ? C.gold : C.border}`, background: hov ? C.white : "transparent", transition: "all 0.2s", cursor: "default" }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: C.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{icon}</div>
      <div>
        <h4 style={{ fontSize: "0.88rem", fontWeight: 600, color: C.navy, marginBottom: 3, fontFamily: "'Inter', sans-serif" }}>{title}</h4>
        <p style={{ fontSize: "0.81rem", color: C.muted, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{desc}</p>
      </div>
    </div>
  );
}

function IPCard() {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 40px rgba(12,35,64,0.06)" }}>
      <div style={{ background: C.navy, padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.5)", fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>Company View — Before Approval</span>
        <strong style={{ fontSize: "0.8rem", color: "#fff", fontFamily: "'Inter', sans-serif" }}>projex.pk/discover</strong>
      </div>
      <div style={{ padding: 22, fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: "0.97rem", fontWeight: 600, color: C.navy, marginBottom: 10 }}>Smart Water Quality Monitoring System</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {["IoT", "Embedded Systems", "CleanTech"].map(t => <span key={t} style={{ background: C.cream, color: C.navyMid, fontSize: "0.68rem", fontWeight: 600, padding: "3px 9px", borderRadius: 4, border: `1px solid ${C.border}` }}>{t}</span>)}
        </div>
        <div style={{ fontSize: "0.77rem", color: C.muted, marginBottom: 14 }}>📍 NED University · Electrical Engg · Class of 2025</div>
        <div style={{ background: C.cream, border: `1px dashed ${C.border}`, borderRadius: 8, padding: 14, position: "relative", overflow: "hidden", marginBottom: 14 }}>
          <div style={{ fontSize: "0.77rem", lineHeight: 1.55, color: "transparent", textShadow: "0 0 6px rgba(95,94,90,0.5)", filter: "blur(3.5px)", userSelect: "none" }}>STM32L476 microcontrollers, custom 4-layer PCBs. FreeRTOS 10.5 with power-optimised sleep achieving 18-month battery...</div>
          <div style={{ position: "absolute", inset: 0, background: "rgba(244,241,236,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: C.navy, color: "#fff", fontSize: "0.69rem", fontWeight: 700, padding: "6px 14px", borderRadius: 6 }}>🔒 Send Interest Request to Proceed</div>
          </div>
        </div>
        <div style={{ background: C.goldPale, border: `1px solid ${C.gold}44`, borderRadius: 8, padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.77rem", color: "#7A5C25", fontWeight: 500 }}>
          <span>AquaTech Solutions has expressed interest</span>
          <button style={{ background: C.gold, color: "#fff", border: "none", borderRadius: 5, padding: "5px 12px", fontSize: "0.71rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Send →</button>
        </div>
      </div>
    </div>
  );
}

/* ─── FEATURES CAROUSEL ─── */
function Features() {
  const ref = useReveal();
  const [index, setIndex] = useState(0);

  const featuresList = [
    { 
      title: "Protected Teaser Listings", 
      desc: "Companies see just enough to get genuinely interested—never enough to replicate the work. Keep your technical advantage completely intact.",
      visual: (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, background: C.goldPale, borderRadius: "50%", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>🔒</div>
          <div style={{ height: 12, width: "70%", background: C.border, borderRadius: 10, margin: "0 auto 12px" }} />
          <div style={{ height: 12, width: "50%", background: C.border, borderRadius: 10, margin: "0 auto 30px" }} />
          <div style={{ background: C.white, border: `1px dashed ${C.gold}`, padding: "16px 20px", borderRadius: 12 }}>
            <div style={{ fontSize: "0.85rem", color: C.gold, fontWeight: 700 }}>Technical Details Locked</div>
            <div style={{ fontSize: "0.75rem", color: C.muted, marginTop: 6 }}>Requires explicit student approval</div>
          </div>
        </div>
      )
    },
    { 
      title: "Student Team Formation", 
      desc: "Invite peers securely by their verified university username. Build cross-disciplinary teams up to 5 members and co-own submissions.",
      visual: (
        <div style={{ padding: "50px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: C.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem", border: "3px solid #fff", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", zIndex: 3 }}>AH</div>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: C.navyMid, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem", border: "3px solid #fff", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", marginLeft: -20, zIndex: 2 }}>SF</div>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: C.gold, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem", border: "3px solid #fff", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", marginLeft: -20, zIndex: 1 }}>+2</div>
          </div>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", fontSize: "0.8rem", color: C.navy, fontWeight: 600 }}>Team 'AeroTech NED' Formed</div>
        </div>
      )
    },
    { 
      title: "Formal Interest Requests", 
      desc: "No cold spam. Companies submit structured requests with their verified profile. You always know exactly who is asking before opening your doors.",
      visual: (
        <div style={{ padding: "30px 20px" }}>
          <div style={{ background: C.white, border: `1px solid ${C.gold}`, borderRadius: 12, padding: 20, boxShadow: "0 8px 24px rgba(176,141,87,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: C.navy, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.8rem" }}>🏢</div>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: C.navy }}>Systems Ltd.</div>
                <div style={{ fontSize: "0.7rem", color: C.muted }}>Verified IT Firm</div>
              </div>
            </div>
            <p style={{ fontSize: "0.8rem", color: C.muted, lineHeight: 1.5, marginBottom: 16 }}>"We are highly interested in your AI model. We would like to review the technicals for a potential internship."</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ flex: 1, padding: "8px", background: C.navy, color: "#fff", border: "none", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600 }}>Approve</button>
              <button style={{ flex: 1, padding: "8px", background: C.cream, color: C.navy, border: "none", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600 }}>Decline</button>
            </div>
          </div>
        </div>
      )
    },
    { 
      title: "In-App Secure Messaging", 
      desc: "Once a request is approved, chat directly on Projex.pk. No need to share personal numbers or emails until a formal agreement is reached.",
      visual: (
        <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ alignSelf: "flex-start", background: C.white, border: `1px solid ${C.border}`, padding: "12px 16px", borderRadius: "14px 14px 14px 0", fontSize: "0.8rem", color: C.navy, maxWidth: "85%", lineHeight: 1.4 }}>
            Thanks for approving our request! Is the prototype deployed yet?
          </div>
          <div style={{ alignSelf: "flex-end", background: C.gold, padding: "12px 16px", borderRadius: "14px 14px 0 14px", fontSize: "0.8rem", color: "#fff", maxWidth: "85%", lineHeight: 1.4 }}>
            Yes, we have a working demo on AWS. I'll share the link.
          </div>
        </div>
      )
    }
  ];

  const handlePrev = () => setIndex(prev => (prev === 0 ? featuresList.length - 1 : prev - 1));
  const handleNext = () => setIndex(prev => (prev === featuresList.length - 1 ? 0 : prev + 1));

  return (
    <section id="features" style={{ background: C.white, borderTop: `1px solid ${C.border}`, padding: "100px 0" }}>
      <div ref={ref} className="reveal" style={{ maxWidth: 1160, margin: "0 auto", padding: "0 48px" }}>
        
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Eyebrow>Core Infrastructure</Eyebrow>
          <h2 style={{ fontSize: "clamp(2rem,3vw,2.7rem)", fontWeight: 700, letterSpacing: "-0.03em", color: C.navy, fontFamily: "'Sora', sans-serif", lineHeight: 1.1, marginBottom: 12 }}>
            Built for trust. <em style={{ fontStyle: "italic", color: C.gold }}>Engineered for scale.</em>
          </h2>
          <p style={{ fontSize: "1rem", color: C.muted, maxWidth: 520, margin: "0 auto", lineHeight: 1.75, fontFamily: "'Inter', sans-serif" }}>
            Everything the platform needs to work. Simple, fast, and focused on quality over noise.
          </p>
        </div>

        {/* Carousel Container */}
        <div style={{ position: "relative", background: C.cream, border: `1px solid ${C.border}`, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(12,35,64,0.05)" }}>
          
          <div style={{ display: "flex", transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)", transform: `translateX(-${index * 100}%)` }}>
            {featuresList.map((feat, i) => (
              <div key={i} style={{ minWidth: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center" }}>
                
                {/* Text Side */}
                <div style={{ padding: "60px" }}>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: C.navy, marginBottom: 16, fontFamily: "'Sora', sans-serif" }}>{feat.title}</h3>
                  <p style={{ fontSize: "1rem", color: C.muted, lineHeight: 1.75, fontFamily: "'Inter', sans-serif" }}>{feat.desc}</p>
                </div>
                
                {/* Visual Side */}
                <div style={{ padding: "40px", background: "rgba(255,255,255,0.4)", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: `1px solid ${C.border}`, position: "relative" }}>
                   <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at center, ${C.goldPale} 0%, transparent 60%)`, opacity: 0.4 }} />
                   <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 360 }}>
                     {feat.visual}
                   </div>
                </div>

              </div>
            ))}
          </div>

          {/* Carousel Controls */}
          <div style={{ position: "absolute", bottom: 24, left: 60, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handlePrev} style={{ width: 36, height: 36, borderRadius: "50%", background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.navy, transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = C.gold} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>←</button>
              <button onClick={handleNext} style={{ width: 36, height: 36, borderRadius: "50%", background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.navy, transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = C.gold} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>→</button>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {featuresList.map((_, i) => (
                <div key={i} style={{ width: i === index ? 24 : 8, height: 8, borderRadius: 4, background: i === index ? C.gold : C.border, transition: "all 0.3s ease" }} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ─── */
function Testimonials() {
  const ref = useReveal();
  const cards = [
    { init: "AH", name: "Ali Hassan", role: "CS Final Year · NED University", text: "We built an AI traffic management prototype for our FYP. Before Projex, it sat in a folder. Within three weeks of posting, two Karachi startups reached out. We're now in active talks." },
    { init: "SF", name: "Sara Farooqi", role: "CTO · Karachi-based Fintech Startup", text: "As a fintech startup, hiring fresh developers is expensive. Projex lets us scout final-year talent and co-develop prototypes before committing to full hires. The gated model means quality over noise." },
    { init: "ZM", name: "Zainab Mirza", role: "Electrical Engg · FAST-NU KHI", text: "The IP protection model is what won me over. I've always been hesitant to share my work publicly. The fact companies can't see technical details without my approval changes everything." },
  ];
  return (
    <section id="stories" style={{ background: C.cream, borderTop: `1px solid ${C.border}` }}>
      <div ref={ref} className="reveal" style={{ maxWidth: 1160, margin: "0 auto", padding: "100px 48px" }}>
        <Eyebrow>Early Voices</Eyebrow>
        <h2 style={{ fontSize: "clamp(2rem,3vw,2.7rem)", fontWeight: 700, letterSpacing: "-0.03em", color: C.navy, fontFamily: "'Sora', sans-serif", lineHeight: 1.1, marginBottom: 12 }}>
          Trusted by students and <em style={{ fontStyle: "italic", color: C.gold }}>companies</em> already.
        </h2>
        <p style={{ fontSize: "1rem", color: C.muted, maxWidth: 440, lineHeight: 1.75, marginBottom: 56, fontFamily: "'Inter', sans-serif" }}>
          What our beta users from Karachi's universities and startups are saying.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {cards.map((c, i) => <TestiCard key={i} {...c} stagger={i} />)}
        </div>
      </div>
    </section>
  );
}

function TestiCard({ init, name, role, text, stagger }) {
  const ref = useReveal();
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref} className={`reveal stagger-${stagger + 1}`} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ border: `1.5px solid ${hov ? C.gold : C.border}`, borderRadius: 16, padding: 32, background: C.white, transition: "all 0.3s ease", transform: hov ? "translateY(-4px)" : "none", boxShadow: hov ? "0 12px 30px rgba(12,35,64,0.06)" : "none", cursor: "default" }}>
      <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
        {[...Array(5)].map((_, i) => <span key={i} style={{ color: C.gold, fontSize: "1rem" }}>★</span>)}
      </div>
      <p style={{ fontSize: "0.9rem", color: C.muted, lineHeight: 1.78, marginBottom: 26, fontStyle: "italic", fontFamily: "'Inter', sans-serif" }}>"{text}"</p>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700, color: "#fff", flexShrink: 0, fontFamily: "'Inter', sans-serif" }}>{init}</div>
        <div>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: C.navy, fontFamily: "'Inter', sans-serif" }}>{name}</div>
          <div style={{ fontSize: "0.75rem", color: C.muted, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── FINAL CTA ─── */
function FinalCTA({ navigate }) {
  const ref = useReveal();
  return (
    <section style={{ background: C.navy, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, rgba(176,141,87,0.08) 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -100, right: -80, width: 500, height: 500, background: `radial-gradient(circle, ${C.gold}18, transparent 65%)`, pointerEvents: "none" }} />

      <div ref={ref} className="reveal" style={{ maxWidth: 1160, margin: "0 auto", padding: "100px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", position: "relative", zIndex: 2 }}>
        <div>
          <h2 style={{ fontSize: "clamp(2.2rem,3.4vw,3rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.1, marginBottom: 18, fontFamily: "'Sora', sans-serif" }}>
            Pakistan's talent pipeline starts <em style={{ color: C.gold, fontStyle: "italic" }}>right here.</em>
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: 36, fontFamily: "'Inter', sans-serif" }}>
            Join the beta. Be among the first universities and companies to shape how Pakistan bridges the gap between academia and industry.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <OriginBtn variant="gold" size="lg" onClick={() => navigate("student")}>🎓 Sign Up as Student</OriginBtn>
            <OriginBtn variant="ghost" size="lg" onClick={() => navigate("company")}>🏢 Sign Up as Company</OriginBtn>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            ["🎓", "I'm a Student", "Post your final-year project safely. Get discovered by real companies. Always free."],
            ["🏢", "I'm a Company", "Scout innovations from 262+ Pakistani universities. Start finding talent today."],
            ["🏛️", "I Represent a University", "Partner with Projex to improve graduate outcomes and industry placement rates."],
          ].map(([icon, h, p]) => <CTABox key={h} icon={icon} title={h} desc={p} />)}
        </div>
      </div>
    </section>
  );
}

function CTABox({ icon, title, desc }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: `rgba(255,255,255,${hov ? "0.08" : "0.04"})`, border: `1px solid rgba(255,255,255,${hov ? "0.15" : "0.07"})`, borderLeft: `3px solid ${hov ? C.gold : "transparent"}`, borderRadius: 12, padding: "20px 22px", display: "flex", alignItems: "center", gap: 18, cursor: "pointer", transform: hov ? "translateX(4px)" : "none", transition: "all 0.22s" }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(176,141,87,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: "0.93rem", fontWeight: 600, color: "#fff", marginBottom: 3, fontFamily: "'Inter', sans-serif" }}>{title}</h3>
        <p style={{ fontSize: "0.79rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif" }}>{desc}</p>
      </div>
      <span style={{ color: hov ? C.gold : "rgba(255,255,255,0.2)", fontSize: "1rem", transition: "all 0.2s", flexShrink: 0 }}>→</span>
    </div>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer style={{ background: "#071220", padding: "40px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", fontFamily: "'Sora', sans-serif" }}>
        Projex<span style={{ color: C.gold }}>.pk</span>
      </div>
      <ul style={{ display: "flex", gap: 28, listStyle: "none", flexWrap: "wrap" }}>
        {["How It Works", "Features", "Privacy Policy", "Terms of Use", "Contact Us"].map(l => (
          <li key={l}>
            <a href="#" style={{ fontSize: "0.81rem", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s", fontFamily: "'Inter', sans-serif" }}
              onMouseEnter={e => e.currentTarget.style.color = C.gold}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
            >{l}</a>
          </li>
        ))}
      </ul>
      <div style={{ fontSize: "0.77rem", color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif" }}>© 2026 Projex.pk · Made in Pakistan 🇵🇰</div>
    </footer>
  );
}

/* ─── APP ROOT ─── */
export default function App({ navigate }) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", position: "relative" }}>
      <FontLoader />
      <Nav navigate={navigate} />
      <main>
        <Hero navigate={navigate} />
        <LogoMarquee />
        <Stats />
        <HowItWorks />
        <IPSection />
        <Features />
        <Testimonials />
        <FinalCTA navigate={navigate} />
      </main>
      <Footer />
    </div>
  );
}