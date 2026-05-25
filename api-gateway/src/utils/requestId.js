const crypto = require('crypto');

const generateRequestId = () => {
  return crypto.randomUUID();
};

module.exports = {
  generateRequestId
};
