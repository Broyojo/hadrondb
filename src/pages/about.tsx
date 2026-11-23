import { Link } from "react-router";
import { DISCORD_URL, HADRON_URL, REPO_URL } from "@/data";
import { useTitle } from "@/lib/use-title";
import wordmarkLight from "@/assets/hadron-wordmark-light.svg";
import wordmarkDark from "@/assets/hadron-wordmark-dark.svg";

const STACK = [
  ["x86 code", "FEX, inside Wine (ARM64EC and WoW64)"],
  ["Windows API", "Wine, built for arm64"],
  ["Direct3D 9", "mtld3d, to Metal"],
  ["Direct3D 10, 11", "DXMT, to Metal"],
  ["Direct3D 12", "vkd3d-proton on KosmicKrisp"],
  ["Vulkan", "KosmicKrisp, Mesa's Vulkan driver on Metal"],
  ["OpenGL", "Zink on KosmicKrisp"],
];

export function AboutPage() {
  useTitle("About · HadronDB");
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-12">
      <article className="doc">
        <h1>About</h1>
        <p>
          HadronDB records how Windows games and programs run on Apple silicon Macs with Hadron: what to expect before you
          install a game, and what Hadron's developers should fix next.
        </p>

        <h2>Hadron</h2>
        <p className="my-4">
          <img src={wordmarkLight} alt="Hadron" width={168} height={42} className="h-[42px] w-auto dark:hidden" />
          <img src={wordmarkDark} alt="Hadron" width={168} height={42} className="hidden h-[42px] w-auto dark:block" />
        </p>
        <p>
          <a href={HADRON_URL}>Hadron</a> is an open-source compatibility tool: the native Mac Steam client installs and plays
          Windows games through it, as Steam on Linux does through Proton. Nothing runs under Rosetta.
        </p>
        <table className="my-4 w-full border-collapse text-[14px]">
          <caption className="sr-only">What runs each part of a Windows game under Hadron</caption>
          <thead>
            <tr className="border-b border-rule">
              <th scope="col" className="label py-1 pr-4 text-left font-medium">
                The game uses
              </th>
              <th scope="col" className="label py-1 text-left font-medium">
                Hadron runs it on
              </th>
            </tr>
          </thead>
          <tbody>
            {STACK.map(([a, b]) => (
              <tr key={a} className="border-b">
                <td className="py-1.5 pr-4">{a}</td>
                <td className="py-1.5 text-muted-foreground">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Programs that aren't on Steam run with <strong>Open With</strong>, <strong>Hadron</strong> on the <code>.exe</code>,
          or <code>hadron run program.exe</code>.
        </p>
        <p>
          It needs an Apple silicon Mac with macOS 27 and Steam for Mac. Install with{" "}
          <code>brew install --cask broyojo/hadron/hadron</code> or from the{" "}
          <a href={`${HADRON_URL}/releases/latest`}>latest release</a>; the <a href={`${HADRON_URL}#install`}>README</a> covers
          setup. Hadron is early: a handful of games play well, many don't start, and games with kernel-level anti-cheat aren't
          expected to work. Questions go to the <a href={DISCORD_URL}>Discord</a> or{" "}
          <a href={`${HADRON_URL}/discussions`}>Discussions</a>, bugs to <a href={`${HADRON_URL}/issues`}>Hadron's issues</a>.
        </p>

        <h2 id="summary">How a game is rated</h2>
        <p>
          The rating at the top of a game's page comes only from reports on the newest Hadron version anyone has tried it on,
          because Hadron changes fast. With several, it is their middle rating; with an even number, the lower of the two middle
          ones. With a chip or version filter on, the list rates each game from the matching reports only.
        </p>
        <p>
          A development build is Hadron built from its main branch between releases; "&lt;0.3.0" in the table means a
          development build before 0.3.0.
        </p>

        <h2>Sources</h2>
        <p>
          The first reports come from Hadron's <a href={`${HADRON_URL}/blob/main/docs/test-games.md`}>test games</a> and issue
          tracker, written up by its maintainer, and from players on the Discord. "Community, relayed" marks a report passed on
          by someone other than the player. New reports come through the <Link to="/report">report form</Link>. Each game is
          one JSON file in the <a href={`${REPO_URL}/tree/main/data`}>repository</a>; corrections are welcome as pull requests.
        </p>

        <h2>Not affiliated</h2>
        <p>
          HadronDB and Hadron are unofficial, and not affiliated with or endorsed by Valve, Steam, Apple, or the projects Hadron
          builds on. Steam is a trademark of Valve Corporation. Game names and images belong to their owners.
        </p>

        <h2>Privacy</h2>
        <p>
          No analytics, cookies or trackers. Fonts are served from this site. Game images load from Steam's image servers
          without a referrer. Your theme choice stays in your browser.
        </p>

        <h2 id="license">Licences</h2>
        <ul>
          <li>
            Data (<code>data/</code>): <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>, credit "HadronDB
            contributors".
          </li>
          <li>
            Code: <a href={`${REPO_URL}/blob/main/LICENSE`}>MIT</a>, © HadronDB contributors.
          </li>
          <li>The Hadron logo belongs to the Hadron project, used here by the same owner.</li>
          <li>Type: IBM Plex Sans and IBM Plex Mono, SIL Open Font License.</li>
        </ul>
      </article>
    </div>
  );
}
