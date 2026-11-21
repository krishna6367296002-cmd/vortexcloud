"""Public booking API: slots, coupons, bookings, recent ticker, ping."""

import random
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException
from pymongo.errors import DuplicateKeyError

from lib.catalog import COUPONS, GAMES, PLANS, plan_price, range_label, format_hour12
from lib.dates import now_local, today_iso
from lib.db import db
from models.booking import (
    Booking,
    BookingCreate,
    BookingLookup,
    CouponCheck,
    CouponResult,
    PingResponse,
    RecentBooking,
    Slot,
    SlotsResponse,
)

router = APIRouter()

ACTIVE = ["pending", "confirmed", "completed"]
SUFFIXES = ["ALPHA", "NOVA", "PRIME", "FLUX", "ORBIT", "VORTEX"]


def _utc(dt: datetime | str | None) -> datetime | None:
    if dt is None:
        return None
    if isinstance(dt, str):  # FIX: local JSON store saves datetimes as text
        dt = datetime.fromisoformat(dt.replace("Z", "+00:00"))
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


async def to_booking(doc: dict) -> Booking:
    """Normalise Mongo doc; auto-complete a confirmed session whose time ran out."""
    doc.pop("_id", None)
    doc["created_at"] = _utc(doc["created_at"])
    doc["session_started_at"] = _utc(doc.get("session_started_at"))
    started = doc["session_started_at"]
    if doc["status"] == "confirmed" and started:
        if started + timedelta(hours=doc["hours"]) <= datetime.now(timezone.utc):
            doc["status"] = "completed"
            await db.bookings.update_one({"id": doc["id"]}, {"$set": {"status": "completed"}})
    return Booking(**doc)


async def compute_slots(game_id: str) -> SlotsResponse:
    if game_id not in GAMES:
        raise HTTPException(status_code=404, detail="Game not found")
    now = now_local()
    date = today_iso()
    yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    booked: set[int] = set()
    async for b in db.bookings.find(
        {"game_id": game_id, "date": {"$in": [date, yesterday]}, "status": {"$in": ACTIVE}},
        {"_id": 0, "date": 1, "start_hour": 1, "hours": 1},
    ):
        end = b["start_hour"] + b["hours"]
        if b["date"] == date:
            booked.update(range(b["start_hour"], min(24, end)))
        elif end > 24:  # overnight pass carried over from yesterday
            booked.update(range(0, end - 24))
    overrides = {
        o["hour"]: o["state"]
        async for o in db.slot_overrides.find({"game_id": game_id, "date": date}, {"_id": 0})
    }
    slots = []
    for hour in range(24):
        if hour < now.hour:
            state = "passed"
        elif hour in booked:
            state = "booked"
        elif overrides.get(hour) == "full":
            state = "full"
        else:
            state = "open"
        slots.append(Slot(hour=hour, label=range_label(hour, 1), state=state))
    return SlotsResponse(game_id=game_id, date=date, now_hour=now.hour, slots=slots)


def coupon_discount(code: str | None, base: int) -> tuple[int, str | None]:
    if not code or not code.strip():
        return 0, None
    norm = code.strip().upper()
    if norm not in COUPONS:
        raise HTTPException(status_code=400, detail=f"Coupon {norm} is not valid")
    return min(COUPONS[norm], base - 1), norm


@router.get("/ping", response_model=PingResponse)
async def ping():
    return PingResponse(pong=True, server_time=datetime.now(timezone.utc))


@router.get("/slots/{game_id}", response_model=SlotsResponse)
async def get_slots(game_id: str):
    return await compute_slots(game_id)


@router.post("/coupons/validate", response_model=CouponResult)
async def validate_coupon(body: CouponCheck):
    if body.game_id not in GAMES:
        raise HTTPException(status_code=404, detail="Game not found")
    norm = body.code.strip().upper()
    if norm not in COUPONS:
        return CouponResult(code=norm, valid=False, discount=0, message="This coupon code is not valid")
    base = plan_price(body.plan, body.game_id)
    discount = min(COUPONS[norm], base - 1)
    return CouponResult(code=norm, valid=True, discount=discount, message=f"₹{discount} off applied")


