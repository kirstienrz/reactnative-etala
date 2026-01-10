const jwt = require("jsonwebtoken");

module.exports = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    // 🔍 DEBUG LOGS
    console.log("🔍 Auth Header:", authHeader ? "EXISTS" : "MISSING");
    console.log("🔍 Token:", token ? token.substring(0, 20) + "..." : "MISSING");
    
    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔍 Decoded user:", decoded); // 👈 ADD THIS
      
      req.user = decoded;
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ msg: "Access denied" });
      }
      next();
    } catch (err) {
      console.error("❌ Token verification failed:", err.message); // 👈 ADD THIS
      res.status(401).json({ msg: "Token is not valid" });
    }
  };
};