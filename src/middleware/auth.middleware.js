import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token =
    (authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null) ?? req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    req.user = jwttoken.verify(token);
    next();
  } catch {
    logger.warn('Invalid or expired token');
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = role => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.role !== role) {
    return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  }

  next();
};
