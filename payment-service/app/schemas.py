from pydantic import BaseModel, condecimal, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class PaymentCreate(BaseModel):
    order_id: UUID
    amount: condecimal(max_digits=10, decimal_places=2, gt=0)
    method: str

class PaymentResponse(BaseModel):
    id: UUID
    order_id: UUID
    user_id: UUID
    amount: float
    status: str
    method: Optional[str]
    paid_at: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)

class PaymentEventResponse(BaseModel):
    id: UUID
    payment_id: UUID
    event_type: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
