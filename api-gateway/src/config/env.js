require('dotenv').config();

const env = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'ecommerce-super-secret-jwt-key-change-this-in-production-must-be-256-bits',
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:8081',
    user: process.env.USER_SERVICE_URL || 'http://user-service:8082',
    product: process.env.PRODUCT_SERVICE_URL || 'http://product-service:8083',
    order: process.env.ORDER_SERVICE_URL || 'http://order-service:8084',
    reporting: process.env.REPORTING_SERVICE_URL || 'http://host.docker.internal:3000',
    cart: process.env.CART_SERVICE_URL || null,
    payment: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:8086',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:8087',
  },
  proxyTimeout: parseInt(process.env.PROXY_TIMEOUT_MS, 10) || 30000,
  rabbitmq: {
    enabled: process.env.ENABLE_RABBITMQ === 'true',
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    reportQueue: process.env.RABBITMQ_REPORT_QUEUE || 'report_requested',
  }
};

module.exports = env;
