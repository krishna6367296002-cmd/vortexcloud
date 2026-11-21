import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Ban, Check, CheckCheck, Clock, Copy, IndianRupee, Loader2, Lock, LogOut, Search, ShieldCheck, Ticket, X } from "lucide-react";
import { apiPatch, apiPost, apiPut } from "@/lib/api";
import { errorMessage, qk, useAdminBookings, useAdminMe, useAdminSlots } from "@/lib/queries";
import { STATUS_META } from "@/lib/status";
import { copyText } from "@/lib/clipboard";
import { GAMES } from "@/lib/games";
import type { AdminMe, Booking, BookingStatus, SlotsResponse, SlotState } from "@/lib/types";
import { OwnerQueue } from "@/components/admin/OwnerQueue";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Rejected" },
];
const STATUS_LABELS: Record<string, string> = Object.fromEntries(STATUS_FILTERS.map((s) => [s.value, s.label]));
const GAME_LABELS: Record<string, string> = Object.fromEntries(GAMES.map((g) => [g.id, g.title]));

function LoginGate() {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);

  const login = useMutation({
    mutationFn: (pw: string) => apiPost<AdminMe>("/admin/login", { password: pw }),
    onSuccess: () => {
      toast.success("Welcome back, owner");
      void queryClient.invalidateQueries({ queryKey: qk.adminMe });
    },
    onError: (err) => {
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
      toast.error("Login failed", { description: errorMessage(err, "Wrong password") });
    },
  });

  const submit = () => {
    if (password) login.mutate(password);
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-20 sm:py-24">
      <motion.div
        animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-[#1e263d] bg-[#0f131f]/80 p-8 text-center backdrop-blur-xl"
        data-testid="admin-login-gate"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-500/15 text-purple-300">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="font-heading text-xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-xs text-slate-400">Owner-only area. Enter your password to continue.</p>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Password"
          data-testid="admin-password-input"
          className="mt-6 border-[#242e49] bg-black/60 py-2.5 text-center text-white placeholder:text-slate-600"
        />
        <Button
          onClick={submit}
          disabled={!password || login.isPending}
          data-testid="admin-login-btn"
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 py-3 font-heading font-extrabold text-white transition-[filter] hover:brightness-110"
        >
          {login.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Unlock Dashboard
        </Button>
        <Link to="/" data-testid="admin-gate-back-link" className="mt-4 block text-[11px] text-slate-500 transition-colors hover:text-cyan-400">
          Back to site
        </Link>
      </motion.div>
    </div>
  );
}

function BookingsPanel() {
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useAdminBookings(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const update = useMutation({
    mutationFn: ({ id, next }: { id: string; next: BookingStatus }) => apiPatch<Booking>(`/admin/bookings/${id}`, { status: next }),
    onSuccess: (b) => {
      const verb = b.status === "confirmed" ? "confirmed" : b.status === "cancelled" ? "rejected" : `marked ${b.status}`;
      toast.success(`Booking ${b.code} ${verb}`, { description: `${b.gamer_tag} · ${b.game_title}` });
      void queryClient.invalidateQueries({ queryKey: qk.adminBookings });
      void queryClient.invalidateQueries({ queryKey: ["admin", "slots"] });
    },
    onError: (err) => toast.error("Update failed", { description: errorMessage(err) }),
  });

  const bookings = isError ? [] : (data ?? []);
  const q = query.trim().toLowerCase();
  const filtered = bookings
    .filter((b) => status === "all" || b.status === status)
    .filter((b) => !q || `${b.utr} ${b.gamer_tag} ${b.game_title} ${b.code}`.toLowerCase().includes(q));

  const count = (s: BookingStatus) => bookings.filter((b) => b.status === s).length;
  const sum = (s: BookingStatus[]) => bookings.filter((b) => s.includes(b.status)).reduce((acc, b) => acc + b.amount, 0);
  const stats = [
    { label: "Total", value: String(bookings.length), color: "text-white", icon: Ticket, testid: "admin-stat-total" },
    { label: "Pending", value: String(count("pending")), color: "text-amber-300", icon: Clock, testid: "admin-stat-pending" },
    { label: "Confirmed", value: String(count("confirmed")), color: "text-cyan-300", icon: Check, testid: "admin-stat-confirmed" },
    { label: "Pending ₹", value: `₹${sum(["pending"]).toLocaleString("en-IN")}`, color: "text-amber-300", icon: IndianRupee, testid: "admin-stat-pending-amount" },
    { label: "Collected ₹", value: `₹${sum(["confirmed", "completed"]).toLocaleString("en-IN")}`, color: "text-emerald-300", icon: IndianRupee, testid: "admin-stat-collected" },
  ];

  const copyUtr = async (b: Booking) => {
    const ok = await copyText(b.utr);
    if (ok) toast.success("UTR copied", { description: b.utr });
  };

  // Alert the owner when a new pending booking arrives while this page is open.
  const pendingIds = bookings.filter((b) => b.status === "pending").map((b) => b.id);
  const pendingKey = pendingIds.join(",");
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!data) return;
    const fresh = data.filter((b) => b.status === "pending");
    if (seen.current) {
      fresh
        .filter((b) => !seen.current?.has(b.id))
        .forEach((b) =>
          toast.info(`New booking from ${b.gamer_tag}`, {
            description: `${b.game_title} · ₹${b.amount} · UTR ${b.utr}`,
            duration: 10_000,
          }),
        );
    }
    seen.current = new Set(fresh.map((b) => b.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingKey]);

  useEffect(() => {
    const base = "Admin — VortexCloud Gaming";
    document.title = pendingIds.length ? `(${pendingIds.length}) New booking — VortexCloud` : base;
    return () => {
      document.title = "VortexCloud Gaming — Rent RTX Cloud Rigs by the Hour";
    };
  }, [pendingIds.length]);

  return (
    <div>
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#1e263d] bg-[#0f131f]/65 p-4 backdrop-blur-xl" data-testid={s.testid}>
            <div className="mb-2 flex items-center gap-1.5 text-[10px] tracking-wider text-slate-400 uppercase">
              <s.icon className="h-3.5 w-3.5" /> {s.label}
            </div>
            <div className={`font-heading text-2xl font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {!isPending && (
        <OwnerQueue
          bookings={bookings}
          busy={update.isPending}
          onUpdate={(id, next) => update.mutate({ id, next })}
        />
      )}

      <h2 className="font-heading mb-3 text-lg font-bold text-white">All Bookings</h2>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by UTR, name, game or booking code…"
            data-testid="admin-search-input"
            className="rounded-xl border-[#1e263d] bg-[#0f131f] py-2.5 pl-11 text-sm text-white placeholder:text-slate-500"
          />
        </div>
        <Select value={status} onValueChange={(v: string) => setStatus(v)}>
          <SelectTrigger className="w-full rounded-xl border-[#1e263d] bg-[#0f131f] sm:w-48" data-testid="admin-status-filter">
            <SelectValue>{(v: string) => STATUS_LABELS[v] ?? "All statuses"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 md:hidden" data-testid="admin-bookings-mobile-list">
        {filtered.map((b) => (
          <div key={b.id} className="rounded-2xl border border-[#1e263d] bg-[#0f131f]/70 p-4" data-testid={`admin-mobile-row-${b.id}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-white">{b.gamer_tag}</span>
              <Badge className={`border ${STATUS_META[b.status].className}`}>{STATUS_META[b.status].label}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-300">{b.game_title}</p>
            <p className="text-xs text-slate-400">
              {b.slot_label} · {b.date} · ₹{b.amount}
            </p>
            <button type="button" onClick={() => copyUtr(b)} className="mt-1 font-mono text-xs text-cyan-300">
              UTR {b.utr} <Copy className="inline h-3 w-3" />
            </button>
            {b.status === "confirmed" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => update.mutate({ id: b.id, next: "completed" })}
                disabled={update.isPending}
                data-testid={`admin-mobile-complete-${b.id}`}
                className="mt-2 w-full rounded-lg"
              >
                <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark Done
              </Button>
            )}
          </div>
        ))}
        {!isPending && filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-400">No bookings match this view yet.</div>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-[#1e263d] bg-[#0f131f]/70 md:block" data-testid="admin-bookings-table">
        {isPending ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading bookings…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400" data-testid="admin-empty-state">
            {isError ? "Bookings could not be loaded." : "No bookings match this view yet."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e263d] hover:bg-transparent">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Game</TableHead>
                <TableHead className="text-slate-400">Slot</TableHead>
                <TableHead className="text-slate-400">UTR</TableHead>
                <TableHead className="text-slate-400">Amount</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-right text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => {
                const meta = STATUS_META[b.status];
                return (
                  <TableRow key={b.id} className="border-[#1e263d]" data-testid={`admin-booking-row-${b.id}`}>
                    <TableCell>
                      <div className="font-semibold text-white" data-testid={`admin-name-${b.id}`}>{b.gamer_tag}</div>
                      <div className="font-mono text-[10px] text-slate-500">{b.code}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-200">{b.game_title}</div>
                      <div className="text-[10px] text-purple-300">{b.plan_label}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-200">{b.slot_label}</div>
                      <div className="text-[10px] text-slate-500">{b.date}</div>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => copyUtr(b)}
                        data-testid={`admin-utr-${b.id}`}
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-cyan-300 transition-colors hover:text-cyan-200"
                      >
                        {b.utr} <Copy className="h-3 w-3" />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-white">₹{b.amount}</div>
                      {b.discount > 0 && <div className="text-[10px] text-emerald-400">{b.coupon_code} −₹{b.discount}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge className={`border ${meta.className}`} data-testid={`admin-status-${b.id}`}>
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {b.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => update.mutate({ id: b.id, next: "confirmed" })}
                              disabled={update.isPending}
                              data-testid={`admin-confirm-${b.id}`}
                              className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 font-bold text-black"
                            >
                              <Check className="mr-1 h-3.5 w-3.5" /> Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => update.mutate({ id: b.id, next: "cancelled" })}
                              disabled={update.isPending}
                              data-testid={`admin-reject-${b.id}`}
                              className="rounded-lg"
                            >
                              <X className="mr-1 h-3.5 w-3.5" /> Reject
                            </Button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => update.mutate({ id: b.id, next: "completed" })}
                            disabled={update.isPending}
                            data-testid={`admin-complete-${b.id}`}
                            className="rounded-lg"
                          >
                            <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark Done
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

const SLOT_STYLE: Record<SlotState, string> = {
  open: "border-emerald-500/50 bg-emerald-950/30 text-emerald-300 hover:border-emerald-400",
  full: "border-red-500/50 bg-red-950/30 text-red-300 hover:border-red-400",
  booked: "cursor-not-allowed border-purple-500/40 bg-purple-950/30 text-purple-300",
  passed: "cursor-not-allowed border-slate-800 bg-slate-900/50 text-slate-500 opacity-60",
};

function SlotsPanel() {
  const queryClient = useQueryClient();
  const [gameId, setGameId] = useState(GAMES[0].id);
  const { data, isPending, isError } = useAdminSlots(gameId, true);

  const toggle = useMutation({
    mutationFn: ({ hour, state }: { hour: number; state: "open" | "full" }) =>
      apiPut<SlotsResponse>(`/admin/slots/${gameId}/${hour}`, { state }),
    onSuccess: (res, vars) => {
      queryClient.setQueryData(qk.adminSlots(gameId), res);
      void queryClient.invalidateQueries({ queryKey: qk.slots(gameId) });
      toast.success(`Slot ${res.slots[vars.hour].label} is now ${vars.state.toUpperCase()}`);
    },
    onError: (err) => toast.error("Could not change slot", { description: errorMessage(err) }),
  });

  const slots = isError ? [] : (data?.slots ?? []);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-white">Slot Control — Today</h2>
          <p className="text-xs text-slate-400">
            Tap an hour to switch it between OPEN and FULL. Hours booked by gamers are locked.
            {data ? ` IST date ${data.date}.` : ""}
          </p>
        </div>
        <Select value={gameId} onValueChange={(v: string) => setGameId(v)}>
          <SelectTrigger className="w-full rounded-xl border-[#1e263d] bg-[#0f131f] sm:w-72" data-testid="admin-slot-game-select">
            <SelectValue>{(v: string) => GAME_LABELS[v] ?? v}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {GAMES.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading slots…
        </div>
      ) : isError ? (
        <div className="py-16 text-center text-sm text-slate-400">Slots could not be loaded.</div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-6" data-testid="admin-slot-grid">
          {slots.map((s) => {
            const editable = s.state === "open" || s.state === "full";
            return (
              <button
                key={s.hour}
                type="button"
                disabled={!editable || toggle.isPending}
                onClick={() => toggle.mutate({ hour: s.hour, state: s.state === "open" ? "full" : "open" })}
                data-testid={`admin-slot-${s.hour}`}
                className={`rounded-xl border p-3 text-left transition-[border-color,transform] duration-150 active:scale-[0.97] ${SLOT_STYLE[s.state]}`}
              >
                <div className="font-mono text-xs font-bold text-white">{s.label.split(" - ")[0]}</div>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                  {s.state === "full" ? <Ban className="h-3 w-3" /> : null}
                  {s.state === "booked" ? "Booked" : s.state}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const me = useAdminMe();

  const logout = useMutation({
    mutationFn: () => apiPost<AdminMe>("/admin/logout"),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["admin"] });
      void queryClient.invalidateQueries({ queryKey: qk.adminMe });
      toast.info("Logged out of admin");
    },
  });

  if (me.isPending) {
    return (
      <div className="flex items-center justify-center gap-2 py-32 text-sm text-slate-400" data-testid="admin-loading">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking access…
      </div>
    );
  }

  if (me.isError || !me.data?.authenticated) return <LoginGate />;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-24 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/40 bg-purple-500/15 text-purple-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-white" data-testid="admin-dashboard-title">
              Admin Dashboard
            </h1>
            <p className="text-xs text-slate-400">Every booking, UTR and slot — live from the server.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            data-testid="admin-back-to-site-link"
            className="inline-flex items-center gap-2 rounded-xl border border-[#1e263d] bg-[#0f131f] px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:text-cyan-400"
          >
            <ArrowLeft className="h-4 w-4" /> Site
          </Link>
          <Button
            variant="outline"
            onClick={() => logout.mutate()}
            data-testid="admin-logout-btn"
            className="rounded-xl border-[#1e263d] bg-[#0f131f] text-slate-200 hover:bg-slate-800"
          >
            <LogOut className="mr-1.5 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList className="mb-6 rounded-xl bg-[#0f131f]" data-testid="admin-tabs">
          <TabsTrigger value="bookings" className="rounded-lg" data-testid="admin-tab-bookings">
            Bookings
          </TabsTrigger>
          <TabsTrigger value="slots" className="rounded-lg" data-testid="admin-tab-slots">
            Slot Control
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bookings">
          <BookingsPanel />
        </TabsContent>
        <TabsContent value="slots">
          <SlotsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
