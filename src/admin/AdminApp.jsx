import { useState } from "react";
import { adminSession } from "../services/adminApi.js";
import AdminLogin from "./AdminLogin.jsx";
import AdminRegister from "./AdminRegister.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

/**
 * Mount this at whatever route you want the admin panel to live at, e.g.
 * `/admin/*` in routing.jsx. It manages its own auth state via
 * localStorage (see services/adminApi.js) so it doesn't need react-router
 * to function — but works fine inside a <Route> too.
 *
 *   import AdminApp from "./admin/AdminApp.jsx";
 *   <Route path="/admin/*" element={<AdminApp />} />
 */
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
