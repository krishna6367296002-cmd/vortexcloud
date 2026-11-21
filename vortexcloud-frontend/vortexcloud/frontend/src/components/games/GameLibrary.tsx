import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GAMES, GENRES } from "@/lib/games";
import { GameCard } from "@/components/games/GameCard";

const PAGE_SIZE = 8;

const SORTS = [
  { value: "featured", label: "Sort: Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "az", label: "Name: A to Z" },
] as const;

type SortValue = (typeof SORTS)[number]["value"];

const SORT_LABELS: Record<string, string> = Object.fromEntries(SORTS.map((s) => [s.value, s.label]));

export function GameLibrary() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string>("All");
  const [sort, setSort] = useState<SortValue>("featured");
  const [shown, setShown] = useState(PAGE_SIZE);

  let list = GAMES;
  if (genre !== "All") list = list.filter((g) => g.genre === genre);
  const q = query.trim().toLowerCase();
  if (q) list = list.filter((g) => `${g.title} ${g.genre}`.toLowerCase().includes(q));

  const sorted = [...list];
  if (sort === "price-asc") sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
  else if (sort === "price-desc") sorted.sort((a, b) => b.pricePerHour - a.pricePerHour);
  else if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
  else
    sorted.sort(
      (a, b) =>
        Number(b.featured ?? false) - Number(a.featured ?? false) ||
        Number(b.popular ?? false) - Number(a.popular ?? false) ||
        a.title.localeCompare(b.title),
    );

  const visible = sorted.slice(0, shown);

  return (
    <section id="library" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="font-heading text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">
            The Full Fleet
          </span>
          <h2 className="font-heading mt-1 text-2xl font-bold text-white sm:text-3xl">Browse Cloud Game Library</h2>
        </div>
        <p className="text-sm text-slate-400">
          Pick any game to open its booking page and check live hourly slots.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(PAGE_SIZE);
            }}
            placeholder="Search games… (e.g. GTA, Racing, Horror)"
            data-testid="game-search-input"
            className="rounded-xl border-[#1e263d] bg-[#0f131f] py-3 pl-11 text-sm text-white placeholder:text-slate-500 focus-visible:border-cyan-400"
          />
        </div>
        <Select
          value={sort}
          onValueChange={(v: string) => {
            setSort(v as SortValue);
            setShown(PAGE_SIZE);
          }}
        >
          <SelectTrigger className="w-full rounded-xl border-[#1e263d] bg-[#0f131f] py-3 sm:w-52" data-testid="game-sort-select">
            <SelectValue>{(v: string) => SORT_LABELS[v] ?? "Sort: Featured"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {["All", ...GENRES].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => {
              setGenre(g);
              setShown(PAGE_SIZE);
            }}
            data-testid={`genre-chip-${g.toLowerCase().replace(/\s+/g, "-")}`}
            className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
              genre === g
                ? "border-cyan-400 bg-cyan-400 text-black"
                : "border-[#1e263d] bg-[#0f131f] text-slate-300 hover:border-cyan-400/60"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <p className="mb-6 text-xs text-slate-500" data-testid="games-count">
        Showing {visible.length} of {sorted.length} games
      </p>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-[#1e263d] bg-[#0f131f]/60 py-16 text-center text-sm text-slate-400" data-testid="games-empty-state">
          No games matched that search. Try another name or genre.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

      {shown < sorted.length && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => setShown((s) => s + PAGE_SIZE)}
            data-testid="show-more-btn"
            className="rounded-xl border-[#1e263d] bg-[#0f131f] px-8 py-3 text-sm font-bold text-slate-200 hover:border-cyan-400/60 hover:bg-slate-800"
          >
            <ChevronDown className="mr-2 h-4 w-4" /> Load More Games
          </Button>
        </div>
      )}
    </section>
  );
}
