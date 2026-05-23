from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from datetime import datetime
from app.models import Payment, PaymentEvent

async def create_payment(db: AsyncSession, payment: Payment) -> Payment:
    db.add(payment)
    await db.flush()
    
    event = PaymentEvent(payment_id=payment.id, event_type=f"PAYMENT_{payment.status}")
    db.add(event)
    
    await db.commit()
    await db.refresh(payment)
    return payment

async def get_payment_by_id(db: AsyncSession, payment_id: UUID) -> Payment:
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    return result.scalars().first()

async def get_payment_by_order(db: AsyncSession, order_id: UUID) -> Payment:
    result = await db.execute(select(Payment).where(Payment.order_id == order_id))
    return result.scalars().first()

async def get_payments_by_user(db: AsyncSession, user_id: UUID) -> list[Payment]:
    result = await db.execute(select(Payment).where(Payment.user_id == user_id))
    return result.scalars().all()

async def get_all_payments(db: AsyncSession) -> list[Payment]:
    result = await db.execute(select(Payment))
    return result.scalars().all()

async def update_payment_status(db: AsyncSession, payment: Payment, new_status: str) -> Payment:
    payment.status = new_status
    if new_status == "COMPLETED":
        payment.paid_at = datetime.utcnow()
        
    event = PaymentEvent(payment_id=payment.id, event_type=f"PAYMENT_{new_status}")
    db.add(event)
    
    await db.commit()
    await db.refresh(payment)
    return payment
