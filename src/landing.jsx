import { useState, useEffect, useRef } from "react";
import StudentOnboarding from "./student/student-onboarding.jsx";
import CompanyOnboarding from "./company/company-onboarding.jsx";

/* ─── GOOGLE FONTS ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
    @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  `}</style>
);
<style>{`
  body {
    margin: 0;
    overflow-x: hidden;
    background: #000;
  }
`}</style>

/* ─── BRAND TOKENS ─── */
const C = {
  blue:      "#033e66",
  blueMid:   "#0a5a96",
  blueLight: "#1a7cc4",
  bluePale:  "#e8f3fb",
  blueTint:  "#f0f7fd",
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
};

/* ══════════════════════════════════════════
   CUSTOM CURSOR
   FIX 1: Date.now in render → moved trail
   aging into a canvas-based RAF loop so
   nothing impure runs during React render.
   Trails are drawn on a 2nd canvas overlay
   instead of rendered as DOM elements.
══════════════════════════════════════════ */
function CustomCursor() {
  const dotRef        = useRef(null);
  const ringRef       = useRef(null);
  const trailCanvasRef= useRef(null);
  const posRef        = useRef({ x: -100, y: -100 });
  const ringPos       = useRef({ x: -100, y: -100 });
  const rafRef        = useRef(null);
  const isHoverRef    = useRef(false);
  const isClickRef    = useRef(false);
  const trailsRef     = useRef([]); // [{x,y,born}] — never in React state

  useEffect(() => {
    const tc  = trailCanvasRef.current;
    const tctx= tc.getContext("2d");

    const resize = () => {
      tc.width  = window.innerWidth;
      tc.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      trailsRef.current.push({ x: e.clientX, y: e.clientY, born: performance.now() });
      if (trailsRef.current.length > 24) trailsRef.current.shift();
    };
    const onOver = (e) => {
      if (e.target.closest("a,button,[data-hover]")) isHoverRef.current = true;
    };
    const onOut  = () => { isHoverRef.current = false; };
    const onDown = () => { isClickRef.current = true; };
    const onUp   = () => { isClickRef.current = false; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout",  onOut);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);

    const LIFE = 600;
    const COLORS = [C.green, C.blue, C.blueLight];

    const loop = () => {
      const now = performance.now();

      /* dot — instant */
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${posRef.current.x - 4}px,${posRef.current.y - 4}px)`;
      }

      /* ring — lagged */
      if (ringRef.current) {
        ringPos.current.x += (posRef.current.x - ringPos.current.x) * 0.12;
        ringPos.current.y += (posRef.current.y - ringPos.current.y) * 0.12;
        const s = isHoverRef.current ? 2.2 : isClickRef.current ? 0.8 : 1;
        ringRef.current.style.transform =
          `translate(${ringPos.current.x - 20}px,${ringPos.current.y - 20}px) scale(${s})`;
        ringRef.current.style.borderColor = isHoverRef.current ? C.green : C.blue;
        ringRef.current.style.background  = isHoverRef.current ? `${C.green}22` : "transparent";
      }

      /* trails — drawn on canvas, no React state */
      tctx.clearRect(0, 0, tc.width, tc.height);
      trailsRef.current = trailsRef.current.filter(p => now - p.born < LIFE);
      trailsRef.current.forEach((p, i) => {
        const age     = (now - p.born) / LIFE;          // performance.now() in RAF ✓
        const opacity = Math.max(0, (1 - age) * 0.55);
        const radius  = Math.max(0, (1 - age) * 4);
        tctx.beginPath();
        tctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        tctx.fillStyle = COLORS[i % 3];
        tctx.globalAlpha = opacity;
        tctx.fill();
        tctx.globalAlpha = 1;
      });

      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout",  onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  return (
    <>
      <style>{`
        * { cursor: none !important; }
        .cur-dot {
          position:fixed;top:0;left:0;width:8px;height:8px;
          background:${C.green};border-radius:50%;
          pointer-events:none;z-index:99999;
          box-shadow:0 0 8px ${C.green},0 0 16px ${C.green}66;
          will-change:transform;
        }
        .cur-ring {
          position:fixed;top:0;left:0;width:40px;height:40px;
          border:1.5px solid ${C.blue};border-radius:50%;
          pointer-events:none;z-index:99998;
          transition:border-color 0.25s,background 0.25s;
          mix-blend-mode:multiply;will-change:transform;
        }
      `}</style>
      {/* trail canvas — drawn in RAF, never causes re-render */}
      <canvas ref={trailCanvasRef} style={{
        position:"fixed",top:0,left:0,
        width:"100vw",height:"100vh",
        pointerEvents:"none",zIndex:99997,
      }} />
      <div ref={dotRef}  className="cur-dot" />
      <div ref={ringRef} className="cur-ring" />
    </>
  );
}

/* ══════════════════════════════════════════
   INTERACTIVE BG CANVAS
   FIX 2: removed unused (_, i) → just (_)
══════════════════════════════════════════ */
function InteractiveBg() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: -1000, y: -1000 });
  const nodesRef  = useRef([]);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let W = 0, H = 0;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // FIX 2: (_, i) → (_) — i was unused
    nodesRef.current = Array.from({ length: 55 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      r:     Math.random() * 2.5 + 1,
      alpha: Math.random() * 0.4 + 0.15,
    }));

    const onMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      nodes.forEach(n => {
        const dx   = mouse.x - n.x;
        const dy   = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220 && dist > 0) {
          n.vx += (dx / dist) * 0.018;
          n.vy += (dy / dist) * 0.018;
        }
        n.vx *= 0.97; n.vy *= 0.97;
        n.x  += n.vx;  n.y  += n.vy;
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(3,62,102,${(1 - d / 130) * 0.15})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
        const mdx = nodes[i].x - mouse.x;
        const mdy = nodes[i].y - mouse.y;
        const md  = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 180) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(163,207,62,${(1 - md / 180) * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      nodes.forEach(n => {
        const mdx  = n.x - mouse.x;
        const mdy  = n.y - mouse.y;
        const md   = Math.sqrt(mdx * mdx + mdy * mdy);
        const glow = md < 160 ? 1 + (1 - md / 160) * 2 : 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * glow, 0, Math.PI * 2);
        ctx.fillStyle = md < 160
          ? `rgba(163,207,62,${n.alpha + 0.3})`
          : `rgba(3,62,102,${n.alpha})`;
        ctx.fill();
      });

      const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
      grd.addColorStop(0, "rgba(163,207,62,0.06)");
      grd.addColorStop(1, "rgba(163,207,62,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 200, 0, Math.PI * 2);
      ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", top:0, left:0,
      width:"100vw", height:"100vh",
      pointerEvents:"none", zIndex:0,
    }} />
  );
}

/* ══════════════════════════════════════════
   SCROLL REVEAL HOOK
══════════════════════════════════════════ */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── Shared tiny components ── */
const Eyebrow = ({ children }) => (
  <div style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:"0.73rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.blue, marginBottom:14 }}>
    <span style={{ width:16, height:2, background:C.green, borderRadius:2, display:"inline-block" }} />
    {children}
  </div>
);
const SH = ({ children, style: s = {} }) => (
  <h2 style={{ fontSize:"clamp(2rem,3.2vw,3rem)", fontWeight:800, letterSpacing:"-0.028em", color:C.ink, lineHeight:1.08, marginBottom:14, fontFamily:"'Plus Jakarta Sans',sans-serif", ...s }}>{children}</h2>
);
const SSub = ({ children, center = false, style: s = {} }) => (
  <p style={{ fontSize:"1rem", color:C.muted, maxWidth:500, lineHeight:1.75, fontWeight:400, margin: center ? "0 auto" : undefined, ...s }}>{children}</p>
);
const Serif = ({ children }) => (
  <em style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontWeight:400, color:C.blue }}>{children}</em>
);
const Divider = () => <div style={{ height:1, background:C.border }} />;

/* ══════════════════════════════════════════
   BUTTON
   FIX 3: ghost variant had duplicate
   'background' key — fixed by using a single
   conditional expression for background.
══════════════════════════════════════════ */
function Btn({ children, variant = "primary", size = "sm", style: extraStyle = {}, onClick }) {
  const [hov, setHov] = useState(false);

  const pad = size === "xl" ? "16px 36px" : size === "lg" ? "14px 28px" : "9px 20px";
  const fs  = size === "xl" ? "1rem"      : size === "lg" ? "0.95rem"   : "0.875rem";

  const base = {
    display:"inline-flex", alignItems:"center", gap:7,
    borderRadius:8, fontFamily:"'Plus Jakarta Sans',sans-serif",
    fontWeight:700, cursor:"pointer", textDecoration:"none",
    transition:"all 0.18s", border:"none", whiteSpace:"nowrap",
    padding:pad, fontSize:fs,
  };

  // FIX 3: each variant object has exactly one 'background' key
  const vMap = {
    primary: {
      background: hov ? C.blueMid : C.blue,
      color: "#fff",
      boxShadow: hov ? "0 8px 20px rgba(3,62,102,0.25)" : "0 1px 3px rgba(3,62,102,0.2)",
      transform: hov ? "translateY(-1px)" : "none",
    },
    ghost: {
      background: hov ? C.blueTint : "transparent",   // ← single key
      border: `1.5px solid ${hov ? C.blue : C.border2}`,
      color: C.blue,
    },
    green: {
      background: hov ? "#b8e047" : C.green,
      color: C.blue,
      boxShadow: hov ? "0 8px 20px rgba(163,207,62,0.3)" : "0 1px 3px rgba(163,207,62,0.2)",
      transform: hov ? "translateY(-1px)" : "none",
    },
    outlineWhite: {
      background: "transparent",
      border: `1.5px solid rgba(255,255,255,${hov ? "0.4" : "0.2"})`,
      color: "#fff",
      transform: hov ? "translateY(-1px)" : "none",
    },
  };

  return (
    <button
      style={{ ...base, ...vMap[variant], ...extraStyle }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >{children}</button>
  );
}

/* ══════════════════════════════════════════
   NAV
══════════════════════════════════════════ */
function Nav({navigate}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:900, height:64, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 48px", background:"rgba(255,255,255,0.93)", backdropFilter:"blur(18px)", borderBottom:`1px solid ${C.border}`, boxShadow: scrolled ? "0 2px 20px rgba(3,62,102,0.08)" : "none", transition:"box-shadow 0.3s", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <a href="#" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
        <div style={{ width:32, height:32, background:C.blue, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", bottom:0, right:0, width:12, height:12, background:C.green, borderRadius:"4px 0 0 0" }} />
          <span style={{ fontSize:"0.7rem", fontWeight:800, color:"#fff", zIndex:1, letterSpacing:"-0.5px" }}>Px</span>
        </div>
        <span style={{ fontSize:"1.15rem", fontWeight:800, color:C.blue, letterSpacing:"-0.5px" }}>
          Projex<span style={{ color:C.green }}>.pk</span>
        </span>
      </a>
      <ul style={{ display:"flex", gap:32, listStyle:"none", position:"absolute", left:"50%", transform:"translateX(-50%)" }}>
        {["How It Works","Features","Pricing","Stories"].map(l => (
          <li key={l}>
            <a href={`#${l.toLowerCase().replace(/\s/g,"")}`}
              style={{ fontSize:"0.875rem", fontWeight:500, color:C.muted, textDecoration:"none", transition:"color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = C.blue}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}
            >{l}</a>
          </li>
        ))}
      </ul>
      <div style={{ display:"flex", gap:10 }}>
        <Btn variant="ghost" onClick={() => navigate("company")}>For Companies </Btn>
        <Btn variant="primary"onClick={() => navigate("student")}>For Students</Btn>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════
   HERO
══════════════════════════════════════════ */
function Hero({navigate}) {
  return (
    <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"120px 48px 80px", position:"relative", overflow:"hidden", background:"#ffffff" }}>
      <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.blueTint, border:`1px solid rgba(3,62,102,0.15)`, borderRadius:100, padding:"6px 16px 6px 8px", fontSize:"0.78rem", fontWeight:600, color:C.blue, marginBottom:28, animation:"fadeUp 0.5s ease both" }}>
        <span style={{ background:C.green, color:C.blue, fontSize:"0.68rem", fontWeight:800, padding:"2px 8px", borderRadius:100, letterSpacing:"0.04em" }}>BETA</span>
        Now live in Karachi & Sindh — early access open
      </div>
      <h1 style={{ fontSize:"clamp(2.9rem,5.5vw,5.2rem)", fontWeight:800, letterSpacing:"-0.035em", lineHeight:1.06, color:C.ink, marginBottom:24, maxWidth:860, fontFamily:"'Plus Jakarta Sans',sans-serif", animation:"fadeUp 0.55s 0.07s ease both", animationFillMode:"both" }}>
        Pakistan's projects deserve a{" "}
        <span style={{ position:"relative", display:"inline-block" }}>
          <Serif>real</Serif>{" "}audience
          <span style={{ position:"absolute", bottom:4, left:0, right:0, height:7, background:C.green, borderRadius:3, opacity:0.55, zIndex:-1 }} />
        </span>
      </h1>
      <p style={{ fontSize:"1.1rem", fontWeight:400, color:C.muted, maxWidth:560, margin:"0 auto 44px", lineHeight:1.75, animation:"fadeUp 0.55s 0.14s ease both", animationFillMode:"both" }}>
        Projex.pk connects final-year university projects with companies seeking fresh ideas, prototypes, and talent — with full intellectual property protection built in.
      </p>
      <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:48, animation:"fadeUp 0.55s 0.21s ease both", animationFillMode:"both" }}>
        <Btn variant="primary" size="xl" onClick={() => navigate("student")}>🎓 Post My Project — It's Free</Btn>
        <Btn variant="green"   size="xl"onClick={() => navigate("company")}>🏢 Scout Student Talent</Btn>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:16, justifyContent:"center", animation:"fadeUp 0.55s 0.28s ease both", animationFillMode:"both", marginBottom:64 }}>
        <div style={{ display:"flex" }}>
          {[["AH",C.blue],["ZM",C.blueMid],["SF",C.greenDark],["RK",C.blueLight]].map(([init,bg],i) => (
            <div key={i} style={{ width:32, height:32, borderRadius:"50%", background:bg, border:"2px solid #fff", marginLeft: i===0?0:-8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", fontWeight:800, color:"#fff" }}>{init}</div>
          ))}
        </div>
        <span style={{ fontSize:"0.83rem", color:C.muted, fontWeight:500 }}>
          <strong style={{ color:C.text }}>120+ students</strong> already on the waitlist from NED, FAST & IBA
        </span>
      </div>
      <PreviewWindow />
    </section>
  );
}

