import type { BookingStatus } from "@/lib/types";

// Shared status badge metadata (user pages + owner console).
export const STATUS_META: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: "PENDING", className: "border-amber-500/50 bg-amber-500/15 text-amber-300" },
  confirmed: { label: "CONFIRMED", className: "border-cyan-500/50 bg-cyan-500/15 text-cyan-300" },
  completed: { label: "COMPLETED", className: "border-slate-500/50 bg-slate-500/15 text-slate-300" },
  cancelled: { label: "CANCELLED", className: "border-red-500/50 bg-red-500/15 text-red-300" },
};
