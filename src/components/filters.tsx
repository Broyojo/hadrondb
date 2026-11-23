import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { CHIP_FAMILIES } from "@/lib/chips";
import { DEV_VERSIONS, EMPTY_FILTERS, type Filters } from "@/lib/filters";
import { GRAPHICS_APIS, GRAPHICS_INFO, type GraphicsApi } from "@/lib/graphics";
import { RATING_LIST, type RatingId } from "@/lib/ratings";

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <label htmlFor={id} className="grid grid-cols-[3.75rem_1fr] items-center gap-1 sm:flex sm:gap-2">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

export function FilterBar({
  filters,
  onChange,
  versions,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  versions: string[];
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const active =
    filters.q !== "" || filters.ratings.length > 0 || Boolean(filters.api || filters.chip || filters.version);
  return (
    <section aria-label="Search and filters" className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-5">
      <div className="md:w-72">
        <label htmlFor="search" className="sr-only">
          Search by name or Steam app ID
        </label>
        <Input
          id="search"
          type="search"
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Search name or app ID"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 [&_select]:w-full sm:[&_select]:w-auto">
        <Field id="filter-rating" label="Rating">
          <select
            id="filter-rating"
            value={filters.ratings[0] ?? ""}
            onChange={(e) => set({ ratings: e.target.value ? [e.target.value as RatingId] : [] })}
          >
            <option value="">Any</option>
            {RATING_LIST.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="filter-api" label="API">
          <select id="filter-api" value={filters.api ?? ""} onChange={(e) => set({ api: (e.target.value || undefined) as GraphicsApi | undefined })}>
            <option value="">Any</option>
            {GRAPHICS_APIS.filter((g) => g !== "other" && g !== "unknown").map((g) => (
              <option key={g} value={g}>
                {GRAPHICS_INFO[g].label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="filter-chip" label="Chip">
          <select id="filter-chip" value={filters.chip ?? ""} onChange={(e) => set({ chip: e.target.value || undefined })}>
            <option value="">Any</option>
            {CHIP_FAMILIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field id="filter-version" label="Hadron">
          <select id="filter-version" value={filters.version ?? ""} onChange={(e) => set({ version: e.target.value || undefined })}>
            <option value="">Any</option>
            {versions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
            <option value={DEV_VERSIONS}>Dev builds</option>
          </select>
        </Field>
      </div>
      {active && (
        <button
          type="button"
          className="self-start text-[13px] text-primary underline md:self-auto"
          onClick={() => onChange({ ...EMPTY_FILTERS, sort: filters.sort, reverse: filters.reverse })}
        >
          Clear
        </button>
      )}
    </section>
  );
}
