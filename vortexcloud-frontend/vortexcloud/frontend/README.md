# VortexCloud Frontend (recovered from Emergent preview)

React + TypeScript + Vite + Tailwind v4.

## Run locally
```
npm install
npm run dev        # http://localhost:3000
```

## Backend
The FastAPI backend is in ../backend. The frontend calls it under `/api` (proxied to http://localhost:8001 in vite.config.ts).
Endpoints used: /slots/{game}, /bookings, /bookings/lookup, /bookings/{id}, /bookings/{id}/start,
/bookings/{id}/end, /recent-bookings, /coupons/validate, /ping, /admin/login, /admin/logout,
/admin/me, /admin/bookings, /admin/bookings/{id}, /admin/slots/{game}/{hour}.
Without the backend, slots/bookings/admin show error states.

## Files reconstructed (not in the original browser download)
- src/lib/types.ts (rebuilt from usage)
- src/index.css (clean Tailwind source; the compiled original is src/index.compiled.reference.css)
- package.json, vite.config.ts, tsconfig.json, index.html

## Deploy
Vercel: import this folder, framework Vite. Edit vercel.json and put your Render URL in the rewrite
(/api/* -> backend). Because of the rewrite the browser sees one origin, so the admin cookie works.
