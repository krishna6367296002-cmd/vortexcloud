import { Ban, CheckCircle2, Lock } from "lucide-react";
import type { Slot } from "@/lib/types";
import { canStartAt, type Plan } from "@/lib/plans";

interface SlotBookingMatrixProps {
  slots: Slot[];
  plan: Plan;
  price: number;
  selectedStart: number | null;
  onSelect: (hour: number) => void;
}

// 24-hour slot matrix. Customers see booked + owner-blocked hours as FULL.
export function SlotBookingMatrix({ slots, plan, price, selectedStart, onSelect }: SlotBookingMatrixProps) {
  const covered = new Set<number>(
    selectedStart === null ? [] : Array.from({ length: plan.hours }, (_, i) => selectedStart + i),
  );

  return (
    <div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {slots.map((slot) => {
          const aria = `Hour ${slot.hour}:00, Status: ${slot.state}, Price: ₹${price}`;
          const isCovered = covered.has(slot.hour);

          if (slot.state === "open") {
            const startable = canStartAt(plan, slots, slot.hour);
            if (!startable && !isCovered) {
              return (
                <button
                  key={slot.hour}
                  type="button"
                  disabled
                  aria-label={aria}
                  data-testid={`slot-hour-${slot.hour}`}
                  className="flex cursor-not-allowed items-center justify-between gap-2 rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-3.5 text-left opacity-55"
                >
                  <div>
                    <div className="font-mono text-xs font-semibold text-slate-300 sm:text-sm">{slot.label}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      <Lock className="mr-1 inline h-3 w-3" /> Outside pass window
                    </div>
                  </div>
                  <span className="rounded border border-emerald-700/40 px-2 py-0.5 font-heading text-[10px] font-bold text-emerald-600 uppercase">
                    Open
                  </span>
                </button>
              );
            }
            return (
              <button
                key={slot.hour}
                type="button"
                onClick={() => startable && onSelect(slot.hour)}
                aria-label={aria}
                data-testid={`slot-hour-${slot.hour}`}
                className={`flex items-center justify-between gap-2 rounded-xl p-3.5 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 active:scale-[0.98] ${
                  isCovered
                    ? "border-2 border-cyan-400 bg-cyan-400/20 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                    : "border border-emerald-500/50 bg-emerald-950/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:border-emerald-400 hover:bg-emerald-900/40"
                }`}
              >
                <div>
                  <div className="font-mono text-xs font-bold text-white sm:text-sm">{slot.label}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-emerald-400">
                    <CheckCircle2 className="mr-1 inline h-3 w-3" />
                    {isCovered
                      ? slot.hour === selectedStart
                        ? plan.hours > 1
                          ? `Pass starts here`
                          : "Selected Slot"
                        : "Included in pass"
                      : plan.hours > 1
                        ? `Start ${plan.hours}-hr pass`
                        : "Click to Book"}
                  </div>
                </div>
                <span className="rounded border border-emerald-400/50 bg-emerald-500/20 px-2 py-0.5 font-heading text-[10px] font-bold text-emerald-300 uppercase">
                  Open
                </span>
              </button>
            );
          }

          if (slot.state === "full" || slot.state === "booked") {
            return (
              <button
                key={slot.hour}
                type="button"
                disabled
                aria-label={aria}
                data-testid={`slot-hour-${slot.hour}`}
                className="flex cursor-not-allowed items-center justify-between gap-2 rounded-xl border border-red-900/40 bg-slate-950/70 p-3.5 text-left opacity-65"
              >
                <div>
                  <div className="font-mono text-xs font-semibold text-slate-400 sm:text-sm">{slot.label}</div>
                  <div className="mt-0.5 text-[11px] text-red-400/90">
                    <Ban className="mr-1 inline h-3 w-3" /> Rig Occupied
                  </div>
                </div>
                <span className="rounded border border-red-500/30 bg-red-500/15 px-2 py-0.5 font-heading text-[10px] font-bold text-red-400 uppercase">
                  Full
                </span>
              </button>
            );
          }

          return (
            <button
              key={slot.hour}
              type="button"
              disabled
              aria-label={aria}
              data-testid={`slot-hour-${slot.hour}`}
              className="flex cursor-not-allowed items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 text-left opacity-50"
            >
              <div>
                <div className="font-mono text-xs font-semibold text-slate-500 sm:text-sm">{slot.label}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">Hour already passed</div>
              </div>
              <span className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 font-heading text-[10px] font-bold text-slate-500 uppercase">
                Passed
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-[#1e263d] bg-black/50 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="font-bold text-emerald-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-cyan-400" />
          <span className="font-medium text-slate-300">Your selection</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="font-medium text-slate-400">Booked / Full</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-slate-700" />
          <span className="font-medium text-slate-400">Passed</span>
        </div>
      </div>
    </div>
  );
}
