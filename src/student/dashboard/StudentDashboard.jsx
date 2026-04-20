import { useState, useEffect } from "react";
import { Sidebar, TopBar }  from "./Layout";
import UploadProjectTab     from "./UploadProjectTab";
import MyProjectTab         from "./MyProjecttab.jsx";
import ProfileTab           from "./ProfileTab";
import TeamTab from "./TeamTab";
import { C }                from "../../assets/tokens";
import AccessRequestsManager from "./AccessRequestsManager";

const TAB_META = {
  upload:     { title: "Upload Project",  subtitle: "Share your work with the world"   },
  myproject:  { title: "My Project",      subtitle: "Manage your posted project"        },
  profile:    { title: "Profile",         subtitle: "Your public student profile" },
  team: { title: "Team", subtitle: "Manage your project team" },
      
};

export default function StudentDashboard({ onLogout }) {
  const [tab,       setTab]       = useState(() => {
    // Bug 1 Fix: if a project_id already exists in localStorage,
    // land on "My Project" tab instead of "Upload"
    return localStorage.getItem("project_id") ? "myproject" : "upload";
  });
  const [collapsed, setCollapsed] = useState(false);
  const [sideW,     setSideW]     = useState(220);

  useEffect(() => {
    const handler = (e) => setSideW(e.detail);
    document.addEventListener("sidebar-resize", handler);
    return () => document.removeEventListener("sidebar-resize", handler);
  }, []);

  const activeWidth = collapsed ? 64 : sideW;
  const meta = TAB_META[tab] || TAB_META.upload;

  // Called by UploadProjectTab after a successful post
  const handleProjectPosted = (project) => {
    setTab("myproject");
  };

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

      <div style={{ display: "flex", fontFamily: "'Plus Jakarta Sans',sans-serif", minHeight: "100vh", background: C.off }}>

        <Sidebar
          active={tab}
          onNav={setTab}
          onLogout={onLogout}
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          width={sideW}
          // Pass whether a project exists so Sidebar can show/hide the tab
          hasProject={!!localStorage.getItem("project_id")}
        />

        <div style={{
          marginLeft: activeWidth,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          transition: "margin-left 0.25s ease",
          minWidth: 0,
        }}>
          <TopBar title={meta.title} subtitle={meta.subtitle} />
          <main style={{ flex: 1, width: "100%", minWidth: 0, overflow: "hidden" }}>
            {tab === "upload"    && (
              <UploadProjectTab onProjectPosted={handleProjectPosted} />
            )}
            {tab === "myproject" && <MyProjectTab />}
            {tab === "profile"   && <ProfileTab />}
            {tab === "team" && <TeamTab />}
          </main>
        </div>

      </div>
    </>
  );
}