function PreviewWindow() {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{ maxWidth:800, width:"100%", opacity: vis?1:0, transform: vis?"translateY(0)":"translateY(28px)", transition:"all 0.7s 0.1s ease", position:"relative", zIndex:2 }}>
      <div style={{ background:C.white, border:`1px solid ${C.border2}`, borderRadius:16, boxShadow:"0 4px 6px rgba(3,62,102,0.04),0 24px 64px rgba(3,62,102,0.13)", overflow:"hidden" }}>
        <div style={{ background:C.off, borderBottom:`1px solid ${C.border}`, padding:"12px 18px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", gap:6 }}>
            {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c }} />)}
          </div>
          <div style={{ flex:1, background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:"5px 12px", fontSize:"0.76rem", color:C.muted, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:C.green }}>🔒</span> projex.pk/discover
          </div>
        </div>
        <div style={{ padding:24, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <ProjCard title="AI-Powered Crop Disease Detection" status="New" statusColor={C.greenPale} statusTextColor={C.greenDark} tags={["AI/ML","AgriTech","IoT"]} meta="📍 NED University · Final Year 2025 · Team of 3" blurText="Custom YOLOv8 model on 12,000 labeled images from Punjab farms. Edge inference on Raspberry Pi 4 with LoRaWAN integration for real-time district..." actionLabel="TechFarm PK sent a request" />
          <ProjCard title="Smart Water Quality Monitor — LoRaWAN" status="3 Requests" statusColor="#fff3e0" statusTextColor="#c05600" tags={["IoT","CleanTech","Embedded"]} meta="📍 FAST-NU KHI · Electrical Engg · Team of 4" blurText="STM32L476 microcontrollers with custom PCBs. FreeRTOS firmware, 18-month battery life on 3× AA cells. Chirpstack v4 with 12-bit ADC sensor..." actionLabel="AquaTech Solutions is interested" actionColor={C.greenPale} actionTextColor="#15803d" />
        </div>
      </div>
    </div>
  );
}

