import { useState, useEffect } from "react";
import { Sidebar, TopBar }  from "./Layout";
import UploadProjectTab     from "./UploadProjectTab";
import MyProjectTab         from "./MyProjecttab.jsx";
import ProfileTab           from "./ProfileTab";
import TeamTab from "./TeamTab";
import DiscoverCompaniesTab from "./DiscoverCompaniesTab";
import ProposalsTab         from "./ProposalsTab";
import AccessRequestsManager from "./AccessRequestsManager";
import ChatInbox            from "../../shared/chat/ChatInbox"; // ← adjust path if ChatInbox.jsx lives elsewhere
import { C }                from "../../assets/tokens";

const TAB_META = {
  upload:     { title: "Upload Project",  subtitle: "Share your work with the world"   },
  myproject:  { title: "My Project",      subtitle: "Manage your posted project"        },
  profile:    { title: "Profile",         subtitle: "Your public student profile" },
  team:       { title: "Team",            subtitle: "Manage your project team" },
  discover:   { title: "Discover Companies", subtitle: "Find companies to pitch your project" },
  proposals:  { title: "Proposals",         subtitle: "Manage your project pitches" },
  access:     { title: "Interest Requests", subtitle: "Manage company interest in your project" },
  messages:   { title: "Messages",          subtitle: "Chat with interested companies" },
};

const API_BASE = import.meta.env?.VITE_API_URL || "/api";

export default function StudentDashboard({ onLogout }) {
  const [tab,       setTab]       = useState(() => {
    // land on "My Project" tab instead of "Upload" if a project exists
    return localStorage.getItem("project_id") ? "myproject" : "upload";
  });
  const [collapsed, setCollapsed] = useState(false);
  const [sideW,     setSideW]     = useState(220);
  const [project,   setProject]   = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [chatRoomId, setChatRoomId] = useState(null);

  // Restore project and project_id from backend if user has a project.
  // The backend returns { fyp_project, academic_projects, total_academic }.
  useEffect(() => {
    const restoreProject = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/projects/my/project`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();

          // Collect all projects from the response
          const projects = [];
          if (data.fyp_project) projects.push(data.fyp_project);
          if (Array.isArray(data.academic_projects)) projects.push(...data.academic_projects);

          // Use the FYP project as the primary, or fallback to first academic
          const primary = data.fyp_project || projects[0] || null;

          if (primary && primary.project_id) {
            setProject(primary);
            localStorage.setItem("project_id", primary.project_id);
          }

          setAllProjects(projects);
        }
      } catch (err) {
        console.warn("Could not restore project:", err);
      }
    };

    restoreProject();
  }, []);

  useEffect(() => {
    const handler = (e) => setSideW(e.detail);
    document.addEventListener("sidebar-resize", handler);
    return () => document.removeEventListener("sidebar-resize", handler);
  }, []);

  const activeWidth = collapsed ? 64 : sideW;
  const meta = TAB_META[tab] || TAB_META.upload;

  // Called by UploadProjectTab after a successful post
  const handleProjectPosted = (postedProject) => {
    setProject(postedProject);
    if (postedProject?.project_id) {
      localStorage.setItem("project_id", postedProject.project_id);
    }
    setAllProjects(prev => [...prev, postedProject]);
    setTab("myproject");
  };

  // Called by ProposalsTab's "Open Chat →" button on an INTERESTED proposal
  const handleOpenChat = (proposal) => {
    if (!proposal?.chat_room_id) return;
    setChatRoomId(proposal.chat_room_id);
    setTab("messages");
  };

  return (
    <>
      <style>{`
        400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to { transform: rotate(360deg) } }
        *, *::before, *::after { box-sizing: border-box; }
        body { margin:0; background:${C.cream}; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:3px; }
      `}</style>

      <div style={{ display: "flex", fontFamily: "'Sora',sans-serif", minHeight: "100vh", background: C.cream }}>

        <Sidebar
          active={tab}
          onNav={setTab}
          onLogout={onLogout}
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          width={sideW}
          hasProject={!!project || !!localStorage.getItem("project_id")}
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
            {tab === "team"      && <TeamTab projects={allProjects} />}
            {tab === "discover"  && <DiscoverCompaniesTab projects={allProjects.length > 0 ? allProjects : (project ? [project] : [])} />}
            {tab === "proposals" && <ProposalsTab projects={allProjects.length > 0 ? allProjects : (project ? [project] : [])} onOpenChat={handleOpenChat} />}
            {tab === "access"    && <AccessRequestsManager />}
            {tab === "messages"  && <ChatInbox initialChatRoomId={chatRoomId} />}
          </main>
        </div>

      </div>
    </>
  );
}