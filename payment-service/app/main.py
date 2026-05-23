import logging
from contextlib import asynccontextmanager
from uuid import UUID
from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.config import settings
from app.database import engine, Base, get_db
from app import schemas, service, repository
from app.auth import get_current_user, UserData
from app.errors import NotFoundError, BadRequestError, ForbiddenError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified/created.")
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(title="Payment Service", lifespan=lifespan)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, (NotFoundError, BadRequestError, ForbiddenError)):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@app.get("/health")
async def health_check():
    return {"status": "up"}


@app.post("/payments", response_model=schemas.PaymentResponse)
async def create_payment(
    payment_data: schemas.PaymentCreate, 
    request: Request,
    user: UserData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.create_payment(db, payment_data, user, request)


@app.get("/payments/me", response_model=List[schemas.PaymentResponse])
async def get_my_payments(
    user: UserData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await repository.get_payments_by_user(db, user.id)


@app.get("/payments/admin/payments", response_model=List[schemas.PaymentResponse])
async def get_all_payments_admin(
    user: UserData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if user.role != "ADMIN":
        raise ForbiddenError("Not authorized to list all payments")
    return await repository.get_all_payments(db)


@app.get("/payments/order/{order_id}", response_model=schemas.PaymentResponse)
async def get_payment_by_order(
    order_id: UUID,
    user: UserData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    payment = await repository.get_payment_by_order(db, order_id)
    if not payment:
        raise NotFoundError("Payment not found")
        
    if payment.user_id != user.id and user.role != "ADMIN":
        raise ForbiddenError("Not authorized to view this payment")
        
    return payment


@app.get("/payments/{payment_id}", response_model=schemas.PaymentResponse)
async def get_payment(
    payment_id: UUID,
    user: UserData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    payment = await repository.get_payment_by_id(db, payment_id)
    if not payment:
        raise NotFoundError("Payment not found")
        
    if payment.user_id != user.id and user.role != "ADMIN":
        raise ForbiddenError("Not authorized to view this payment")
        
    return payment


@app.post("/payments/{payment_id}/confirm", response_model=schemas.PaymentResponse)
async def confirm_payment_endpoint(
    payment_id: UUID,
    user: UserData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.confirm_payment(db, payment_id, user)


@app.post("/payments/{payment_id}/fail", response_model=schemas.PaymentResponse)
async def fail_payment_endpoint(
    payment_id: UUID,
    user: UserData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.fail_payment(db, payment_id, user)
