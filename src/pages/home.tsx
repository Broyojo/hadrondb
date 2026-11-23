import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { FilterBar } from "@/components/filters";
import { GameTable } from "@/components/game-table";
import { catalog, HADRON_URL, REPORT_FORM_URL } from "@/data";
import { applyFilters, filtersFromParams, filtersToParams, type Filters, type Sort } from "@/lib/filters";
import { useTitle } from "@/lib/use-title";
import { compareVersions, isRelease } from "@/lib/versions";

export function HomePage() {
  useTitle("HadronDB: Windows games on Apple silicon Macs");
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params);
  const rows = useMemo(() => applyFilters(catalog.entries, filters), [filters]);
  const versions = useMemo(() => {
    const all = new Set(catalog.entries.flatMap((e) => e.reports.map((r) => r.hadronVersion)).filter(isRelease));
    return [...all].sort(compareVersions).reverse();
  }, []);
  const reports = catalog.entries.reduce((n, e) => n + e.reports.length, 0);
  const onChange = (f: Filters) => setParams(filtersToParams(f), { replace: true, preventScrollReset: true });
  const onSort = (sort: Sort) =>
    onChange({ ...filters, sort, reverse: filters.sort === sort ? !filters.reverse : false });

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-4 pb-12">
      <h1 className="sr-only">Games</h1>
      <p className="mb-3 text-[13px] text-muted-foreground">
        <span className="font-mono text-foreground">{catalog.entries.length}</span> games ·{" "}
        <span className="font-mono text-foreground">{reports}</span> reports.{" "}
        <a className="underline hover:text-foreground" href={HADRON_URL}>
          Hadron
        </a>{" "}
        runs Windows games from the Mac Steam client on Apple silicon.
      </p>
      <FilterBar filters={filters} onChange={onChange} versions={versions} />
      <p className="mt-2 min-h-5 text-[12px] text-muted-foreground" role="status" aria-live="polite">
        {rows.length === catalog.entries.length
          ? ""
          : `${rows.length} of ${catalog.entries.length} games${filters.chip || filters.version ? ", rated from the matching reports" : ""}`}
      </p>
      {rows.length > 0 ? (
        <GameTable rows={rows} filters={filters} onSort={onSort} />
      ) : (
        <p className="border-t border-rule py-6 text-muted-foreground">
          No game matches. Tried one that isn't here?{" "}
          <a className="text-primary underline" href={REPORT_FORM_URL}>
            Add a report
          </a>
          .
        </p>
      )}
    </div>
  );
}