@router.post("/bookings", response_model=Booking, status_code=201)
async def create_booking(body: BookingCreate):
    game = GAMES.get(body.game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    plan = PLANS[body.plan]
    hours = plan["hours"]
    start = body.start_hour

    if start not in plan["start_hours"] or (start + hours > 24 and not plan["overnight"]):
        raise HTTPException(status_code=400, detail=f"{plan['label']} cannot start at {format_hour12(start)}")
    slots = await compute_slots(body.game_id)
    window = slots.slots[start : min(24, start + hours)]
    if any(s.state != "open" for s in window):
        raise HTTPException(status_code=409, detail="That time slot was just taken — please pick another one")

    base = plan_price(body.plan, body.game_id)
    discount, coupon = coupon_discount(body.coupon_code, base)
    num = random.randint(1000, 9999)
    access = f"VTX-{num}-{random.choice(SUFFIXES)}"
    doc = {
        "id": str(uuid.uuid4()),
        "code": f"VTX-{num}",
        "access_code": access,
        "stream_url": f"https://play.vortexcloud.in/rtc/{access.lower()}",
        "game_id": body.game_id,
        "game_title": game["title"],
        "rig": game["rig"],
        "plan": body.plan,
        "plan_label": plan["label"],
        "hours": hours,
        "start_hour": start,
        "slot_label": range_label(start, hours),
        "date": slots.date,
        "gamer_tag": body.gamer_tag.strip() or "Gamer",
        "base_amount": base,
        "discount": discount,
        "amount": base - discount,
        "coupon_code": coupon,
        "utr": body.utr,
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
        "session_started_at": None,
    }
    try:
        await db.bookings.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="This UTR was already used for another booking")
    return await to_booking(doc)


@router.post("/bookings/lookup", response_model=list[Booking])
async def lookup_bookings(body: BookingLookup):
    if not body.ids:
        return []
    docs = await db.bookings.find({"id": {"$in": body.ids}}).sort("created_at", -1).to_list(50)
    return [await to_booking(d) for d in docs]


@router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str):
    doc = await db.bookings.find_one({"id": booking_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Booking not found")
    return await to_booking(doc)


@router.post("/bookings/{booking_id}/start", response_model=Booking)
async def start_session(booking_id: str):
    doc = await db.bookings.find_one({"id": booking_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Booking not found")
    if doc["status"] != "confirmed":
        raise HTTPException(status_code=409, detail="Booking is not confirmed yet")
    if not doc.get("session_started_at"):
        now = datetime.now(timezone.utc)
        await db.bookings.update_one(
            {"id": booking_id, "session_started_at": None}, {"$set": {"session_started_at": now}}
        )
        doc = await db.bookings.find_one({"id": booking_id})
    return await to_booking(doc)


@router.post("/bookings/{booking_id}/end", response_model=Booking)
async def end_session(booking_id: str):
    doc = await db.bookings.find_one({"id": booking_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Booking not found")
    if doc["status"] == "confirmed":
        await db.bookings.update_one({"id": booking_id}, {"$set": {"status": "completed"}})
        doc["status"] = "completed"
    return await to_booking(doc)


def mask_name(name: str) -> str:
    n = name.strip() or "Gamer"
    if len(n) <= 2:
        return n[0] + "***"
    return f"{n[0]}***{n[-1]}"


@router.get("/recent-bookings", response_model=list[RecentBooking])
async def recent_bookings():
    docs = await db.bookings.find(
        {"status": {"$in": ACTIVE}},
        {"_id": 0, "id": 1, "gamer_tag": 1, "game_id": 1, "game_title": 1, "plan_label": 1, "created_at": 1},
    ).sort("created_at", -1).to_list(10)
    return [
        RecentBooking(
            id=d["id"],
            masked_name=mask_name(d["gamer_tag"]),
            game_id=d["game_id"],
            game_title=d["game_title"],
            plan_label=d["plan_label"],
            created_at=_utc(d["created_at"]),
        )
        for d in docs
    ]
