// Router.jsx
import React, { useState, useEffect } from "react";
import StudentOnboarding, { StudentLogin } from "./student/student-onboarding";
import CompanyOnboarding from "./company/company-onboarding";
import Companylogin from "./company/company-login";
import App from "./landing";
import ForgotPassword from "./forgotpassword";
import StudentDashboard from "./student/dashboard/StudentDashboard";
import CompanyDashboard from "./company/CompanyDashboard";

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
    <CompanyDashboard onLogout={handleLogout} />
  );

    default:
      return <App navigate={navigate} />;
  }
}

export default Router;