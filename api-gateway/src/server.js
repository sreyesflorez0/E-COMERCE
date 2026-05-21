const app = require('./app');
const env = require('./config/env');
const { connectRabbitMQ } = require('./utils/rabbitmq');

const startServer = async () => {
  try {
    await connectRabbitMQ();
    
    app.listen(env.port, () => {
      console.log(`🚀 API Gateway running in ${env.nodeEnv} mode on port ${env.port}`);
      console.log(`- Auth Service Proxy: ${env.services.auth}`);
      console.log(`- User Service Proxy: ${env.services.user}`);
      console.log(`- Product Service Proxy: ${env.services.product}`);
      console.log(`- Order Service Proxy: ${env.services.order}`);
      if (env.services.reporting) {
        console.log(`- Reporting Service Proxy: ${env.services.reporting}`);
      }
    });
  } catch (error) {
    console.error('Failed to start API Gateway:', error);
    process.exit(1);
  }
};

startServer();
