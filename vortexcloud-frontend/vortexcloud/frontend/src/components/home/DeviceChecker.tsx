import { useState } from "react";
import { CheckCircle2, Laptop, Loader2, Monitor, ScanSearch, Smartphone, XCircle } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/common/Reveal";

type DeviceId = "mobile" | "pc" | "mac";

const DEVICES: {
  id: DeviceId;
  label: string;
  icon: typeof Smartphone;
  fps: string;
  res: string;
  browser: string;
  controller: string;
  net: string;
  tip: string;
}[] = [
  {
    id: "mobile",
    label: "Mobile",
    icon: Smartphone,
    fps: "60 FPS in the browser",
    res: "Up to 1080p",
    browser: "Chrome (Android) / Safari (iPhone)",
    controller: "Bluetooth controller or on-screen touch",
    net: "15 Mbps+ on 5G or 5GHz Wi-Fi",
    tip: "Use landscape mode and turn on Do Not Disturb.",
  },
  {
    id: "pc",
    label: "Low-End PC",
    icon: Monitor,
    fps: "60 FPS in the browser",
    res: "Up to 1440p",
    browser: "Chrome or Edge",
    controller: "Keyboard + mouse, Xbox / DualSense",
    net: "20 Mbps+ wired or 5GHz Wi-Fi",
    tip: "The cloud rig does the heavy lifting — even integrated graphics work.",
  },
  {
    id: "mac",
    label: "Mac",
    icon: Laptop,
    fps: "60 FPS in the browser",
    res: "Up to 4K on Retina displays",
    browser: "Chrome or Safari",
    controller: "Keyboard + mouse, DualSense / Xbox",
    net: "25 Mbps+ for 4K",
    tip: "Play Windows-only games on your Mac with zero installs.",
  },
];

function detectDevice(): DeviceId {
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return "mobile";
  if (/Macintosh|Mac OS X/i.test(ua)) return "mac";
  return "pc";
}

interface CheckResult {
  label: string;
  ok: boolean;
  detail: string;
}

type NetInfo = { downlink?: number; effectiveType?: string };

async function runChecks(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const webrtc = typeof window.RTCPeerConnection === "function";
  results.push({ label: "WebRTC streaming", ok: webrtc, detail: webrtc ? "Supported" : "Not available in this browser" });

  let decodeOk = false;
  let decodeDetail = "Could not test video decoding";
  try {
    if (navigator.mediaCapabilities?.decodingInfo) {
      const info = await navigator.mediaCapabilities.decodingInfo({
        type: "media-source",
        video: {
          contentType: 'video/mp4; codecs="avc1.640028"',
          width: 1920,
          height: 1080,
          bitrate: 15_000_000,
          framerate: 60,
        },
      });
      decodeOk = info.supported && info.smooth;
      decodeDetail = info.supported
        ? info.smooth
          ? `Smooth${info.powerEfficient ? " · hardware accelerated" : ""}`
          : "Supported but may stutter"
        : "Not supported";
    }
  } catch {
    // keep defaults
  }
  results.push({ label: "1080p 60 FPS video decode", ok: decodeOk, detail: decodeDetail });

  const gamepad = typeof navigator.getGamepads === "function";
  results.push({ label: "Controller support", ok: gamepad, detail: gamepad ? "Gamepad API available" : "Not available" });

  const conn = (navigator as Navigator & { connection?: NetInfo }).connection;
  if (conn?.downlink !== undefined) {
    const ok = conn.downlink >= 10;
    results.push({
      label: "Network estimate",
      ok,
      detail: `~${conn.downlink} Mbps${conn.effectiveType ? ` (${conn.effectiveType.toUpperCase()})` : ""}`,
    });
  }
  return results;
}

