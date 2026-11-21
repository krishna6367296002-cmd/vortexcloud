import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { CheckCircle2, Copy, Loader2, QrCode, Send, Smartphone, TicketPercent, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Game } from "@/lib/games";
import { COUPON_HINT, planPrice, planRangeLabel, type Plan } from "@/lib/plans";
import { apiPost } from "@/lib/api";
import { errorMessage, qk } from "@/lib/queries";
import { addMyBookingId, getGamerTag, setGamerTag } from "@/lib/store";
import type { Booking, BookingCreate, CouponResult } from "@/lib/types";
import { copyText } from "@/lib/clipboard";
import { buildUpiLink, MERCHANT_UPI_ID, TELEGRAM_HANDLE, TELEGRAM_LINK, VERIFY_SECONDS } from "@/lib/upi";

type Step = "details" | "verifying" | "success";

const VERIFY_STAGES = ["Sending UTR to the owner…", "Reserving your RTX rig…", "Generating stream access token…"];

interface UpiCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: Game;
  plan: Plan;
  startHour: number | null;
}

export function UpiCheckoutModal({ open, onOpenChange, game, plan, startHour }: UpiCheckoutModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("details");
  const [gamerTag, setTagState] = useState("");
  const [utr, setUtr] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [created, setCreated] = useState<Booking | null>(null);

  useEffect(() => {
    if (open) {
      setStep("details");
      setTagState(getGamerTag());
      setUtr("");
      setCouponInput("");
      setCoupon(null);
      setElapsed(0);
      setCreated(null);
    }
  }, [open]);

  const base = planPrice(plan, game.pricePerHour);
  const discount = coupon?.valid ? coupon.discount : 0;
  const total = base - discount;

  const applyCoupon = useMutation({
    mutationFn: (code: string) =>
      apiPost<CouponResult>("/coupons/validate", { code, game_id: game.id, plan: plan.id }),
    onSuccess: (res) => {
      if (res.valid) {
        setCoupon(res);
        toast.success(`Coupon ${res.code} applied`, { description: res.message });
      } else {
        setCoupon(null);
        toast.error("Invalid coupon", { description: res.message });
      }
    },
    onError: (err) => toast.error("Could not apply coupon", { description: errorMessage(err) }),
  });

  const createBooking = useMutation({
    mutationFn: (body: BookingCreate) => apiPost<Booking>("/bookings", body),
    onSuccess: (booking) => {
      addMyBookingId(booking.id);
      setCreated(booking);
      setElapsed(0);
      setStep("verifying");
      void queryClient.invalidateQueries({ queryKey: qk.slots(game.id) });
      void queryClient.invalidateQueries({ queryKey: qk.myBookings });
      void queryClient.invalidateQueries({ queryKey: qk.recent });
    },
    onError: (err) => {
      toast.error("Booking failed", { description: errorMessage(err) });
      void queryClient.invalidateQueries({ queryKey: qk.slots(game.id) });
    },
  });

  // Short hand-off animation after the booking is saved on the server.
  useEffect(() => {
    if (step !== "verifying") return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const sec = Math.floor((Date.now() - startedAt) / 1000);
      if (sec >= VERIFY_SECONDS) {
        window.clearInterval(timer);
        setStep("success");
        toast.success("Payment submitted", { description: "Booking saved — pending owner confirmation." });
      } else {
        setElapsed(sec);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  const submitUtr = () => {
    const value = utr.trim();
    if (!/^\d{12}$/.test(value)) {
      toast.error("Invalid UTR", { description: "The UTR must be exactly 12 digits (numbers only)." });
      return;
    }
    if (startHour === null) return;
    const tag = gamerTag.trim() || "Gamer";
    setGamerTag(tag);
    createBooking.mutate({
      game_id: game.id,
      plan: plan.id,
      start_hour: startHour,
      gamer_tag: tag,
      utr: value,
      coupon_code: coupon?.valid ? coupon.code : null,
    });
  };

  const copyValue = async (text: string, label: string) => {
    const ok = await copyText(text);
    if (ok) toast.success(`${label} copied`, { description: text });
    else toast.error("Copy failed", { description: "Please copy it manually." });
  };

  if (startHour === null) return null;

  const slotLabel = planRangeLabel(plan, startHour);
  const upiLink = buildUpiLink(total, `VortexCloud ${game.title} ${slotLabel}`);
  const stageIndex = Math.min(VERIFY_STAGES.length - 1, Math.floor((elapsed / VERIFY_SECONDS) * VERIFY_STAGES.length));
  const progress = Math.min(100, Math.round(((elapsed + 1) / VERIFY_SECONDS) * 100));
  const left = Math.max(0, VERIFY_SECONDS - elapsed);
  const countdown = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border-[#2a3655] bg-[#0c101a]/95 shadow-[0_24px_64px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
        data-testid="upi-checkout-modal"
      >
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2.5 text-base text-white sm:text-lg">
            <QrCode className="h-5 w-5 text-cyan-400" /> UPI Checkout
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Pay via any UPI app — GPay, PhonePe, Paytm. Confirmation lands on Telegram.
          </DialogDescription>
        </DialogHeader>

        {step === "details" && (
          <div className="space-y-5">
            <div className="space-y-2.5 rounded-xl border border-[#1e263d] bg-black/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">Game Title</span>
                <span className="font-heading text-right text-sm font-bold text-white" data-testid="checkout-game-title">
                  {game.title}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Plan</span>
                <span className="text-xs font-semibold text-purple-300" data-testid="checkout-plan-label">
                  {plan.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Time Slot</span>
                <span
                  className="rounded-md border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-1 text-xs font-bold text-emerald-400"
                  data-testid="checkout-slot-time"
                >
                  {slotLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Subtotal</span>
                <span className="text-xs font-semibold text-slate-200" data-testid="checkout-subtotal">₹{base}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400">Coupon {coupon?.code}</span>
                  <span className="text-xs font-bold text-emerald-400" data-testid="checkout-discount">−₹{discount}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-[#1e263d] pt-2.5">
                <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">Total Payable</span>
                <span className="font-heading text-2xl font-black text-cyan-400" data-testid="checkout-total-amount">
                  ₹{total}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                Coupon Code
              </label>
              {coupon?.valid ? (
                <div
                  className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2.5"
                  data-testid="coupon-applied-chip"
                >
                  <span className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                    <TicketPercent className="h-4 w-4" /> {coupon.code} — ₹{coupon.discount} off
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCoupon(null);
                      setCouponInput("");
                    }}
                    data-testid="coupon-remove-btn"
                    aria-label="Remove coupon"
                    className="rounded-md p-1 text-slate-400 transition-colors hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase().slice(0, 24))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && couponInput.trim()) applyCoupon.mutate(couponInput.trim());
                    }}
                    placeholder={`Try ${COUPON_HINT}`}
                    data-testid="coupon-input"
                    className="rounded-xl border-slate-700 bg-slate-900 px-3.5 py-2.5 font-mono text-sm text-white uppercase placeholder:text-slate-500 focus-visible:border-cyan-400"
                  />
                  <Button
                    variant="outline"
                    disabled={!couponInput.trim() || applyCoupon.isPending}
                    onClick={() => applyCoupon.mutate(couponInput.trim())}
                    data-testid="coupon-apply-btn"
                    className="rounded-xl border-purple-500/50 bg-purple-500/15 px-4 font-bold text-purple-200 hover:bg-purple-500/25"
                  >
                    {applyCoupon.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                Gamer Name / Tag
              </label>
              <Input
                value={gamerTag}
                onChange={(e) => setTagState(e.target.value.slice(0, 24))}
                placeholder="e.g. Krishna_OP"
                data-testid="gamer-tag-input"
                className="rounded-xl border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus-visible:border-cyan-400"
              />
            </div>

            <div className="rounded-xl border border-purple-500/40 bg-slate-900/90 p-4">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl bg-white p-2">
                  <QRCodeSVG value={upiLink} size={112} data-testid="upi-qr-code" />
                </div>
                <div className="w-full space-y-2">
                  <p className="text-xs text-slate-300">
                    Scan with GPay / PhonePe / Paytm to pay <span className="font-bold text-cyan-300">₹{total}</span>, or
                    pay to this UPI ID:
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={MERCHANT_UPI_ID}
                      data-testid="upi-id-input"
                      className="rounded-lg border-slate-700 bg-black/70 px-3 py-2 font-mono text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => copyValue(MERCHANT_UPI_ID, "UPI ID")}
                      data-testid="copy-upi-id-btn"
                      title="Copy UPI ID"
                      className="rounded-lg bg-slate-800 p-2.5 text-white transition-colors hover:bg-slate-700"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <a
                    href={upiLink}
                    data-testid="pay-with-upi-app-link"
                    className="block rounded-lg bg-purple-600 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-purple-500"
                  >
                    <Smartphone className="mr-1 inline h-3.5 w-3.5" /> Pay with UPI App (Mobile)
                  </a>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                After paying, enter your 12-digit UTR / Transaction ID
              </label>
              <Input
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
                inputMode="numeric"
                maxLength={12}
                placeholder="e.g. 412345678901"
                data-testid="utr-input"
                className="rounded-xl border-slate-700 bg-slate-900 px-3.5 py-2.5 font-mono text-sm text-white placeholder:text-slate-500 focus-visible:border-cyan-400"
              />
              <p className="mt-1.5 text-[11px] text-slate-400">
                Listed as “UPI transaction ID” in your GPay / PhonePe payment details.
              </p>
            </div>

            <Button
              onClick={submitUtr}
              disabled={createBooking.isPending}
              data-testid="submit-utr-btn"
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3.5 font-heading text-sm font-extrabold tracking-wide text-black shadow-lg shadow-emerald-500/25 transition-[filter,transform] hover:brightness-110 active:scale-[0.99] sm:text-base"
            >
              {createBooking.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              I Have Paid — Submit UTR
            </Button>
          </div>
        )}

        {step === "verifying" && created && (
          <div className="space-y-5 text-center" data-testid="verify-step">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-500/15 text-amber-300">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <div>
              <h4 className="font-heading text-lg font-bold text-white">Submitting Your Payment</h4>
              <p className="mt-1 text-xs text-slate-400">
                UTR: <span className="font-mono text-slate-200" data-testid="verify-utr-text">{created.utr}</span>
              </p>
            </div>
            <div className="rounded-xl border border-[#1e263d] bg-black/60 py-4">
              <div className="font-heading text-4xl font-black tracking-widest text-amber-300" data-testid="verify-countdown">
                {countdown}
              </div>
              <div className="mx-auto mt-3 h-1.5 w-3/4 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-[width] duration-1000"
                  style={{ width: `${progress}%` }}
                  data-testid="verify-progress-bar"
                />
              </div>
            </div>
            <p className="text-sm font-medium text-cyan-300" data-testid="verify-stage-text">
              {VERIFY_STAGES[stageIndex]}
            </p>
            <p className="text-xs text-slate-400">Send your payment screenshot now so the owner can verify it faster:</p>
            <a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noopener"
              data-testid="verify-telegram-link"
              className="block rounded-xl bg-sky-500 py-3 text-center text-sm font-bold text-black transition-colors hover:bg-sky-400"
            >
              <Send className="mr-1.5 inline h-4 w-4" /> Send Screenshot on Telegram {TELEGRAM_HANDLE}
            </a>
          </div>
        )}

        {step === "success" && created && (
          <div className="space-y-5 text-center" data-testid="success-step">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500/15 text-emerald-300">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h4 className="font-heading text-xl font-bold text-emerald-300">Payment Submitted!</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                The owner will verify your UTR and confirm the booking. Send your payment screenshot on Telegram to speed it
                up.
              </p>
            </div>
            <div className="space-y-2 rounded-xl border border-[#1e263d] bg-black/60 p-4 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Booking ID</span>
                <span className="font-heading font-bold text-white" data-testid="success-booking-code">{created.code}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">Game</span>
                <span className="font-heading text-right font-bold text-white">{created.game_title}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Slot</span>
                <span className="font-bold text-emerald-400">{created.slot_label}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Paid</span>
                <span className="font-bold text-cyan-300" data-testid="success-amount">₹{created.amount}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#1e263d] pt-2 text-xs">
                <span className="text-slate-400">UTR</span>
                <span className="font-mono font-bold text-cyan-400" data-testid="success-utr">{created.utr}</span>
              </div>
            </div>
            <a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noopener"
              data-testid="success-telegram-link"
              className="block rounded-xl bg-sky-500 py-3 text-center text-sm font-bold text-black transition-colors hover:bg-sky-400"
            >
              <Send className="mr-1.5 inline h-4 w-4" /> Send Screenshot on Telegram {TELEGRAM_HANDLE}
            </a>
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate("/bookings");
              }}
              data-testid="success-bookings-btn"
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3.5 font-heading text-sm font-extrabold tracking-wide text-black transition-[filter] hover:brightness-110"
            >
              Go to My Bookings
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
