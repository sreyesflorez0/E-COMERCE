const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const env = require('./config/env');

const requestLogger = require('./middlewares/requestLogger.middleware');
const authMiddleware = require('./middlewares/auth.middleware');
const errorMiddleware = require('./middlewares/error.middleware');
const notFoundMiddleware = require('./middlewares/notFound.middleware');

const proxyRoutes = require('./routes/proxy.routes');
const healthRoutes = require('./routes/health.routes');
const futureRoutes = require('./routes/future.routes');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration centralized in the gateway
app.use(cors({
  origin: env.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  credentials: true
}));

// Setup request ID and logging
app.use(requestLogger());

// Cookie parser for handling HttpOnly cookies if present
app.use(cookieParser());

// NOTE: We do NOT use express.json() globally here because http-proxy-middleware 
// needs to forward the raw streams for POST/PUT/PATCH bodies.
// If downstream services need JSON bodies, they will parse the forwarded stream.

// Public Health Check Route
app.use('/', healthRoutes);

// JWT Authentication Middleware
app.use('/api', authMiddleware);

// Proxy Routes
app.use('/api', proxyRoutes);

// Future Planned Routes (return 501 Not Implemented)
app.use('/api', futureRoutes);

// Catch-all 404
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