export function DeviceChecker() {
  const [detected] = useState<DeviceId>(() => detectDevice());
  const [device, setDevice] = useState<DeviceId>(detected);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const d = DEVICES.find((x) => x.id === device) ?? DEVICES[0];
  const ready = results ? results.filter((r) => r.label !== "Network estimate").every((r) => r.ok) : null;

  const check = async () => {
    setChecking(true);
    setResults(await runChecks());
    setChecking(false);
  };

  return (
    <section id="devices" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-10">
        <SectionHeading
          eyebrow="Device Compatibility Checker"
          eyebrowClass="text-sky-400"
          title="Will It Run On My Device?"
          sub="Pick your device for instant specs, or run a live check on this browser right now."
        />
      </div>
      <Reveal>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="rounded-3xl border border-[#1e263d] bg-[#0f131f]/65 p-6 backdrop-blur-xl lg:col-span-3" data-testid="device-checker-card">
            <div className="mb-6 grid grid-cols-3 gap-2">
              {DEVICES.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setDevice(x.id)}
                  data-testid={`device-option-${x.id}`}
                  className={`relative rounded-2xl border p-3 text-center transition-[background-color,border-color] duration-200 sm:p-4 ${
                    device === x.id ? "border-sky-400 bg-sky-400/10" : "border-[#1e263d] bg-black/40 hover:border-sky-400/50"
                  }`}
                >
                  <x.icon className={`mx-auto mb-1.5 h-6 w-6 ${device === x.id ? "text-sky-300" : "text-slate-400"}`} />
                  <span className="text-xs font-bold text-white sm:text-sm">{x.label}</span>
                  {x.id === detected && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black whitespace-nowrap text-black uppercase">
                      Your device
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3" data-testid="device-fps-badge">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="font-heading text-sm font-bold text-emerald-300">{d.fps} — supported</span>
            </div>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="device-spec-list">
              {[
                ["Max resolution", d.res],
                ["Best browser", d.browser],
                ["Controls", d.controller],
                ["Internet", d.net],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-slate-800/80 bg-black/40 px-3 py-2.5">
                  <dt className="text-[10px] tracking-wider text-slate-500 uppercase">{k}</dt>
                  <dd className="mt-0.5 text-xs font-semibold text-slate-200">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-slate-400">Tip: {d.tip}</p>
          </div>

          <div className="flex flex-col rounded-3xl border border-[#1e263d] bg-[#0f131f]/65 p-6 backdrop-blur-xl lg:col-span-2" data-testid="live-check-card">
            <h3 className="font-heading flex items-center gap-2 text-base font-bold text-white">
              <ScanSearch className="h-5 w-5 text-sky-400" /> Live Browser Check
            </h3>
            <p className="mt-1 text-xs text-slate-400">Tests this browser&apos;s real streaming capabilities in about a second.</p>
            <div className="my-5 flex-1 space-y-2.5">
              {results ? (
                results.map((r) => (
                  <div key={r.label} className="flex items-start gap-2.5 rounded-xl border border-slate-800/80 bg-black/40 px-3 py-2.5" data-testid="live-check-result">
                    {r.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />}
                    <div>
                      <div className="text-xs font-semibold text-white">{r.label}</div>
                      <div className="text-[11px] text-slate-400">{r.detail}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-full min-h-32 items-center justify-center rounded-xl border border-dashed border-[#1e263d] text-xs text-slate-500">
                  Results will appear here
                </div>
              )}
            </div>
            {ready !== null && (
              <p className={`mb-3 text-sm font-bold ${ready ? "text-emerald-400" : "text-amber-300"}`} data-testid="live-check-verdict">
                {ready ? "This device is ready for 60 FPS cloud gaming!" : "Some features are missing — try the latest Chrome."}
              </p>
            )}
            <button
              type="button"
              onClick={() => void check()}
              disabled={checking}
              data-testid="run-device-check-btn"
              className="font-heading flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 py-3 text-sm font-extrabold text-black transition-[filter] hover:brightness-110 disabled:opacity-70"
            >
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
              {results ? "Run Check Again" : "Check This Device"}
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
