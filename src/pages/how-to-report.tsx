import { Link } from "react-router";
import { Swatch } from "@/components/rating";
import { HADRON_URL, REPORT_FORM_URL } from "@/data";
import { RATING_LIST } from "@/lib/ratings";
import { useTitle } from "@/lib/use-title";

export function HowToReportPage() {
  useTitle("How to report a game · HadronDB");
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-12">
      <article className="doc">
        <h1>How to report a game</h1>
        <p>
          A report says how one game ran on one Mac with one version of Hadron. Reports are sent with the{" "}
          <a href={REPORT_FORM_URL}>report form</a> on GitHub, so you need a GitHub account.
        </p>

        <h2>What happens to it</h2>
        <ol>
          <li>The form opens an issue labelled <code>report</code>.</li>
          <li>A maintainer reads it, may ask a question, and labels it <code>accepted</code>.</li>
          <li>
            A bot checks the answers and opens a pull request adding the report to the game's data file. If an answer can't be
            read, it comments on the issue with what to fix.
          </li>
          <li>When the pull request is merged, the report appears here under your GitHub user name.</li>
        </ol>

        <h2 id="ratings">Ratings</h2>
        <p>Pick the one that fits. Between two, pick the lower and say why.</p>
        <dl className="border-t">
          {RATING_LIST.map((r) => (
            <div key={r.id} className="grid gap-1 border-b py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <dt className="flex items-baseline gap-2 font-semibold">
                <Swatch rating={r.id} className="translate-y-[1px]" />
                {r.label}
              </dt>
              <dd className="text-[14px]">{r.description}</dd>
            </div>
          ))}
        </dl>

        <h2>What to include</h2>
        <ul>
          <li>
            <strong>Hadron version.</strong> <code>hadron status</code> prints it. A result is only useful with its version.
          </li>
          <li>
            <strong>Mac:</strong> model, chip, memory and macOS version (Apple menu, About This Mac).
          </li>
          <li>
            <strong>How far you got, and for how long.</strong> "First two chapters, about three hours" rather than "works".
          </li>
          <li>
            <strong>Frame rate and settings:</strong> resolution, quality, window mode. The Metal performance HUD shows the
            frame rate.
          </li>
          <li>
            <strong>Anything you changed:</strong> Steam launch options (plain <code>NAME=value</code> words on the Mac, no{" "}
            <code>%command%</code>), lines in <code>games.conf</code>, Retina mode turned off.
          </li>
          <li>
            <strong>Each problem on its own line</strong>, precisely: "intro video is black, menu is fine".
          </li>
          <li>
            <strong>Links</strong> to a Hadron issue or Discord thread about the game.
          </li>
        </ul>
        <p>
          The Steam app ID is the number in the store address: store.steampowered.com/app/<strong>620</strong>/ is Portal 2.
          Leave it empty for a program that isn't on Steam. The graphics API is often on the store page or PCGamingWiki.
        </p>

        <h2 id="privacy">Personal details</h2>
        <p>
          Reports are public and stay in the repository's history. Leave out your real name, e-mail address, Steam account
          name, serial numbers, and file paths containing your user name.
        </p>
        <p>
          HadronDB keeps only the form's text, not logs. To have a failure looked at, open an issue in{" "}
          <a href={`${HADRON_URL}/issues`}>Hadron's repository</a> with a report file from <strong>Save a report</strong> in
          Hadron (or <code>hadron report</code>). That zip removes your home folder path, user name and Steam account from the
          logs, by pattern, so look through it before attaching it.
        </p>

        <h2>Licence</h2>
        <p>
          Reports are published under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>, like the rest of
          the data (<Link to="/about#license">About</Link>).
        </p>
      </article>
    </div>
  );
}
