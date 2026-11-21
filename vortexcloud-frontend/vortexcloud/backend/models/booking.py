"""Booking / slot / coupon / admin models. Mirrored by frontend/src/lib/types.ts."""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

BookingStatus = Literal["pending", "confirmed", "completed", "cancelled"]
PlanId = Literal["hourly", "night_owl", "marathon", "ultimate"]
SlotState = Literal["open", "full", "booked", "passed"]


class Booking(BaseModel):
    id: str
    code: str
    access_code: str
    stream_url: str
    game_id: str
    game_title: str
    rig: str
    plan: PlanId
    plan_label: str
    hours: int
    start_hour: int
    slot_label: str
    date: str
    gamer_tag: str
    base_amount: int
    discount: int
    amount: int
    coupon_code: Optional[str] = None
    utr: str
    status: BookingStatus
    created_at: datetime
    session_started_at: Optional[datetime] = None


class BookingCreate(BaseModel):
    game_id: str
    plan: PlanId
    start_hour: int = Field(ge=0, le=23)
    gamer_tag: str = Field(default="", max_length=24)
    utr: str = Field(pattern=r"^\d{12}$")
    coupon_code: Optional[str] = Field(default=None, max_length=24)


class BookingLookup(BaseModel):
    ids: list[str] = Field(default_factory=list, max_length=50)


class Slot(BaseModel):
    hour: int
    label: str
    state: SlotState


class SlotsResponse(BaseModel):
    game_id: str
    date: str
    now_hour: int
    slots: list[Slot]


class SlotUpdate(BaseModel):
    state: Literal["open", "full"]


class CouponCheck(BaseModel):
    code: str = Field(max_length=24)
    game_id: str
    plan: PlanId


class CouponResult(BaseModel):
    code: str
    valid: bool
    discount: int
    message: str


class RecentBooking(BaseModel):
    id: str
    masked_name: str
    game_id: str
    game_title: str
    plan_label: str
    created_at: datetime


class PingResponse(BaseModel):
    pong: bool
    server_time: datetime


class AdminLogin(BaseModel):
    password: str = Field(max_length=128)


class AdminMe(BaseModel):
    authenticated: bool


class AdminStatusUpdate(BaseModel):
    status: BookingStatus
