import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import { ExternalLink } from "lucide-react";
import { GameArt } from "@/components/game-image";
import { RatingBar, RatingMark } from "@/components/rating";
import { ReportEntry } from "@/components/report-entry";
import { Button } from "@/components/ui/button";
import { catalog, REPO_URL, reportFormUrl } from "@/data";
import { GRAPHICS_INFO } from "@/lib/graphics";
import { summarize } from "@/lib/summary";
import { useTitle } from "@/lib/use-title";
import { formatVersion } from "@/lib/versions";
import { NotFoundPage } from "./not-found";

const MAC_VERSION_NOTE =
  "Has a Mac version, which Steam installs unless told otherwise. For the Windows version through Hadron: the game's Properties in Steam, Compatibility, tick “Force the use of a specific Steam Play compatibility tool”.";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <tr className="border-b">
      <th scope="row" className="label w-28 py-2 pr-3 text-left align-top font-medium sm:w-40 sm:pr-4">
        {label}
      </th>
      <td className="py-1.5 align-top">{children}</td>
    </tr>
  );
}

export function GamePage({ kind }: { kind: "steam" | "program" }) {
  const { id } = useParams();
  const entry = catalog.entries.find((e) => (kind === "steam" ? String(e.appId) === id : e.slug === id));
  useTitle(entry ? `${entry.name} · HadronDB` : "Page not found · HadronDB");
  if (!entry) return <NotFoundPage />;

  const summary = summarize(entry.reports);
  const notes = [...(entry.hasMacVersion ? [MAC_VERSION_NOTE] : []), ...entry.tips];
  const formUrl = reportFormUrl(entry.name, entry.appId);
  const basis =
    summary.basis.length === 0
      ? ""
      : summary.latestVersion
        ? `From ${summary.basis.length === 1 ? "the report" : `the ${summary.basis.length} reports`} on ${summary.latestVersion}, the newest version tried.`
        : `From ${summary.basis.length === 1 ? "one report" : `${summary.basis.length} reports`} without a Hadron version.`;

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-3 pb-12">
      <p className="text-[12px] text-muted-foreground">
        <Link to="/" className="hover:text-foreground hover:underline">
          Games
        </Link>{" "}
        / {entry.kind === "steam" ? <span className="font-mono">{entry.appId}</span> : "not on Steam"}
      </p>

      <header className="mt-2 flex flex-col gap-3 border-b border-rule pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[22px] leading-tight font-semibold tracking-tight">{entry.name}</h1>
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <RatingMark rating={summary.rating} full className="text-[15px] font-semibold [&>span:first-child]:size-3" />
            {basis && <span className="text-[13px] text-muted-foreground">{basis}</span>}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-[13px]">
          {(entry.storeUrl || entry.website) && (
            <a href={entry.storeUrl ?? entry.website} className="inline-flex items-center gap-1 text-primary hover:underline">
              {entry.storeUrl ? "Steam store" : "Website"}
              <ExternalLink className="size-3" aria-label="(external)" />
            </a>
          )}
          <Button asChild variant="outline">
            <a href={formUrl}>Add a report</a>
          </Button>
        </div>
      </header>

      <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
        <table className="w-full border-collapse self-start text-[13px]">
          <caption className="sr-only">About {entry.name}</caption>
          <tbody>
            {entry.appId !== undefined && (
              <Row label="Steam app ID">
                <span className="font-mono">{entry.appId}</span>
              </Row>
            )}
            {entry.kind === "program" && <Row label="Source">Not on Steam; run with Open With Hadron or hadron run</Row>}
            <Row label="Graphics">
              {entry.graphicsApis.map((g) => (
                <div key={g}>
                  {GRAPHICS_INFO[g].label}
                  {GRAPHICS_INFO[g].path && <span className="text-muted-foreground"> → {GRAPHICS_INFO[g].path}</span>}
                </div>
              ))}
            </Row>
            <Row label="Architecture">{entry.arch === "unknown" ? <span className="text-muted-foreground">not known</span> : entry.arch}</Row>
            {entry.engine && <Row label="Engine">{entry.engine}</Row>}
            {entry.antiCheat && <Row label="Anti-cheat">{entry.antiCheat}</Row>}
            <Row label="Latest version">
              {summary.latestVersion ? (
                <span className="font-mono">{summary.latestVersion}</span>
              ) : (
                <span className="text-muted-foreground">{summary.total ? "not given" : "none yet"}</span>
              )}
              {summary.latestVersion?.endsWith("-dev") && (
                <span className="text-muted-foreground"> ({formatVersion(summary.latestVersion).toLowerCase()})</span>
              )}
            </Row>
            <Row label="Last report">
              <span className="font-mono">{summary.lastDate ?? "–"}</span>
            </Row>
            <Row label="Reports">
              <RatingBar counts={summary.counts} total={summary.total} />
            </Row>
            {notes.length > 0 && (
              <Row label="Notes">
                {notes.map((n) => (
                  <p key={n} className="max-w-[75ch] py-0.5">
                    {n}
                  </p>
                ))}
              </Row>
            )}
          </tbody>
        </table>
        <div className="hidden md:block">
          <GameArt entry={entry} variant="header" className="w-full border" />
          <p className="mt-1.5 text-[12px] text-muted-foreground">
            <a className="hover:text-foreground hover:underline" href={`${REPO_URL}/blob/main/${entry.sourceFile}`}>
              {entry.sourceFile}
            </a>
          </p>
        </div>
      </div>

      <section aria-labelledby="reports" className="mt-8">
        <h2 id="reports" className="flex items-baseline justify-between border-b border-rule pb-1">
          <span className="text-[15px] font-semibold">
            Reports <span className="font-mono text-[13px] font-normal text-muted-foreground">{summary.total}</span>
          </span>
          <span className="text-[12px] text-muted-foreground">newest first</span>
        </h2>
        {entry.reports.length > 0 ? (
          <div className="hidden grid-cols-[6.5rem_8.5rem_minmax(0,1fr)_9.5rem_9rem] gap-x-4 border-b py-1.5 sm:grid">
            {["Date", "Hadron", "Mac", "Rating", "Reporter"].map((h, i) => (
              <span key={h} className={i === 4 ? "label text-right" : "label"}>
                {h}
              </span>
            ))}
          </div>
        ) : null}
        {entry.reports.map((r) => (
          <ReportEntry key={r.id} report={r} />
        ))}
        {entry.reports.length === 0 && (
          <p className="py-4 text-muted-foreground">
            No reports yet.{" "}
            <a className="text-primary underline" href={formUrl}>
              Add the first
            </a>
            .
          </p>
        )}
      </section>
    </div>
  );
}
