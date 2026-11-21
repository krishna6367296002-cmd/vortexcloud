"""Owner/admin API: login, all bookings, status changes, slot OPEN/FULL control."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from lib.admin_auth import COOKIE_NAME, SESSION_SECONDS, check_password, make_token, require_admin, token_valid
from lib.catalog import GAMES
from lib.dates import today_iso
from lib.db import db
from models.booking import AdminLogin, AdminMe, AdminStatusUpdate, Booking, SlotsResponse, SlotUpdate
from routers.bookings import compute_slots, to_booking

router = APIRouter(prefix="/admin")


@router.post("/login", response_model=AdminMe)
async def admin_login(body: AdminLogin, request: Request, response: Response):
    if not check_password(body.password):
        raise HTTPException(status_code=401, detail="Wrong password")
    # FIX: Secure cookies are dropped on plain http (e.g. http://127.0.0.1 / LAN IP), so login
    # "succeeded" but the session never stuck. Only mark Secure when the request is HTTPS.
    proto = request.headers.get("x-forwarded-proto", request.url.scheme).split(",")[0].strip()
    response.set_cookie(
        COOKIE_NAME, make_token(), max_age=SESSION_SECONDS, httponly=True,
        secure=proto == "https", samesite="lax", path="/",
    )
    return AdminMe(authenticated=True)


@router.post("/logout", response_model=AdminMe)
async def admin_logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")
    return AdminMe(authenticated=False)


@router.get("/me", response_model=AdminMe)
async def admin_me(request: Request):
    return AdminMe(authenticated=token_valid(request.cookies.get(COOKIE_NAME)))


@router.get("/bookings", response_model=list[Booking], dependencies=[Depends(require_admin)])
async def admin_bookings():
    docs = await db.bookings.find().sort("created_at", -1).to_list(1000)
    return [await to_booking(d) for d in docs]


@router.patch("/bookings/{booking_id}", response_model=Booking, dependencies=[Depends(require_admin)])
async def admin_update_booking(booking_id: str, body: AdminStatusUpdate):
    res = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": body.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return await to_booking(await db.bookings.find_one({"id": booking_id}))


@router.get("/slots/{game_id}", response_model=SlotsResponse, dependencies=[Depends(require_admin)])
async def admin_slots(game_id: str):
    return await compute_slots(game_id)


@router.put("/slots/{game_id}/{hour}", response_model=SlotsResponse, dependencies=[Depends(require_admin)])
async def admin_set_slot(game_id: str, hour: int, body: SlotUpdate):
    if game_id not in GAMES:
        raise HTTPException(status_code=404, detail="Game not found")
    if not 0 <= hour <= 23:
        raise HTTPException(status_code=400, detail="Hour must be 0-23")
    current = (await compute_slots(game_id)).slots[hour].state
    if current in ("booked", "passed"):
        raise HTTPException(status_code=409, detail=f"This hour is {current} and cannot be changed")
    await db.slot_overrides.update_one(
        {"game_id": game_id, "date": today_iso(), "hour": hour},
        {"$set": {"state": body.state}},
        upsert=True,
    )
    return await compute_slots(game_id)
