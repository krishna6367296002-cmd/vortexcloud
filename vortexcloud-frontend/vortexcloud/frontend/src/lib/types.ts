// Types mirroring the FastAPI backend's Pydantic models.
// NOTE: reconstructed from how the frontend uses them (the original file was type-only,
// so it never reached the browser). Adjust if your backend differs.

export type PlanId = "hourly" | "night_owl" | "marathon" | "ultimate";
export type SlotState = "open" | "full" | "booked" | "passed";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Slot {
  hour: number;
  label: string;
  state: SlotState;
}

export interface SlotsResponse {
  game_id: string;
  date: string;
  now_hour: number;
  slots: Slot[];
}

export interface Booking {
  id: string;
  code: string;
  game_id: string;
  game_title: string;
  rig: string;
  plan: PlanId;
  plan_label: string;
  hours: number;
  start_hour: number;
  slot_label: string;
  date: string;
  gamer_tag: string;
  utr: string;
  base_amount: number;
  amount: number;
  discount: number;
  coupon_code: string | null;
  status: BookingStatus;
  access_code: string;
  stream_url: string;
  session_started_at: string | null;
  created_at: string;
}

export interface BookingCreate {
  game_id: string;
  plan: PlanId;
  start_hour: number;
  gamer_tag: string;
  utr: string;
  coupon_code: string | null;
}

export interface RecentBooking {
  id: string;
  masked_name: string;
  game_id: string;
  game_title: string;
  plan_label: string;
  created_at: string;
}

export interface CouponResult {
  valid: boolean;
  code: string;
  discount: number;
  message: string;
}

export interface AdminMe {
  authenticated: boolean;
}

export interface PingResponse {
  ok?: boolean;
  [key: string]: unknown;
}
