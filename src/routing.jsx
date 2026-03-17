// Router.jsx
import React, { useState, useEffect } from "react";
import StudentOnboarding, { StudentLogin } from "./student/student-onboarding";
import CompanyOnboarding from "./company/company-onboarding";
import App from "./landing";
import ForgotPassword from "./forgotpassword";
import StudentDashboard from "./student/dashboard/StudentDashboard";

function Router() {
  const [page, setPage] = useState("landing");

  const navigate = (dest) => {
    setPage(dest);
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
        />
      );

    case "login":
      return (
        <StudentLogin
          onBack={() => navigate("landing")}
          onSwitchToRegister={() => navigate("student")}
          onForgotPassword={() => navigate("forgot-password")}
          onSuccess={() => navigate("student-dashboard")}  // ← login success → dashboard
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
      return <CompanyOnboarding navigate={navigate} />;

    case "student-dashboard":
      return (
        <StudentDashboard
          onLogout={() => navigate("landing")}
        />
      );

    default:
      return <App navigate={navigate} />;
  }
}

export default Router;