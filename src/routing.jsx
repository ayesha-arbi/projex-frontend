// Router.jsx
import React, { useState, useEffect } from "react";
import StudentOnboarding, { StudentLogin } from "./student/student-onboarding";
import CompanyOnboarding from "./company/company-onboarding";
import Companylogin from "./company/company-login";
import App from "./landing";
import ForgotPassword from "./forgotpassword";
import StudentDashboard from "./student/dashboard/StudentDashboard";

function Router() {
  // ── Bug 2 Fix: restore session from localStorage on first load ──
  // useState lazy initialiser runs once — reads token/user before first render
  const [page, setPage] = useState(() => {
    const token = localStorage.getItem("token");
    const user  = localStorage.getItem("user");
    if (token && user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.role === "student") return "student-dashboard";
        if (parsed.role === "company") return "company-dashboard";
      } catch {
        // Corrupted localStorage — wipe and start fresh
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return "landing";
  });

  const navigate = (dest) => setPage(dest);

  // Centralised logout — clears ALL auth keys
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("project_id");
    navigate("landing");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  switch (page) {
    case "student":
      return (
        <StudentOnboarding
          onBack={() => navigate("landing")}
          onSwitchToLogin={() => navigate("login")}
          onSuccess={() => navigate("student-dashboard")}
        />
      );

    case "login":
      return (
        <StudentLogin
          onBack={() => navigate("landing")}
          onSwitchToRegister={() => navigate("student")}
          onForgotPassword={() => navigate("forgot-password")}
          onSuccess={() => navigate("student-dashboard")}
        />
      );

    case "forgot-password":
      return (
        <ForgotPassword
          onBack={() => navigate("landing")}
          onBackToLogin={() => navigate("login")}
        />
      );

    case "company":
      return (
        <CompanyOnboarding
          onBack={() => navigate("landing")}
          onSwitchToLogin={() => navigate("company-login")}
        />
      );

    case "company-login":
      return (
        <Companylogin
          onBack={() => navigate("landing")}
          onSwitchToRegister={() => navigate("company")}
          onForgotPassword={() => navigate("company-forgot-password")}
          onSuccess={() => navigate("company-dashboard")}
        />
      );

    case "company-forgot-password":
      return (
        <ForgotPassword
          onBack={() => navigate("landing")}
          onBackToLogin={() => navigate("company-login")}
        />
      );

    case "student-dashboard":
      return (
        <StudentDashboard
          onLogout={handleLogout}
        />
      );

    // Placeholder until company dashboard is built
    case "company-dashboard":
      return (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#033e66", background:"#f7f8fa" }}>
          <div style={{ textAlign:"center" }}>
            <p style={{ fontSize:"2.5rem", marginBottom:8 }}>🏢</p>
            <h2 style={{ fontWeight:800, marginBottom:8 }}>Company dashboard coming soon</h2>
            <p style={{ color:"#5a7491", marginBottom:20 }}>You're logged in. Full dashboard is on its way.</p>
            <button onClick={handleLogout}
              style={{ padding:"10px 24px", background:"#033e66", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700 }}>
              Logout
            </button>
          </div>
        </div>
      );

    default:
      return <App navigate={navigate} />;
  }
}

export default Router;