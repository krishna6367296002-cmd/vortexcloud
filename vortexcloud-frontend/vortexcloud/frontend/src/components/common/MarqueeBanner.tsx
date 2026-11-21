const ITEMS = [
  { label: "RTX 4090 Ultra Rigs", color: "text-cyan-400" },
  { label: "DLSS 3.5", color: "text-purple-400" },
  { label: "4K 120 FPS", color: "text-pink-400" },
  { label: "Ray Tracing", color: "text-amber-400" },
  { label: "Zero Downloads", color: "text-emerald-400" },
  { label: "Play On Any Device", color: "text-cyan-400" },
  { label: "Sub-15ms India Latency", color: "text-purple-400" },
  { label: "UPI Instant Pay", color: "text-pink-400" },
  { label: "28+ AAA Titles", color: "text-emerald-400" },
];

// Infinite horizontal tech ribbon (content duplicated once for a seamless loop).
export function MarqueeBanner() {
  const row = (keyPrefix: string) => (
    <div key={keyPrefix} className="flex items-center">
      {ITEMS.map((item, i) => (
        <span key={`${keyPrefix}-${i}`} className="flex items-center">
          <span className="px-8 font-heading text-xs font-bold tracking-[0.2em] text-slate-500 uppercase sm:text-sm">
            {item.label}
          </span>
          <span className={item.color}>&#9670;</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden border-y border-[#1e263d] bg-black/30 py-3" data-testid="marquee-banner">
      <div className="animate-marquee flex w-max">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
