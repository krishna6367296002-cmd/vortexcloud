import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { Gamepad2, X } from "lucide-react";
import { useRecentBookings } from "@/lib/queries";
import { getGame } from "@/lib/games";

const HIDE_KEY = "vx_hide_ticker";

// Rotating "recent bookings" card fed by real bookings (names masked on the server).
export function RecentBookingsTicker() {
  const { data, isError } = useRecentBookings();
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem(HIDE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const items = isError ? [] : (data ?? []);
  const count = items.length;

  useEffect(() => {
    if (count < 2) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => window.clearInterval(t);
  }, [count]);

  if (hidden || count === 0) return null;
  const item = items[index % count];
  const gameCover = getGame(item.game_id)?.cover ?? null;

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[calc(100vw-6.5rem)] max-w-[310px] sm:bottom-6 sm:left-6" data-testid="recent-bookings-ticker">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex items-center gap-3 rounded-2xl border border-[#2a3655] bg-[#0c101a]/90 p-3 pr-8 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            {gameCover ? <img src={gameCover} alt="" className="h-full w-full rounded-xl object-cover" /> : <Gamepad2 className="h-5 w-5" />}
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs text-slate-200" data-testid="ticker-text">
              <span className="font-bold text-white">{item.masked_name}</span> booked{" "}
              <span className="font-semibold text-cyan-300">{item.game_title}</span>
            </p>
            <p className="truncate text-[10px] text-slate-500">
              {item.plan_label} · {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
      <button
        type="button"
        onClick={() => {
          setHidden(true);
          try {
            sessionStorage.setItem(HIDE_KEY, "1");
          } catch {
            // ignore
          }
        }}
        aria-label="Hide recent bookings"
        data-testid="ticker-close-btn"
        className="absolute top-2 right-2 rounded-md p-0.5 text-slate-500 transition-colors hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
