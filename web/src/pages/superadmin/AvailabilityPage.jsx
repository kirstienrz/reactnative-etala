import React from 'react';
import AdminAvailability from './AdminAvailability';

const AvailabilityPage = () => {
  // TODO: Replace with actual adminId from auth/profile context
  const adminId = localStorage.getItem('adminId') || 'YOUR_ADMIN_ID';
  return (
    <div className="p-6">
      <AdminAvailability adminId={adminId} />
    </div>
  );
};

export default AvailabilityPage;
