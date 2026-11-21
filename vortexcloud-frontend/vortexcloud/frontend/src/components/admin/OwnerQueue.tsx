import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Ban, CheckCircle2, Clock, Copy, Gamepad2, PartyPopper, Power, Radio, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import { getGame } from "@/lib/games";
import { formatRemaining, remainingMs } from "@/lib/store";
import type { Booking, BookingStatus } from "@/lib/types";

interface OwnerQueueProps {
  bookings: Booking[];
  busy: boolean;
  onUpdate: (id: string, next: BookingStatus) => void;
}

function Cover({ b }: { b: Booking }) {
  const cover = getGame(b.game_id)?.cover;
  return cover ? (
    <img src={cover} alt="" className="h-16 w-24 shrink-0 rounded-xl object-cover" />
  ) : (
    <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
      <Gamepad2 className="h-6 w-6" />
    </div>
  );
}

function PendingCard({ b, busy, onUpdate }: { b: Booking; busy: boolean; onUpdate: OwnerQueueProps["onUpdate"] }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => setArmed(false), 3500);
    return () => window.clearTimeout(t);
  }, [armed]);

  const copyUtr = async () => {
    if (await copyText(b.utr)) toast.success("UTR copied", { description: "Match it in your UPI app." });
  };

  return (
    <div
      className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent p-4"
      data-testid={`owner-pending-card-${b.id}`}
    >
      <div className="flex gap-3">
        <Cover b={b} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-base font-bold text-white" data-testid={`owner-pending-name-${b.id}`}>
              {b.gamer_tag}
            </span>
            <span className="text-[11px] text-slate-500">
              {formatDistanceToNow(new Date(b.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="truncate text-sm text-slate-200">{b.game_title}</p>
          <p className="text-xs text-slate-400">
            <Clock className="mr-1 inline h-3 w-3" />
            {b.slot_label} · {b.plan_label}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-[#1e263d] bg-black/50 p-3">
        <div>
          <div className="text-[10px] tracking-wider text-slate-500 uppercase">Should receive</div>
          <div className="font-heading text-xl font-black text-cyan-300" data-testid={`owner-pending-amount-${b.id}`}>
            ₹{b.amount}
          </div>
          {b.discount > 0 && <div className="text-[10px] text-emerald-400">{b.coupon_code} −₹{b.discount}</div>}
        </div>
        <button
          type="button"
          onClick={copyUtr}
          data-testid={`owner-pending-utr-${b.id}`}
          className="rounded-lg text-left transition-colors hover:bg-white/5"
        >
          <div className="text-[10px] tracking-wider text-slate-500 uppercase">UTR (tap to copy)</div>
          <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-white">
            {b.utr} <Copy className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          onClick={() => onUpdate(b.id, "confirmed")}
          disabled={busy}
          data-testid={`owner-allow-${b.id}`}
          className="h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 font-heading text-sm font-extrabold text-black transition-[filter] hover:brightness-110"
        >
          <CheckCircle2 className="mr-1.5 h-4 w-4" /> Allow to Play
        </Button>
        <Button
          variant="destructive"
          onClick={() => (armed ? onUpdate(b.id, "cancelled") : setArmed(true))}
          disabled={busy}
          data-testid={`owner-reject-${b.id}`}
          className={`h-11 rounded-xl font-heading text-sm font-extrabold transition-[background-color] ${armed ? "animate-pulse bg-red-600" : ""}`}
        >
          {armed ? (
            "Tap again to reject"
          ) : (
            <>
              <X className="mr-1.5 h-4 w-4" /> Reject
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function OwnerQueue({ bookings, busy, onUpdate }: OwnerQueueProps) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const pending = bookings
    .filter((b) => b.status === "pending")
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  const playing = bookings.filter((b) => (remainingMs(b, now) ?? -1) > 0);
  const readyToPlay = bookings.filter((b) => b.status === "confirmed" && !b.session_started_at);

  return (
    <div className="mb-10 space-y-8">
      <section data-testid="owner-action-needed">
        <div className="mb-3 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            {pending.length > 0 && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            )}
            <span className={`relative inline-flex h-3 w-3 rounded-full ${pending.length ? "bg-amber-400" : "bg-slate-600"}`} />
          </span>
          <h2 className="font-heading text-lg font-bold text-white">Action Needed</h2>
          <span
            className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-300"
            data-testid="owner-pending-count"
          >
            {pending.length}
          </span>
        </div>
        <p className="mb-4 text-xs text-slate-400">
          Check that the amount and UTR arrived in your UPI app, then tap <b className="text-emerald-300">Allow to Play</b>.
          If the money did not arrive, tap <b className="text-red-300">Reject</b>.
        </p>
        {pending.length === 0 ? (
          <div
            className="flex items-center gap-3 rounded-2xl border border-dashed border-[#1e263d] px-5 py-6 text-sm text-slate-400"
            data-testid="owner-all-caught-up"
          >
            <PartyPopper className="h-5 w-5 text-emerald-400" /> All caught up — no payments waiting for you.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pending.map((b) => (
              <PendingCard key={b.id} b={b} busy={busy} onUpdate={onUpdate} />
            ))}
          </div>
        )}
      </section>

      <section data-testid="owner-playing-now">
        <div className="mb-3 flex items-center gap-2">
          <Radio className="h-4 w-4 text-red-400" />
          <h2 className="font-heading text-lg font-bold text-white">Playing Now</h2>
          <span className="rounded-full border border-red-500/40 bg-red-500/15 px-2.5 py-0.5 text-xs font-bold text-red-300">
            {playing.length}
          </span>
          {readyToPlay.length > 0 && (
            <span className="text-xs text-slate-500">· {readyToPlay.length} allowed, not started yet</span>
          )}
        </div>
        {playing.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1e263d] px-5 py-6 text-sm text-slate-400" data-testid="owner-nobody-playing">
            Nobody is streaming right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {playing.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-3"
                data-testid={`owner-playing-card-${b.id}`}
              >
                <Cover b={b} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white">{b.gamer_tag}</div>
                  <div className="truncate text-xs text-slate-300">{b.game_title}</div>
                  <div className="font-mono text-sm font-bold text-cyan-300">
                    {formatRemaining(remainingMs(b, now) ?? 0)} left
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => onUpdate(b.id, "completed")}
                  data-testid={`owner-stop-${b.id}`}
                  className="rounded-lg border-red-500/40 text-red-300 hover:bg-red-500/10"
                >
                  <Power className="mr-1 h-3.5 w-3.5" /> Stop
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <Ban className="h-3 w-3" /> Rejecting frees the slot again for other gamers. This page refreshes every 15 seconds.
      </p>
    </div>
  );
}
