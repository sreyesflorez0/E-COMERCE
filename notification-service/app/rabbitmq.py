import threading
import json
import pika
import structlog
from datetime import datetime, timezone
from app.config import config
from app.models import build_notification
from app.service import create_notification

logger = structlog.get_logger()

# Global channel for publishing
publisher_channel = None

def get_message_for_event(event_type: str, payload: dict) -> str:
    if event_type == "cart_updated":
        return "Tu carrito ha sido actualizado."
    elif event_type == "order_created":
        return "Tu orden ha sido creada exitosamente."
    elif event_type == "order_confirmed":
        return "Tu orden ha sido confirmada."
    elif event_type == "payment_completed":
        return "Tu pago ha sido procesado exitosamente."
    elif event_type == "payment_failed":
        return "Hubo un problema al procesar tu pago."
    else:
        return f"Evento de sistema: {event_type}"

def handle_event(ch, method, properties, body):
    try:
        payload = json.loads(body)
        event_type = method.routing_key
        
        # Determine user_id
        user_id = payload.get("user_id")
        
        # Note: Depending on the event, user_id might be named differently
        if not user_id and "order" in payload and "user_id" in payload["order"]:
            user_id = payload["order"]["user_id"]
            
        if not user_id:
            logger.warning("Event missing user_id, cannot create notification", event_type=event_type)
            return
            
        message = get_message_for_event(event_type, payload)
        
        # Build and save notification
        notification_doc = build_notification(user_id, event_type, message)
        notification_id = create_notification(notification_doc)
        
        logger.info("Notification created for event", 
                    event_type=event_type, 
                    user_id=user_id, 
                    notification_id=notification_id)
        
        # Optionally publish notification_sent
        if config.ENABLE_NOTIFICATION_SENT_EVENT and publisher_channel:
            try:
                sent_event = {
                    "event_type": "notification_sent",
                    "notification_id": notification_id,
                    "user_id": user_id,
                    "source_event_type": event_type,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                publisher_channel.basic_publish(
                    exchange=config.RABBITMQ_EXCHANGE,
                    routing_key=config.RABBITMQ_NOTIFICATION_SENT_ROUTING_KEY,
                    body=json.dumps(sent_event)
                )
                logger.info("Published notification_sent event", notification_id=notification_id)
            except Exception as e:
                logger.error("Failed to publish notification_sent", error=str(e))
                
    except Exception as e:
        logger.error("Error processing RabbitMQ event", error=str(e), body=body)

def start_rabbitmq_consumer():
    if not config.ENABLE_RABBITMQ:
        logger.info("RabbitMQ is disabled. Consumer will not start.")
        return

    def run():
        global publisher_channel
        try:
            parameters = pika.URLParameters(config.RABBITMQ_URL)
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()
            
            # Save for publisher
            publisher_channel = channel

            channel.exchange_declare(exchange=config.RABBITMQ_EXCHANGE, exchange_type='topic', durable=True)
            
            result = channel.queue_declare(queue=config.RABBITMQ_QUEUE, durable=True)
            queue_name = result.method.queue
            
            routing_keys = config.RABBITMQ_ROUTING_KEYS.split(',')
            for rk in routing_keys:
                rk = rk.strip()
                if rk:
                    channel.queue_bind(
                        exchange=config.RABBITMQ_EXCHANGE, 
                        queue=queue_name, 
                        routing_key=rk
                    )
            
            channel.basic_consume(
                queue=queue_name, 
                on_message_callback=handle_event, 
                auto_ack=True
            )
            
            logger.info("RabbitMQ consumer started", queue=queue_name, routing_keys=routing_keys)
            channel.start_consuming()
            
        except Exception as e:
            logger.warning("RabbitMQ consumer failed to start or crashed", error=str(e))
            # Fallamos silenciosamente para no tumbar Flask

    thread = threading.Thread(target=run, daemon=True)
    thread.start()
