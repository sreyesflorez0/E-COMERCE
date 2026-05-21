const morgan = require('morgan');
const { generateRequestId } = require('../utils/requestId');

// Setup morgan format
const format = ':requestId :method :url :status :response-time ms - :res[content-length]';

morgan.token('requestId', (req) => {
  return req.id;
});

const requestLogger = () => {
  return [
    (req, res, next) => {
      // Assign or reuse request ID
      req.id = req.headers['x-request-id'] || generateRequestId();
      // Ensure the downstream services get it too
      req.headers['x-request-id'] = req.id;
      res.setHeader('x-request-id', req.id);
      next();
    },
    morgan(format)
  ];
};

module.exports = requestLogger;
