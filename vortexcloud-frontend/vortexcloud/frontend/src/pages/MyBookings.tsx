import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Clock, Copy, Gamepad2, KeyRound, Loader2, Play, Radio, Send } from "lucide-react";
import { formatRemaining, remainingMs } from "@/lib/store";
import { useMyBookings } from "@/lib/queries";
import { STATUS_META } from "@/lib/status";
import { copyText } from "@/lib/clipboard";
import { getGame, GAMES } from "@/lib/games";
import type { Booking } from "@/lib/types";
import { TELEGRAM_LINK } from "@/lib/upi";

function coverFor(b: Booking): string {
  return getGame(b.game_id)?.cover ?? GAMES[0].cover;
}

function BookingCard({ booking }: { booking: Booking }) {
  const navigate = useNavigate();
  const meta = STATUS_META[booking.status];

  const copyCode = async () => {
    const ok = await copyText(booking.access_code);
    if (ok) toast.success("Access code copied", { description: booking.access_code });
    else toast.error("Copy failed", { description: "Please copy it manually." });
  };

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border border-[#1e263d] bg-[#0f131f]/65 p-4 backdrop-blur-xl sm:flex-row sm:items-center"
      data-testid={`booking-card-${booking.id}`}
    >
      <img src={coverFor(booking)} alt={`${booking.game_title} cover`} className="h-20 w-full rounded-xl object-cover sm:w-32" />
      <div className="flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-heading text-sm font-bold text-cyan-400">{booking.code}</span>
          <Badge data-testid={`booking-status-${booking.id}`} className={`border ${meta.className}`}>
            {meta.label}
          </Badge>
        </div>
        <h3 className="font-heading text-base font-bold text-white">{booking.game_title}</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          <Clock className="mr-1 inline h-3 w-3" />
          {booking.slot_label} &bull; {booking.plan_label} &bull; ₹{booking.amount}
        </p>
        <p className="mt-1 font-mono text-[11px] text-slate-500">
          {booking.date} &bull; UTR {booking.utr}
        </p>
        {booking.status === "pending" && (
          <p className="mt-1 text-[11px] text-amber-400/90">
            Waiting for owner confirmation — this page updates automatically.
          </p>
        )}
      </div>
      <div className="flex flex-col items-stretch gap-2 sm:items-end">
        {booking.status === "confirmed" && (
          <button
            type="button"
            onClick={copyCode}
            data-testid={`copy-code-${booking.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#1e263d] bg-black/50 px-3 py-2 font-mono text-xs font-bold text-cyan-400 transition-colors hover:bg-slate-800"
          >
            <KeyRound className="h-3.5 w-3.5" /> {booking.access_code} <Copy className="h-3.5 w-3.5" />
          </button>
        )}
        {booking.status === "confirmed" ? (
          <Button
            onClick={() => navigate(`/session/${booking.id}`)}
            data-testid={`launch-stream-${booking.id}`}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 font-heading text-sm font-extrabold text-black transition-[filter] hover:brightness-110"
          >
            <Play className="mr-1.5 h-4 w-4" /> Launch Stream
          </Button>
        ) : booking.status === "pending" ? (
          <>
            <a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noopener"
              data-testid={`booking-telegram-${booking.id}`}
              className="rounded-xl bg-sky-500 px-4 py-2 text-center text-xs font-bold text-black transition-colors hover:bg-sky-400"
            >
              <Send className="mr-1.5 inline h-3.5 w-3.5" /> Send Screenshot on Telegram
            </a>
            <Button
              disabled
              data-testid={`awaiting-confirmation-${booking.id}`}
              className="cursor-not-allowed rounded-xl border border-amber-500/40 bg-amber-500/10 font-heading text-xs font-bold text-amber-300"
            >
              <Clock className="mr-1.5 h-4 w-4" /> Awaiting Confirmation
            </Button>
          </>
        ) : (
          <Link
            to={`/game/${booking.game_id}`}
            data-testid={`rebook-${booking.id}`}
            className={buttonVariants({ variant: "outline" }) + " rounded-xl"}
          >
            Book Again
          </Link>
        )}
      </div>
    </div>
  );
}

export default function MyBookings() {
  const { data, isPending, isError, hasIds } = useMyBookings();
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const bookings = isError ? [] : (data ?? []);
  const live = bookings.filter((b) => (remainingMs(b, now) ?? -1) > 0);
  const upcoming = bookings.filter(
    (b) => b.status === "pending" || (b.status === "confirmed" && (remainingMs(b, now) ?? -1) <= 0),
  );
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 pb-24 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <span className="font-heading text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">Your Rentals</span>
          <h1 className="font-heading mt-1 text-2xl font-bold text-white sm:text-3xl" data-testid="bookings-title">
            My Cloud Sessions
          </h1>
        </div>
        <span
          className="font-heading rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold text-cyan-300"
          data-testid="bookings-count-badge"
        >
          {bookings.length} Total
        </span>
      </div>

      {live.length > 0 && (
        <div
          className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border-2 border-cyan-400 bg-gradient-to-r from-cyan-950/60 to-purple-950/40 p-5 sm:flex-row"
          data-testid="live-session-banner"
        >
          <div className="flex items-center gap-4">
            <img src={coverFor(live[0])} alt={live[0].game_title} className="h-16 w-28 rounded-xl object-cover" />
            <div>
              <span className="mb-1 inline-flex items-center gap-2 rounded-full border border-red-500/60 bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-red-400 uppercase">
                <Radio className="h-3 w-3 animate-pulse" /> Live Now
              </span>
              <h3 className="font-heading text-lg font-bold text-white">{live[0].game_title}</h3>
              <p className="text-xs text-slate-300">
                Time remaining{" "}
                <span className="font-mono font-bold text-cyan-400" data-testid="live-remaining">
                  {formatRemaining(remainingMs(live[0], now) ?? 0)}
                </span>
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate(`/session/${live[0].id}`)}
            data-testid="resume-stream-btn"
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 font-heading font-extrabold text-black transition-[filter] hover:brightness-110"
          >
            <Play className="mr-1.5 h-4 w-4" /> Resume Stream
          </Button>
        </div>
      )}

      {hasIds && isPending ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-400" data-testid="bookings-loading">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your bookings…
        </div>
      ) : hasIds && isError ? (
        <div className="rounded-3xl border border-dashed border-red-500/40 py-16 text-center text-sm text-slate-300" data-testid="bookings-error">
          Your bookings could not be loaded right now. Please refresh in a moment.
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#1e263d] py-20 text-center" data-testid="bookings-empty-state">
          <Gamepad2 className="mx-auto mb-4 h-12 w-12 text-slate-600" />
          <h3 className="font-heading text-lg font-bold text-white">No rentals yet</h3>
          <p className="mt-1 text-sm text-slate-400">Book your first cloud slot and it will show up here.</p>
          <Link to="/" className={buttonVariants() + " mt-6 rounded-xl"} data-testid="empty-browse-games-btn">
            Explore {GAMES.length}+ Games
          </Link>
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList className="rounded-xl bg-[#0f131f]" data-testid="bookings-tabs">
            <TabsTrigger value="upcoming" className="rounded-lg" data-testid="bookings-tab-upcoming">
              Upcoming &amp; Active
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg" data-testid="bookings-tab-past">
              Past Sessions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-6 space-y-4">
            {upcoming.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#1e263d] py-16 text-center text-sm text-slate-400" data-testid="upcoming-empty-state">
                Nothing scheduled ahead. Your live session (if any) is shown above.
              </div>
            ) : (
              upcoming.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </TabsContent>
          <TabsContent value="past" className="mt-6 space-y-4">
            {past.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#1e263d] py-16 text-center text-sm text-slate-400" data-testid="past-empty-state">
                No completed sessions yet.
              </div>
            ) : (
              past.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
