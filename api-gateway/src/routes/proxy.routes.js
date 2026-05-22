const { Router } = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const env = require('../config/env');
const { publishReportRequested } = require('../utils/rabbitmq');

const router = Router();

// Shared Proxy Options
const createProxyOptions = (target) => ({
  target,
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl.split('?')[0].replace(/^\/api/, ''),
  timeout: env.proxyTimeout,
  proxyTimeout: env.proxyTimeout,
  // Ensure headers like Authorization and cookies are forwarded
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log(`[Proxy Request] ${req.method} ${req.originalUrl} -> Target: ${target}${proxyReq.path}`);
      console.log(`[Proxy Request Headers]`, proxyReq.getHeaders());
      if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        // Body parsing restreaming if needed
      }
    },
    proxyRes: (proxyRes, req, res) => {
      console.log(`[Proxy Response] ${req.method} ${req.originalUrl} -> Target: ${target}${req.url} | Status: ${proxyRes.statusCode}`);
      // Intercept report requests to optionally publish to RabbitMQ
      if (req.path.includes('/reports/generate') || req.path.includes('/reports/daily')) {
        if (proxyRes.statusCode === 200 || proxyRes.statusCode === 201) {
          const { publishReportRequested } = require('../utils/rabbitmq');
          publishReportRequested({
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
          });
        }
      }
    },
    error: (err, req, res) => {
      console.error(`[Proxy Error] ${req.method} ${req.url} -> ${target}: ${err.message}`);
      if (!res.headersSent) {
        res.status(502).json({ message: 'Bad Gateway or Service Unavailable', target });
      }
    }
  }
});

// Proxy definitions
router.use('/auth', createProxyMiddleware(createProxyOptions(env.services.auth)));
router.use('/users', createProxyMiddleware(createProxyOptions(env.services.user)));
router.use('/products', createProxyMiddleware(createProxyOptions(env.services.product)));
router.use('/categories', createProxyMiddleware(createProxyOptions(env.services.product)));
router.use('/orders', createProxyMiddleware(createProxyOptions(env.services.order)));
router.use('/cart', createProxyMiddleware(createProxyOptions(env.services.cart || 'http://cart-service:8085')));
router.use('/payments', createProxyMiddleware(createProxyOptions(env.services.payment)));
router.use('/notifications', createProxyMiddleware(createProxyOptions(env.services.notification)));

if (env.services.reporting) {
  router.use('/reports', createProxyMiddleware(createProxyOptions(env.services.reporting)));
}

module.exports = router;
