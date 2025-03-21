//role check 
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
      try {
        if (!req.user || !req.user.role) {
          return res.status(403).json({ message: " No role assigned." });
        }
  
        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({ message: " Insufficient permissions." });
        }
  
        next(); 
      } catch (error) {
        console.error("❌ Error in Role Middleware:", error);
        return res.status(500).json({ message: "❌ Internal server error." });
      }
    };
  };



  module.exports = {
    roleMiddleware,//check role 
    
}
