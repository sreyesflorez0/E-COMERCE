const { verifyToken } = require('../utils/jwt');

// Routes that do not require JWT authentication
const publicRoutes = [
  { path: '/api/auth/login', methods: ['POST'] },
  { path: '/api/auth/register', methods: ['POST'] },
  { path: '/api/auth/refresh', methods: ['POST'] },
  { path: '/health', methods: ['GET'] },
  // Product service public endpoints
  { path: '/api/products', methods: ['GET'] },
  { path: '/api/categories', methods: ['GET'] },
  { path: '/api/recommendations/trending', methods: ['GET'] }
];

const isPublicRoute = (req) => {
  const requestPath = req.originalUrl.split('?')[0];
  
  // Temporal debug logs as requested
  console.log(`[Auth Check] Method: ${req.method}, originalUrl: ${req.originalUrl}, path: ${req.path}, checking against: ${requestPath}`);

  return publicRoutes.some(route => {
    // Exact match for endpoints like /api/auth/login
    // Or prefix match for /api/products and /api/categories to allow sub-paths like /api/products/123
    const isPrefixRoute = route.path === '/api/products' || route.path === '/api/categories' || route.path === '/api/recommendations/trending';
    const isPathMatch = requestPath === route.path || (isPrefixRoute && requestPath.startsWith(`${route.path}/`));
    const isMethodMatch = route.methods.includes(req.method);
    return isPathMatch && isMethodMatch;
  });
};

const authMiddleware = async (req, res, next) => {
  if (isPublicRoute(req)) {
    return next();
  }

  let token = null;

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    // Or from cookies if configured that way
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ message: 'No auth token provided.' });
  }

  try {
    const decoded = await verifyToken(token);
    // Attach user payload to request for potential role-based routing or logs
    req.user = decoded;
    // We do NOT strip the Authorization header, as downstream services also validate the token.
    next();
  } catch (error) {
    console.error(`[Auth] JWT Error: ${error.message}`);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