function ProjCard({ title, status, statusColor, statusTextColor, tags, meta, blurText, actionLabel, actionColor, actionTextColor }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:C.off, border:`1px solid ${hov?C.blueLight:C.border}`, borderRadius:12, padding:18, textAlign:"left", transition:"all 0.2s", boxShadow: hov?"0 4px 16px rgba(3,62,102,0.09)":"none" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10, gap:8 }}>
        <div style={{ fontSize:"0.87rem", fontWeight:700, color:C.text, lineHeight:1.3 }}>{title}</div>
        <div style={{ fontSize:"0.65rem", fontWeight:700, padding:"3px 8px", borderRadius:5, background:statusColor, color:statusTextColor, border:`1px solid ${statusTextColor}33`, whiteSpace:"nowrap", flexShrink:0, letterSpacing:"0.03em" }}>{status}</div>
      </div>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
        {tags.map(t => <span key={t} style={{ fontSize:"0.67rem", fontWeight:600, padding:"2px 8px", borderRadius:4, background:C.blueTint, color:C.blueMid, border:`1px solid rgba(3,62,102,0.12)` }}>{t}</span>)}
      </div>
      <div style={{ fontSize:"0.74rem", color:C.muted, marginBottom:12 }}>{meta}</div>
      <div style={{ background:C.white, border:`1px dashed ${C.border2}`, borderRadius:7, padding:10, position:"relative", overflow:"hidden", marginBottom:10 }}>
        <div style={{ fontSize:"0.72rem", lineHeight:1.5, color:"transparent", textShadow:"0 0 5px rgba(90,116,145,0.5)", filter:"blur(3px)", userSelect:"none" }}>{blurText}</div>
        <div style={{ position:"absolute", inset:0, background:"rgba(255,255,255,0.7)", backdropFilter:"blur(1px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:C.blue, color:"#fff", fontSize:"0.68rem", fontWeight:700, padding:"4px 12px", borderRadius:5, display:"flex", alignItems:"center", gap:5, letterSpacing:"0.04em" }}>🔒 Approve to unlock</div>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background: actionColor||C.blueTint, borderRadius:6, padding:"7px 10px", fontSize:"0.72rem", color: actionTextColor||C.blue, fontWeight:500 }}>
        <span>{actionLabel}</span>
        <button style={{ background: actionTextColor?"#22c55e":C.blue, color:"#fff", border:"none", borderRadius:4, padding:"4px 10px", fontSize:"0.68rem", fontWeight:700, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
          {actionColor ? "●" : "Review →"}
        </button>
      </div>
    </div>
  );
}

/* ──────────────────── LOGOS ──────────────────── */
function LogosBar() {
  const logos = [
    "/logos/ned.png",
    "/logos/fast.png",
    "/logos/iba.png",
    "/logos/ku.png",
    "/logos/habib.png",
    "/logos/dawood.png"
  ];

  return (
    <div style={{
      borderTop:`1px solid ${C.border}`,
      borderBottom:`1px solid ${C.border}`,
      background:C.white,
      overflow:"hidden",
      padding:"14px 0",
      position:"relative"
    }}>
      
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div style={{
        display:"flex",
        height: "15vh",
        width: "100vw",
        animation:"ticker 10s linear infinite",
        gap:60,
        alignItems:"center"
      }}>
        {[...logos, ...logos].map((logo, i) => (
          <img
            key={i}
            src={logo}
            style={{
              height:48,
              transition:"all 0.3s"
            }}
            onMouseEnter={e=>{
              e.currentTarget.style.opacity=1
              e.currentTarget.style.filter="grayscale(0%)"
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.opacity=0.7
              e.currentTarget.style.filter="grayscale(100%)"
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   STATS
   FIX 4: removed unused 'delay' prop from
   StatCell — transitionDelay kept via inline
   style passed directly from parent.
══════════════════════════════════════════ */
function Stats() {
  const [ref, vis] = useReveal();
  const data = [
    { n:"500K+", l:"Annual university graduates across Pakistan" },
    { n:"262+",  l:"HEC-recognized universities in the country" },
    { n:"$3.8B", l:"Pakistan IT exports in FY25 — and growing" },
    { n:"31%",   l:"Graduate unemployment — driven by skill mismatches" },
  ];
  return (
    <div ref={ref} style={{ padding:"96px 48px", textAlign:"center", background:"transparent" }}>
      <div style={{ maxWidth:1160, margin:"0 auto" }}>
        <Eyebrow>The Opportunity</Eyebrow>
        <SH>Pakistan's innovation gap is <Serif>real</Serif></SH>
        <SSub center>Half a million graduates every year. A booming IT sector. And virtually no bridge between them.</SSub>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:C.border, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden", marginTop:56 }}>
          {data.map(({ n, l }, i) => (
            // FIX 4: pass delay via style directly instead of as a prop
            <StatCell key={i} num={n} label={l} vis={vis} delayMs={i * 80} />
          ))}
        </div>
      </div>
    </div>
  );
}

// FIX 4: 'delay' param removed → replaced with 'delayMs' used in transitionDelay
function StatCell({ num, label, vis, delayMs }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov?C.blueTint:C.white, padding:"36px 32px", transition:"all 0.2s", opacity: vis?1:0, transform: vis?"translateY(0)":"translateY(20px)", transitionDelay:`${delayMs}ms` }}>
      <div style={{ fontSize:"2.6rem", fontWeight:800, letterSpacing:"-0.04em", lineHeight:1, color:C.blue, marginBottom:8 }}>{num}</div>
      <div style={{ fontSize:"0.82rem", color:C.muted, lineHeight:1.5, fontWeight:500 }}>{label}</div>
    </div>
  );
}

/* ──────────────────── HOW IT WORKS ──────────────────── */
function HowItWorks() {
  const [ref, vis] = useReveal();
  const steps = {
    student: [
      ["Verify & Register","Sign up with your .edu.pk university email. Your institution is verified instantly for credibility on the platform."],
      ["Form Your Team","Invite teammates by username. Build cross-disciplinary teams of up to 5 members and co-own the submission together."],
      ["Post a Protected Teaser","Only your title, one-line summary, tech tags, and university appear publicly. Full implementation stays hidden until you choose."],
      ["Review Interest Requests","Companies send formal requests with their verified profile. You choose to Approve, Decline, or request an NDA first."],
      ["Connect & Collaborate","Chat directly with approved companies. Land collaborations, internships, funding, or full project adoption deals."],
    ],
    company: [
      ["Create a Business Profile","Register with your NTN or business email. Specify your sector, size, and the types of innovation or talent you need."],
      ["Browse with a Daily Limit","Free-tier accounts browse up to 20–30 project teasers per day. Paid plans unlock higher limits and advanced filters."],
      ["Send an Interest Request","Found something promising? Send a formal Interest Request — your full company profile is shared with the student's team."],
      ["Access Full Project Details","If the student approves your request, you unlock the complete submission — reports, demo videos, code repos, prototypes."],
      ["Engage, Fund, or Hire","Use built-in NDA templates and in-platform messaging to formalize — R&D adoption, equity deals, or direct hiring."],
    ],
  };
  return (
    <div id="howitworks" style={{ background:C.off, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}` }}>
      <div ref={ref} style={{ maxWidth:1160, margin:"0 auto", padding:"96px 48px", opacity: vis?1:0, transform: vis?"translateY(0)":"translateY(28px)", transition:"all 0.65s ease" }}>
        <Eyebrow>Platform Workflow</Eyebrow>
        <SH>Two sides. One <Serif>trusted</Serif> exchange.</SH>
        <SSub>Students keep control. Companies get access. Everyone wins through consent.</SSub>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, marginTop:56 }}>
          <StepsCol role="Student" color={C.blue}      steps={steps.student} />
          <StepsCol role="Company" color={C.greenDark} steps={steps.company} />
        </div>
      </div>
    </div>
  );
}
function StepsCol({ role, color, steps }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28, paddingBottom:18, borderBottom:`2px solid ${C.border}` }}>
        <span style={{ background:color, color: color===C.greenDark?C.blue:"#fff", fontSize:"0.7rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", padding:"4px 12px", borderRadius:5 }}>{role}</span>
        <span style={{ fontSize:"1rem", fontWeight:700, color:C.text }}>For {role}s</span>
      </div>
      {steps.map(([h,p],i) => (
        <div key={i} style={{ display:"flex", gap:16, marginBottom:24 }}>
          <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, background: color===C.greenDark?C.greenPale:C.blueTint, border:`1.5px solid ${color===C.greenDark?"rgba(163,207,62,0.35)":"rgba(3,62,102,0.2)"}`, color:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.8rem", fontWeight:800, marginTop:2 }}>{i+1}</div>
          <div>
            <h4 style={{ fontSize:"0.92rem", fontWeight:700, color:C.text, marginBottom:4 }}>{h}</h4>
            <p style={{ fontSize:"0.84rem", color:C.muted, lineHeight:1.65 }}>{p}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────── IP SECTION ──────────────────── */
function IPSection() {
  const [ref, vis] = useReveal();
  return (
    <div style={{ padding:"96px 48px", background:"transparent" }}>
      <div ref={ref} style={{ maxWidth:1160, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"center", opacity: vis?1:0, transform: vis?"translateY(0)":"translateY(28px)", transition:"all 0.65s ease" }}>
        <div>
          <Eyebrow>Intellectual Property Protection</Eyebrow>
          <SH style={{ fontSize:"clamp(1.9rem,2.8vw,2.6rem)" }}>Your idea stays yours — until you say <Serif>otherwise.</Serif></SH>
          <SSub style={{ marginTop:14 }}>Unlike open project portals, Projex.pk runs on a consent-first model. Companies never see technical details without your explicit approval.</SSub>
          <div style={{ display:"flex", flexDirection:"column", gap:14, marginTop:32 }}>
            {[
              ["🔒","Teaser-Only Public View","Companies only see your pitch hook — title, one-liner, tags. Full implementation stays locked until you choose to share it."],
              ["📋","NDA Templates Built In","Download Pakistan-compliant NDA agreements before any disclosure. Legal scaffolding, included at no extra cost."],
              ["📊","Access Logs & Watermarking","Every view of your approved project is tracked. Documents carry watermarks tied to the specific company that accessed them."],
            ].map(([icon,h,p]) => <IPFeat key={h} icon={icon} title={h} desc={p} />)}
          </div>
        </div>
        <IPCard />
      </div>
    </div>
  );
}
function IPFeat({ icon, title, desc }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:"flex", alignItems:"flex-start", gap:14, padding:18, borderRadius:10, border:`1px solid ${hov?C.blueLight:C.border}`, background: hov?C.blueTint:C.white, transition:"all 0.2s", boxShadow: hov?"0 4px 16px rgba(3,62,102,0.08)":"none" }}>
      <div style={{ width:38, height:38, borderRadius:9, background:C.blue, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0 }}>{icon}</div>
      <div>
        <h4 style={{ fontSize:"0.88rem", fontWeight:700, color:C.text, marginBottom:3 }}>{title}</h4>
        <p style={{ fontSize:"0.81rem", color:C.muted, lineHeight:1.6 }}>{desc}</p>
      </div>
    </div>
  );
}
function IPCard() {
  return (
    <div style={{ background:C.white, border:`1px solid ${C.border2}`, borderRadius:16, overflow:"hidden", boxShadow:"0 4px 6px rgba(3,62,102,0.04),0 16px 40px rgba(3,62,102,0.09)" }}>
      <div style={{ background:C.blue, padding:"16px 22px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.55)", fontWeight:500 }}>Company View — Before Approval</span>
        <strong style={{ fontSize:"0.82rem", color:"#fff" }}>projex.pk/discover</strong>
      </div>
      <div style={{ padding:22 }}>
        <div style={{ fontSize:"0.97rem", fontWeight:800, color:C.text, marginBottom:8 }}>Smart Water Quality Monitoring System</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
          {["IoT","Embedded Systems","CleanTech"].map(t => <span key={t} style={{ background:C.blueTint, color:C.blueMid, fontSize:"0.69rem", fontWeight:700, padding:"3px 9px", borderRadius:4, border:`1px solid rgba(3,62,102,0.12)` }}>{t}</span>)}
        </div>
        <div style={{ fontSize:"0.77rem", color:C.muted, marginBottom:12 }}>📍 NED University · Electrical Engineering · Class of 2025 · Team of 4</div>
        <div style={{ fontSize:"0.83rem", color:C.muted, lineHeight:1.65, marginBottom:14 }}>A low-cost IoT sensor array monitoring pH, turbidity, and dissolved oxygen in real time via LoRaWAN.</div>
        <div style={{ background:C.off, border:`1px dashed ${C.border2}`, borderRadius:8, padding:14, position:"relative", overflow:"hidden", marginBottom:14 }}>
          <div style={{ fontSize:"0.78rem", lineHeight:1.55, color:"transparent", textShadow:"0 0 6px rgba(90,116,145,0.45)", filter:"blur(3.5px)", userSelect:"none" }}>
            STM32L476 microcontrollers, custom 4-layer PCBs. FreeRTOS 10.5 with power-optimised sleep achieving 18-month battery. Chirpstack v4 LoRaWAN with custom payload decoders...
          </div>
          <div style={{ position:"absolute", inset:0, background:"rgba(247,248,250,0.72)", backdropFilter:"blur(1.5px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ background:C.blue, color:"#fff", fontSize:"0.7rem", fontWeight:700, padding:"6px 14px", borderRadius:6, display:"flex", alignItems:"center", gap:6 }}>🔒 Send Interest Request to Proceed</div>
          </div>
        </div>
        <div style={{ background:C.greenPale, border:`1px solid rgba(163,207,62,0.4)`, borderRadius:8, padding:"11px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:"0.78rem", color:C.greenDark, fontWeight:600 }}>
          <span>AquaTech Solutions has expressed interest</span>
          <button style={{ background:C.green, color:C.blue, border:"none", borderRadius:5, padding:"5px 12px", fontSize:"0.72rem", fontWeight:800, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Send →</button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── FEATURES BENTO ──────────────────── */
function Features() {
  const [ref, vis] = useReveal();
  const cards = [
    { n:"01", h:"Protected Teaser Listings",       p:"Only the pitch — never the plan. Companies see just enough to get genuinely interested, never enough to replicate the work.", span:2 },
    { n:"02", h:"Student Team Formation",           p:"Invite peers by username, build cross-disciplinary teams of up to 5, and co-own submissions together.", span:2 },
    { n:"03", h:"Daily Browsing Quotas",            p:"Companies have a capped number of teasers per day — ensuring deliberate, quality interest over bulk data harvesting.", span:2 },
    { n:"04", h:"Formal Interest Requests",         p:"No cold messages. Companies submit structured Interest Requests with their verified profile — students always know who wants access before deciding.", span:3, dark:true },
    { n:"05", h:"NDA Templates & Secure Messaging", p:"Pakistan-specific NDA templates built in. All communication on-platform post-approval — no personal details exchanged early.", span:3 },
  ];
  return (
    <div id="features" style={{ background:C.off, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}` }}>
      <div ref={ref} style={{ maxWidth:1160, margin:"0 auto", padding:"96px 48px", opacity: vis?1:0, transform: vis?"translateY(0)":"translateY(28px)", transition:"all 0.65s ease" }}>
        <Eyebrow>Core Features</Eyebrow>
        <SH>Everything the platform <Serif>needs to work.</Serif></SH>
        <SSub>Built for Pakistan's mobile-first, trust-deficit market. Simple, fast, focused on matching quality to quality.</SSub>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:16, marginTop:56 }}>
          {/* FIX 4 (secondary): delay was passed but unused in BentoCard — removed from call site */}
          {cards.map((c, i) => <BentoCard key={i} {...c} />)}
        </div>
      </div>
    </div>
  );
}

// FIX 4 (secondary): 'delay' removed from destructuring — it was declared but never read
function BentoCard({ n, h, p, span, dark }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ gridColumn:`span ${span}`, background: dark?C.blue:C.white, border:`1px solid ${hov&&!dark?C.blueLight:dark?C.blue:C.border}`, borderRadius:14, padding:"28px 26px", position:"relative", overflow:"hidden", transition:"all 0.22s", boxShadow: hov&&!dark?"0 8px 24px rgba(3,62,102,0.09)":"none", transform: hov?"translateY(-2px)":"none" }}>
      <div style={{ position:"absolute", bottom:0, left:0, width: hov?64:36, height:3, background: dark?"rgba(163,207,62,0.6)":C.green, borderRadius:"0 3px 0 0", transition:"width 0.3s" }} />
      <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:"3rem", color: dark?"rgba(255,255,255,0.1)":C.border, lineHeight:1, marginBottom:12, display:"block" }}>{n}</span>
      <h3 style={{ fontSize:"0.95rem", fontWeight:700, color: dark?"#fff":C.text, marginBottom:8, letterSpacing:"-0.01em", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{h}</h3>
      <p style={{ fontSize:"0.83rem", color: dark?"rgba(255,255,255,0.6)":C.muted, lineHeight:1.65 }}>{p}</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   PRICING
   FIX 5: 'btnVariant' was declared in plan
   objects and destructured in PriceCard but
   never actually used — removed entirely.
══════════════════════════════════════════ */
function Pricing() {
  const [ref, vis] = useReveal();
  // FIX 5: removed btnVariant from all plan objects
  const plans = [
    {
      tier:"Student", price:"0", per:"Forever free for students", featured:false,
      features:[[true,"Post up to 3 projects"],[true,"Form teams up to 5 members"],[true,"Review & approve interest requests"],[true,"In-app messaging post-approval"],[true,"NDA template downloads"],[false,"Featured project placement"]],
      btnLabel:"Create Free Profile",
    },
    {
      tier:"Company — Growth", price:"15,000", per:"per month", featured:true,
      features:[[true,"Browse 50 project teasers per day"],[true,"20 interest requests per month"],[true,"Advanced filters — tech, city, university"],[true,"Verified company badge"],[true,"In-app messaging & NDA tools"],[true,"Analytics dashboard"]],
      btnLabel:"Start Free Trial →",
    },
    {
      tier:"Company — Enterprise", price:"45,000", per:"per month, billed annually", featured:false,
      features:[[true,"Unlimited daily browsing"],[true,"Unlimited interest requests"],[true,"Priority request badge"],[true,"Dedicated account manager"],[true,"University partnership integrations"],[true,"Full analytics + export reports"]],
      btnLabel:"Contact Sales",
    },
  ];
  return (
    <div id="pricing" style={{ padding:"96px 48px", textAlign:"center", background:"transparent" }}>
      <div ref={ref} style={{ maxWidth:1160, margin:"0 auto", opacity: vis?1:0, transform: vis?"translateY(0)":"translateY(28px)", transition:"all 0.65s ease" }}>
        <Eyebrow>Pricing</Eyebrow>
        <SH>Free for students. <Serif>Priced for business.</Serif></SH>
        <SSub center>Students always post for free. Companies choose a plan that matches how seriously they invest in talent scouting.</SSub>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginTop:56 }}>
          {plans.map((plan, i) => <PriceCard key={i} {...plan} stagger={i*80} vis={vis} />)}
        </div>
      </div>
    </div>
  );
}

// FIX 5: 'btnVariant' removed from destructuring
function PriceCard({ tier, price, per, features, btnLabel, featured, stagger, vis }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ border:`1.5px solid ${featured?C.blue:hov?C.blueLight:C.border}`, borderRadius:16, padding:"36px 28px", background: featured?C.blue:C.white, boxShadow: featured?"0 8px 24px rgba(3,62,102,0.25)":hov?"0 12px 32px rgba(3,62,102,0.1)":"none", transform: hov?"translateY(-4px)":"none", transition:"all 0.22s", position:"relative", opacity: vis?1:0, transitionDelay:`${stagger}ms`, textAlign:"left" }}>
      {featured && (
        <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:C.green, color:C.blue, fontSize:"0.68rem", fontWeight:800, padding:"4px 14px", borderRadius:100, letterSpacing:"0.07em", textTransform:"uppercase", whiteSpace:"nowrap", boxShadow:"0 2px 8px rgba(163,207,62,0.4)" }}>Most Popular</div>
      )}
      <div style={{ fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color: featured?"rgba(255,255,255,0.5)":C.muted, marginBottom:10 }}>{tier}</div>
      <div style={{ fontSize:"2.8rem", fontWeight:800, letterSpacing:"-0.04em", lineHeight:1, color: featured?"#fff":C.ink, marginBottom:4 }}>
        <span style={{ fontSize:"1rem", fontWeight:500, opacity:0.5, verticalAlign:"super", marginRight:2 }}>PKR</span>{price}
      </div>
      <div style={{ fontSize:"0.8rem", color: featured?"rgba(255,255,255,0.45)":C.muted, marginBottom:24 }}>{per}</div>
      <div style={{ height:1, background: featured?"rgba(255,255,255,0.12)":C.border, margin:"20px 0" }} />
      {features.map(([yes, label], i) => (
        <div key={i} style={{ display:"flex", gap:10, fontSize:"0.84rem", color: featured?"rgba(255,255,255,0.65)":C.muted, marginBottom:10, alignItems:"flex-start" }}>
          <span style={{ color: yes?(featured?C.green:C.greenDark):"#d1d5db", fontWeight:700, flexShrink:0, marginTop:1 }}>{yes?"✓":"✗"}</span>
          {label}
        </div>
      ))}
      <div style={{ marginTop:24 }}>
        {featured
          ? <Btn variant="green" style={{ width:"100%", justifyContent:"center" }}>{btnLabel}</Btn>
          : <button style={{ display:"block", width:"100%", textAlign:"center", padding:"12px", borderRadius:8, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:"0.88rem", cursor:"pointer", border:`1.5px solid ${C.border2}`, color:C.blue, background:"transparent", transition:"all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.background=C.blueTint; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=C.border2; e.currentTarget.style.background="transparent"; }}
            >{btnLabel}</button>
        }
      </div>
    </div>
  );
}

