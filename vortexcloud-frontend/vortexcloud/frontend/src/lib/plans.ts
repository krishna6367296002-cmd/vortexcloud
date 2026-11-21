import type { PlanId, Slot } from "@/lib/types";
import { formatHour12 } from "@/lib/games";

// Mirrors PLANS in backend/lib/catalog.py (the server re-validates every booking).
export interface Plan {
  id: PlanId;
  label: string;
  short: string;
  hours: number;
  price: number | null; // null = the game's hourly price
  startHours: number[];
  overnight: boolean; // may run past midnight into the next day
  window: string;
  perk?: string;
}

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);

export const PLANS: Plan[] = [
  {
    id: "hourly",
    label: "1-Hour Session",
    short: "1 Hour",
    hours: 1,
    price: null,
    startHours: ALL_HOURS,
    overnight: false,
    window: "Any open hour, every day",
  },
  {
    id: "night_owl",
    label: "Night Owl 3-Hour Pass",
    short: "Night Owl · 3 Hrs",
    hours: 3,
    price: 299,
    startHours: [20, 21],
    overnight: false,
    window: "Start at 8 PM or 9 PM, every night",
  },
  {
    id: "marathon",
    label: "Marathon 5-Hour Pass",
    short: "Marathon · 5 Hrs",
    hours: 5,
    price: 499,
    startHours: Array.from({ length: 20 }, (_, i) => i),
    overnight: false,
    window: "Any day, start any time until 7 PM",
  },
  {
    id: "ultimate",
    label: "Ultimate 24-Hour Pass",
    short: "Ultimate · 24 Hrs",
    hours: 24,
    price: 999,
    startHours: ALL_HOURS,
    overnight: true,
    window: "Start any hour — play 24 hours straight",
    perk: "Live stream on YouTube allowed",
  },
];

export const COUPON_HINT = "VORTEX20";

export function getPlan(id: string | null | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function planPrice(plan: Plan, gamePrice: number): number {
  return plan.price ?? gamePrice;
}

export function planRangeLabel(plan: Plan, start: number): string {
  const end = start + plan.hours;
  return `${formatHour12(start)} - ${formatHour12(end)}${end > 24 ? " (next day)" : ""}`;
}

// A start hour is valid when the plan allows it and every covered hour today is open.
export function canStartAt(plan: Plan, slots: Slot[], hour: number): boolean {
  if (!plan.startHours.includes(hour)) return false;
  if (!plan.overnight && hour + plan.hours > 24) return false;
  return slots.slice(hour, Math.min(24, hour + plan.hours)).every((s) => s.state === "open");
}

const PREF_KEY = "vx_pref_plan";

export function setPreferredPlan(id: PlanId): void {
  try {
    sessionStorage.setItem(PREF_KEY, id);
  } catch {
    // ignore
  }
}

export function getPreferredPlan(): PlanId | null {
  try {
    const v = sessionStorage.getItem(PREF_KEY);
    return PLANS.some((p) => p.id === v) ? (v as PlanId) : null;
  } catch {
    return null;
  }
}
