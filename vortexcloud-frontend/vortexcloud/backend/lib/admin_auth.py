"""Owner/admin session: password login -> signed httpOnly cookie."""

import hashlib
import hmac
import os
import secrets
import time

from fastapi import HTTPException, Request

COOKIE_NAME = "vx_admin"
SESSION_SECONDS = 12 * 60 * 60


# FIX: a missing ADMIN_TOKEN_SECRET used to crash /admin/* with KeyError (HTTP 500).
# Fall back to a random per-process secret (sessions just reset on restart).
_FALLBACK_SECRET = secrets.token_hex(32)


def _secret() -> bytes:
    return (os.environ.get("ADMIN_TOKEN_SECRET") or _FALLBACK_SECRET).encode()


def check_password(password: str) -> bool:
    expected = os.environ.get("ADMIN_PASSWORD", "")
    return bool(expected) and hmac.compare_digest(password.encode(), expected.encode())


def make_token() -> str:
    exp = str(int(time.time()) + SESSION_SECONDS)
    sig = hmac.new(_secret(), exp.encode(), hashlib.sha256).hexdigest()
    return f"{exp}.{sig}"


def token_valid(token: str | None) -> bool:
    if not token or "." not in token:
        return False
    exp, sig = token.split(".", 1)
    good = hmac.new(_secret(), exp.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, good):
        return False
    return exp.isdigit() and int(exp) > time.time()


async def require_admin(request: Request) -> None:
    if not token_valid(request.cookies.get(COOKIE_NAME)):
        raise HTTPException(status_code=401, detail="Admin login required")

