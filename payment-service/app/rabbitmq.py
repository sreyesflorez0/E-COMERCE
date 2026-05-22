import aio_pika
import json
import logging
from app.config import settings
from datetime import datetime
from uuid import UUID

logger = logging.getLogger(__name__)

class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

async def publish_event(event_data: dict, routing_key: str):
    if not settings.ENABLE_RABBITMQ:
        logger.info(f"RabbitMQ is disabled. Skipping event {routing_key}.")
        return

    try:
        connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
        async with connection:
            channel = await connection.channel()
            exchange = await channel.declare_exchange(
                settings.RABBITMQ_EXCHANGE, 
                aio_pika.ExchangeType.TOPIC,
                durable=True
            )
            
            message_body = json.dumps(event_data, cls=CustomEncoder).encode()
            message = aio_pika.Message(
                body=message_body,
                content_type="application/json",
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT
            )
            
            await exchange.publish(message, routing_key=routing_key)
            logger.info(f"Published {routing_key} event for payment {event_data.get('payment_id')}")
            
    except Exception as e:
        # Resilient requirement: shouldn't fail the HTTP request if RabbitMQ is down
        logger.error(f"Failed to publish event to RabbitMQ: {e}")
