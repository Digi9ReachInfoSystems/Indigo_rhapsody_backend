const jwt = require('jsonwebtoken');
const { admin } = require('../service/firebaseServices');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'No authorization header provided' 
      });
    }

    // Check if it's a JWT token (Bearer token)
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      try {
        // Try JWT verification first
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        return next();
      } catch (jwtError) {
        // If JWT fails, try Firebase token
        try {
          const decodedToken = await admin.auth().verifyIdToken(token);
          req.user = {
            id: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role || 'User',
            is_creator: decodedToken.is_creator || false
          };
          return next();
        } catch (firebaseError) {
          return res.status(401).json({ 
            success: false,
            message: 'Invalid token (both JWT and Firebase verification failed)' 
          });
        }
      }
    } else {
      // Try Firebase ID token directly
      try {
        const decodedToken = await admin.auth().verifyIdToken(authHeader);
        req.user = {
          id: decodedToken.uid,
          email: decodedToken.email,
          role: decodedToken.role || 'User',
          is_creator: decodedToken.is_creator || false
        };
        return next();
      } catch (firebaseError) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid Firebase token' 
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Authentication error' 
    });
  }
};

const roleMiddleware = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
      });
    }
    
    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware
};  