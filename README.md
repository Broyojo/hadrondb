# HadronDB

A community compatibility database for [Hadron](https://github.com/Broyojo/hadron), the
open-source tool that lets the Mac Steam client play Windows games on Apple silicon. It is a
static site, built from JSON files in this repository, published at
[hadrondb.com](https://hadrondb.com).

HadronDB is not affiliated with Valve, Steam or Apple.

## The data

Every game is one file:

- `data/games/<steam app id>.json` for Steam games, e.g. `data/games/620.json`;
- `data/programs/<slug>.json` for programs that aren't on Steam (run with Open With Hadron or
  `hadron run`), e.g. `data/programs/unvanquished.json`.

A file holds the game's details (name, graphics APIs with the default first, 32 or 64-bit,
engine, anti-cheat, tips) and its `reports`. A report has an `id` unique in the file, a
`rating`, the `date` it was tried, the `hadronVersion`, the `reporter`, and optionally the Mac
(`system`: model, chip, memory, macOS), the graphics API used, Retina mode, launch options,
in-game settings, frame rate, issues, notes, what happens next (`followUp`) and links.

The schema is [`src/lib/schema.ts`](src/lib/schema.ts) (zod). `pnpm schema` writes it out as
JSON Schema to [`schema/`](schema/), and each data file names it in `$schema`, so editors
check files as you type.

**Ratings**, best first (ids in the files, labels on the site; definitions in
[`src/lib/ratings.ts`](src/lib/ratings.ts)):

| id | Label | Meaning |
|---|---|---|
| `perfect` | Runs perfectly | Plays as it does on Windows, nothing to work around |
| `well` | Runs well | Plays well; small issues, if any, that don't get in the way |
| `issues` | Playable with issues | Playable, but with issues you will notice |
| `unplayable` | Starts but unplayable | Starts, maybe reaches the menu, but can't be played |
| `broken` | Doesn't run | Doesn't start, or never gets to its menu |

A game's headline rating comes from the reports on the newest Hadron version anyone tried it
on: their middle rating, the worse of the two middle ones for an even count.

**Versions** are a release (`0.3.3`), a development build on the way to a release
(`0.3.0-dev`: built from main after 0.2.x, before 0.3.0), or `unknown`.

**Reporters** are a GitHub user name, `maintainer` (Hadron's maintainer), or `community` (a
report passed on from Discord by someone other than the player).

The first reports come from Hadron's
[docs/test-games.md](https://github.com/Broyojo/hadron/blob/main/docs/test-games.md) and git
history (dated from when each result was written down), and from reports on Hadron's issue
tracker and Discord.

Every file must be formatted as `JSON.stringify(data, null, 2)` plus a newline;
`pnpm validate` checks that and the schema.

## How reports get in

1. Someone fills in the **Game report** issue form
   ([`.github/ISSUE_TEMPLATE/game-report.yml`](.github/ISSUE_TEMPLATE/game-report.yml)). The
   issue gets the `report` label.
2. A maintainer reads it, asks questions if needed, and adds the label **`accepted`**.
3. [`.github/workflows/accept-report.yml`](.github/workflows/accept-report.yml) runs
   [`scripts/accept-report.ts`](scripts/accept-report.ts). It parses the form's answers
   ([`src/lib/report-form.ts`](src/lib/report-form.ts)), checks them against the schema, asks
   Steam's store for the app ID's name, and adds the report (id `issue-<number>`) to the
   game's file, starting the file if the game is new. It validates all data, pushes the branch
   `report/issue-<number>`, opens a pull request that closes the issue, and comments the link on
   the issue.
4. If the answers can't be used, it comments what to fix and removes `accepted`. After the
   reporter edits the issue, add the label again. Accepting the same issue again replaces its
   report.
5. Review the pull request (for a new game, check the graphics API, 32/64-bit and engine) and
   merge it. The site redeploys.

The workflow uses only `GITHUB_TOKEN`, with `contents: write`, `pull-requests: write` and
`issues: write` for that job alone. The issue text is treated as data: it is read from the
event file by the script, never put into a shell command.

Two repository settings it needs:

- Labels `report` and `accepted` must exist (the form only applies labels that exist).
- **Settings → Actions → General → Workflow permissions**: tick **Allow GitHub Actions to create
  and approve pull requests**, or the pull request step fails.

Pull requests opened with `GITHUB_TOKEN` don't trigger other workflows, so CI doesn't run on
them by itself; the accept job runs the data validation before opening one. To run full CI
on such a pull request, close and reopen it, or run the CI workflow by hand.

## Running it locally

Node 24 or later and pnpm 12 (the version is pinned in `package.json`):

```sh
pnpm install
pnpm dev        # http://localhost:5173
pnpm check      # typecheck, lint, tests, data validation, production build
pnpm preview    # serve the production build from dist/
```

`pnpm test` runs vitest: the schema, the issue-form parser (against the form's own YAML), the
report workflow's merge step, data loading, the rating summary and filters, and the colour
contrast of the ratings and theme. The scripts in `scripts/` run on Node's built-in TypeScript
support (`node scripts/validate-data.ts`).

## How the site works

Vite, React 19, TypeScript, Tailwind CSS 4 and shadcn/ui components (Radix, copied into
`src/components/ui/`). The data files are bundled into the page at build time; there is no
server, no analytics, no cookies, and no external fonts or scripts. Steam header images load
from Steam's CDN, without a referrer, with a drawn tile when one is missing.

**Routing**: real paths (`/game/620`, `/program/unvanquished`, `/report`, `/about`) with React
Router's browser router. GitHub Pages only serves files, so after the build
[`vite.config.ts`](vite.config.ts) writes a copy of `index.html` for every page
(`dist/game/620/index.html`, ...), each with its own title, description and Open Graph tags.
Links to any page load with status 200 and preview properly where they are shared, and search
engines see them; `404.html` (the same app) handles anything else. A hash router would have
needed no build step, but its URLs (`/#/game/620`) can't have per-page previews. The build
also writes `sitemap.xml`.

## Publishing (GitHub Pages and hadrondb.com)

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs on every push to `main`:
it checks and builds the site, and publishes it only when Pages is set to deploy from
GitHub Actions; until then it notes that and skips publishing. `public/CNAME` holds
`hadrondb.com`. A Pages site is public even when the repository is private.

1. **DNS** (Route 53, hosted zone `hadrondb.com`):

   | Name | Type | Value |
   |---|---|---|
   | `hadrondb.com` | A | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
   | `hadrondb.com` | AAAA | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
   | `www.hadrondb.com` | CNAME | `broyojo.github.io` |

   Optional but recommended: verify the domain for your account (GitHub → Settings → Pages →
   Add a domain), which gives a TXT record `_github-pages-challenge-broyojo.hadrondb.com` to
   add. That stops anyone else from claiming the domain on GitHub.
2. **Settings → Pages**: Source **GitHub Actions**; Custom domain `hadrondb.com`, Save; once the
   DNS check passes and the certificate is issued, tick **Enforce HTTPS**.
3. Run **Deploy site** (Actions tab, Run workflow), or push to `main`.

Without the custom domain the site would be served under `/hadrondb/`; build with
`BASE_PATH=/hadrondb/ pnpm build` for that.

## Licences

- Code: [MIT](LICENSE).
- Data (`data/`): [CC BY 4.0](data/LICENSE). Reporters agree to it in the form.
- The Hadron logo (`src/assets/`, `public/favicon.svg`) is the Hadron project's, by the same
  owner, and is not covered by either.
