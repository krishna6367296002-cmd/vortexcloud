interface SectionHeadingProps {
  eyebrow: string;
  eyebrowClass?: string;
  title: string;
  sub?: string;
  align?: "left" | "center";
}

export function SectionHeading({ eyebrow, eyebrowClass, title, sub, align = "center" }: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <span
        className={`font-heading text-xs font-bold tracking-[0.2em] uppercase ${eyebrowClass ?? "text-cyan-400"}`}
      >
        {eyebrow}
      </span>
      <h2 className="font-heading mt-2 text-2xl font-bold text-white sm:text-4xl">{title}</h2>
      {sub ? (
        <p className={`mt-3 text-sm text-slate-400 ${align === "center" ? "mx-auto max-w-xl" : "max-w-xl"}`}>{sub}</p>
      ) : null}
    </div>
  );
}
