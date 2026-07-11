import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mentorix_super_secret_core_token_2026';

// General JWT Verification Middleware
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No authorization token provided. Access denied.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

// Role-Based Access Control Gatekeeper
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access forbidden. This action requires one of these roles: [${roles.join(', ')}]. Current role: ${req.user.role}` 
      });
    }

    next();
  };
};
