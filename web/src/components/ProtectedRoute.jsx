import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({
  allowedRoles = [],
  requireInterviewAccess = false,
}) => {
  const { isLoggedIn, role, user } = useSelector((state) => state.auth);

  const effectiveRole = (user?.role || role)?.toLowerCase();

  // 1️⃣ Not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 2️⃣ Role check
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.map(r => r.toLowerCase()).includes(effectiveRole)
  ) {
    return <Navigate to="/" replace />;
  }

  // 3️⃣ Interview access check (optional)
  if (requireInterviewAccess) {
    const canAccessInterview =
      localStorage.getItem("canAccessInterview") === "true";

    if (!canAccessInterview) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
