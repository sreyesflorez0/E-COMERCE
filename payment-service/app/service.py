from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Request
from datetime import datetime

from app.models import Payment
from app.schemas import PaymentCreate
from app import repository
from app.errors import NotFoundError, BadRequestError, ForbiddenError
from app.auth import UserData
from app.order_client import check_order_exists
from app.config import settings
from app.rabbitmq import publish_event

async def create_payment(db: AsyncSession, payment_data: PaymentCreate, user: UserData, request: Request) -> Payment:
    # Check if a payment already exists for this order
    existing_payment = await repository.get_payment_by_order(db, payment_data.order_id)
    if existing_payment:
        raise BadRequestError("Payment for this order already exists")

    # Validate order
    is_valid_order = await check_order_exists(payment_data.order_id, request)
    if not is_valid_order:
        if not settings.PAYMENT_ALLOW_UNVERIFIED_ORDERS:
            raise BadRequestError("Invalid order or order not found")
            
    payment = Payment(
        order_id=payment_data.order_id,
        user_id=user.id,
        amount=payment_data.amount,
        method=payment_data.method,
        status="PENDING"
    )
    return await repository.create_payment(db, payment)

async def confirm_payment(db: AsyncSession, payment_id: UUID, user: UserData) -> Payment:
    payment = await repository.get_payment_by_id(db, payment_id)
    if not payment:
        raise NotFoundError("Payment not found")
        
    if payment.user_id != user.id and user.role != "ADMIN":
        raise ForbiddenError("Not authorized to confirm this payment")
        
    if payment.status == "COMPLETED":
        raise BadRequestError("Payment is already completed")
    if payment.status == "FAILED":
        raise BadRequestError("Payment already failed")
        
    updated_payment = await repository.update_payment_status(db, payment, "COMPLETED")
    
    event_data = {
        "event_type": "payment_completed",
        "payment_id": updated_payment.id,
        "order_id": updated_payment.order_id,
        "user_id": updated_payment.user_id,
        "amount": float(updated_payment.amount),
        "method": updated_payment.method,
        "status": updated_payment.status,
        "timestamp": datetime.utcnow()
    }
    
    await publish_event(event_data, settings.RABBITMQ_PAYMENT_COMPLETED_ROUTING_KEY)
    
    return updated_payment

async def fail_payment(db: AsyncSession, payment_id: UUID, user: UserData) -> Payment:
    payment = await repository.get_payment_by_id(db, payment_id)
    if not payment:
        raise NotFoundError("Payment not found")
        
    if payment.user_id != user.id and user.role != "ADMIN":
        raise ForbiddenError("Not authorized to fail this payment")
        
    if payment.status == "COMPLETED":
        raise BadRequestError("Payment is already completed")
    if payment.status == "FAILED":
        raise BadRequestError("Payment is already failed")
        
    updated_payment = await repository.update_payment_status(db, payment, "FAILED")
    
    event_data = {
        "event_type": "payment_failed",
        "payment_id": updated_payment.id,
        "order_id": updated_payment.order_id,
        "user_id": updated_payment.user_id,
        "amount": float(updated_payment.amount),
        "method": updated_payment.method,
        "status": updated_payment.status,
        "timestamp": datetime.utcnow()
    }
    
    await publish_event(event_data, settings.RABBITMQ_PAYMENT_FAILED_ROUTING_KEY)
    
    return updated_payment
