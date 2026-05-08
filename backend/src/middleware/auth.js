const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user exists and get tenant info
    const result = await pool.query(
      `SELECT p.*, t.name as tenant_name, t.slug as tenant_slug 
       FROM profiles p 
       JOIN tenants t ON p.tenant_id = t.id 
       WHERE p.id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const tenantScope = (req, res, next) => {
  // Ensure all queries are scoped to the user's tenant
  if (!req.user || !req.user.tenant_id) {
    return res.status(401).json({ error: 'Tenant context required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  tenantScope
};