/* ──────────────────── TESTIMONIALS ──────────────────── */
function Testimonials() {
  const [ref, vis] = useReveal();
  const cards = [
    { init:"AH", bg:C.blue,     name:"Ali Hassan",   role:"CS Final Year · NED University",       text:"We built an AI traffic management prototype for our FYP. Before Projex, it sat in a folder. Within three weeks of posting, two Karachi startups reached out. We're now in active talks." },
    { init:"SF", bg:C.greenDark,textC:C.blue, name:"Sara Farooqi",  role:"CTO · Karachi-based Fintech Startup",  text:"As a fintech startup, hiring fresh developers is expensive. Projex lets us scout final-year talent and co-develop prototypes before committing to full hires. The gated model means quality over noise." },
    { init:"ZM", bg:C.blueMid,  name:"Zainab Mirza", role:"Electrical Engg · FAST-NU KHI",         text:"The IP protection model is what won me over. I've always been hesitant to share my work publicly. The fact companies can't see technical details without my approval changes everything." },
  ];
  return (
    <div id="stories" style={{ background:C.off, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}` }}>
      <div ref={ref} style={{ maxWidth:1160, margin:"0 auto", padding:"96px 48px", opacity: vis?1:0, transform: vis?"translateY(0)":"translateY(28px)", transition:"all 0.65s ease" }}>
        <Eyebrow>Early Voices</Eyebrow>
        <SH>Trusted by students and <Serif>companies</Serif> already.</SH>
        <SSub>What our beta users from Karachi's universities and startups are saying.</SSub>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginTop:56 }}>
          {cards.map((c,i) => <TestiCard key={i} {...c} />)}
        </div>
      </div>
    </div>
  );
}
function TestiCard({ init, bg, textC, name, role, text }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ border:`1.5px solid ${hov?C.blueLight:C.border}`, borderRadius:14, padding:28, background:C.white, boxShadow: hov?"0 8px 24px rgba(3,62,102,0.08)":"none", transition:"all 0.2s" }}>
      <div style={{ display:"flex", gap:2, marginBottom:16 }}>
        {[...Array(5)].map((_,i) => <span key={i} style={{ color:C.green, fontSize:"0.9rem" }}>★</span>)}
      </div>
      <p style={{ fontSize:"0.88rem", color:C.muted, lineHeight:1.75, marginBottom:22, fontStyle:"italic" }}>"{text}"</p>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.8rem", fontWeight:800, color: textC||"#fff", flexShrink:0 }}>{init}</div>
        <div>
          <div style={{ fontSize:"0.86rem", fontWeight:700, color:C.text }}>{name}</div>
          <div style={{ fontSize:"0.76rem", color:C.muted }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── FINAL CTA ──────────────────── */
function FinalCTA({navigate}) {
  const [ref, vis] = useReveal();
  return (
    <div style={{ background:C.blue, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)`, backgroundSize:"28px 28px", pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:-80, right:-80, width:450, height:450, background:"radial-gradient(circle,rgba(163,207,62,0.12),transparent 65%)", pointerEvents:"none" }} />
      <div ref={ref} style={{ maxWidth:1160, margin:"0 auto", padding:"100px 48px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center", position:"relative", zIndex:2, opacity: vis?1:0, transform: vis?"translateY(0)":"translateY(28px)", transition:"all 0.65s ease" }}>
        <div>
          <h2 style={{ fontSize:"clamp(2.2rem,3.5vw,3.2rem)", fontWeight:800, letterSpacing:"-0.03em", color:"#fff", lineHeight:1.1, marginBottom:18, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            Pakistan's talent pipeline starts <Serif>right here.</Serif>
          </h2>
          <p style={{ fontSize:"1rem", color:"rgba(255,255,255,0.55)", lineHeight:1.7, marginBottom:32 }}>
            Join the beta. Be among the first universities and companies to shape how Pakistan bridges the gap between academia and industry — for good.
          </p>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <Btn variant="green"        size="lg" onClick={() => navigate("student")}>🎓 Sign Up as Student</Btn>
            <Btn variant="outlineWhite" size="lg" onClick={() => navigate("company")}>🏢 Sign Up as Company</Btn>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[
            ["🎓","I'm a Student","Post your final-year project safely. Get discovered by real companies. Always free."],
            ["🏢","I'm a Company","Scout innovations from 262+ Pakistani universities. Start your free trial today."],
            ["🏛️","I Represent a University","Partner with Projex to improve graduate outcomes and industry placement rates."],
          ].map(([icon,h,p]) => <CTABox key={h} icon={icon} title={h} desc={p} />)}
        </div>
      </div>
    </div>
  );
}
function CTABox({ icon, title, desc }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:`rgba(255,255,255,${hov?"0.1":"0.06"})`, border:`1px solid rgba(255,255,255,${hov?"0.2":"0.1"})`, borderLeft: hov?`3px solid ${C.green}`:"3px solid transparent", borderRadius:12, padding:"20px 22px", display:"flex", alignItems:"center", gap:18, cursor:"pointer", transform: hov?"translateX(4px)":"none", transition:"all 0.22s" }}>
      <div style={{ width:44, height:44, borderRadius:10, background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <h3 style={{ fontSize:"0.95rem", fontWeight:700, color:"#fff", marginBottom:3, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{title}</h3>
        <p style={{ fontSize:"0.8rem", color:"rgba(255,255,255,0.45)" }}>{desc}</p>
      </div>
      <span style={{ color: hov?C.green:"rgba(255,255,255,0.25)", fontSize:"1rem", transition:"all 0.2s", flexShrink:0 }}>→</span>
    </div>
  );
}

/* ──────────────────── FOOTER ──────────────────── */
function Footer() {
  return (
    <footer style={{ background:C.ink, padding:"40px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:20 }}>
      <div style={{ fontSize:"1.1rem", fontWeight:800, color:"#fff", letterSpacing:"-0.4px", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        Projex<span style={{ color:C.green }}>.pk</span>
      </div>
      <ul style={{ display:"flex", gap:28, listStyle:"none", flexWrap:"wrap" }}>
        {["How It Works","Features","Pricing","Privacy Policy","Terms of Use","Contact Us"].map(l => (
          <li key={l}>
            <a href="#" style={{ fontSize:"0.82rem", color:"rgba(255,255,255,0.35)", textDecoration:"none", transition:"color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color="rgba(255,255,255,0.75)"}
              onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.35)"}
            >{l}</a>
          </li>
        ))}
      </ul>
      <div style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.25)" }}>© 2026 Projex.pk · Made in Pakistan 🇵🇰</div>
    </footer>
  );
}

/* ══════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════ */
export default function App({navigate}) {
  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", position:"relative" }}>
      <FontLoader />
      <CustomCursor />
      <InteractiveBg />
      <div style={{ position:"relative", zIndex:1 }}>
        <Nav navigate={navigate} />
        <Hero navigate={navigate} />
        <div style={{ background:"white" }}>
          <LogosBar />
          <Stats />
          <Divider />
          <HowItWorks />
          <Divider />
          <IPSection />
          <Divider />
          <Features />
          <Divider />
          <Pricing />
          <Divider />
          <Testimonials />
          <FinalCTA />
          <Footer />
        </div>
      </div>
    </div>
  );
}