import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowRight } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { FilterBar } from "@/components/filters";
import { useTitle } from "@/lib/use-title";
import { Button } from "@/components/ui/button";
import { catalog, REPORT_FORM_URL } from "@/data";
import { applyFilters, filtersFromParams, filtersToParams, type Filters } from "@/lib/filters";
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

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <section className="py-10 sm:py-14">
        <p className="mb-3 text-sm font-medium text-primary">Community compatibility reports</p>
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          How Windows games run on your Mac with Hadron
        </h1>
        <p className="mt-4 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
          Hadron plays Windows games from the Mac Steam client on Apple silicon. HadronDB collects what players find:{" "}
          {catalog.entries.length} games and programs, {reports} reports so far.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <a href={REPORT_FORM_URL}>Report a game</a>
          </Button>
          <Button asChild variant="outline">
            <Link to="/about">
              What is Hadron? <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <FilterBar filters={filters} onChange={onChange} versions={versions} resultCount={rows.length} />

      {rows.length > 0 ? (
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Games">
          {rows.map((row) => (
            <GameCard key={row.entry.key} row={row} />
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed p-10 text-center">
          <p className="font-medium">No games match.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tried one that isn't here?{" "}
            <a className="font-medium text-primary underline" href={REPORT_FORM_URL}>
              Add a report
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
