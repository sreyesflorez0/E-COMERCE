const jwt = require('jsonwebtoken');
const env = require('../config/env');

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    // We use HS512 based on the order-service and reporting-service implementations. 
    // The library handles standard HS256/HS512 auto-detect based on signature but we can be explicit if needed.
    jwt.verify(token, env.jwtSecret, { algorithms: ['HS512'] }, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

module.exports = {
  verifyToken
};
