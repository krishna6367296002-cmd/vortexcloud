"""Shared DB handle with automatic MongoDB + local JSON fallback for offline/local runs."""

from __future__ import annotations

import asyncio
import copy
import json
import logging
import os
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, IndexModel

BASE_DIR = Path(__file__).parent.parent
load_dotenv(BASE_DIR / ".env")

mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
db_name = os.environ.get("DB_NAME", "vortexcloud_db")
logger = logging.getLogger(__name__)

_STORE_FILE = BASE_DIR / ".local_db_store.json"
_IO_LOCK = asyncio.Lock()

INDEXES: dict[str, list[IndexModel]] = {
    "status_checks": [IndexModel([("timestamp", DESCENDING)], name="timestamp_desc")],
    "bookings": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("utr", ASCENDING)], name="utr", unique=True),
        IndexModel([("game_id", ASCENDING), ("date", ASCENDING), ("status", ASCENDING)], name="game_date_status"),
        IndexModel([("status", ASCENDING), ("created_at", DESCENDING)], name="status_created"),
        IndexModel([("created_at", DESCENDING)], name="created_desc"),
    ],
    "slot_overrides": [
        IndexModel([("game_id", ASCENDING), ("date", ASCENDING), ("hour", ASCENDING)], name="game_date_hour", unique=True),
    ],
}


def _load_local_data() -> dict[str, list[dict[str, Any]]]:
    if not _STORE_FILE.exists():
        return {"bookings": [], "slot_overrides": [], "status_checks": []}
    try:
        raw = json.loads(_STORE_FILE.read_text(encoding="utf-8"))
        return {
            "bookings": list(raw.get("bookings", [])),
            "slot_overrides": list(raw.get("slot_overrides", [])),
            "status_checks": list(raw.get("status_checks", [])),
        }
    except Exception:
        return {"bookings": [], "slot_overrides": [], "status_checks": []}


def _save_local_data(data: dict[str, list[dict[str, Any]]]) -> None:
    _STORE_FILE.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")


def _match_condition(val: Any, cond: Any) -> bool:
    if isinstance(cond, dict):
        if "$in" in cond:
            return val in cond["$in"]
        if "$ne" in cond:
            return val != cond["$ne"]
        return False
    return val == cond


def _matches_filter(doc: dict[str, Any], flt: dict[str, Any] | None) -> bool:
    if not flt:
        return True
    for k, v in flt.items():
        if not _match_condition(doc.get(k), v):
            return False
    return True


def _project_doc(doc: dict[str, Any], proj: dict[str, int] | None) -> dict[str, Any]:
    out = copy.deepcopy(doc)
    if not proj:
        return out
    if proj.get("_id") == 0:
        out.pop("_id", None)
    included = [k for k, v in proj.items() if k != "_id" and v == 1]
    if included:
        keep = {k: out[k] for k in included if k in out}
        if proj.get("_id") != 0 and "_id" in out:
            keep["_id"] = out["_id"]
        return keep
    return out


class _LocalCursor:
    def __init__(self, docs: list[dict[str, Any]], proj: dict[str, int] | None = None):
        self._docs = [_project_doc(d, proj) for d in docs]
        self._sort_field: str | None = None
        self._sort_dir: int = 1

    def sort(self, field: str, direction: int = 1) -> "_LocalCursor":
        self._sort_field = field
        self._sort_dir = direction
        return self

    async def to_list(self, length: int = 1000) -> list[dict[str, Any]]:
        items = list(self._docs)
        if self._sort_field:
            reverse = self._sort_dir < 0
            items.sort(key=lambda d: str(d.get(self._sort_field) or ""), reverse=reverse)
        return items[:length]

    def __aiter__(self):
        items = list(self._docs)
        if self._sort_field:
            reverse = self._sort_dir < 0
            items.sort(key=lambda d: str(d.get(self._sort_field) or ""), reverse=reverse)
        self._iter = iter(items)
        return self

    async def __anext__(self) -> dict[str, Any]:
        try:
            return next(self._iter)
        except StopIteration:
            raise StopAsyncIteration


