import { Link } from "react-router-dom";
import { CalendarCheck, Cpu, Gauge, Signal, Zap } from "lucide-react";
import { FEATURED_GAME } from "@/lib/games";
import { MarqueeBanner } from "@/components/common/MarqueeBanner";
import { GameLibrary } from "@/components/games/GameLibrary";
import { CtaBanner, FeaturesGrid, HowItWorks, StatsStrip } from "@/components/home/HomeSections";
import { RigsPricing } from "@/components/home/RigsPricing";
import { FaqSection } from "@/components/home/FaqSection";
import { ComboPasses } from "@/components/home/ComboPasses";
import { DeviceChecker } from "@/components/home/DeviceChecker";
import { PingTestDialog } from "@/components/common/PingTestDialog";
import { useSlots } from "@/lib/queries";

export default function Home() {
  const game = FEATURED_GAME;
  const slotsQuery = useSlots(game.id);
  const openSlots = slotsQuery.isError
    ? null
    : (slotsQuery.data?.slots.filter((s) => s.state === "open").length ?? null);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16">
        <div className="pointer-events-none absolute top-0 left-1/2 h-[350px] w-[650px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="pointer-events-none absolute top-20 right-10 h-[350px] w-[350px] rounded-full bg-cyan-500/15 blur-[130px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border-2 border-purple-500/50 bg-gradient-to-br from-[#161028] via-[#0f131f] to-[#0b1524] shadow-[0_0_50px_rgba(157,78,221,0.2)]">
            <div className="grid grid-cols-1 items-center lg:grid-cols-12">
              <div className="space-y-6 p-6 sm:p-10 lg:col-span-7 lg:p-12">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-heading rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-lg">
                    <Zap className="mr-1 inline h-3.5 w-3.5" /> #1 Featured Cloud Exclusive
                  </span>
                  {openSlots !== null && (
                    <span
                      className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400"
                      data-testid="hero-open-slots-badge"
                    >
                      {openSlots} Slots Open Today
                    </span>
                  )}
                </div>

                <h1 className="font-heading text-3xl leading-tight font-black tracking-tight text-white sm:text-5xl">
                  {game.title.toUpperCase().slice(0, -2)}
                  <span className="neon-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    {game.title.toUpperCase().slice(-2)}
                  </span>
                </h1>

                <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  Experience {game.title.replace("Grand Theft Auto ", "Vice City & Leonida in ")} on our{" "}
                  <span className="font-semibold text-white">RTX 4090 Ultra Cloud Rigs</span> with Ray Tracing and
                  DLSS 3.5. Zero downloads — instant browser and Parsec streaming.
                </p>

                <div className="flex flex-wrap items-center gap-5 pt-2">
                  <div className="rounded-2xl border border-purple-500/40 bg-black/60 px-5 py-3">
                    <span className="block text-[11px] tracking-wider text-slate-400 uppercase">Hourly Rig Rate</span>
                    <span className="font-heading text-2xl font-black text-cyan-400 sm:text-3xl" data-testid="hero-price">
                      ₹{game.pricePerHour}
                    </span>
                    <span className="text-xs text-slate-400"> / hr</span>
                  </div>
                  <Link
                    to={`/game/${game.id}`}
                    data-testid="hero-book-now-btn"
                    className="font-heading flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 px-7 py-4 text-sm font-extrabold tracking-wide text-white shadow-[0_0_30px_rgba(157,78,221,0.5)] transition hover:opacity-95 sm:text-base"
                  >
                    <CalendarCheck className="h-5 w-5" /> Book Slot / View Game
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
                  <PingTestDialog variant="hero" />
                  <span>
                    <Cpu className="mr-1.5 inline h-3.5 w-3.5 text-purple-400" /> NVIDIA RTX 4090 Node
                  </span>
                  <span>
                    <Gauge className="mr-1.5 inline h-3.5 w-3.5 text-cyan-400" /> 4K / 120 FPS Locked
                  </span>
                  <span>
                    <Zap className="mr-1.5 inline h-3.5 w-3.5 text-amber-400" /> Instant UPI Access
                  </span>
                </div>
              </div>

              <div className="relative min-h-[320px] lg:col-span-5 lg:h-full">
                <div className="animate-floaty relative h-full min-h-[320px]">
                  <img
                    src={game.cover}
                    alt={`${game.title} key art`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f131f] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0f131f] lg:via-transparent lg:to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/75 px-3 py-1.5 font-mono text-xs backdrop-blur-md">
                    <Signal className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-bold text-emerald-400">LIVE</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-cyan-400">120 FPS</span>
                  </div>
                  <div className="absolute right-4 bottom-4 rounded-lg border border-purple-500/40 bg-purple-500/20 px-3 py-1.5 text-xs font-bold text-purple-200 backdrop-blur-md">
                    RTX 4090 Ultra Rig
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <StatsStrip />
      <MarqueeBanner />
      <GameLibrary />
      <ComboPasses />
      <HowItWorks />
      <FeaturesGrid />
      <RigsPricing />
      <DeviceChecker />
      <FaqSection />
      <CtaBanner />
    </div>
  );
}
