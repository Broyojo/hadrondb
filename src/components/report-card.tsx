import type { ReactNode } from "react";
import { Calendar, Cpu, ExternalLink, Gauge, MessageCircle, SlidersHorizontal, User, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RatingBadge } from "@/components/rating";
import { GRAPHICS_INFO } from "@/lib/graphics";
import type { Report, ReportLink } from "@/lib/schema";
import { formatVersion, parseVersion } from "@/lib/versions";

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function Reporter({ reporter }: { reporter: string }) {
  if (reporter === "maintainer") return <>Hadron's maintainer</>;
  if (reporter === "community") return <>Community, relayed</>;
  return (
    <a className="underline hover:text-foreground" href={`https://github.com/${reporter}`}>
      @{reporter}
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

function systemText(r: Report): string | undefined {
  const s = r.system;
  if (!s) return undefined;
  return [s.model, s.chip, s.ramGB ? `${s.ramGB} GB` : undefined, s.macos ? `macOS ${s.macos}` : undefined]
    .filter(Boolean)
    .join(" · ");
}

function Detail({ icon: Icon, label, children }: { icon: typeof Cpu; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="text-sm break-words">{children}</dd>
      </div>
    </div>
  );
}

export function ReportCard({ report }: { report: Report }) {
  const system = systemText(report);
  const version = parseVersion(report.hadronVersion);
  return (
    <Card id={`report-${report.id}`} className="scroll-mt-20">
      <article aria-labelledby={`report-${report.id}-title`}>
        <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-5 py-4">
          <h3 id={`report-${report.id}-title`} className="sr-only">
            Report from {formatDate(report.date)}
          </h3>
          <RatingBadge rating={report.rating} />
          <Badge variant="secondary" title={version?.dev ? `Built from Hadron's main branch (${report.hadronVersion})` : undefined}>
            {formatVersion(report.hadronVersion)}
          </Badge>
          <span className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" aria-hidden />
              <time dateTime={report.date}>{formatDate(report.date)}</time>
            </span>
            <span className="flex items-center gap-1">
              <User className="size-3.5" aria-hidden />
              <Reporter reporter={report.reporter} />
            </span>
          </span>
        </header>
        <div className="space-y-4 px-5 py-4">
          {report.notes && <p className="leading-relaxed">{report.notes}</p>}
          {report.issues && report.issues.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-sm font-semibold">Issues</h4>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
                {report.issues.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          )}
          {report.followUp && (
            <p className="rounded-lg border-l-4 border-primary bg-accent px-3 py-2 text-sm text-accent-foreground">
              <span className="font-semibold">What's next: </span>
              {report.followUp}
            </p>
          )}
          <dl className="grid gap-3 sm:grid-cols-2">
            {system && (
              <Detail icon={Cpu} label="Mac">
                {system}
              </Detail>
            )}
            {(report.graphicsApi || report.retinaMode) && (
              <Detail icon={Gauge} label="Graphics">
                {[
                  report.graphicsApi && report.graphicsApi !== "unknown" ? GRAPHICS_INFO[report.graphicsApi].label : undefined,
                  report.retinaMode === "on" ? "Retina mode on" : report.retinaMode === "off" ? "Retina mode off (RetinaMode=n)" : undefined,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Detail>
            )}
            {report.performance && (
              <Detail icon={Gauge} label="Frame rate">
                {report.performance}
              </Detail>
            )}
            {report.gameSettings && (
              <Detail icon={SlidersHorizontal} label="In-game settings">
                {report.gameSettings}
              </Detail>
            )}
            {report.launchOptions && (
              <Detail icon={Wrench} label="Launch options and settings">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">{report.launchOptions}</code>
              </Detail>
            )}
          </dl>
          {report.links && report.links.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-1">
              {report.links.map((l) => (
                <li key={l.url + (l.title ?? "")}>
                  <a
                    href={l.url}
                    className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    {l.type === "discord" ? <MessageCircle className="size-3.5" aria-hidden /> : <ExternalLink className="size-3.5" aria-hidden />}
                    {linkLabel(l)}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </Card>
  );
}
