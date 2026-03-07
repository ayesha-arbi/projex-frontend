// Router.jsx
import React, { useState, useEffect } from "react";
import StudentOnboarding from "./student-onboarding";
import CompanyOnboarding from "./company-onboarding";
import App from "./landing";

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
      return <StudentOnboarding navigate={navigate} />;

    case "company":
      return <CompanyOnboarding navigate={navigate} />;

    default:
      return <App navigate={navigate} />;
  }
}

export default Router;
