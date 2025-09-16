// Simple JWT-like authentication middleware
// In production, use proper JWT verification

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Simple token validation (in production, verify JWT properly)
    if (token.startsWith('fake-jwt-token-')) {
      const userId = token.replace('fake-jwt-token-', '');
      req.user = { userId };
      next();
    } else {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;