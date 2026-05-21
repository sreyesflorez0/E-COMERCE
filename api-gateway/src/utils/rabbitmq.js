const amqp = require('amqplib');
const env = require('../config/env');

let channel = null;

const connectRabbitMQ = async () => {
  if (!env.rabbitmq.enabled) {
    console.log('[RabbitMQ] Integration is disabled via config.');
    return;
  }

  try {
    const connection = await amqp.connect(env.rabbitmq.url);
    channel = await connection.createChannel();
    await channel.assertQueue(env.rabbitmq.reportQueue, { durable: true });
    console.log('[RabbitMQ] Connected and queue asserted.');
  } catch (error) {
    console.error('[RabbitMQ] Connection failed:', error.message);
    // Do not crash the gateway if RabbitMQ is down, just log it.
  }
};

const publishReportRequested = async (payload) => {
  if (!env.rabbitmq.enabled) {
    console.log('[RabbitMQ] Publish skipped (disabled):', payload);
    return;
  }

  if (!channel) {
    console.warn('[RabbitMQ] Channel not ready, cannot publish.');
    return;
  }

  try {
    channel.sendToQueue(
      env.rabbitmq.reportQueue,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );
    console.log(`[RabbitMQ] Published event to ${env.rabbitmq.reportQueue}`);
  } catch (error) {
    console.error('[RabbitMQ] Publish failed:', error.message);
  }
};

module.exports = {
  connectRabbitMQ,
  publishReportRequested
};
