import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Gamepad2, Menu, Send, Ticket, X } from "lucide-react";
import { useMyBookings } from "@/lib/queries";
import { scrollToSection } from "@/lib/sections";
import { TELEGRAM_LINK } from "@/lib/upi";
import { PingTestDialog } from "@/components/common/PingTestDialog";

const NAV_LINKS = [
  { label: "Library", hash: "library" },
  { label: "Passes", hash: "passes" },
  { label: "Devices", hash: "devices" },
  { label: "FAQ", hash: "faq" },
];

export function NavigationHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: myBookings, isError } = useMyBookings();
  const activeCount = isError
    ? 0
    : (myBookings ?? []).filter((b) => b.status === "pending" || b.status === "confirmed").length;

  const goToSection = (hash: string) => {
    setOpen(false);
    if (pathname !== "/") {
      navigate(`/#${hash}`);
    } else {
      scrollToSection(hash);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#1e263d] bg-[#090b10]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" data-testid="nav-brand-link">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/30">
            <Gamepad2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-xl font-extrabold tracking-wider text-white">
              VORTEX<span className="text-cyan-400">CLOUD</span>
            </span>
            <span className="hidden rounded-full border border-cyan-500/30 bg-cyan-950/60 px-2 py-0.5 text-[10px] tracking-widest text-cyan-400 uppercase sm:inline-block">
              India Rig v2.4
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <PingTestDialog variant="header" />

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.hash}
                type="button"
                onClick={() => goToSection(link.hash)}
                data-testid={`nav-${link.hash}-link`}
                className="transition hover:text-cyan-400"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener"
            data-testid="nav-telegram-btn"
            className="hidden items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/15 px-4 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-500/25 sm:inline-flex"
          >
            <Send className="h-3.5 w-3.5" /> Support
          </a>

          <Link
            to="/bookings"
            data-testid="nav-bookings-link"
            className="relative inline-flex items-center gap-2 rounded-lg border border-purple-500/40 bg-purple-500/15 px-3 py-2 text-xs font-bold text-purple-300 transition hover:bg-purple-500/25"
          >
            <Ticket className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">My Bookings</span>
            {activeCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-black text-black"
                data-testid="nav-bookings-count"
              >
                {activeCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            data-testid="mobile-menu-btn"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-200 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="space-y-1 border-b border-[#1e263d] bg-[#090b10]/95 px-4 py-3 text-sm backdrop-blur-md md:hidden"
          data-testid="mobile-menu-panel"
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.hash}
              type="button"
              onClick={() => goToSection(link.hash)}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-slate-200 hover:bg-slate-800"
              data-testid={`mobile-nav-${link.hash}-link`}
            >
              {link.label}
            </button>
          ))}
          <a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener"
            className="block rounded-lg bg-sky-500/15 px-3 py-2.5 font-semibold text-sky-300"
            data-testid="mobile-nav-telegram-link"
          >
            <Send className="mr-1.5 inline h-4 w-4" /> Telegram Support
          </a>
          <PingTestDialog variant="menu" />
        </div>
      )}
    </header>
  );
}
