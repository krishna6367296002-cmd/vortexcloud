import { Zap } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div
      className="grad-anim bg-gradient-to-r from-purple-700 via-pink-600 to-cyan-600 px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm"
      data-testid="announcement-bar"
    >
      <Zap className="mr-1.5 inline h-4 w-4" />
      UPI instant checkout &bull; Slot confirmation on Telegram &bull; Play on any device
    </div>
  );
}