class _LazyCursor:
    """find() result that picks MongoDB or the local JSON store on first use."""

    def __init__(self, col: "_LocalCollection", flt: dict[str, Any] | None, proj: dict[str, int] | None):
        self._col = col
        self._flt = flt or {}
        self._proj = proj
        self._sort: tuple[str, int] | None = None

    def sort(self, field: str, direction: int = 1) -> "_LazyCursor":
        self._sort = (field, direction)
        return self

    async def _resolve(self) -> Any:
        if await self._col._mongo_ok():
            cur = self._col._mongo.find(self._flt, self._proj)
        else:
            cur = self._col._local_find(self._flt, self._proj)
        if self._sort:
            cur = cur.sort(*self._sort)
        return cur

    async def to_list(self, length: int = 1000) -> list[dict[str, Any]]:
        cur = await self._resolve()
        return await cur.to_list(length)

    def __aiter__(self):
        return self._gen()

    async def _gen(self):
        for doc in await self.to_list(100000):
            yield doc


class _UpdateResult:
    def __init__(self, matched_count: int):
        self.matched_count = matched_count


class _LocalCollection:
    def __init__(self, name: str, mongo_col: Any):
        self._name = name
        self._mongo = mongo_col
        self._use_local = False

    async def _mongo_ok(self) -> bool:
        if self._use_local:
            return False
        try:
            await asyncio.wait_for(self._mongo.database.client.admin.command("ping"), timeout=0.6)
            return True
        except Exception:
            self._use_local = True
            return False

    def find(self, flt: dict[str, Any] | None = None, proj: dict[str, int] | None = None) -> "_LazyCursor":
        # FIX: decide Mongo vs local JSON lazily (after a ping), so the very first find()
        # no longer crashes with ServerSelectionTimeoutError when MongoDB is not running.
        return _LazyCursor(self, flt, proj)

    def _local_find(self, flt: dict[str, Any] | None, proj: dict[str, int] | None) -> _LocalCursor:
        data = _load_local_data()
        matched = [d for d in data.get(self._name, []) if _matches_filter(d, flt)]
        return _LocalCursor(matched, proj)

    async def find_one(self, flt: dict[str, Any], proj: dict[str, int] | None = None) -> dict[str, Any] | None:
        if await self._mongo_ok():
            return await self._mongo.find_one(flt, proj)
        data = _load_local_data()
        for d in data.get(self._name, []):
            if _matches_filter(d, flt):
                return _project_doc(d, proj)
        return None

    async def insert_one(self, doc: dict[str, Any]) -> Any:
        if await self._mongo_ok():
            return await self._mongo.insert_one(doc)
        async with _IO_LOCK:
            data = _load_local_data()
            col = data.setdefault(self._name, [])
            if self._name == "bookings" and doc.get("utr"):
                if any(existing.get("utr") == doc.get("utr") for existing in col):
                    from pymongo.errors import DuplicateKeyError
                    raise DuplicateKeyError("Duplicate UTR")
            col.append(copy.deepcopy(doc))
            _save_local_data(data)
        return None

    async def update_one(self, flt: dict[str, Any], update: dict[str, Any], upsert: bool = False) -> _UpdateResult:
        if await self._mongo_ok():
            res = await self._mongo.update_one(flt, update, upsert=upsert)
            return _UpdateResult(res.matched_count)
        async with _IO_LOCK:
            data = _load_local_data()
            col = data.setdefault(self._name, [])
            matched = 0
            for d in col:
                if _matches_filter(d, flt):
                    matched += 1
                    if "$set" in update:
                        d.update(copy.deepcopy(update["$set"]))
                    break
            if matched == 0 and upsert:
                new_doc = dict(flt)
                if "$set" in update:
                    new_doc.update(copy.deepcopy(update["$set"]))
                col.append(new_doc)
                matched = 1
            _save_local_data(data)
            return _UpdateResult(matched)

    async def create_indexes(self, models: list[IndexModel]) -> None:
        if await self._mongo_ok():
            await self._mongo.create_indexes(models)


class _FallbackDB:
    def __init__(self, mongo_db: Any):
        self._mongo_db = mongo_db
        self._cols: dict[str, _LocalCollection] = {}

    def __getattr__(self, name: str) -> _LocalCollection:
        if name.startswith("_"):
            raise AttributeError(name)
        if name not in self._cols:
            self._cols[name] = _LocalCollection(name, self._mongo_db[name])
        return self._cols[name]

    def __getitem__(self, name: str) -> _LocalCollection:
        return getattr(self, name)


client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=1000)
_raw_db = client[db_name]
db = _FallbackDB(_raw_db)


async def ensure_indexes() -> None:
    try:
        await asyncio.wait_for(client.admin.command("ping"), timeout=0.8)
    except Exception:
        logger.info("MongoDB not reachable locally; using persistent local JSON store at %s", _STORE_FILE)
        return
    for collection, models in INDEXES.items():
        for model in models:
            try:
                await _raw_db[collection].create_indexes([model])
            except Exception as exc:
                logger.error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)
