import { useState, useEffect } from "react";
import { Sidebar, TopBar }  from "./Layout";
import UploadProjectTab     from "./UploadProjectTab";
import ProfileTab           from "./ProfileTab";
import { C }                from "../../assets/tokens";

const TAB_META = {
  upload:  { title:"Upload Project", subtitle:"Share your work with the world" },
  profile: { title:"Profile",        subtitle:"Your public student profile"    },
};

export default function StudentDashboard({ onLogout }) {
  const [tab,       setTab]       = useState("upload");
  const [collapsed, setCollapsed] = useState(false);
  const [sideW,     setSideW]     = useState(220);  // sidebar width when expanded

  // Listen for drag-resize events from the sidebar handle
  useEffect(() => {
    const handler = (e) => setSideW(e.detail);
    document.addEventListener("sidebar-resize", handler);
    return () => document.removeEventListener("sidebar-resize", handler);
  }, []);

  const activeWidth = collapsed ? 64 : sideW;
  const meta = TAB_META[tab] || TAB_META.upload;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to { transform: rotate(360deg) } }
        *, *::before, *::after { box-sizing: border-box; }
        body { margin:0; background:${C.off}; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${C.border2}; border-radius:3px; }
      `}</style>

      <div style={{ display:"flex", fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:"100vh", background:C.off }}>

        <Sidebar
          active={tab}
          onNav={setTab}
          onLogout={onLogout}
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          width={sideW}
        />

        {/* Main area — shifts with sidebar width */}
        <div style={{
          marginLeft:activeWidth,
          flex:1,
          display:"flex",
          flexDirection:"column",
          minHeight:"100vh",
          transition:"margin-left 0.25s ease",
          minWidth:0,
        }}>
          <TopBar title={meta.title} subtitle={meta.subtitle} />
          <main style={{ flex:1, width:"100%", minWidth:0, overflow:"hidden" }}>
            {tab === "upload"  && <UploadProjectTab />}
            {tab === "profile" && <ProfileTab />}
          </main>
        </div>

      </div>
    </>
  );
}