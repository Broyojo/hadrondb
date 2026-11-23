import type { CSSProperties, ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RATING_ICONS } from "@/components/rating-icons";
import { CHIP_FAMILIES } from "@/lib/chips";
import { DEV_VERSIONS, EMPTY_FILTERS, type Filters, type Sort } from "@/lib/filters";
import { GRAPHICS_APIS, GRAPHICS_INFO, type GraphicsApi } from "@/lib/graphics";
import { RATING_LIST, type RatingId } from "@/lib/ratings";

const ANY = "any";

function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Select value={value ?? ANY} onValueChange={(v) => onChange(v === ANY ? undefined : v)}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

export function FilterBar({
  filters,
  onChange,
  versions,
  resultCount,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  versions: string[];
  resultCount: number;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const active =
    filters.q !== "" || filters.ratings.length > 0 || Boolean(filters.api || filters.chip || filters.version);
  return (
    <section aria-label="Search and filters" className="space-y-4">
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search games
        </Label>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          id="search"
          type="search"
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Search by name or Steam app ID"
          className="h-12 rounded-xl pl-11 text-base md:text-base"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div>
        <p id="rating-filter-label" className="mb-2 text-xs font-medium text-muted-foreground">
          Rating
        </p>
        <ToggleGroup
          type="multiple"
          aria-labelledby="rating-filter-label"
          value={filters.ratings}
          onValueChange={(v) => set({ ratings: v as RatingId[] })}
        >
          {RATING_LIST.map((r) => {
            const Icon = RATING_ICONS[r.id];
            return (
              <ToggleGroupItem
                key={r.id}
                value={r.id}
                className="data-[state=on]:border-transparent data-[state=on]:bg-[var(--bg)] data-[state=on]:text-[var(--fg)]"
                style={{ "--bg": `var(--rating-${r.id}-bg)`, "--fg": `var(--rating-${r.id}-fg)` } as CSSProperties}
              >
                <Icon className="size-3.5" style={{ color: `var(--rating-${r.id}-solid)` }} aria-hidden />
                {r.label}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <FilterSelect id="filter-api" label="Graphics API" value={filters.api} onChange={(v) => set({ api: v as GraphicsApi | undefined })}>
          <SelectItem value={ANY}>Any API</SelectItem>
          <SelectSeparator />
          {GRAPHICS_APIS.filter((g) => g !== "other").map((g) => (
            <SelectItem key={g} value={g}>
              {GRAPHICS_INFO[g].label}
            </SelectItem>
          ))}
        </FilterSelect>
        <FilterSelect id="filter-chip" label="Chip" value={filters.chip} onChange={(v) => set({ chip: v })}>
          <SelectItem value={ANY}>Any chip</SelectItem>
          <SelectSeparator />
          {CHIP_FAMILIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c} family
            </SelectItem>
          ))}
        </FilterSelect>
        <FilterSelect id="filter-version" label="Hadron version" value={filters.version} onChange={(v) => set({ version: v })}>
          <SelectItem value={ANY}>Any version</SelectItem>
          <SelectSeparator />
          {versions.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
          <SelectItem value={DEV_VERSIONS}>Development builds</SelectItem>
        </FilterSelect>
        <FilterSelect id="filter-sort" label="Sort by" value={filters.sort} onChange={(v) => set({ sort: (v ?? "recent") as Sort })}>
          <SelectItem value="recent">Latest report</SelectItem>
          <SelectItem value="rating">Best rating</SelectItem>
          <SelectItem value="name">Name</SelectItem>
        </FilterSelect>
      </div>

      <div className="flex min-h-8 items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {resultCount === 1 ? "1 game" : `${resultCount} games`}
          {filters.chip || filters.version ? ", rated from the matching reports" : ""}
        </p>
        {active && (
          <Button variant="ghost" size="sm" onClick={() => onChange({ ...EMPTY_FILTERS, sort: filters.sort })}>
            <X aria-hidden /> Clear filters
          </Button>
        )}
      </div>
    </section>
  );
}
