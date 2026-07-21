// routing.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import StudentOnboarding, { StudentLogin } from "./student/student-onboarding";
import CompanyOnboarding from "./company/company-onboarding";
import Companylogin from "./company/company-login";
import App from "./landing";
import ForgotPassword from "./forgotpassword";
import StudentDashboard from "./student/dashboard/StudentDashboard";
import CompanyDashboard from "./company/CompanyDashboard";
import AdminApp from "./admin/AdminApp";

/* ─────────────────────────────────────────────────────────
   Session helpers — same localStorage shape as before
   ("token" + "user" JSON with a `role` field).
   ───────────────────────────────────────────────────────── */
function getSession() {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  if (!token || !userRaw) return null;
  try {
    const user = JSON.parse(userRaw);
    return { token, user };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("project_id");
}

/* ─────────────────────────────────────────────────────────
   Route guards
   ───────────────────────────────────────────────────────── */

function RequireRole({ role, loginPath, children }) {
  const session = getSession();
  if (!session || !session.user || session.user.role?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to={loginPath} replace />;
  }
  return children;
}

function RedirectIfLoggedIn({ children }) {
  const session = getSession();
  const role = session?.user?.role?.toLowerCase();
  if (role === "student") return <Navigate to="/student/dashboard" replace />;
  if (role === "company") return <Navigate to="/company/dashboard" replace />;
  return children;
}

/* ─────────────────────────────────────────────────────────
   Scroll to top on every route change (same as the old
   `useEffect(() => window.scrollTo(0,0), [page])`)
   ───────────────────────────────────────────────────────── */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/* ─────────────────────────────────────────────────────────
   Thin wrappers translating each page's onX callback props
   into real navigation — keeps the page components themselves
   completely unchanged.
   ───────────────────────────────────────────────────────── */

function LandingPage() {
  const navigate = useNavigate();
  // landing.jsx calls navigate("student") / navigate("company") —
  // map those old destination keys onto real routes.
  const legacyNavigate = (dest) => {
    const map = {
      student: "/student/register",
      company: "/company/register",
    };
    navigate(map[dest] || "/");
  };
  return <App navigate={legacyNavigate} />;
}

function StudentRegisterPage() {
  const navigate = useNavigate();
  return (
    <StudentOnboarding
      onBack={() => navigate("/")}
      onSwitchToLogin={() => navigate("/student/login")}
      onSuccess={() => navigate("/student/dashboard")}
    />
  );
}

function StudentLoginPage() {
  const navigate = useNavigate();
  return (
    <StudentLogin
      onBack={() => navigate("/")}
      onSwitchToRegister={() => navigate("/student/register")}
      onForgotPassword={() => navigate("/student/forgot-password")}
      onSuccess={() => navigate("/student/dashboard")}
    />
  );
}

function StudentForgotPasswordPage() {
  const navigate = useNavigate();
  return (
    <ForgotPassword
      onBack={() => navigate("/")}
      onBackToLogin={() => navigate("/student/login")}
    />
  );
}

function CompanyRegisterPage() {
  const navigate = useNavigate();
  return (
    <CompanyOnboarding
      onBack={() => navigate("/")}
      onSwitchToLogin={() => navigate("/company/login")}
    />
  );
}

function CompanyLoginPage() {
  const navigate = useNavigate();
  return (
    <Companylogin
      onBack={() => navigate("/")}
      onSwitchToRegister={() => navigate("/company/register")}
      onForgotPassword={() => navigate("/company/forgot-password")}
      onSuccess={() => navigate("/company/dashboard")}
    />
  );
}

function CompanyForgotPasswordPage() {
  const navigate = useNavigate();
  return (
    <ForgotPassword
      onBack={() => navigate("/")}
      onBackToLogin={() => navigate("/company/login")}
    />
  );
}

function StudentDashboardPage() {
  const navigate = useNavigate();
  const handleLogout = () => {
    clearSession();
    navigate("/");
  };
  return <StudentDashboard onLogout={handleLogout} />;
}

function CompanyDashboardPage() {
  const navigate = useNavigate();
  const handleLogout = () => {
    clearSession();
    navigate("/");
  };
  return <CompanyDashboard onLogout={handleLogout} />;
}

/* ─────────────────────────────────────────────────────────
   Router
   ───────────────────────────────────────────────────────── */
function Router() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<RedirectIfLoggedIn><LandingPage /></RedirectIfLoggedIn>} />

        {/* Student */}
        <Route
          path="/student/register"
          element={<RedirectIfLoggedIn><StudentRegisterPage /></RedirectIfLoggedIn>}
        />
        <Route
          path="/student/login"
          element={<RedirectIfLoggedIn><StudentLoginPage /></RedirectIfLoggedIn>}
        />
        <Route path="/student/forgot-password" element={<StudentForgotPasswordPage />} />
        <Route
          path="/student/dashboard/*"
          element={
            <RequireRole role="student" loginPath="/student/login">
              <StudentDashboardPage />
            </RequireRole>
          }
        />

        {/* Company */}
        <Route
          path="/company/register"
          element={<RedirectIfLoggedIn><CompanyRegisterPage /></RedirectIfLoggedIn>}
        />
        <Route
          path="/company/login"
          element={<RedirectIfLoggedIn><CompanyLoginPage /></RedirectIfLoggedIn>}
        />
        <Route path="/company/forgot-password" element={<CompanyForgotPasswordPage />} />
        <Route
          path="/company/dashboard/*"
          element={
            <RequireRole role="company" loginPath="/company/login">
              <CompanyDashboardPage />
            </RequireRole>
          }
        />

        {/* Admin — manages its own login/register/session internally */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* Legacy short links some bookmarks/emails may still use */}
        <Route path="/login" element={<Navigate to="/student/login" replace />} />
        <Route path="/company-login" element={<Navigate to="/company/login" replace />} />

        {/* Anything unknown → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;