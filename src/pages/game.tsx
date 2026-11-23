import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ExternalLink, Info, Lightbulb, Plus } from "lucide-react";
import { useTitle } from "@/lib/use-title";
import { GameImage } from "@/components/game-image";
import { RatingBadge, RatingBar } from "@/components/rating";
import { ReportCard } from "@/components/report-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { catalog, REPO_URL, reportFormUrl } from "@/data";
import { GRAPHICS_INFO } from "@/lib/graphics";
import { RATINGS } from "@/lib/ratings";
import { summarize } from "@/lib/summary";
import { formatVersion } from "@/lib/versions";
import { NotFoundPage } from "./not-found";

const MAC_VERSION_TIP =
  "This game also has a Mac version, which Steam installs unless told otherwise. To play the Windows version through Hadron, open the game's Properties in Steam, go to Compatibility, and tick “Force the use of a specific Steam Play compatibility tool”.";

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b py-2.5 last:border-b-0 sm:flex-row sm:gap-4">
      <dt className="w-36 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export function GamePage({ kind }: { kind: "steam" | "program" }) {
  const { id } = useParams();
  const entry = catalog.entries.find((e) => (kind === "steam" ? String(e.appId) === id : e.slug === id));
  useTitle(entry ? `${entry.name} · HadronDB` : "Page not found · HadronDB");
  if (!entry) return <NotFoundPage />;

  const summary = summarize(entry.reports);
  const tips = [...(entry.hasMacVersion ? [MAC_VERSION_TIP] : []), ...entry.tips];
  const formUrl = reportFormUrl(entry.name, entry.appId);
  const basisText =
    summary.basis.length === 0
      ? ""
      : summary.latestVersion
        ? `From ${summary.basis.length === 1 ? "the report" : `the ${summary.basis.length} reports`} on ${formatVersion(summary.latestVersion)}, the newest version tried.`
        : `From ${summary.basis.length === 1 ? "one report" : `${summary.basis.length} reports`} that don't name a Hadron version.`;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-16">
      <Link to="/" className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> All games
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="game-title" className="min-w-0">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <GameImage entry={entry} eager className="rounded-xl border sm:w-72 sm:shrink-0" />
            <div className="min-w-0">
              <h1 id="game-title" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                {entry.name}
              </h1>
              <div className="mt-3">
                <RatingBadge rating={summary.rating} size="lg" />
              </div>
              {summary.rating && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {RATINGS[summary.rating].short}. {basisText}
                </p>
              )}
              {!summary.rating && (
                <p className="mt-2 text-sm text-muted-foreground">Nobody has reported on this one yet. Tried it?</p>
              )}
            </div>
          </div>

          {tips.length > 0 && (
            <div className="mt-6 space-y-2">
              {tips.map((t) => (
                <p key={t} className="flex gap-2.5 rounded-lg border bg-accent px-4 py-3 text-sm text-accent-foreground">
                  <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>{t}</span>
                </p>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold tracking-tight">
              Reports <span className="text-muted-foreground">({summary.total})</span>
            </h2>
            <span className="text-sm text-muted-foreground">Newest first</span>
          </div>
          {entry.reports.length > 0 ? (
            <div className="mt-4 space-y-4">
              {entry.reports.map((r) => (
                <ReportCard key={r.id} report={r} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No reports yet.{" "}
              <a className="font-medium text-primary underline" href={formUrl}>
                Be the first
              </a>
              .
            </div>
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start" aria-label="About this game">
          <Card>
            <CardContent>
              <h2 className="mb-3 text-sm font-semibold">Summary</h2>
              <RatingBar counts={summary.counts} total={summary.total} />
              <dl className="mt-3">
                <Fact label="Latest version tried">
                  {summary.latestVersion ? formatVersion(summary.latestVersion) : summary.total ? "Not given" : "None yet"}
                </Fact>
                {summary.lastDate && <Fact label="Latest report">{summary.lastDate}</Fact>}
                <Fact label="Graphics">
                  <ul className="space-y-1">
                    {entry.graphicsApis.map((g) => (
                      <li key={g}>
                        {GRAPHICS_INFO[g].label}
                        {GRAPHICS_INFO[g].path && (
                          <span className="block text-xs text-muted-foreground">through {GRAPHICS_INFO[g].path}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </Fact>
                <Fact label="Architecture">{entry.arch === "unknown" ? "Not known" : entry.arch}</Fact>
                {entry.engine && <Fact label="Engine">{entry.engine}</Fact>}
                {entry.antiCheat && <Fact label="Anti-cheat">{entry.antiCheat}</Fact>}
                {entry.appId !== undefined && <Fact label="Steam app ID">{entry.appId}</Fact>}
                {entry.kind === "program" && <Fact label="Source">Not on Steam: run with Open With Hadron</Fact>}
              </dl>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <a href={formUrl}>
                <Plus aria-hidden /> Add your report
              </a>
            </Button>
            {(entry.storeUrl || entry.website) && (
              <Button asChild variant="outline">
                <a href={entry.storeUrl ?? entry.website}>
                  <ExternalLink aria-hidden /> {entry.storeUrl ? "Steam store page" : "Website"}
                </a>
              </Button>
            )}
            <Button asChild variant="ghost" size="sm">
              <a href={`${REPO_URL}/blob/main/${entry.sourceFile}`}>
                <Info aria-hidden /> This game's data file
              </a>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
