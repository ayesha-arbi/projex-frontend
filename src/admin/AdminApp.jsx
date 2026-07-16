import { useState } from "react";
import { adminSession } from "../services/adminApi.js";
import AdminLogin from "./AdminLogin.jsx";
import AdminRegister from "./AdminRegister.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

export default function AdminApp() {
  const [admin, setAdmin] = useState(() => adminSession.getAdmin());
  const [view, setView] = useState(adminSession.isLoggedIn() ? "dashboard" : "login");

  const handleLoggedIn = (adminData, wantsRegister) => {
    if (wantsRegister) {
      setView("register");
      return;
    }
    setAdmin(adminData);
    setView("dashboard");
  };

  const handleLogout = () => {
    setAdmin(null);
    setView("login");
  };

  if (view === "register") {
    return <AdminRegister onBackToLogin={() => setView("login")} />;
  }

  if (view === "dashboard" && adminSession.isLoggedIn()) {
    return <AdminDashboard admin={admin || adminSession.getAdmin()} onLogout={handleLogout} />;
  }

  return <AdminLogin onLoggedIn={handleLoggedIn} />;
}
