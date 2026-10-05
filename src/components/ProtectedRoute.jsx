import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { meRequest } from "@/lib/authApi";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [state, setState] = useState({ checking: true, user: null });

  useEffect(() => {
    const userValue = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (!userValue) {
      setState({ checking: false, user: null });
      return undefined;
    }

    let active = true;
    meRequest()
      .then(({ user }) => {
        if (!active) return;
        const normalizedRole = user.role === "HEAD_COUNSELLOR" ? "COUNSELLOR" : user.role;
        const updatedUser = { ...user, role: normalizedRole, isAuthenticated: true };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent("solmento:user-updated", { detail: updatedUser }));
        setState({ checking: false, user: updatedUser });
      })
      .catch(() => {
        if (!active) return;
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("solmento_token");
        localStorage.removeItem("user");
        localStorage.removeItem("solmento_token");
        setState({ checking: false, user: null });
      });

    return () => { active = false; };
  }, []);

  if (state.checking) return null;

  if (!state.user?.isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(state.user.role)) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}
