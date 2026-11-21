import { Clock, Moon, CalendarRange, TicketPercent, Check, Crown } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { scrollToSection } from "@/lib/sections";
import { COUPON_HINT, setPreferredPlan } from "@/lib/plans";
import { GAMES } from "@/lib/games";
import type { PlanId } from "@/lib/types";

const minPrice = Math.min(...GAMES.map((g) => g.pricePerHour));

const OFFERS: {
  id: PlanId;
  icon: typeof Clock;
  name: string;
  price: string;
  unit: string;
  tag?: string;
  perks: string[];
  accent: string;
}[] = [
  {
    id: "hourly",
    icon: Clock,
    name: "Standard Session",
    price: `₹${minPrice}+`,
    unit: "/ hour",
    perks: ["Any game, any open hour", "Every day of the week", "Perfect for a quick match"],
    accent: "from-slate-500/30 to-slate-700/20 border-slate-600/40",
  },
  {
    id: "night_owl",
    icon: Moon,
    name: "Night Owl 3-Hour Pass",
    price: "₹299",
    unit: "/ 3 hours",
    tag: "Most Popular",
    perks: ["3 back-to-back hours on one rig", "Start at 8 PM or 9 PM", "Works with every game, even 4090 titles"],
    accent: "from-purple-600/30 to-indigo-700/20 border-purple-500/50",
  },
  {
    id: "marathon",
    icon: CalendarRange,
    name: "Marathon 5-Hour Pass",
    price: "₹499",
    unit: "/ 5 hours",
    tag: "Best Value",
    perks: ["5 hours straight — finish that campaign", "Any day of the week", "Start any time until 7 PM"],
    accent: "from-cyan-600/30 to-emerald-700/20 border-cyan-500/50",
  },
  {
    id: "ultimate",
    icon: Crown,
    name: "Ultimate 24-Hour Pass",
    price: "₹999",
    unit: "/ 24 hours",
    tag: "Streamer's Choice",
    perks: [
      "Play for 24 hours straight on one rig",
      "Start any hour you like — runs into the next day",
      "Live stream your gameplay on YouTube",
    ],
    accent: "from-red-600/30 to-amber-600/20 border-red-500/50",
  },
];

export function ComboPasses() {
  const choose = (id: PlanId, name: string) => {
    setPreferredPlan(id);
    scrollToSection("library");
    toast.success(`${name} selected`, { description: "Now pick any game — the pass is pre-selected on its booking page." });
  };

  return (
    <section id="passes" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-12">
        <SectionHeading
          eyebrow="Combo Passes & Offers"
          eyebrowClass="text-pink-400"
          title="Play Longer, Pay Less"
          sub="Bundle hours into a pass and save on the flagship rigs. Passes work with every game in the library."
        />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {OFFERS.map((o, i) => (
          <Reveal key={o.id} delay={i * 0.08}>
            <div
              className={`relative flex h-full flex-col rounded-3xl border bg-gradient-to-br p-7 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 ${o.accent}`}
              data-testid={`offer-card-${o.id}`}
            >
              {o.tag && (
                <span className="font-heading absolute -top-3 right-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-lg">
                  {o.tag}
                </span>
              )}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white">
                <o.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">{o.name}</h3>
              <div className="my-4">
                <span className="font-heading text-4xl font-black text-cyan-300" data-testid={`offer-price-${o.id}`}>
                  {o.price}
                </span>
                <span className="text-xs text-slate-400"> {o.unit}</span>
              </div>
              <ul className="mb-6 flex-1 space-y-2.5 text-xs text-slate-300">
                {o.perks.map((p) => (
                  <li key={p}>
                    <Check className="mr-2 inline h-4 w-4 text-emerald-400" />
                    {p}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => choose(o.id, o.name)}
                data-testid={`offer-choose-${o.id}`}
                className="font-heading w-full rounded-xl bg-white/10 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
              >
                {o.id === "hourly" ? "Browse Games" : "Use This Pass"}
              </button>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <div
          className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-dashed border-pink-500/50 bg-pink-500/5 px-6 py-4 text-center sm:flex-row sm:text-left"
          data-testid="coupon-banner"
        >
          <p className="text-sm text-slate-200">
            <TicketPercent className="mr-2 inline h-4 w-4 text-pink-400" />
            Use code <span className="font-mono font-bold text-pink-300">{COUPON_HINT}</span> at checkout for{" "}
            <span className="font-bold text-white">₹20 off</span> any session or pass.
          </p>
          <span className="text-[11px] text-slate-500">Applied inside the UPI checkout</span>
        </div>
      </Reveal>
    </section>
  );
}
