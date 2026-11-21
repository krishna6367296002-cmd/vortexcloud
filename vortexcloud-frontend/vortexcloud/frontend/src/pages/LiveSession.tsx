import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Copy, Gamepad2, Hourglass, KeyRound, Loader2, Maximize, Power, Send, Signal, Volume2 } from "lucide-react";
import { getGame, GAMES } from "@/lib/games";
import { copyText } from "@/lib/clipboard";
import { apiPost } from "@/lib/api";
import { formatRemaining, remainingMs } from "@/lib/store";
import { errorMessage, qk, useBooking } from "@/lib/queries";
import type { Booking } from "@/lib/types";
import { TELEGRAM_LINK } from "@/lib/upi";

const QUALITIES = ["4K HDR", "1440p60", "1080p60"];

function StateCard({
  testid,
  icon,
  title,
  text,
  children,
}: {
  testid: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center" data-testid={testid}>
      {icon}
      <h1 className="font-heading text-2xl font-bold text-white">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{text}</p>
      <div className="mt-6 flex items-center justify-center gap-3">{children}</div>
    </div>
  );
}

export default function LiveSession() {
  const { bookingId } = useParams();
  const { data: booking, isPending, isError } = useBooking(bookingId);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(Date.now());
  const [fps, setFps] = useState(120);
  const [ping, setPing] = useState(14);
  const [quality, setQuality] = useState("4K HDR");
  const [volume, setVolume] = useState(80);
  const [fullscreen, setFullscreen] = useState(false);
  const [expiredOpen, setExpiredOpen] = useState(false);
  const startRequested = useRef(false);
  const expiryHandled = useRef(false);

  const setCached = (b: Booking) => {
    queryClient.setQueryData(qk.booking(b.id), b);
    void queryClient.invalidateQueries({ queryKey: qk.myBookings });
  };

  const startMutation = useMutation({
    mutationFn: (id: string) => apiPost<Booking>(`/bookings/${id}/start`),
    onSuccess: setCached,
    onError: (err) => toast.error("Could not start the session", { description: errorMessage(err) }),
  });

  const endMutation = useMutation({
    mutationFn: (id: string) => apiPost<Booking>(`/bookings/${id}/end`),
    onSuccess: setCached,
  });

  // Start the session clock the first time a confirmed stream is opened (idempotent server-side).
  useEffect(() => {
    if (booking && booking.status === "confirmed" && !booking.session_started_at && !startRequested.current) {
      startRequested.current = true;
      startMutation.mutate(booking.id);
    }
  }, [booking, startMutation]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const rig = booking?.rig;
  useEffect(() => {
    if (!rig) return;
    const base = rig === "RTX 4090 Ultra" ? 118 : 58;
    const t = window.setInterval(() => {
      setFps(base + Math.floor(Math.random() * 3));
      setPing(11 + Math.floor(Math.random() * 4));
    }, 1500);
    return () => window.clearInterval(t);
  }, [rig]);

  const rem = booking ? remainingMs(booking, now) : null;

  useEffect(() => {
    if (booking && rem !== null && rem <= 0 && !expiryHandled.current) {
      expiryHandled.current = true;
      endMutation.mutate(booking.id);
      setExpiredOpen(true);
    }
  }, [rem, booking, endMutation]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-2 py-32 text-sm text-slate-400" data-testid="session-loading">
        <Loader2 className="h-4 w-4 animate-spin" /> Connecting to your rig…
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <StateCard
        testid="session-not-found"
        icon={<Gamepad2 className="mx-auto mb-4 h-12 w-12 text-slate-600" />}
        title="Session not found"
        text="This stream session could not be loaded. Check My Bookings for your sessions."
      >
        <Link to="/bookings" className={buttonVariants() + " rounded-xl"} data-testid="session-not-found-bookings-btn">
          My Bookings
        </Link>
      </StateCard>
    );
  }

  if (booking.status === "pending") {
    return (
      <StateCard
        testid="session-pending-state"
        icon={<Clock className="mx-auto mb-4 h-12 w-12 text-amber-400" />}
        title="Awaiting owner confirmation"
        text={`Your UTR for ${booking.game_title} is received. The stream unlocks the moment the owner confirms your payment.`}
      >
        <Link to="/bookings" className={buttonVariants() + " rounded-xl"} data-testid="pending-bookings-btn">
          My Bookings
        </Link>
      </StateCard>
    );
  }

  if (booking.status === "cancelled") {
    return (
      <StateCard
        testid="session-cancelled-state"
        icon={<Hourglass className="mx-auto mb-4 h-12 w-12 text-red-400" />}
        title="Booking cancelled"
        text={`The owner could not verify this payment, so booking ${booking.code} was rejected. Contact support on Telegram if you think this is a mistake.`}
      >
        <Link to={`/game/${booking.game_id}`} className={buttonVariants() + " rounded-xl"} data-testid="cancelled-rebook-btn">
          Book Again
        </Link>
      </StateCard>
    );
  }

  if (booking.status === "completed" && !expiredOpen) {
    return (
      <StateCard
        testid="session-completed-state"
        icon={<Hourglass className="mx-auto mb-4 h-12 w-12 text-amber-400" />}
        title="Session completed"
        text={`Your ${booking.plan_label} for ${booking.game_title} has ended.`}
      >
        <Link to="/bookings" className={buttonVariants() + " rounded-xl"} data-testid="completed-bookings-btn">
          My Bookings
        </Link>
        <Link to="/" className={buttonVariants({ variant: "outline" }) + " rounded-xl"} data-testid="completed-home-btn">
          Explore Games
        </Link>
      </StateCard>
    );
  }

  const cover = getGame(booking.game_id)?.cover ?? GAMES[0].cover;
  const display = rem === null ? formatRemaining(booking.hours * 3600 * 1000) : formatRemaining(rem);
  const timerClass =
    rem !== null && rem <= 60_000 ? "animate-pulse text-red-500" : rem !== null && rem <= 300_000 ? "text-amber-300" : "text-cyan-400";

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await viewportRef.current?.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch {
      toast.info("Stream active", { description: "Full-window mode is not available in this browser." });
    }
  };

  const disconnect = () => {
    expiryHandled.current = true;
    endMutation.mutate(booking.id, {
      onSuccess: () => {
        toast.warning("Session disconnected", { description: "You have ended your cloud gaming session." });
        navigate("/bookings");
      },
      onError: (err) => toast.error("Could not disconnect", { description: errorMessage(err) }),
    });
  };

  const copyValue = async (text: string, label: string) => {
    const ok = await copyText(text);
    if (ok) toast.success(`${label} copied`, { description: text });
    else toast.error("Copy failed", { description: "Please copy it manually." });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="flex items-center gap-2 rounded-full border border-red-500 bg-red-500/20 px-3 py-1 text-xs font-bold tracking-wider text-red-400 uppercase"
            data-testid="live-session-badge"
          >
            <span className="h-2 w-2 animate-ping rounded-full bg-red-500" /> Live Cloud Rig
          </span>
          <h1 className="font-heading text-lg font-bold text-white sm:text-xl" data-testid="session-game-title">
            {booking.game_title}
          </h1>
          <span className="rounded-lg border border-cyan-500/30 bg-black/50 px-3 py-1 text-xs font-semibold text-cyan-300" data-testid="session-slot-badge">
            {booking.slot_label}
          </span>
        </div>
        <div className="rounded-xl border border-[#1e263d] bg-black/60 px-4 py-2 text-right sm:hidden">
          <div className="text-[10px] tracking-wider text-slate-400 uppercase">Time Remaining</div>
          <div className={`font-heading text-xl font-black tracking-widest ${timerClass}`} data-testid="session-timer-display-mobile">
            {display}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div ref={viewportRef} className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-black" data-testid="stream-viewport">
            <img src={cover} alt={`${booking.game_title} stream preview`} className="animate-kenburns absolute inset-0 h-full w-full object-cover opacity-90" />
            <div className="scanlines absolute inset-0" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.75))]" />
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-black/75 px-3 py-1.5 font-mono text-xs backdrop-blur-md" data-testid="telemetry-hud">
              <span className="font-bold text-emerald-400">
                <Signal className="mr-1 inline h-3 w-3" />
                <span data-testid="hud-fps">{fps}</span> FPS
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400">
                <span data-testid="hud-ping">{ping}</span>ms
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-purple-400" data-testid="hud-quality">{quality}</span>
              <span className="hidden text-slate-600 sm:inline">|</span>
              <span className="hidden text-amber-400 sm:inline">{booking.rig}</span>
            </div>
            <div className="absolute top-3 right-3 hidden rounded-xl border border-cyan-500/30 bg-black/75 px-4 py-2 text-right backdrop-blur-md sm:block" data-testid="session-timer">
              <div className="text-[10px] tracking-wider text-slate-400 uppercase">Time Remaining</div>
              <div className={`font-heading text-2xl font-black tracking-widest ${timerClass}`} data-testid="session-timer-display">
                {display}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1e263d] bg-[#0f131f]/80 p-3 backdrop-blur-xl" data-testid="control-dock">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleFullscreen} data-testid="fullscreen-btn" className="rounded-lg">
                <Maximize className="mr-1.5 h-4 w-4" /> {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </Button>
              <Select value={quality} onValueChange={(v: string) => setQuality(v)}>
                <SelectTrigger size="sm" className="w-32 rounded-lg" data-testid="quality-select">
                  <SelectValue>{(v: string) => v}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {QUALITIES.map((q) => (
                    <SelectItem key={q} value={q}>
                      {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 rounded-lg border border-[#1e263d] bg-black/40 px-3 py-1.5">
                <Volume2 className="h-4 w-4 text-slate-400" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  data-testid="volume-slider"
                  aria-label="Stream volume"
                  className="w-24 accent-cyan-400"
                />
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={disconnect} disabled={endMutation.isPending} data-testid="disconnect-btn" className="rounded-lg">
              <Power className="mr-1.5 h-4 w-4" /> Disconnect
            </Button>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 rounded-xl border border-[#1e263d] bg-[#0f131f] p-5" data-testid="session-credentials-panel">
          <div>
            <h3 className="font-heading mb-4 flex items-center gap-2 text-sm tracking-wider text-cyan-400 uppercase">
              <KeyRound className="h-4 w-4" /> Session Access Credentials
            </h3>
            <div className="mb-4 flex justify-between border-b border-slate-800/80 pb-3 text-xs">
              <span className="text-slate-400">Gamer:</span>
              <span className="font-semibold text-white" data-testid="session-player-name">{booking.gamer_tag}</span>
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-xs text-slate-400">Unique Session Access Code</label>
              <div className="flex items-center gap-2">
                <Input readOnly value={booking.access_code} data-testid="session-access-code" className="rounded-lg border-cyan-500/40 bg-black/70 px-3 py-2.5 font-mono text-sm font-bold text-cyan-400" />
                <button type="button" onClick={() => copyValue(booking.access_code, "Access Code")} data-testid="copy-access-code-btn" title="Copy Code" className="rounded-lg bg-slate-800 p-2.5 text-white transition-colors hover:bg-slate-700">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-xs text-slate-400">Parsec / WebRTC Direct Stream URL</label>
              <div className="flex items-center gap-2">
                <Input readOnly value={booking.stream_url} data-testid="session-stream-url" className="rounded-lg border-slate-700 bg-black/70 px-3 py-2.5 font-mono text-xs text-slate-300" />
                <button type="button" onClick={() => copyValue(booking.stream_url, "Stream Link")} data-testid="copy-stream-url-btn" title="Copy URL" className="rounded-lg bg-slate-800 p-2.5 text-white transition-colors hover:bg-slate-700">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-2 rounded-xl border border-slate-800 bg-black/50 p-3.5 text-xs text-slate-400">
            <p className="font-semibold text-slate-200">How to Connect:</p>
            <p>1. Play directly in the browser stream window.</p>
            <p>2. Or paste the link in Parsec / Moonlight for 120Hz.</p>
            <a href={TELEGRAM_LINK} target="_blank" rel="noopener" data-testid="session-telegram-link" className="block rounded-lg bg-sky-500 px-3 py-2 text-center font-bold text-black transition-colors hover:bg-sky-400">
              <Send className="mr-1.5 inline h-3.5 w-3.5" /> Telegram Support
            </a>
          </div>
        </div>
      </div>

      <Dialog open={expiredOpen} onOpenChange={setExpiredOpen}>
        <DialogContent className="max-w-md rounded-2xl border-2 border-red-500/60 bg-[#0c101a] text-center shadow-[0_0_40px_rgba(239,68,68,0.25)]" data-testid="session-expired-modal">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-500 bg-red-500/20 text-red-400">
            <Hourglass className="h-7 w-7" />
          </div>
          <DialogTitle className="font-heading text-xl font-bold text-white">Session Time Expired!</DialogTitle>
          <DialogDescription className="text-sm text-slate-300">
            Your booked cloud gaming time has ended and the remote rig has been disconnected.
          </DialogDescription>
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={() => navigate("/bookings")} data-testid="expired-bookings-btn" className="w-full rounded-xl bg-cyan-400 font-heading font-extrabold text-black transition-colors hover:bg-cyan-300">
              Back to My Bookings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
