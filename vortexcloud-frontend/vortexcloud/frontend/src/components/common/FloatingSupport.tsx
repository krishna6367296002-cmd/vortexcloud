import { Send } from "lucide-react";
import { TELEGRAM_HANDLE, TELEGRAM_LINK } from "@/lib/upi";

// Floating Telegram support button (bottom-right).
export function FloatingSupport() {
  return (
    <a
      href={TELEGRAM_LINK}
      target="_blank"
      rel="noopener"
      aria-label={`Chat with support on Telegram ${TELEGRAM_HANDLE}`}
      data-testid="floating-telegram-btn"
      className="group fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-sky-500 p-3.5 text-black shadow-[0_8px_30px_rgba(14,165,233,0.45)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(14,165,233,0.6)] sm:right-6 sm:bottom-6"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-sky-400/40" />
      <Send className="h-5 w-5" />
      <span className="max-w-0 overflow-hidden text-sm font-bold whitespace-nowrap transition-[max-width] duration-300 group-hover:max-w-40">
        Chat on Telegram
      </span>
    </a>
  );
}
