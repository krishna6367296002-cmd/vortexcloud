# VortexCloud — Fixed Version

React + Vite + TypeScript frontend (`frontend/`) and FastAPI backend (`backend/`).

## Zaroori cheezein (Requirements)
- Node.js 20.19+ (ya 22 LTS)  — https://nodejs.org
- Python 3.10+                — https://python.org (install karte waqt "Add to PATH" tick karein)
- MongoDB optional hai. MongoDB na ho to backend apne-aap `backend/.local_db_store.json` file me data save karta hai.

## Sabse aasan tarika (Windows)
VS Code me folder kholo, terminal me:
```
powershell -ExecutionPolicy Bypass -File .\start-vortexcloud.ps1
```
Pehli baar ye packages install karega, phir backend (:8001) aur frontend (:3000) dono chala dega.
Browser me kholo: http://localhost:3000

## Manual tarika (2 terminal)
Terminal 1 — backend:
```
cd backend
python -m venv .venv
.venv\Scripts\activate          (Mac/Linux: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env          (Mac/Linux: cp .env.example .env)   # sirf agar .env nahi hai
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```
Terminal 2 — frontend:
```
cd frontend
npm install
npm run dev
```
Check: `npm run typecheck` (TypeScript errors), `npm run build` (production build).

## Admin panel
http://localhost:3000/admin — password `backend/.env` me `ADMIN_PASSWORD` hai (default: `vortex-admin-123`).
**Deploy se pehle password aur ADMIN_TOKEN_SECRET zaroor badlein.**

## Kya-kya theek kiya gaya (Fixes)
1. **tsconfig.json** — TypeScript 6/7 me `baseUrl` hata diya gaya hai, isliye `tsc` / `npm run build` fail hota tha
   (`TS5102`, `TS5090`). `baseUrl` hataya, paths ko `./src/*` kiya, `vite/client` types add kiye.
2. **package.json** — sab packages `"latest"` the (har install pe alag version = naye errors). Ab sab tested versions pe pin hain,
   `typecheck` script add ki. Purana Windows-only `node_modules` hata diya (ise `npm install` se dobara banana chahiye).
3. **vite.config.ts** — ES module me `__dirname` exist nahi karta; ab `import.meta.url` se banaya jaata hai.
4. **backend/.env missing tha** — `ADMIN_TOKEN_SECRET` na hone se admin login pe server crash (500) hota tha.
   `.env` + `.env.example` add kiye, aur secret na ho to bhi crash nahi hota.
5. **Admin login cookie** — cookie hamesha `Secure` thi, jo plain `http://` (127.0.0.1 / LAN IP) pe browser save nahi karta,
   isliye login ke baad bhi admin "logged out" dikhta tha. Ab sirf HTTPS pe `Secure` lagta hai.
6. **MongoDB ke bina crash** — `lib/db.py` me pehli `find()` query fallback check se pehle MongoDB pe jaati thi aur
   timeout error deti thi (slots/bookings load nahi hote the). Ab har query pehle check karti hai, phir local JSON store use karti hai.
7. **Local JSON store dates** — JSON me save hui dates text ban jaati thi, phir bookings dikhate waqt crash hota tha. Ab parse hoti hain.
8. `datetime.utcnow()` (deprecated) ko `datetime.now(timezone.utc)` se badla. `__pycache__` files hata di.
9. `start-vortexcloud.ps1` — ab pehli baar `.env`, Python venv aur `npm install` khud karta hai.

Design, pages, colors aur features me koi badlaav nahi kiya gaya.

## Deploy
- Backend: Render (`backend/render.yaml`) — env me `MONGO_URL`, `CORS_ORIGINS`, `ADMIN_PASSWORD` set karein.
- Frontend: Vercel — `frontend/vercel.json` me `YOUR-RENDER-APP` ki jagah apna Render URL daalein.
