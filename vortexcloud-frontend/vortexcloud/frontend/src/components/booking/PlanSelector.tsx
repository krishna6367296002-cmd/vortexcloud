import { Clock, Crown, Moon, Timer, Youtube } from "lucide-react";
import { PLANS, planPrice, type Plan } from "@/lib/plans";
import type { PlanId } from "@/lib/types";

const ICONS: Record<PlanId, typeof Clock> = { hourly: Clock, night_owl: Moon, marathon: Timer, ultimate: Crown };

interface PlanSelectorProps {
  value: PlanId;
  gamePrice: number;
  onChange: (plan: Plan) => void;
}

export function PlanSelector({ value, gamePrice, onChange }: PlanSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="plan-selector">
      {PLANS.map((plan) => {
        const Icon = ICONS[plan.id];
        const active = plan.id === value;
        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onChange(plan)}
            data-testid={`plan-option-${plan.id}`}
            className={`rounded-2xl border p-4 text-left transition-[background-color,border-color,box-shadow] duration-200 ${
              active
                ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                : "border-[#1e263d] bg-black/40 hover:border-cyan-400/50"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`flex items-center gap-2 text-sm font-bold ${active ? "text-cyan-300" : "text-white"}`}>
                <Icon className="h-4 w-4 shrink-0" /> {plan.short}
              </span>
              <span className="font-heading text-lg font-black text-cyan-400">₹{planPrice(plan, gamePrice)}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{plan.window}</p>
            {plan.perk && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-400">
                <Youtube className="h-3.5 w-3.5" /> {plan.perk}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
