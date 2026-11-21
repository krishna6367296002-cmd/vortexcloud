"""Server-side catalog: prices, plans and coupons the backend trusts.

Mirrors frontend/src/lib/games.ts + plans.ts — keep ids/prices in sync by hand.
"""

GAMES: dict[str, dict] = {
    "gta-6": {"title": "Grand Theft Auto VI", "price": 129, "rig": "RTX 4090 Ultra"},
    "cyberpunk-2077": {"title": "Cyberpunk 2077: Phantom Liberty", "price": 99, "rig": "RTX 4090 Ultra"},
    "black-myth-wukong": {"title": "Black Myth: Wukong", "price": 99, "rig": "RTX 4090 Ultra"},
    "god-of-war-ragnarok": {"title": "God of War Ragnarök", "price": 99, "rig": "RTX 4090 Ultra"},
    "spider-man-2": {"title": "Marvel's Spider-Man 2", "price": 99, "rig": "RTX 4090 Ultra"},
    "assassins-creed-shadows": {"title": "Assassin's Creed Shadows", "price": 99, "rig": "RTX 4090 Ultra"},
    "alan-wake-2": {"title": "Alan Wake 2", "price": 99, "rig": "RTX 4090 Ultra"},
    "elden-ring": {"title": "Elden Ring: Shadow of the Erdtree", "price": 89, "rig": "RTX 4080"},
    "ghost-of-tsushima": {"title": "Ghost of Tsushima: Director's Cut", "price": 89, "rig": "RTX 4080"},
    "dragons-dogma-2": {"title": "Dragon's Dogma 2", "price": 89, "rig": "RTX 4090 Ultra"},
    "silent-hill-2": {"title": "Silent Hill 2 Remake", "price": 89, "rig": "RTX 4090 Ultra"},
    "horizon-forbidden-west": {"title": "Horizon Forbidden West", "price": 89, "rig": "RTX 4080"},
    "cod-warzone": {"title": "Call of Duty: Warzone", "price": 79, "rig": "RTX 4080"},
    "forza-horizon-5": {"title": "Forza Horizon 5", "price": 79, "rig": "RTX 4080"},
    "red-dead-redemption-2": {"title": "Red Dead Redemption 2", "price": 79, "rig": "RTX 4080"},
    "resident-evil-4": {"title": "Resident Evil 4", "price": 79, "rig": "RTX 4080"},
    "witcher-3": {"title": "The Witcher 3: Wild Hunt", "price": 69, "rig": "RTX 4080"},
    "starfield": {"title": "Starfield", "price": 79, "rig": "RTX 4080"},
    "ea-fc-25": {"title": "EA SPORTS FC 25", "price": 79, "rig": "RTX 4080"},
    "tekken-8": {"title": "Tekken 8", "price": 79, "rig": "RTX 4080"},
    "f1-24": {"title": "F1 24", "price": 79, "rig": "RTX 4080"},
    "hogwarts-legacy": {"title": "Hogwarts Legacy", "price": 79, "rig": "RTX 4080"},
    "helldivers-2": {"title": "Helldivers 2", "price": 79, "rig": "RTX 4080"},
    "valorant-pro": {"title": "VALORANT", "price": 59, "rig": "RTX 4080"},
    "last-of-us-part-1": {"title": "The Last of Us Part I", "price": 79, "rig": "RTX 4080"},
    "crew-motorfest": {"title": "The Crew Motorfest", "price": 69, "rig": "RTX 4080"},
    "diablo-4": {"title": "Diablo IV: Vessel of Hatred", "price": 79, "rig": "RTX 4080"},
    "dead-space": {"title": "Dead Space", "price": 79, "rig": "RTX 4080"},
}

# price None = the game's hourly price. start_hours = allowed first hour (local time).
# overnight plans may run past midnight into the next day.
PLANS: dict[str, dict] = {
    "hourly": {"label": "1-Hour Session", "hours": 1, "price": None, "start_hours": list(range(24)), "overnight": False},
    "night_owl": {"label": "Night Owl 3-Hour Pass", "hours": 3, "price": 299, "start_hours": [20, 21], "overnight": False},
    "marathon": {"label": "Marathon 5-Hour Pass", "hours": 5, "price": 499, "start_hours": list(range(20)), "overnight": False},
    "ultimate": {"label": "Ultimate 24-Hour Pass", "hours": 24, "price": 999, "start_hours": list(range(24)), "overnight": True},
}

COUPONS: dict[str, int] = {"VORTEX20": 20}  # code -> flat ₹ discount


def plan_price(plan_id: str, game_id: str) -> int:
    plan = PLANS[plan_id]
    return plan["price"] if plan["price"] is not None else GAMES[game_id]["price"]


def format_hour12(hour: int) -> str:
    h = hour % 24
    period = "AM" if h < 12 else "PM"
    display = 12 if h % 12 == 0 else h % 12
    return f"{display:02d}:00 {period}"


def range_label(start: int, hours: int) -> str:
    suffix = " (next day)" if start + hours > 24 else ""
    return f"{format_hour12(start)} - {format_hour12(start + hours)}{suffix}"
