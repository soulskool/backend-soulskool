




import userModel from '../models/userModel.js';
import jwt from "jsonwebtoken";
export const authMiddleware = async (req, res, next) => {
    try {
      let token;
      
      // Check for token in Authorization header
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }
      
      // Check if token exists
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, no token provided"
        });
      }
      
      // Verify token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'fallback_secret_key_change_in_production'
      );
      
      // Find user by id from token
      const user = await userModel.findById(decoded.id).select('-__v');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found or token invalid"
        });
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
            if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: "Invalid token"
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: "Token expired"
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Server authentication error",
        error: error.message
      });
    }
  };