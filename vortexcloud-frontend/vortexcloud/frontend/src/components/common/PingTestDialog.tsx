import { useState } from "react";
import { Activity, Loader2, RefreshCw, Wifi } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import type { PingResponse } from "@/lib/types";

const SAMPLES = 6;

function rate(ms: number): { label: string; note: string; color: string } {
  if (ms < 60) return { label: "Excellent", note: "Ready for competitive 120 FPS shooters.", color: "text-emerald-400" };
  if (ms < 100) return { label: "Great", note: "Smooth for every game in the library.", color: "text-cyan-400" };
  if (ms < 160) return { label: "Good", note: "Great for story & open-world games.", color: "text-amber-300" };
  return { label: "Weak", note: "Try 5GHz Wi-Fi or move closer to your router.", color: "text-red-400" };
}

type Variant = "header" | "hero" | "menu";

const TRIGGER_CLASS: Record<Variant, string> = {
  header:
    "hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:border-emerald-400 hover:bg-emerald-900/50 lg:flex",
  hero: "inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20",
  menu: "block w-full rounded-lg px-3 py-2.5 text-left text-emerald-300 hover:bg-slate-800",
};

// Real round-trip measurement from this browser to the VortexCloud API server.
export function PingTestDialog({ variant }: { variant: Variant }) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [samples, setSamples] = useState<number[]>([]);
  const [failed, setFailed] = useState(false);

  const run = async () => {
    setRunning(true);
    setFailed(false);
    setSamples([]);
    try {
      await apiGet<PingResponse>(`/ping?warm=${Date.now()}`); // warm-up (DNS/TLS), not counted
      const got: number[] = [];
      for (let i = 0; i < SAMPLES; i++) {
        const t0 = performance.now();
        await apiGet<PingResponse>(`/ping?t=${Date.now()}-${i}`);
        got.push(Math.round(performance.now() - t0));
        setSamples([...got]);
      }
    } catch {
      setFailed(true);
    } finally {
      setRunning(false);
    }
  };

  const openAndRun = () => {
    setOpen(true);
    void run();
  };

  const sorted = [...samples].sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
  const jitter = sorted.length > 1 ? sorted[sorted.length - 1] - sorted[0] : 0;
  const verdict = median !== null && !running ? rate(median) : null;
  const maxBar = Math.max(200, ...samples);

  return (
    <>
      <button type="button" onClick={openAndRun} data-testid={`ping-test-btn-${variant}`} className={TRIGGER_CLASS[variant]}>
        {variant === "header" ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
        ) : (
          variant === "hero" && <Activity className="h-4 w-4" />
        )}
        {variant === "header" ? "Servers Online · Test My Ping" : "Test My Server Ping"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl border-[#2a3655] bg-[#0c101a]/95 backdrop-blur-2xl" data-testid="ping-test-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2 text-white">
              <Wifi className="h-5 w-5 text-emerald-400" /> Server Ping Test
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Live round-trip time from your device to the VortexCloud server.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-[#1e263d] bg-black/60 p-6 text-center">
            <div className="text-[10px] tracking-[0.2em] text-slate-400 uppercase">Your latency</div>
            <div className="font-heading mt-1 text-5xl font-black text-white" data-testid="ping-result-ms">
              {median !== null ? median : running ? <Loader2 className="mx-auto h-10 w-10 animate-spin text-cyan-400" /> : "--"}
              {median !== null && <span className="ml-1 text-xl text-slate-400">ms</span>}
            </div>
            {verdict && (
              <div className="mt-2" data-testid="ping-verdict">
                <span className={`font-heading text-lg font-bold ${verdict.color}`}>{verdict.label}</span>
                <p className="text-xs text-slate-400">{verdict.note}</p>
              </div>
            )}
            {failed && (
              <p className="mt-2 text-xs text-red-400" data-testid="ping-error">
                Could not reach the server. Check your internet and try again.
              </p>
            )}

            <div className="mt-5 flex h-16 items-end justify-center gap-2" aria-hidden="true">
              {Array.from({ length: SAMPLES }, (_, i) => {
                const v = samples[i];
                return (
                  <div key={i} className="flex w-7 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-cyan-500 to-emerald-400 transition-[height] duration-300"
                      style={{ height: v ? `${Math.max(8, (v / maxBar) * 56)}px` : "4px", opacity: v ? 1 : 0.25 }}
                    />
                    <span className="font-mono text-[9px] text-slate-500">{v ?? "·"}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex justify-center gap-6 text-xs text-slate-400">
              <span>
                Samples <span className="font-mono text-white">{samples.length}/{SAMPLES}</span>
              </span>
              <span>
                Jitter <span className="font-mono text-white" data-testid="ping-jitter">{jitter}ms</span>
              </span>
            </div>
          </div>

          <Button
            onClick={() => void run()}
            disabled={running}
            data-testid="ping-rerun-btn"
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 font-heading font-extrabold text-black transition-[filter] hover:brightness-110"
          >
            {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {running ? "Testing…" : "Run Again"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
