import { Link } from "react-router";
import { useTitle } from "@/lib/use-title";
import { DISCORD_URL, HADRON_URL, REPO_URL } from "@/data";
import wordmarkLight from "@/assets/hadron-wordmark-light.svg";
import wordmarkDark from "@/assets/hadron-wordmark-dark.svg";

const STACK = [
  ["x86 code", "FEX, inside Wine (ARM64EC and WoW64)"],
  ["Windows API", "Wine, built natively for arm64"],
  ["Direct3D 9", "mtld3d, straight to Metal"],
  ["Direct3D 10 and 11", "DXMT, straight to Metal"],
  ["Direct3D 12", "vkd3d-proton on KosmicKrisp"],
  ["Vulkan", "KosmicKrisp, Mesa's Vulkan driver on Metal"],
  ["OpenGL", "Zink on KosmicKrisp"],
];

export function AboutPage() {
  useTitle("About · HadronDB");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">About HadronDB</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        HadronDB collects reports on how Windows games and programs run on Apple silicon Macs with Hadron, so that you can see
        what to expect before you install a game, and so that Hadron's developers can see what to fix next.
      </p>

      <div className="prose-page">
        <h2>What Hadron is</h2>
        <div className="my-6 flex justify-start">
          <img src={wordmarkLight} alt="Hadron" width={280} height={70} className="h-14 w-auto dark:hidden" />
          <img src={wordmarkDark} alt="Hadron" width={280} height={70} className="hidden h-14 w-auto dark:block" />
        </div>
        <p>
          <a href={HADRON_URL}>Hadron</a> is an open-source compatibility tool that lets the native Mac Steam client install and
          play Windows games on Apple silicon, as Proton does for Steam on Linux. Nothing runs under Rosetta: Wine is built for
          arm64, FEX translates the game's x86 code, and the game's graphics are translated to Metal.
        </p>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <caption className="sr-only">What runs each part of a Windows game under Hadron</caption>
          <thead className="bg-muted text-left">
            <tr>
              <th scope="col" className="px-4 py-2 font-semibold">
                The game uses
              </th>
              <th scope="col" className="px-4 py-2 font-semibold">
                Hadron runs it with
              </th>
            </tr>
          </thead>
          <tbody>
            {STACK.map(([a, b]) => (
              <tr key={a} className="border-t bg-card">
                <td className="px-4 py-2 font-medium">{a}</td>
                <td className="px-4 py-2 text-muted-foreground">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="prose-page">
        <p>
          Windows programs that aren't on Steam run too: right-click the <code>.exe</code> and choose <strong>Open With</strong>,{" "}
          <strong>Hadron</strong>, or run <code>hadron run program.exe</code>.
        </p>
        <p>
          To install it you need an Apple silicon Mac with macOS 27 and Steam for Mac. With Homebrew:{" "}
          <code>brew install --cask broyojo/hadron/hadron</code>, or download it from the{" "}
          <a href={`${HADRON_URL}/releases/latest`}>latest release</a>. Hadron's{" "}
          <a href={`${HADRON_URL}#install`}>README</a> walks through setting up Steam, games that also have a Mac version, and
          updating. Hadron is early: a handful of games play well and many don't start yet. Games with kernel-level anti-cheat
          aren't expected to work.
        </p>
        <p>
          Questions go to Hadron's <a href={DISCORD_URL}>Discord</a> or its{" "}
          <a href={`${HADRON_URL}/discussions`}>Discussions</a>; bugs to its <a href={`${HADRON_URL}/issues`}>issues</a>.
        </p>

        <h2 id="summary">How a game's rating is worked out</h2>
        <p>
          Hadron changes fast, and a result from an old version says little about the current one. So the rating at the top of a
          game's page comes only from the reports on the newest Hadron version anyone has tried the game on. When there are
          several, it is their middle rating; with an even number, the lower of the two middle ones. Every report stays listed
          below it, newest first. The filters for chip and version work the same way: with a filter on, a game is rated from
          the matching reports only.
        </p>
        <p>
          A <em>development build</em> is Hadron built from its main branch between releases; "development build before 0.3.0"
          sorts just below 0.3.0.
        </p>

        <h2>Where the data comes from</h2>
        <p>
          The first reports come from Hadron's own{" "}
          <a href={`${HADRON_URL}/blob/main/docs/test-games.md`}>test games</a> and its issue tracker, written up by Hadron's
          maintainer, and from players on Hadron's Discord. A report credited to "community, relayed" was passed on by someone
          other than the player. New reports come through the <Link to="/report">report form</Link>. Every game is one JSON
          file in the <a href={`${REPO_URL}/tree/main/data`}>repository</a>, so corrections are welcome as pull requests.
        </p>

        <h2>Not affiliated</h2>
        <p>
          HadronDB and Hadron are unofficial. They are not affiliated with or endorsed by Valve, Steam, Apple, or any of the
          projects Hadron is built on. Steam is a trademark of Valve Corporation; game names and images belong to their
          owners.
        </p>

        <h2>Privacy</h2>
        <p>
          The site has no analytics, no cookies and no trackers, and loads no fonts or scripts from elsewhere. Game header images
          load from Steam's image servers, without a referrer. Your theme choice is kept in your own browser.
        </p>

        <h2 id="license">Licences</h2>
        <ul>
          <li>
            The data (everything in <code>data/</code>) is under{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>: reuse it, with credit to the HadronDB
            contributors.
          </li>
          <li>
            The site's code is under the <a href={`${REPO_URL}/blob/main/LICENSE`}>MIT licence</a>.
          </li>
          <li>The Hadron logo is the Hadron project's, used here by the same owner.</li>
        </ul>
      </div>
    </div>
  );
}
