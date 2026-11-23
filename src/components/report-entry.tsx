import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { RatingMark } from "@/components/rating";
import { GRAPHICS_INFO } from "@/lib/graphics";
import type { Report, ReportLink } from "@/lib/schema";
import { formatVersion, parseVersion } from "@/lib/versions";

function Reporter({ reporter }: { reporter: string }) {
  if (reporter === "maintainer") return <>maintainer</>;
  if (reporter === "community") return <span title="Passed on from Discord by someone other than the player">community, relayed</span>;
  return (
    <a className="underline hover:text-foreground" href={`https://github.com/${reporter}`}>
      {reporter}
    </a>
  );
}

function linkLabel(l: ReportLink): string {
  if (l.title) return l.title;
  const m = /\/(issues|pull)\/(\d+)/.exec(l.url);
  if (m) return `${m[1] === "pull" ? "Pull request" : "Issue"} #${m[2]}`;
  if (l.type === "discord") return "Discord thread";
  return new URL(l.url).hostname;
}

function mac(r: Report): string {
  const s = r.system;
  if (!s) return "–";
  return [s.chip, s.ramGB ? `${s.ramGB} GB` : undefined, s.macos ? `macOS ${s.macos}` : undefined].filter(Boolean).join(", ") || "–";
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-x-3 py-0.5 sm:grid-cols-[7.5rem_1fr]">
      <dt className="label pt-[3px]">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

/** One report: a row of facts, then what the reporter said. */
export function ReportEntry({ report }: { report: Report }) {
  const v = parseVersion(report.hadronVersion);
  const graphics = [
    report.graphicsApi && report.graphicsApi !== "unknown" ? GRAPHICS_INFO[report.graphicsApi].label : undefined,
    report.retinaMode === "on" ? "Retina on" : report.retinaMode === "off" ? "Retina off (RetinaMode=n)" : undefined,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <article id={`report-${report.id}`} className="scroll-mt-4 border-b py-4 first:pt-3">
      <h3 className="sr-only">Report from {report.date}</h3>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[13px] sm:grid sm:grid-cols-[6.5rem_8.5rem_minmax(0,1fr)_9.5rem_9rem] sm:gap-x-4">
        <span className="font-mono text-[12px]">
          <time dateTime={report.date}>{report.date}</time>
        </span>
        <span className="font-mono text-[12px]" title={formatVersion(report.hadronVersion)}>
          {v ? (v.dev ? `dev <${v.major}.${v.minor}.${v.patch}` : report.hadronVersion) : "version ?"}
        </span>
        <span className={report.system ? "order-last w-full text-muted-foreground sm:order-none sm:w-auto" : "hidden text-muted-foreground sm:inline"} title={report.system?.model}>
          {report.system?.model ? `${report.system.model}, ` : ""}
          {mac(report)}
        </span>
        <RatingMark rating={report.rating} className="font-medium" />
        <span className="text-muted-foreground sm:text-right">
          <span className="sm:hidden">by </span>
          <Reporter reporter={report.reporter} />
        </span>
      </div>
      <div className="mt-2 max-w-[75ch] space-y-2 text-[14px] leading-relaxed">
        {report.notes && <p>{report.notes}</p>}
        {report.issues && report.issues.length > 0 && (
          <ul className="list-[square] space-y-0.5 pl-5 marker:text-muted-foreground">
            {report.issues.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        )}
        {(report.followUp || graphics || report.performance || report.gameSettings || report.launchOptions || report.links?.length) && (
          <dl className="pt-1 text-[13px]">
            {report.followUp && <Field label="Next">{report.followUp}</Field>}
            {report.performance && <Field label="Frame rate">{report.performance}</Field>}
            {report.gameSettings && <Field label="Settings">{report.gameSettings}</Field>}
            {report.launchOptions && (
              <Field label="Launch">
                <code className="font-mono text-[12px]">{report.launchOptions}</code>
              </Field>
            )}
            {graphics && <Field label="Graphics">{graphics}</Field>}
            {report.links && report.links.length > 0 && (
              <Field label="Links">
                {report.links.map((l, i) => (
                  <span key={l.url + i}>
                    {i > 0 && <span className="text-muted-foreground"> · </span>}
                    <a href={l.url} className="inline-flex items-center gap-0.5 text-primary hover:underline">
                      {linkLabel(l)}
                      <ExternalLink className="size-3" aria-label="(external)" />
                    </a>
                  </span>
                ))}
              </Field>
            )}
          </dl>
        )}
      </div>
    </article>
  );
}
