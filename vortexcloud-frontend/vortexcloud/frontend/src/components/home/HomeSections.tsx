import { Gamepad2, Clock, QrCode, Send, Cpu, Smartphone, CloudDownload, Zap, IndianRupee, Headset } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { scrollToSection } from "@/lib/sections";
import { GAMES } from "@/lib/games";
import { TELEGRAM_LINK } from "@/lib/upi";

export function StatsStrip() {
  const stats = [
    { value: `${GAMES.length}+`, label: "AAA Titles", color: "text-cyan-400" },
    { value: "24", label: "Hourly Slots / Day", color: "text-purple-400" },
    { value: "₹299", label: "Night Owl 3-Hr Pass", color: "text-emerald-400" },
    { value: "0 GB", label: "Downloads Needed", color: "text-amber-400" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8" data-testid="stats-strip">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="rounded-2xl border border-[#1e263d] bg-[#0f131f]/65 p-5 text-center backdrop-blur-xl">
              <div className={`font-heading text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="mt-1 text-xs text-slate-400">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: Gamepad2,
    title: "Pick a Game",
    text: "Choose from 28+ AAA titles in the cloud library.",
    accent: "border-purple-500/40 bg-purple-500/15 text-purple-300",
  },
  {
    icon: Clock,
    title: "Choose Your Hourly Slot",
    text: "24 hourly slots a day — pick any open one that suits you.",
    accent: "border-cyan-500/40 bg-cyan-500/15 text-cyan-300",
  },
  {
    icon: QrCode,
    title: "Pay via UPI QR",
    text: "Scan the QR with any UPI app and enter your UTR number.",
    accent: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  },
  {
    icon: Send,
    title: "Get Your Stream Key",
    text: "Verified on Telegram — then launch your 4K stream instantly.",
    accent: "border-sky-500/40 bg-sky-500/15 text-sky-300",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-12">
        <SectionHeading
          eyebrow="Simple Process"
          title="How It Works"
          sub="Four easy steps between you and the rig — no downloads, no waiting."
        />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.08}>
            <div
              className="relative overflow-hidden rounded-2xl border border-[#1e263d] bg-[#0f131f]/65 p-6 backdrop-blur-xl"
              data-testid={`how-step-${i + 1}`}
            >
              <span className="font-heading absolute -top-3 -right-1 text-7xl font-black text-white/5">
                {i + 1}
              </span>
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${step.accent}`}>
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading mb-1.5 font-bold text-white">{step.title}</h3>
              <p className="text-xs leading-relaxed text-slate-400">{step.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Cpu,
    title: "High-End GPU Rigs",
    text: "NVIDIA RTX-class machines run every title at ultra settings.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Smartphone,
    title: "Any Device You Own",
    text: "Phone, laptop, tablet or TV — stream in the browser or via Parsec.",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    icon: CloudDownload,
    title: "Zero Downloads",
    text: "No 100 GB installs. Your slot time is play time, immediately.",
    gradient: "from-emerald-500 to-cyan-600",
  },
  {
    icon: Zap,
    title: "Low Latency Streaming",
    text: "WebRTC and Parsec tech keep input lag under control at every frame.",
    gradient: "from-amber-500 to-red-600",
  },
  {
    icon: IndianRupee,
    title: "UPI Payments",
    text: "GPay, PhonePe, Paytm — instant checkout with any UPI app.",
    gradient: "from-sky-500 to-indigo-600",
  },
  {
    icon: Headset,
    title: "Direct Support",
    text: "Any problem? Talk straight to the owner on Telegram.",
    gradient: "from-rose-500 to-purple-600",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-12">
        <SectionHeading eyebrow="Why VortexCloud" eyebrowClass="text-purple-400" title="Powerful Features" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.06}>
            <div
              className="rounded-2xl border border-[#1e263d] bg-[#0f131f]/65 p-6 backdrop-blur-xl transition hover:border-cyan-400/60"
              data-testid={`feature-card-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-white`}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading mb-1.5 font-bold text-white">{f.title}</h3>
              <p className="text-xs leading-relaxed text-slate-400">{f.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <Reveal>
        <div
          className="grad-anim rounded-3xl bg-gradient-to-r from-purple-700 via-pink-600 to-cyan-600 p-8 text-center shadow-[0_0_50px_rgba(157,78,221,0.25)] sm:p-12"
          data-testid="cta-banner"
        >
          <h2 className="font-heading mb-3 text-2xl font-black text-white sm:text-4xl">Ready To Play?</h2>
          <p className="mx-auto mb-6 max-w-xl text-sm text-white/90 sm:text-base">
            Pick your game and slot, pay via UPI, and your cloud rig is waiting.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollToSection("library")}
              data-testid="cta-browse-games-btn"
              className="font-heading rounded-xl bg-white px-7 py-3.5 text-sm font-extrabold text-black transition hover:bg-slate-200"
            >
              <Gamepad2 className="mr-2 inline h-4 w-4" /> Browse Games
            </button>
            <a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noopener"
              data-testid="cta-telegram-btn"
              className="font-heading rounded-xl border border-white/40 bg-black/30 px-7 py-3.5 text-sm font-extrabold text-white transition hover:bg-black/50"
            >
              <Send className="mr-2 inline h-4 w-4" /> Talk On Telegram
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
