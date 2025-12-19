import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({
  allowedRoles = [],
  allowedDepartments = [],
}) => {
  const { isLoggedIn, role, department, user } = useSelector(
    (state) => state.auth
  );

  const effectiveRole = (user?.role || role)?.toLowerCase();
  const effectiveDepartment = (user?.department || department)?.toLowerCase();

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.map(r => r.toLowerCase()).includes(effectiveRole)
  )
    return <Navigate to="/" replace />;

  if (
    allowedDepartments.length > 0 &&
    !allowedDepartments.map(d => d.toLowerCase()).includes(effectiveDepartment)
  )
    return <Navigate to="/" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
