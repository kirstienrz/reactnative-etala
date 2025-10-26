exports.superAdminDashboard = (req, res) => {
  res.json({ msg: "Superadmin Dashboard Data" });
};

exports.osaAdminDashboard = (req, res) => {
  if (req.user.department !== "OSA")
    return res.status(403).json({ msg: "Not OSA department" });
  res.json({ msg: "OSA Admin Dashboard" });
};

exports.hrAdminDashboard = (req, res) => {
  if (req.user.department !== "HR")
    return res.status(403).json({ msg: "Not HR department" });
  res.json({ msg: "HR Admin Dashboard" });
};

exports.deptHeadDashboard = (req, res) => {
  res.json({ msg: `Department Head Dashboard for ${req.user.department}` });
};

exports.userHome = (req, res) => {
  res.json({ msg: "Welcome to User Home Page" });
};