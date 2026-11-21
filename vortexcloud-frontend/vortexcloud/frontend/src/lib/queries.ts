import { useQuery } from "@tanstack/react-query";
import { ApiError, apiGet, apiPost } from "@/lib/api";
import { useMyBookingIds } from "@/lib/store";
import type { AdminMe, Booking, RecentBooking, SlotsResponse } from "@/lib/types";

export const qk = {
  slots: (gameId: string) => ["slots", gameId] as const,
  myBookings: ["my-bookings"] as const,
  booking: (id: string) => ["booking", id] as const,
  recent: ["recent-bookings"] as const,
  adminMe: ["admin", "me"] as const,
  adminBookings: ["admin", "bookings"] as const,
  adminSlots: (gameId: string) => ["admin", "slots", gameId] as const,
};

export function useSlots(gameId: string | undefined) {
  return useQuery({
    queryKey: qk.slots(gameId ?? ""),
    queryFn: () => apiGet<SlotsResponse>(`/slots/${gameId}`),
    enabled: Boolean(gameId),
    refetchInterval: 30_000,
  });
}

export function useMyBookings() {
  const ids = useMyBookingIds();
  const query = useQuery({
    queryKey: [...qk.myBookings, ids.join(",")],
    queryFn: () => apiPost<Booking[]>("/bookings/lookup", { ids }),
    enabled: ids.length > 0,
    refetchInterval: 10_000,
  });
  return { ...query, hasIds: ids.length > 0 };
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: qk.booking(id ?? ""),
    queryFn: () => apiGet<Booking>(`/bookings/${id}`),
    enabled: Boolean(id),
    refetchInterval: 10_000,
    retry: (count, err) => !(err instanceof ApiError && err.status === 404) && count < 2,
  });
}

export function useRecentBookings() {
  return useQuery({
    queryKey: qk.recent,
    queryFn: () => apiGet<RecentBooking[]>("/recent-bookings"),
    refetchInterval: 30_000,
  });
}

export function useAdminMe() {
  return useQuery({
    queryKey: qk.adminMe,
    queryFn: () => apiGet<AdminMe>("/admin/me"),
  });
}

export function useAdminBookings(enabled: boolean) {
  return useQuery({
    queryKey: qk.adminBookings,
    queryFn: () => apiGet<Booking[]>("/admin/bookings"),
    enabled,
    refetchInterval: 15_000,
  });
}

export function useAdminSlots(gameId: string, enabled: boolean) {
  return useQuery({
    queryKey: qk.adminSlots(gameId),
    queryFn: () => apiGet<SlotsResponse>(`/admin/slots/${gameId}`),
    enabled,
  });
}

// Human-readable message from an ApiError body ({detail: string | [{msg}]}).
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof ApiError) {
    const body = err.body as { detail?: unknown } | null;
    const detail = body?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
  }
  return fallback;
}
