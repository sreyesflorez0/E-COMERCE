const { Router } = require('express');
const env = require('../config/env');

const router = Router();

const futureRouteHandler = (serviceName) => (req, res) => {
  res.status(501).json({
    error: 'Not Implemented',
    message: `The ${serviceName} service is planned for a future release.`,
    path: req.originalUrl
  });
};

router.use('/payments', futureRouteHandler('payments'));
router.use('/notifications', futureRouteHandler('notifications'));

module.exports = router;
