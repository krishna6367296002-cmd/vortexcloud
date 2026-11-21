import { Check, Zap, Cpu } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { scrollToSection } from "@/lib/sections";
import { GAMES, type Rig } from "@/lib/games";

const TIERS: { rig: Rig; tagline: string; icon: typeof Zap; features: string[]; border: string; iconBg: string }[] = [
  {
    rig: "RTX 4080",
    tagline: "Best value for most titles",
    icon: Cpu,
    features: ["Ultra settings at 1080p / 1440p", "Smooth 60+ FPS gameplay", "240 FPS competitive mode for esports"],
    border: "border-cyan-500/40",
    iconBg: "border-cyan-500/40 bg-cyan-500/15 text-cyan-300",
  },
  {
    rig: "RTX 4090 Ultra",
    tagline: "Flagship 4K ray tracing",
    icon: Zap,
    features: ["4K / 1440p max settings", "Ray Tracing + DLSS 3.5 Frame Gen", "Headroom for the most demanding releases"],
    border: "border-purple-500/40",
    iconBg: "border-purple-500/40 bg-purple-500/15 text-purple-300",
  },
];

export function RigsPricing() {
  return (
    <section id="rigs" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-12">
        <SectionHeading
          eyebrow="Rigs & Pricing"
          eyebrowClass="text-emerald-400"
          title="Choose Your Rig"
          sub="Every game runs on one of two rig tiers. Check the hourly rate range for each below."
        />
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
        {TIERS.map((tier, i) => {
          const games = GAMES.filter((g) => g.rig === tier.rig);
          const prices = games.map((g) => g.pricePerHour);
          const lo = Math.min(...prices);
          const hi = Math.max(...prices);
          const range = lo === hi ? `₹${lo}` : `₹${lo} – ₹${hi}`;
          return (
            <Reveal key={tier.rig} delay={i * 0.1}>
              <div
                className={`flex h-full flex-col rounded-3xl border bg-[#0f131f]/65 p-7 backdrop-blur-xl ${tier.border}`}
                data-testid={`rig-card-${tier.rig.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${tier.iconBg}`}>
                  <tier.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading text-xl font-bold text-white">{tier.rig} Rig</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {tier.tagline} — {games.length} games available
                </p>
                <div className="my-5">
                  <span className="font-heading text-3xl font-black text-cyan-400">{range}</span>
                  <span className="text-xs text-slate-400"> / hour</span>
                </div>
                <ul className="mb-6 flex-1 space-y-2.5 text-xs text-slate-300">
                  {tier.features.map((f) => (
                    <li key={f}>
                      <Check className="mr-2 inline h-4 w-4 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => scrollToSection("library")}
                  data-testid="rig-browse-games-btn"
                  className={`w-full rounded-xl border py-3 text-sm font-bold text-white transition ${tier.iconBg} hover:brightness-125`}
                >
                  Browse {tier.rig} Games
                </button>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
