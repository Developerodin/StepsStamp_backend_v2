import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import User from '../models/user.model.js';

const authMiddleware = (requiredRole = null) => async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
  
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Check if the token is for an admin
      if (decoded.role === 'admin') {
        const admin = await Admin.findById(decoded.adminId);
        if (!admin || !admin.isActive) {
          return res.status(401).json({ message: 'Invalid or inactive admin account' });
        }
        req.adminId = admin._id;
        req.email = admin.email;
        req.role = 'admin';
        return next();
      }
  
      // For user tokens
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'Invalid user account' });
      }
  
      req.userId = user._id;
      req.email = user.email;
      req.role = 'user';
  
      // If admin role is required, check if user is admin
      if (requiredRole === 'admin' && req.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }
  
      // If no specific role is required or user is admin, allow access
      if (!requiredRole || req.role === 'admin') {
        return next();
      }
  
      // For other roles, check if the role matches
      if (requiredRole && req.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
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