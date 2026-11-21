import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { CalendarCheck, Cpu } from "lucide-react";
import type { Game } from "@/lib/games";

export function GameCard({ game }: { game: Game }) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2, ease: "easeOut" }} className="h-full">
      <Link
        to={`/game/${game.id}`}
        data-testid={`game-card-${game.id}`}
        className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#1e263d] bg-[#0f131f] shadow-lg transition-all duration-300 hover:border-cyan-400/70 hover:shadow-[0_0_25px_rgba(0,240,255,0.15)]"
      >
        <div>
          <div className="relative aspect-video overflow-hidden bg-slate-900">
            <img
              src={game.cover}
              alt={`${game.title} cover art`}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f131f] via-transparent to-transparent" />
            <span className="absolute top-3 left-3 rounded-md border border-purple-500/60 bg-purple-500/25 px-2.5 py-1 text-[10px] font-bold tracking-wider text-purple-200 backdrop-blur-md">
              {game.badge}
            </span>
            <div className="absolute right-3 bottom-3 rounded-lg border border-white/15 bg-black/85 px-3 py-1 backdrop-blur-md">
              <span className="font-heading text-base font-black text-cyan-400">₹{game.pricePerHour}</span>
              <span className="text-xs text-slate-400">/hr</span>
            </div>
          </div>
          <div className="p-5">
            <div className="mb-1 text-xs font-medium text-slate-400">
              {game.genre} &bull; {game.rating}
            </div>
            <h3 className="font-heading mb-2 text-lg font-bold text-white transition group-hover:text-cyan-400">
              {game.title}
            </h3>
            <div className="flex items-center gap-2 rounded-lg border border-slate-800/80 bg-black/40 px-3 py-2 text-xs text-slate-400">
              <Cpu className="h-3.5 w-3.5 shrink-0 text-purple-400" />
              <span>{game.streamSpec}</span>
            </div>
          </div>
        </div>
        <div className="px-5 pb-5">
          <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 py-3 text-sm font-bold text-white shadow-md transition group-hover:opacity-95">
            <CalendarCheck className="h-4 w-4" /> Book Slot &amp; Play
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
