import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { superAdminMeRequest } from "@/lib/authApi";

export default function SuperAdminProtectedRoute({ children }) {
  const [state, setState] = useState({ checking: true, user: null });

  useEffect(() => {
    let active = true;
    superAdminMeRequest()
      .then(({ user }) => {
        if (!active) return;
        if (user.role !== "SUPER_ADMIN") {
          setState({ checking: false, user: null });
          return;
        }
        const storage = localStorage.getItem("superAdminUser") ? localStorage : sessionStorage;
        storage.setItem("superAdminUser", JSON.stringify({ ...user, isAuthenticated: true }));
        setState({ checking: false, user: { ...user, isAuthenticated: true } });
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem("superAdminUser");
        sessionStorage.removeItem("superAdminUser");
        setState({ checking: false, user: null });
      });
    return () => { active = false; };
  }, []);

  if (state.checking) return null;
  if (!state.user?.isAuthenticated || state.user.role !== "SUPER_ADMIN") {
    return <Navigate to="/auth/superadmin/login" replace />;
  }
  return children;
}
