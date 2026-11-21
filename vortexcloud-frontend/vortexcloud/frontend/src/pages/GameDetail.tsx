import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, Cpu, Gamepad2, Loader2, RefreshCw, Signal, Wifi } from "lucide-react";
import { getGame, RIG_SPECS } from "@/lib/games";
import { getPlan, getPreferredPlan, planPrice, planRangeLabel, type Plan } from "@/lib/plans";
import { useSlots } from "@/lib/queries";
import { SlotBookingMatrix } from "@/components/booking/SlotBookingMatrix";
import { PlanSelector } from "@/components/booking/PlanSelector";
import { UpiCheckoutModal } from "@/components/checkout/UpiCheckoutModal";

export default function GameDetail() {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const game = getGame(gameId);
  const slotsQuery = useSlots(game?.id);
  const [plan, setPlan] = useState<Plan>(() => getPlan(searchParams.get("plan") ?? getPreferredPlan()));
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!game) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center" data-testid="game-not-found">
        <Gamepad2 className="mx-auto mb-4 h-12 w-12 text-slate-600" />
        <h1 className="font-heading text-2xl font-bold text-white">Game not found</h1>
        <p className="mt-2 text-sm text-slate-400">This title is not in the cloud library.</p>
        <Link to="/" className={buttonVariants({ variant: "outline" }) + " mt-6 rounded-xl"} data-testid="game-not-found-back-btn">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
        </Link>
      </div>
    );
  }

  const data = slotsQuery.isError ? undefined : slotsQuery.data;
  const slots = data?.slots ?? [];
  const upcoming = slots.filter((s) => s.state !== "passed");
  const openCount = upcoming.filter((s) => s.state === "open").length;
  const load = upcoming.length === 0 ? 100 : Math.round(((upcoming.length - openCount) / upcoming.length) * 100);
  const price = planPrice(plan, game.pricePerHour);
  const specs = RIG_SPECS[game.rig];
  const specChips: { label: string; value: string }[] = [
    { label: "GPU", value: specs.gpu },
    { label: "CPU", value: specs.cpu },
    { label: "RAM", value: specs.ram },
    { label: "Storage", value: specs.storage },
    { label: "Upscaler", value: specs.upscaler },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-24 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          to="/"
          data-testid="back-to-library-btn"
          className="inline-flex items-center gap-2 rounded-xl border border-[#1e263d] bg-[#0f131f] px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Games
        </Link>
      </div>

      <div
        className="relative mb-8 min-h-[280px] overflow-hidden rounded-3xl border border-[#1e263d] bg-[#0f131f] shadow-2xl lg:h-80"
        data-testid="game-detail-banner"
      >
        <img src={game.cover} alt={`${game.title} key art`} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f131f] via-[#0f131f]/60 to-transparent lg:bg-gradient-to-r lg:from-[#0f131f] lg:via-[#0f131f]/50 lg:to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-1 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              {game.genre} &bull; {game.rating}
            </div>
            <h1 className="font-heading mb-3 text-2xl font-black text-white sm:text-4xl" data-testid="game-detail-title">
              {game.title}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300">{game.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-lg border border-slate-800 bg-black/50 px-3 py-1.5 text-slate-300">
                <Cpu className="mr-1.5 inline h-3.5 w-3.5 text-purple-400" />
                {game.rig} Node
              </span>
              <span className="rounded-lg border border-slate-800 bg-black/50 px-3 py-1.5 text-cyan-300">{game.streamSpec}</span>
            </div>
          </div>
          <div className="mt-6 lg:mt-0">
            <div className="rounded-2xl border border-cyan-500/40 bg-black/60 px-5 py-3">
              <span className="block text-[11px] tracking-wider text-slate-400 uppercase">Hourly Rate</span>
              <span className="font-heading text-3xl font-black text-cyan-400" data-testid="game-detail-price">
                ₹{game.pricePerHour}
              </span>
              <span className="text-xs text-slate-400"> / hour</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#1e263d] bg-[#0f131f]/65 p-5 backdrop-blur-xl lg:col-span-2" data-testid="rig-specs-card">
          <h2 className="font-heading mb-4 flex items-center gap-2 text-sm tracking-wider text-cyan-400 uppercase">
            <Cpu className="h-4 w-4" /> Rig Allocation — {game.rig}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specChips.map((chip) => (
              <div key={chip.label} className="rounded-xl border border-slate-800/80 bg-black/40 px-3 py-2.5">
                <div className="text-[10px] tracking-wider text-slate-500 uppercase">{chip.label}</div>
                <div className="mt-0.5 text-xs font-semibold text-slate-200">{chip.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#1e263d] bg-[#0f131f]/65 p-5 backdrop-blur-xl" data-testid="server-load-card">
          <h2 className="font-heading flex items-center gap-2 text-sm tracking-wider text-cyan-400 uppercase">
            <Signal className="h-4 w-4" /> Today&apos;s Rig Load
          </h2>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 transition-[width] duration-700"
              style={{ width: `${data ? load : 0}%` }}
              data-testid="server-load-bar"
            />
          </div>
          <p className="mt-3 text-xs font-bold text-amber-400" data-testid="server-load-text">
            {data ? `${load}% booked — ${openCount} hours still open today` : "Loading live availability…"}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            <Wifi className="mr-1 inline h-3 w-3" /> Live from the booking server, refreshes every 30s
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#1e263d] bg-[#0f131f] p-6 shadow-xl sm:p-8" data-testid="slot-booking-section">
        <div className="mb-6 border-b border-slate-800 pb-6">
          <h2 className="font-heading flex items-center gap-2.5 text-xl font-bold text-white sm:text-2xl">
            <CalendarDays className="h-5 w-5 text-cyan-400" /> Choose Plan &amp; Time Slot (Today)
          </h2>
          <p className="mt-1 mb-5 text-xs text-slate-400 sm:text-sm">
            Pick a 1-hour session or a combo pass, then choose when your session starts.
            {data ? ` Times are India time (IST), ${data.date}.` : ""}
          </p>
          <PlanSelector
            value={plan.id}
            gamePrice={game.pricePerHour}
            onChange={(p) => {
              setPlan(p);
              setSelectedStart(null);
            }}
          />
        </div>

        {slotsQuery.isPending ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400" data-testid="slots-loading">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading live slots…
          </div>
        ) : !data ? (
          <div className="rounded-2xl border border-dashed border-red-500/40 py-14 text-center" data-testid="slots-error">
            <p className="text-sm text-slate-300">Live slots could not be loaded right now.</p>
            <Button
              variant="outline"
              onClick={() => void slotsQuery.refetch()}
              data-testid="slots-retry-btn"
              className="mt-4 rounded-xl"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        ) : (
          <SlotBookingMatrix
            slots={slots}
            plan={plan}
            price={price}
            selectedStart={selectedStart}
            onSelect={setSelectedStart}
          />
        )}

        <div
          className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#1e263d] bg-slate-900/95 p-5 sm:flex-row"
          data-testid="booking-summary-bar"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/15 text-cyan-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs text-slate-400">{plan.label}</span>
              <span
                className={`font-heading text-sm font-bold sm:text-base ${selectedStart !== null ? "text-emerald-400" : "text-amber-300"}`}
                data-testid="selected-slot-label"
              >
                {selectedStart !== null
                  ? planRangeLabel(plan, selectedStart)
                  : "No slot selected — click an available slot above"}
              </span>
            </div>
          </div>
          <Button
            disabled={selectedStart === null}
            onClick={() => setCheckoutOpen(true)}
            data-testid="proceed-to-pay-btn"
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-3.5 font-heading text-sm font-extrabold tracking-wide text-black shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-[filter,box-shadow] hover:brightness-110 disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none sm:w-auto"
          >
            {selectedStart !== null ? `Proceed to Pay ₹${price}` : "Select a Slot to Pay"}
          </Button>
        </div>
      </div>

      <UpiCheckoutModal
        open={checkoutOpen}
        onOpenChange={(o) => {
          setCheckoutOpen(o);
          if (!o) setSelectedStart(null);
        }}
        game={game}
        plan={plan}
        startHour={selectedStart}
      />
    </div>
  );
}
