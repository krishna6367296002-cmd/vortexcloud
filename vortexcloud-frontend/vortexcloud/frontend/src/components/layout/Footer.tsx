import { Link } from "react-router-dom";
import { Gamepad2, Send, ShieldCheck } from "lucide-react";
import { scrollToSection } from "@/lib/sections";
import { TELEGRAM_HANDLE, TELEGRAM_LINK } from "@/lib/upi";

const EXPLORE = [
  { label: "Games Library", hash: "library" },
  { label: "Combo Passes", hash: "passes" },
  { label: "How It Works", hash: "how" },
  { label: "Device Checker", hash: "devices" },
  { label: "FAQ", hash: "faq" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#1e263d] bg-[#0f131f]/60 pt-14 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading text-xl font-extrabold tracking-wider text-white">
                VORTEX<span className="text-cyan-400">CLOUD</span>
              </span>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-slate-400">
              Rent high-end cloud gaming rigs by the hour. No downloads, no hardware upgrades — book a
              slot, pay via UPI and stream AAA titles instantly on any device.
            </p>
          </div>

          <div>
            <h4 className="font-heading mb-4 text-xs tracking-widest text-white uppercase">Explore</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {EXPLORE.map((item) => (
                <li key={item.hash}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(item.hash)}
                    data-testid={`footer-${item.hash}-link`}
                    className="transition hover:text-cyan-400"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <Link to="/bookings" data-testid="footer-bookings-link" className="transition hover:text-cyan-400">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading mb-4 text-xs tracking-widest text-white uppercase">Contact</h4>
            <a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noopener"
              data-testid="footer-telegram-btn"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-xs font-bold text-black transition hover:bg-sky-400"
            >
              <Send className="h-3.5 w-3.5" /> {TELEGRAM_HANDLE}
            </a>
            <p className="mt-3 text-[11px] text-slate-500">
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-400" />
              UPI payments accepted
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#1e263d] pt-6 text-[11px] text-slate-500 sm:flex-row">
          <span>&copy; 2026 VortexCloud Gaming. All rights reserved.</span>
          <Link to="/admin" data-testid="footer-admin-link" className="transition-colors hover:text-cyan-400">
            Owner Login
          </Link>
          <span>All game names and trademarks belong to their respective owners.</span>
        </div>
      </div>
    </footer>
  );
}
