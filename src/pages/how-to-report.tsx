import { Link } from "react-router";
import { useTitle } from "@/lib/use-title";
import { RatingBadge } from "@/components/rating";
import { Button } from "@/components/ui/button";
import { HADRON_URL, REPORT_FORM_URL } from "@/data";
import { RATING_LIST } from "@/lib/ratings";

export function HowToReportPage() {
  useTitle("How to report a game · HadronDB");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">How to report a game</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        A report says how one game ran on one Mac with one version of Hadron. Reports are sent with a form on GitHub, so you
        need a GitHub account.
      </p>
      <Button asChild size="lg" className="mt-6">
        <a href={REPORT_FORM_URL}>Open the report form</a>
      </Button>

      <div className="prose-page">
        <h2>What happens to a report</h2>
        <ol>
          <li>You fill in the form. It opens an issue in the HadronDB repository, labelled <code>report</code>.</li>
          <li>
            A maintainer reads it, and may ask a question. When it is ready, they add the label <code>accepted</code>.
          </li>
          <li>
            A bot reads the form's answers, checks them, and opens a pull request that adds the report to the game's data
            file. If something can't be read (a version that isn't one, say), it comments on the issue with what to fix.
          </li>
          <li>
            Once the pull request is merged, the report appears here, credited to your GitHub user name, and the issue is
            closed.
          </li>
        </ol>

        <h2 id="ratings">The ratings</h2>
        <p>Pick the one that fits best. When in doubt between two, pick the lower one and say why in the notes.</p>
      </div>
      <ul className="mt-4 space-y-3">
        {RATING_LIST.map((r) => (
          <li key={r.id} className="rounded-xl border bg-card p-4">
            <RatingBadge rating={r.id} />
            <p className="mt-2 text-sm leading-relaxed">{r.description}</p>
          </li>
        ))}
      </ul>

      <div className="prose-page">
        <h2>What a good report includes</h2>
        <ul>
          <li>
            <strong>The Hadron version.</strong> <code>hadron status</code> prints it, and so does Hadron's window. Hadron changes
            quickly, so a result is only useful with its version.
          </li>
          <li>
            <strong>Your Mac:</strong> the model, the chip, the memory and the macOS version, from Apple menu &gt; About This Mac.
          </li>
          <li>
            <strong>How far you got and for how long.</strong> "Played the first two chapters, about three hours" says much
            more than "works".
          </li>
          <li>
            <strong>The frame rate and how it felt,</strong> with the in-game settings: resolution, quality, window mode. The
            Metal performance HUD shows the frame rate.
          </li>
          <li>
            <strong>Anything you changed:</strong> Steam launch options (on the Mac they are plain <code>NAME=value</code>{" "}
            words, without <code>%command%</code>), lines in Hadron's <code>games.conf</code>, or Retina mode turned off.
          </li>
          <li>
            <strong>Each problem on its own line,</strong> as precisely as you can: "the intro video is black, the menu is fine"
            rather than "graphics broken".
          </li>
          <li>
            <strong>Links</strong> to a Hadron issue or a Discord thread about the game, if there is one.
          </li>
        </ul>

        <h3>Finding the details</h3>
        <ul>
          <li>
            The <strong>Steam app ID</strong> is the number in the game's store address: store.steampowered.com/app/
            <strong>620</strong>/ is Portal 2. Leave it empty for a program that isn't on Steam.
          </li>
          <li>
            The <strong>graphics API</strong> (Direct3D 9, 11, 12, Vulkan, OpenGL) is often on the store page or on PCGamingWiki.
            If you don't know, say so.
          </li>
        </ul>

        <h2 id="privacy">Leave out personal details</h2>
        <p>
          Reports are public, and they stay in the repository's history. Don't put in your real name, e-mail address, Steam
          account name, serial numbers, or file paths that contain your user name.
        </p>
        <p>
          HadronDB keeps only the text of the form; it doesn't need logs. If the game fails and you want it looked at, open an
          issue in{" "}
          <a href={`${HADRON_URL}/issues`}>Hadron's own repository</a> with a report file: choose <strong>Save a report</strong>{" "}
          in Hadron, or run <code>hadron report</code>. That zip takes your home folder's path, your user name and your Steam
          account out of the logs. It does so by pattern, so look through it before you attach it. Hadron never sends
          anything by itself.
        </p>

        <h2>Licence</h2>
        <p>
          By sending a report you agree to it being published under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>, like the rest of HadronDB's data. See{" "}
          <Link to="/about#license">About</Link>.
        </p>
      </div>
    </div>
  );
}
