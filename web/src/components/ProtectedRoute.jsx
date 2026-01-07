import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({
  allowedRoles = [],
  allowedDepartments = [],
  requireInterviewAccess = false, // <-- new prop
}) => {
  const { isLoggedIn, role, department, user } = useSelector(
    (state) => state.auth
  );

  const effectiveRole = (user?.role || role)?.toLowerCase();
  const effectiveDepartment = (user?.department || department)?.toLowerCase();

  // 1️⃣ Not logged in
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // 2️⃣ Role check
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.map(r => r.toLowerCase()).includes(effectiveRole)
  )
    return <Navigate to="/" replace />;

  // 3️⃣ Department check
  if (
    allowedDepartments.length > 0 &&
    !allowedDepartments.map(d => d.toLowerCase()).includes(effectiveDepartment)
  )
    return <Navigate to="/" replace />;

  // 4️⃣ Interview access check
  if (requireInterviewAccess) {
    const canAccessInterview = localStorage.getItem("canAccessInterview") === "true";
    if (!canAccessInterview) return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
