import jwt from 'jsonwebtoken';

const authMiddleware = (requiredRole = null) => async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
  
      const token = authHeader.split(' ')[1];
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Attach user data to request
      req.userId = decoded.userId;
      req.email = decoded.email;
      req.role = decoded.role;  // Attach role
  
      // Check for admin access if required
      if (requiredRole && req.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }
  
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired, please login again' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  export default authMiddleware;