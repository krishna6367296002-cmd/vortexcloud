import { useSyncExternalStore } from "react";
import type { Booking } from "@/lib/types";

// Bookings live on the server. This browser only remembers WHICH bookings are
// "mine" (their ids) plus the last gamer tag, so My Bookings works without login.

const IDS_KEY = "vx_my_booking_ids_v2";
const TAG_KEY = "vx_gamer_tag";

function loadIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(IDS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

let ids: string[] = loadIds();
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useMyBookingIds(): string[] {
  return useSyncExternalStore(subscribe, () => ids, () => ids);
}

export function addMyBookingId(id: string): void {
  if (ids.includes(id)) return;
  ids = [id, ...ids].slice(0, 50);
  try {
    localStorage.setItem(IDS_KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable — keep in memory
  }
  listeners.forEach((l) => l());
}

export function getGamerTag(): string {
  try {
    return localStorage.getItem(TAG_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setGamerTag(tag: string): void {
  try {
    localStorage.setItem(TAG_KEY, tag);
  } catch {
    // ignore
  }
}

// Remaining session ms for a confirmed booking whose stream has started.
export function remainingMs(booking: Booking, now: number): number | null {
  if (!booking.session_started_at || booking.status !== "confirmed") return null;
  const startedAt = Date.parse(booking.session_started_at);
  if (Number.isNaN(startedAt)) return null;
  return startedAt + booking.hours * 60 * 60 * 1000 - now;
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const mmss = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return hrs > 0 ? `${hrs}:${mmss}` : mmss;
}
